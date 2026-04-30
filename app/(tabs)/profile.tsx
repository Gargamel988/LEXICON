import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { EditProfileModal } from '@/components/Profile/EditProfileModal';
import { ProfileSettingsList } from '@/components/Profile/ProfileSettingsList';
import { ProfileStatsGrid } from '@/components/Profile/ProfileStatsGrid';
import { ProfileUserCard } from '@/components/Profile/ProfileUserCard';
import { POWER_UP_DEFINITIONS, PowerUpKey } from '@/constants/powerUps';
import { COIN_COLOR, COIN_ICON } from '@/constants/ui';
import { useCosmetics } from '@/hooks/useCosmetics';
import { useInventory } from '@/hooks/useInventory';
import { useProfile } from '@/hooks/useProfile';
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
    mutationFn: async ({ name, avatar }: { name: string, avatar: string }) => {
      if (!user) throw new Error("Kullanıcı bulunamadı");
      const result = await statsService.updateProfile(user.id, {
        username: name,
        avatar_url: avatar
      });
      if (!result.success) throw result.error;
      return { name, avatar };
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
      </View>
    );
  }

  if (!stats) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
          rank={stats.rank}
          onEdit={() => setIsEditModalVisible(true)}
          activeFrame={activeFrame?.id}
          activeNameTag={activeNameTag}
          activeTitleId={activeTitle?.id}
          xp={stats.xp}
        />

        {/* Statistics Dashboard */}
        <ProfileStatsGrid stats={stats} />

        {/* ── Elmas Bakiyesi ── */}
        <Pressable
          onPress={() => router.push('/(tabs)/shop' as any)}
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

        {/* Settings & Account Management */}
        <ProfileSettingsList onLogout={() => signOutMutation.mutate()} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        userId={user?.id || ""}
        currentName={profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ""}
        currentAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url || ""}
        onSave={(name: string, avatar: string) => updateProfileMutation.mutate({ name, avatar })}
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
    </View>
  );
}
