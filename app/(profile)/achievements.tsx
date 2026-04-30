import { Achievement, ACHIEVEMENTS } from '@/constants/achievements';
import Colors from '@/constants/Colors';
import { FRAMES } from '@/constants/frames';
import { NAMETAGS } from '@/constants/nametags';
import { TITLES } from '@/constants/titles';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { achievementService } from '@/services/achievementService';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';



export default function AchievementsScreen() {
  const { user } = useAuth();
  const { wp, hp, moderateScale, spacing } = useResponsive();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const { data: userAchievements = [], isLoading } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => user ? achievementService.getUserAchievements(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const unlockedIds = useMemo(() => new Set(userAchievements.map(a => a.achievement_id)), [userAchievements]);

  const filteredAchievements = useMemo(() => ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedIds.has(a.id);
    if (filter === 'locked') return !unlockedIds.has(a.id);
    return true;
  }), [filter, unlockedIds]);

  const progress = useMemo(() => ACHIEVEMENTS.length > 0
    ? (userAchievements.length / ACHIEVEMENTS.length) * 100
    : 0, [userAchievements]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.correct.main} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <Stack.Screen options={{ title: 'Başarımlar', headerShown: false }} />
      <LinearGradient
        colors={['#1a1a1a', '#0f0f0f']}
        style={{
          paddingTop: hp(7),
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          borderBottomLeftRadius: moderateScale(32),
          borderBottomRightRadius: moderateScale(32),
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: moderateScale(20),
                backgroundColor: 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: moderateScale(28), fontWeight: '900', color: '#fff', letterSpacing: -0.5 }}>Başarımlar</Text>
              <Text style={{ fontSize: moderateScale(13), color: '#aaa', marginTop: 2 }}>Kelime avında kazandığın ödüller</Text>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 215, 0, 0.15)',
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(6),
            borderRadius: moderateScale(20),
            gap: 6,
          }}>
            <Ionicons name="trophy" size={moderateScale(18)} color="#FFD700" />
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: moderateScale(14) }}>
              {userAchievements.length}/{ACHIEVEMENTS.length}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: moderateScale(12), fontWeight: '600', opacity: 0.8 }}>Tamamlama Oranı</Text>
            <Text style={{ color: Colors.correct.main, fontSize: moderateScale(14), fontWeight: '900' }}>%{Math.round(progress)}</Text>
          </View>
          <View style={{ height: moderateScale(8), backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View
              style={[
                { height: '100%', backgroundColor: Colors.correct.main, borderRadius: 4 },
                { width: `${progress}%` }
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm }}>
        <FilterButton
          label="Tümü"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
          moderateScale={moderateScale}
        />
        <FilterButton
          label="Kazanılan"
          active={filter === 'unlocked'}
          onPress={() => setFilter('unlocked')}
          moderateScale={moderateScale}
        />
        <FilterButton
          label="Kilitli"
          active={filter === 'locked'}
          onPress={() => setFilter('locked')}
          moderateScale={moderateScale}
        />
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: spacing.sm }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredAchievements.map((achievement, index) => (
          <TouchableOpacity
            key={achievement.id}
            activeOpacity={0.8}
            onPress={() => setSelectedAchievement(achievement)}
          >
            <AchievementCard
              achievement={achievement}
              isUnlocked={unlockedIds.has(achievement.id)}
              index={index}
              unlockDate={userAchievements.find(a => a.achievement_id === achievement.id)?.unlocked_at}
              moderateScale={moderateScale}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AchievementDetailModal
        achievement={selectedAchievement}
        isVisible={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        isUnlocked={selectedAchievement ? unlockedIds.has(selectedAchievement.id) : false}
        unlockDate={selectedAchievement ? userAchievements.find(a => a.achievement_id === selectedAchievement.id)?.unlocked_at : undefined}
      />
    </View>
  );
}

function FilterButton({ label, active, onPress, moderateScale }: { label: string, active: boolean, onPress: () => void, moderateScale: any }) {
  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(20),
        backgroundColor: active ? Colors.correct.main : '#1c1c1e',
      }}
      onPress={onPress}
    >
      <Text style={{
        color: active ? '#fff' : '#aaa',
        fontWeight: '600',
        fontSize: moderateScale(13),
      }}>{label}</Text>
    </TouchableOpacity>
  );
}

function AchievementCard({
  achievement,
  isUnlocked,
  index,
  unlockDate,
  moderateScale
}: {
  achievement: Achievement,
  isUnlocked: boolean,
  index: number,
  unlockDate?: string,
  moderateScale: any
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{
        flexDirection: 'row',
        backgroundColor: isUnlocked ? '#1c1c1e' : '#161618',
        borderRadius: moderateScale(24),
        padding: moderateScale(16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        opacity: isUnlocked ? 1 : 0.7,
      }}
    >
      <View style={{ position: 'relative' }}>
        <LinearGradient
          colors={isUnlocked ? ['#639922', '#4a7319'] : ['#333', '#222']}
          style={{
            width: moderateScale(64),
            height: moderateScale(64),
            borderRadius: moderateScale(20),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name={achievement.icon as any}
            size={moderateScale(32)}
            color={isUnlocked ? '#fff' : '#666'}
          />
        </LinearGradient>
        {!isUnlocked && (
          <View style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            backgroundColor: '#333',
            width: moderateScale(24),
            height: moderateScale(24),
            borderRadius: moderateScale(12),
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#1c1c1e',
          }}>
            <Ionicons name="lock-closed" size={moderateScale(12)} color="#aaa" />
          </View>
        )}
      </View>

      <View style={{ flex: 1, marginLeft: moderateScale(16) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{
            color: isUnlocked ? '#fff' : '#666',
            fontSize: moderateScale(17),
            fontWeight: '800',
          }}>
            {achievement.title}
          </Text>
          {isUnlocked && (
            <Ionicons name="checkmark-circle" size={moderateScale(16)} color={Colors.correct.main} />
          )}
        </View>
        <Text style={{
          color: isUnlocked ? '#aaa' : '#555',
          fontSize: moderateScale(12),
          marginTop: 4,
          lineHeight: moderateScale(16),
        }}>
          {achievement.description}
        </Text>

        {isUnlocked && unlockDate && (
          <Text style={{ color: Colors.correct.main, fontSize: moderateScale(11), marginTop: 8, fontWeight: '600' }}>
            {new Date(unlockDate).toLocaleDateString('tr-TR')} tarihinde kazanıldı
          </Text>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            gap: 4,
          }}>
            <Ionicons name="flash" size={moderateScale(12)} color="#FFD700" />
            <Text style={{ color: '#FFD700', fontSize: moderateScale(11), fontWeight: 'bold' }}>
              {achievement.rewardPoints} XP
            </Text>
          </View>

          {achievement.rewardTitleId && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(96, 165, 250, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}>
              <Ionicons name="ribbon" size={moderateScale(12)} color="#60A5FA" />
              <Text style={{ color: '#60A5FA', fontSize: moderateScale(11), fontWeight: 'bold' }}>
                Unvan
              </Text>
            </View>
          )}

          {achievement.rewardFrameId && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}>
              <Ionicons name="person-circle" size={moderateScale(12)} color="#A855F7" />
              <Text style={{ color: '#A855F7', fontSize: moderateScale(11), fontWeight: 'bold' }}>
                Çerçeve
              </Text>
            </View>
          )}

          {achievement.rewardNameTagId && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}>
              <Ionicons name="card" size={moderateScale(12)} color="#EC4899" />
              <Text style={{ color: '#EC4899', fontSize: moderateScale(11), fontWeight: 'bold' }}>
                İsimlik
              </Text>
            </View>
          )}

          {achievement.rewardPowerUp && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}>
              <Ionicons name="thunderstorm" size={moderateScale(12)} color="#F97316" />
              <Text style={{ color: '#F97316', fontSize: moderateScale(11), fontWeight: 'bold' }}>
                {achievement.rewardPowerUp.quantity}x Takviye
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function AchievementDetailModal({
  achievement,
  isVisible,
  onClose,
  isUnlocked,
  unlockDate
}: {
  achievement: Achievement | null,
  isVisible: boolean,
  onClose: () => void,
  isUnlocked: boolean,
  unlockDate?: string
}) {
  const { moderateScale, spacing, verticalScale, scale } = useResponsive();

  if (!achievement) return null;

  const getRequirementInfo = (type: string, value: number) => {
    switch (type) {
      case 'total_wins': return `${value} Galibiyet Al`;
      case 'total_points': return `${value.toLocaleString()} Toplam Puan Kazan`;
      case 'streak': return `${value} Günlük Seri Yap`;
      case 'perfect_game': return `${value} Kusursuz Oyun (Tek Atış)`;
      case 'climb_level': return `Tırmanış Modunda ${value}. Seviyeye Ulaş`;
      case 'survival_words': return `Can Modunda Bir Turda ${value} Kelime Çöz`;
      case 'blitz_speed': return `Blitz Modunda ${value} Saniye Altında Çöz`;
      case 'total_games_played': return `${value} Toplam Oyun Oyna`;
      case 'total_words_solved': return `${value} Toplam Kelime Çöz`;
      case 'daily_streak': return `${value} Gün Üst Üste Oyna`;
      case 'multi_wins': return `Çoklu Modda ${value} Galibiyet Al`;
      default: return `${value} Hedefe Ulaş`;
    }
  };

  const renderRewardItem = (icon: keyof typeof Ionicons.glyphMap, color: string, label: string, value: string) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      padding: moderateScale(12),
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      marginBottom: 8
    }}>
      <View style={{
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: 8,
        backgroundColor: `${color}1A`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Ionicons name={icon} size={moderateScale(18)} color={color} />
      </View>
      <View>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>{label}</Text>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={30} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <View style={{
          width: '85%',
          backgroundColor: '#15151b',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
          padding: moderateScale(24),
          overflow: 'hidden'
        }}>
          {/* Header Icon */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <LinearGradient
              colors={isUnlocked ? ['#639922', '#4a7319'] : ['#333', '#222']}
              style={{
                width: moderateScale(80),
                height: moderateScale(80),
                borderRadius: 28,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)'
              }}
            >
              <Ionicons
                name={achievement.icon as any}
                size={moderateScale(40)}
                color={isUnlocked ? '#fff' : '#666'}
              />
            </LinearGradient>
            <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', textAlign: 'center' }}>
              {achievement.title}
            </Text>
            {isUnlocked ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.correct.main} />
                <Text style={{ color: Colors.correct.main, fontSize: 12, fontWeight: 'bold' }}>BAŞARIM KAZANILDI</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="lock-closed" size={14} color="#666" />
                <Text style={{ color: '#666', fontSize: 12, fontWeight: 'bold' }}>BAŞARIM KİLİTLİ</Text>
              </View>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: verticalScale(350) }}>
            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>AÇIKLAMA</Text>
              <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20 }}>{achievement.description}</Text>
            </View>

            {/* How to Unlock */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 }}>NASIL KAZANILIR?</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: isUnlocked ? Colors.correct.main : '#666' }}>
                <Text style={{ color: isUnlocked ? '#fff' : '#aaa', fontSize: 14, fontWeight: '600' }}>
                  {getRequirementInfo(achievement.requirementType, achievement.requirementValue)}
                </Text>
              </View>
            </View>

            {/* Rewards */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 }}>ÖDÜLLER</Text>

              {renderRewardItem('flash', '#FFD700', 'TECRÜBE PUANI', `+${achievement.rewardPoints} XP`)}

              {achievement.rewardTitleId && TITLES.find(t => t.id === achievement.rewardTitleId) && (
                renderRewardItem('ribbon', '#60A5FA', 'ÖZEL UNVAN', TITLES.find(t => t.id === achievement.rewardTitleId)!.label)
              )}

              {achievement.rewardFrameId && FRAMES.find(f => f.id === achievement.rewardFrameId) && (
                renderRewardItem('person-circle', '#A855F7', 'AVATAR ÇERÇEVESİ', FRAMES.find(f => f.id === achievement.rewardFrameId)!.name)
              )}

              {achievement.rewardNameTagId && NAMETAGS.find(n => n.id === achievement.rewardNameTagId) && (
                renderRewardItem('card', '#EC4899', 'ÖZEL İSİMLİK', NAMETAGS.find(n => n.id === achievement.rewardNameTagId)!.name)
              )}

              {achievement.rewardPowerUp && (
                renderRewardItem('thunderstorm', '#F97316', 'TAKTAKİYE PAKETİ', `${achievement.rewardPowerUp.quantity}x ${achievement.rewardPowerUp.id.toUpperCase()}`)
              )}
            </View>

            {isUnlocked && unlockDate && (
              <View style={{ padding: 12, backgroundColor: 'rgba(99, 153, 34, 0.1)', borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: Colors.correct.main, fontSize: 11, fontWeight: 'bold' }}>
                  {new Date(unlockDate).toLocaleDateString('tr-TR')} tarihinde kazanıldı
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 20,
              backgroundColor: '#fff',
              height: moderateScale(48),
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#000', fontWeight: '900', letterSpacing: 1 }}>ANLADIM</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}
