import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { EditProfileModal } from '@/components/Profile/EditProfileModal';
import { ProfileSettingsList } from '@/components/Profile/ProfileSettingsList';
import { ProfileStatsGrid } from '@/components/Profile/ProfileStatsGrid';
import { ProfileUserCard } from '@/components/Profile/ProfileUserCard';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const { user, signOutMutation, loading: authLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
    const router = useRouter();
    const { moderateScale, wp } = useResponsive();
    const queryClient = useQueryClient();
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

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
                />

                {/* Statistics Dashboard */}
                <ProfileStatsGrid stats={stats} />

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
            />
        </View>
    );
}
