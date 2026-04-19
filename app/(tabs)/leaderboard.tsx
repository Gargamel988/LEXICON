import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeaderboardPodium } from '../../components/Leaderboard/LeaderboardPodium';
import { ModeConfig, ModeTabs } from '../../components/Leaderboard/ModeTabs';
import { Period, PeriodTabs } from '../../components/Leaderboard/PeriodTabs';
import { PlayerStatsModal } from '../../components/Leaderboard/PlayerStatsModal';
import { RankItem } from '../../components/Leaderboard/RankItem';
import { UserRankCard } from '../../components/Leaderboard/UserRankCard';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { statsService } from '../../services/statsService';

interface SelectedUser {
  id: string;
  username: string;
  avatar_url?: string;
}

const MODES: ModeConfig[] = [
  { id: 'all_time', label: 'Genel', icon: 'globe-outline', color: '#639922', unit: 'Puan' },
  { id: 'daily', label: 'Günlük', icon: 'calendar-outline', color: '#4cd964', unit: 'Deneme' },
  { id: 'blitz', label: 'Blitz', icon: 'flash-outline', color: '#ff7e79', unit: 'Puan' },
  { id: 'climb', label: 'Tırmanış', icon: 'trending-up-outline', color: '#CF4C13', unit: 'Tur' },
  { id: 'survival', label: 'Can Modu', icon: 'heart-outline', color: '#ff3b30', unit: 'Kelime' },
];

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('all_time');
  const [selectedMode, setSelectedMode] = useState(MODES[0].id);
  const [tabIndex, setTabIndex] = useState(0);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { wp, hp, moderateScale, spacing, verticalScale } = useResponsive();

  const screenWidth = useMemo(() => wp(100), [wp]);
  const screenHeight = useMemo(() => hp(100), [hp]);

  // Animation stuff
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const currentModeConfig = useMemo(() =>
    MODES.find(m => m.id === selectedMode) || MODES[0]
    , [selectedMode]);

  const { data: leaderboardData = [], isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['leaderboard', period, selectedMode],
    queryFn: async () => {
      let data;
      if (selectedMode === 'all_time') {
        data = await statsService.getLeaderboard(period as any);
      } else {
        data = await statsService.getLeaderboardByMode(period, selectedMode);
      }
      return data || [];
    },
  });

  const { data: userRankInfo, isLoading: isUserRankLoading } = useQuery({
    queryKey: ['userRank', period, selectedMode, user?.id],
    queryFn: async () => {
      if (!user) return null;
      if (selectedMode === 'all_time') {
        return await statsService.getUserRank(period as any, user.id);
      }
      return await statsService.getUserRankByMode(period, selectedMode, user.id);
    },
    enabled: !!user,
  });

  const loading = isLeaderboardLoading || (!!user && isUserRankLoading);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (rawScore: any, duration?: number) => {
    if (selectedMode === 'daily') {
      const timeStr = formatDuration(duration);
      return `${rawScore} Deneme${timeStr ? ` • ${timeStr}` : ''}`;
    }
    const num = parseFloat(rawScore);
    if (isNaN(num)) return '0';
    return `${num.toLocaleString()} ${currentModeConfig.unit}`;
  };

  const navigateToTab = useCallback((index: number) => {
    setTabIndex(index);
    setSelectedMode(MODES[index].id);
    translateX.value = 0;
    opacity.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, []);

  const swipeGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      opacity.value = 1 - Math.abs(e.translationX) / screenWidth;
    })
    .onEnd((e) => {
      const config = { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
      if (e.translationX < -screenWidth * 0.25 || e.velocityX < -500) {
        // Sola kaydır -> Sonraki
        if (tabIndex < MODES.length - 1) {
          translateX.value = withTiming(-screenWidth, config);
          runOnJS(navigateToTab)(tabIndex + 1);
        } else {
          translateX.value = withTiming(0, config);
        }
      } else if (e.translationX > screenWidth * 0.25 || e.velocityX > 500) {
        if (tabIndex > 0) {
          translateX.value = withTiming(screenWidth, config);
          runOnJS(navigateToTab)(tabIndex - 1);
        } else {
          translateX.value = withTiming(0, config);
        }
      } else {
        translateX.value = withTiming(0, config);
        opacity.value = withTiming(1, config);
      }
    }), [tabIndex, screenWidth, navigateToTab]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  const handlePlayerPress = (item: any) => {
    setSelectedUser({
      id: item.user_id,
      username: item.username || 'Oyuncu',
      avatar_url: item.avatar_url,
    });
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: spacing.lg }}>
      <PeriodTabs
        period={period}
        onSelect={setPeriod}
        accentColor={currentModeConfig.color}
      />
      <LeaderboardPodium
        topThree={topThree}
        accentColor={currentModeConfig.color}
        userId={user?.id}
        formatScore={formatScore}
        onPlayerPress={handlePlayerPress}
      />
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <GestureDetector gesture={swipeGesture}>
        <View style={{ flex: 1, height: '100%', paddingTop: insets.top }}>
          <ModeTabs
            modes={MODES}
            selectedMode={selectedMode}
            onSelect={(id, index) => {
              setSelectedMode(id);
              setTabIndex(index);
            }}
          />
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            {/* Header Title */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.05)'
            }}>
              <Animated.Text style={{ color: currentModeConfig.color, fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 1 }}>
                {currentModeConfig.label.toUpperCase()} SIRALAMASI
              </Animated.Text>
            </View>

            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={currentModeConfig.color} />
              </View>
            ) : (
              <FlatList
                data={restOfList}
                keyExtractor={(item) => `${selectedMode}-${item.user_id}`}
                renderItem={({ item }: { item: any }) => (
                  <RankItem
                    rank={item.rank}
                    username={item.username || 'Oyuncu'}
                    score={formatScore(item.score || item.total_score, item.duration)}
                    avatar_url={item.avatar_url}
                    isCurrentUser={item.user_id === user?.id}
                    accentColor={currentModeConfig.color}
                    onPress={() => handlePlayerPress(item)}
                  />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>

          <UserRankCard
            userRankInfo={userRankInfo}
            user={user}
            accentColor={currentModeConfig.color}
            label={currentModeConfig.label}
            periodLabel={period === 'all_time' ? 'Tüm Zamanlar' : period === 'weekly' ? 'Haftalık' : 'Günlük'}
            formatScore={(score) => formatScore(score)}
          />

          <PlayerStatsModal
            isVisible={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            userId={selectedUser?.id || null}
            username={selectedUser?.username || ''}
            avatar_url={selectedUser?.avatar_url}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
