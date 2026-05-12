import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { BannerAd } from '@/components/Ads/BannerAd';
import { OfflineBanner } from '@/components/Common/OfflineBanner';
import { TitlesSection } from '@/components/Cosmetics/TitlesSection';
import { EditProfileModal } from '@/components/Profile/EditProfileModal';
import { ProfileSettingsList } from '@/components/Profile/ProfileSettingsList';
import { ProfileStatsGrid } from '@/components/Profile/ProfileStatsGrid';
import { ProfileUserCard } from '@/components/Profile/ProfileUserCard';
import { POWER_UP_DEFINITIONS, PowerUpKey } from '@/constants/powerUps';
import { COIN_COLOR, COIN_ICON } from '@/constants/ui';
import { useCosmetics } from '@/hooks/useCosmetics';
import { useInventory } from '@/hooks/useInventory';
import { useProfile } from '@/hooks/useProfile';
import { networkService } from '@/services/networkService';
import { renderPowerUpIcon } from '@/utils/renderPowerUpIcon';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, signOutMutation, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { moderateScale, wp } = useResponsive();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const { coins, inventory } = useInventory(user?.id);
  const {
    activeFrame,
    activeNameTag,
    activeTitle,
    ownedTitles,
    ownedCosmetics,
    setActiveTitle,
    setActiveFrame,
    setActiveNameTag
  } = useCosmetics(user?.id);

  // Sadece stoku olan güçlendirmeler
  const ownedPowerUps = (Object.keys(POWER_UP_DEFINITIONS) as PowerUpKey[]).filter(
    (key) => (inventory[key] ?? 0) > 0
  );

  // Stats fetching with React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: () => statsService.getAggregateStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, avatar, isPublic, showOnLeaderboard }: { name: string, avatar: string, isPublic: boolean, showOnLeaderboard: boolean }) => {
      if (!user) throw new Error("Kullanıcı bulunamadı");
      if (!networkService.isOnline) {
        throw new Error("Profil güncellemek için internet gerekiyor.");
      }
      const result = await statsService.updateProfile(user.id, {
        username: name,
        avatar_url: avatar,
        is_public: isPublic,
        show_on_leaderboard: showOnLeaderboard
      });
      if (!result.success) throw result.error;
      return { name, avatar, isPublic, showOnLeaderboard };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      Toast.show({
        type: 'success',
        text1: 'Profil Güncellendi',
        text2: 'Değişikliklerin başarıyla kaydedildi.'
      });
      setIsEditModalVisible(false);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: error.message
      });
    }
  });


  if (authLoading || statsLoading || profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={{ color: '#888', marginTop: 10, fontSize: 10 }}>
          {authLoading ? 'Auth...' : statsLoading ? 'Stats...' : 'Profile...'}
        </Text>
      </View>
    );
  }

  if (!stats) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <OfflineBanner />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[Colors.accent + '15', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: moderateScale(400) }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: moderateScale(60),
          paddingHorizontal: wp(6) // Responsive horizontal padding
        }}
      >
        {/* User Identity Card */}
        <ProfileUserCard
          user={user}
          profile={profile}
          level={stats.level}
          onEdit={() => {
            if (!networkService.isOnline) {
              Toast.show({ type: 'info', text1: 'Çevrimdışı Mod', text2: 'Profil düzenlemek için internet gerekiyor.' });
              return;
            }
            setIsEditModalVisible(true);
          }}
          activeFrame={activeFrame?.id}
          activeNameTag={activeNameTag}
          activeTitleId={activeTitle?.id}
          xp={stats.xp}
        />

        {/* Statistics Dashboard */}
        <ProfileStatsGrid stats={stats} />

        {/* ── Üyelik Durumu ── */}
        {(() => {
          const isPremiumActive = profile?.is_premium && (!profile.premium_until || new Date(profile.premium_until) > new Date());

          return (
            <Pressable
              onPress={() => {
                !isPremiumActive && router.push('/(tabs)/shop' as any);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isPremiumActive
                  ? (pressed ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.08)')
                  : (pressed ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)'),
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isPremiumActive ? 'rgba(251,191,36,0.3)' : 'rgba(59,130,246,0.3)',
                paddingHorizontal: 20,
                paddingVertical: 16,
                marginBottom: 16,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: isPremiumActive ? 'rgba(251,191,36,0.2)' : 'rgba(59,130,246,0.2)',
                  justifyContent: 'center', alignItems: 'center'
                }}>
                  <Ionicons
                    name={isPremiumActive ? "shield-checkmark" : "shield-outline"}
                    size={22}
                    color={isPremiumActive ? "#fbbf24" : "#3b82f6"}
                  />
                </View>
                <View>
                  <Text style={{
                    color: isPremiumActive ? "#fbbf24" : "#3b82f6",
                    fontSize: moderateScale(13),
                    fontWeight: '900',
                    letterSpacing: 0.5
                  }}>
                    {isPremiumActive ? 'PREMIUM ÜYELİK' : 'REKLAMSIZ OYUN'}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(10), fontWeight: '600' }}>
                    {isPremiumActive ? 'Tüm reklamlar devre dışı' : 'Reklamları kaldırmak için tıkla'}
                  </Text>
                </View>
              </View>
              {!isPremiumActive && (
                <Ionicons name="chevron-forward" size={18} color="#3b82f6" />
              )}
            </Pressable>
          );
        })()}

        {/* ── Elmas Bakiyesi ── */}
        <Pressable
          onPress={() => {
            router.push('/(tabs)/shop' as any);
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: pressed ? 'rgba(255,214,0,0.15)' : 'rgba(255,214,0,0.08)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,214,0,0.25)',
            paddingHorizontal: 20,
            paddingVertical: 16,
            marginBottom: 16,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={COIN_ICON} size={24} color={COIN_COLOR} />
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(11), fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>Elmas Bakiyesi</Text>
              <Text style={{ color: COIN_COLOR, fontSize: moderateScale(22), fontWeight: '900' }}>
                {coins.toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: 'rgba(255,214,0,0.15)', paddingHorizontal: 12,
            paddingVertical: 6, borderRadius: 12,
          }}>
            <Text style={{ color: COIN_COLOR, fontWeight: '800', fontSize: moderateScale(12) }}>Mağaza</Text>
            <Ionicons name="arrow-forward" size={14} color={COIN_COLOR} />
          </View>
        </Pressable>

        {/* ── Güçlendirme Envanteri ── */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15), letterSpacing: 0.3 }}>Güçlendirmeler</Text>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: moderateScale(11), letterSpacing: 1, textTransform: 'uppercase' }}>
              {ownedPowerUps.length} çeşit
            </Text>
          </View>

          {ownedPowerUps.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
              <Ionicons name="cube-outline" size={32} color="rgba(255,255,255,0.15)" />
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(13) }}>Henüz güçlendirme yok</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {ownedPowerUps.map((key) => {
                const def = POWER_UP_DEFINITIONS[key];
                const qty = inventory[key] ?? 0;
                return (
                  <View key={key} style={{
                    alignItems: 'center', gap: 4,
                    width: wp(17),
                  }}>
                    <View style={{
                      width: wp(14), height: wp(14), borderRadius: wp(7),
                      backgroundColor: `${def.accentColor}18`,
                      borderWidth: 1.5, borderColor: `${def.accentColor}40`,
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      {renderPowerUpIcon(def, moderateScale(20), def.accentColor)}
                      {/* Miktar badge */}
                      <View style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 18, height: 18, borderRadius: 9,
                        backgroundColor: def.accentColor,
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: 1.5, borderColor: Colors.background,
                      }}>
                        <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>{qty}</Text>
                      </View>
                    </View>
                    <Text style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: moderateScale(9),
                      fontWeight: '700',
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }}>{def.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Unvan Koleksiyonu ── */}
        <View style={{ paddingHorizontal: wp(1) }}>
          <TitlesSection ownedTitlesIds={ownedTitles.map(t => t.id)} />
        </View>

        <ProfileSettingsList onLogout={() => signOutMutation.mutate()} />

        {/* ── Debug Bilgileri (Sadece Geliştirme Modunda) ── */}
        {__DEV__ && (
          <View style={{
            marginTop: moderateScale(20),
            padding: moderateScale(15),
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 15,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
            marginBottom: moderateScale(40)
          }}>
            <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8 }}>DEVELOPER DEBUG</Text>
            <View style={{ gap: 4 }}>
              <Text style={{ color: '#888', fontSize: 11 }}>User ID: <Text style={{ color: '#ccc' }}>{user?.id}</Text></Text>
              <Text style={{ color: '#888', fontSize: 11 }}>Public: <Text style={{ color: profile?.is_public ? '#4cd964' : '#ff3b30' }}>{String(profile?.is_public)}</Text></Text>
              <Text style={{ color: '#888', fontSize: 11 }}>Leaderboard: <Text style={{ color: profile?.show_on_leaderboard ? '#4cd964' : '#ff3b30' }}>{String(profile?.show_on_leaderboard)}</Text></Text>
              <Text style={{ color: '#888', fontSize: 11 }}>Online: <Text style={{ color: networkService.isOnline ? '#4cd964' : '#ff3b30' }}>{String(networkService.isOnline)}</Text></Text>
            </View>
          </View>
        )}
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        userId={user?.id || ""}
        currentName={profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ""}
        currentAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url || ""}
        isPublicInitial={profile?.is_public ?? true}
        showOnLeaderboardInitial={profile?.show_on_leaderboard ?? true}
        onSave={(name: string, avatar: string, isPublic: boolean, showOnLeaderboard: boolean) =>
          updateProfileMutation.mutate({ name, avatar, isPublic, showOnLeaderboard })
        }
        isLoading={updateProfileMutation.isPending}
        activeFrame={activeFrame}
        activeTitle={activeTitle}
        activeNameTag={activeNameTag}
        ownedTitles={ownedTitles}
        ownedCosmetics={ownedCosmetics}
        onSaveTitle={(titleId) => setActiveTitle(titleId)}
        onSaveFrame={(frameId) => setActiveFrame(frameId)}
        onSaveNameTag={(tagId) => setActiveNameTag(tagId)}
      />
      <BannerAd />
    </View>
  );
}
