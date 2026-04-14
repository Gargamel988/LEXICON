import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { statsService } from '@/services/statsService';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

// Modular Components
import { ProfileAchievements } from '@/components/Profile/ProfileAchievements';
import { ProfileSettingsList } from '@/components/Profile/ProfileSettingsList';
import { ProfileStatsGrid } from '@/components/Profile/ProfileStatsGrid';
import { ProfileUserCard } from '@/components/Profile/ProfileUserCard';

export default function ProfileScreen() {
    const { user, signOutMutation, loading: authLoading } = useAuth();
    const router = useRouter();
    const { moderateScale, wp } = useResponsive();

    // Stats fetching with React Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['stats', user?.id],
        queryFn: () => statsService.getAggregateStats(user!.id),
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, authLoading]);

    if (authLoading || statsLoading) {
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
                <ProfileUserCard user={user} level={stats.level} rank={stats.rank} />

                {/* Statistics Dashboard */}
                <ProfileStatsGrid stats={stats} />

                {/* Achievements Gallery */}
                <ProfileAchievements />

                {/* Settings & Account Management */}
                <ProfileSettingsList onLogout={() => signOutMutation.mutate()} />
            </ScrollView>
        </View>
    );
}
