import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PodiumItem } from '../../components/Leaderboard/PodiumItem';
import { RankItem } from '../../components/Leaderboard/RankItem';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { statsService } from '../../services/statsService';

type Period = 'all_time' | 'weekly' | 'daily';

const MODES = [
  { id: 'all_time', label: 'Genel', icon: 'globe-outline', color: '#639922', unit: 'Puan' },
  { id: 'daily', label: 'Günlük', icon: 'calendar-outline', color: '#4cd964', unit: 'Deneme' },
  { id: 'blitz', label: 'Blitz', icon: 'flash-outline', color: '#ff7e79', unit: 'Puan' },
  { id: 'climb', label: 'Tırmanış', icon: 'trending-up-outline', color: '#CF4C13', unit: 'Tur' },
  { id: 'survival', label: 'Can Modu', icon: 'heart-outline', color: '#ff3b30', unit: 'Kelime' },
];

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('all_time');
  const [selectedMode, setSelectedMode] = useState(MODES[0].id);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRankInfo, setUserRankInfo] = useState<any>(null);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { wp, hp, moderateScale, spacing, verticalScale } = useResponsive();

  const currentModeConfig = useMemo(() =>
    MODES.find(m => m.id === selectedMode) || MODES[0]
    , [selectedMode]);

  useEffect(() => {
    fetchData();
  }, [period, selectedMode, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mod bazlı yeni service metotlarını kullan
      const data = await statsService.getLeaderboardByMode(period, selectedMode);
      setLeaderboardData(data || []);

      if (user) {
        const rankInfo = await statsService.getUserRankByMode(period, selectedMode, user.id);
        setUserRankInfo(rankInfo);
      }
    } catch (error) {
      console.error("Lexicon Leaderboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (score: any, duration?: number) => {
    if (selectedMode === 'daily') {
      const timeStr = formatDuration(duration);
      return `${score} Deneme${timeStr ? ` • ${timeStr}` : ''}`;
    }
    const num = parseFloat(score);
    if (isNaN(num)) return '0';
    return `${num.toLocaleString()} ${currentModeConfig.unit}`;
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);

  const renderHeader = () => (
    <View style={{ paddingBottom: spacing.lg }}>
      {/* Mode Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xs, marginBottom: spacing.md }}
      >
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => setSelectedMode(m.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(20),
              backgroundColor: selectedMode === m.id ? m.color : 'rgba(255,255,255,0.05)',
              marginRight: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: selectedMode === m.id ? m.color : 'rgba(255,255,255,0.1)',
            }}
          >
            <Ionicons
              name={m.icon as any}
              size={moderateScale(16)}
              color={selectedMode === m.id ? '#000' : '#888'}
              style={{ marginRight: 6 }}
            />
            <Text style={{
              color: selectedMode === m.id ? '#000' : '#888',
              fontWeight: '800',
              fontSize: moderateScale(13),
            }}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Period Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: moderateScale(16),
        padding: 4,
        marginBottom: verticalScale(20),
        marginHorizontal: spacing.xs,
      }}>
        {([
          { id: 'daily', label: 'Günlük' },
          { id: 'weekly', label: 'Haftalık' },
          { id: 'all_time', label: 'Tüm Zamanlar' }
        ] as { id: Period, label: string }[]).map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPeriod(p.id)}
            style={{
              flex: 1,
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(12),
              backgroundColor: period === p.id ? currentModeConfig.color : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: period === p.id ? '#000' : '#888',
              fontWeight: '900',
              fontSize: moderateScale(12),
              letterSpacing: 0.5
            }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.md,
        minHeight: verticalScale(200),
        marginTop: spacing.md
      }}>
        {/* Rank 2 */}
        {topThree[1] ? (
          <PodiumItem
            rank={2}
            username={topThree[1].username || 'Oyuncu'}
            score={formatScore(topThree[1].score, topThree[1].duration)}
            avatar_url={topThree[1].avatar_url}
            accentColor={currentModeConfig.color}
          />
        ) : <View style={{ width: moderateScale(80) }} />}

        {/* Rank 1 */}
        {topThree[0] ? (
          <PodiumItem
            rank={1}
            username={topThree[0].username || 'Şampiyon'}
            score={formatScore(topThree[0].score, topThree[0].duration)}
            avatar_url={topThree[0].avatar_url}
            accentColor={currentModeConfig.color}
          />
        ) : <View style={{ width: moderateScale(100) }} />}

        {/* Rank 3 */}
        {topThree[2] ? (
          <PodiumItem
            rank={3}
            username={topThree[2].username || 'Oyuncu'}
            score={formatScore(topThree[2].score, topThree[2].duration)}
            avatar_url={topThree[2].avatar_url}
            accentColor={currentModeConfig.color}
          />
        ) : <View style={{ width: moderateScale(80) }} />}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d', paddingTop: insets.top }}>
      {/* Header Title */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
      }}>
        <Text style={{ color: currentModeConfig.color, fontSize: moderateScale(20), fontWeight: '900', letterSpacing: 1 }}>
          {currentModeConfig.label.toUpperCase()} SIRALAMASI
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={currentModeConfig.color} />
        </View>
      ) : (
        <FlatList
          data={restOfList}
          keyExtractor={(item) => `${selectedMode}-${item.user_id}`}
          renderItem={({ item }) => (
            <RankItem
              rank={item.rank}
              username={item.username || 'Oyuncu'}
              score={formatScore(item.score, (item as any).duration)}
              avatar_url={item.avatar_url}
              isCurrentUser={item.user_id === user?.id}
              accentColor={currentModeConfig.color}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sticky User Footer */}
      {userRankInfo && (
        <View style={{
          position: 'absolute',
          bottom: verticalScale(90),
          left: spacing.md,
          right: spacing.md,
          backgroundColor: '#1a1a1a',
          borderRadius: moderateScale(24),
          padding: moderateScale(16),
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${currentModeConfig.color}33`,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 20,
        }}>
          <Text style={{ color: currentModeConfig.color, fontWeight: '900', fontSize: moderateScale(16), marginRight: spacing.md }}>
            #{userRankInfo.rank || '-'}
          </Text>

          <View style={{
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: moderateScale(20),
            backgroundColor: '#333',
            marginRight: spacing.sm,
            overflow: 'hidden'
          }}>
            {user?.user_metadata?.avatar_url ? (
              <Image source={{ uri: user.user_metadata.avatar_url }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: moderateScale(14), fontWeight: '800' }}>
              Senin Sıran
            </Text>
            <Text style={{ color: '#888', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>
              {currentModeConfig.label} Modu {period === 'all_time' ? 'Tüm Zamanlar' : period === 'weekly' ? 'Haftalık' : 'Günlük'}
            </Text>
          </View>

          <Text style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: '900' }}>
            {formatScore(userRankInfo.score)}
          </Text>
        </View>
      )}
    </View>
  );
}
