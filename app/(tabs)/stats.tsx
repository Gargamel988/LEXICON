import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ClimbStats from '@/components/Stats/ClimbStats';
import MultiStats from '@/components/Stats/MultiStats';
import SurvivalStats from '@/components/Stats/SurvivalStats';
import BlindStats from '../../components/Stats/BlindStats';
import BlitzStats from '../../components/Stats/BlitzStats';
import ClassicStats from '../../components/Stats/ClassicStats';
import DailyStats from '../../components/Stats/DailyStats';
import { ACCENTS, TabId } from '../../components/Stats/types';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { statsService } from '../../services/statsService';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'classic', label: 'Klasik', icon: 'grid-outline' },
  { id: 'blitz', label: 'Blitz', icon: 'flash-outline' },
  { id: 'daily', label: 'Günlük', icon: 'calendar-outline' },
  { id: 'blind', label: 'Kör Mod', icon: 'eye-off-outline' },
  { id: 'multi', label: 'Çoklu', icon: 'layers-outline' },
  { id: 'survival', label: 'Survival', icon: 'heart-outline' },
  { id: 'climb', label: 'Tırmanış', icon: 'trending-up-outline' },
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { moderateScale, wp, spacing } = useResponsive();
  const screenWidth = useMemo(() => wp(100), [wp]);
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>('classic');
  const accent = ACCENTS[tab];
  const [tabIndex, setTabIndex] = useState(0);

  // Animation stuff
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // React Query ile verileri çek
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats', user?.id, tab],
    queryFn: () => statsService.getModeStats(user!.id, tab),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  useEffect(() => {
    const index = TABS.findIndex(m => m.id === tab);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, index * moderateScale(120) - spacing.xl * 2),
        animated: true,
      });
    }
  }, [tab, moderateScale, spacing.xl]);

  const handleTabPress = (id: TabId, index: number) => {
    if (tab === id) return;
    setTab(id);
    setTabIndex(index);
    translateX.value = 0;
    opacity.value = withSpring(1);
  };

  const navigateToTab = useCallback((index: number) => {
    setTabIndex(index);
    setTab(TABS[index].id);
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
        // Sola kaydır -> İleri
        if (tabIndex < TABS.length - 1) {
          translateX.value = withTiming(-screenWidth, config);
          runOnJS(navigateToTab)(tabIndex + 1);
        } else {
          translateX.value = withTiming(0, config);
        }
      } else if (e.translationX > screenWidth * 0.25 || e.velocityX > 500) {
        // Sağa kaydır -> Geri
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

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <View style={{ flex: 1 }}>
        <View style={{
          marginTop: moderateScale(30),
          marginBottom: moderateScale(10),
        }}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: wp(1),
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 5,
              paddingHorizontal: wp(4)
            }}
          >
            {TABS.map((t, index) => {
              const isActive = tab === t.id;
              const tabAccent = ACCENTS[t.id];
              return (
                <Pressable
                  key={t.id}
                  onPress={() => handleTabPress(t.id, index)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: moderateScale(10),
                    paddingHorizontal: moderateScale(18),
                    borderRadius: 20,
                    backgroundColor: isActive ? `${tabAccent}15` : 'transparent',
                    borderWidth: 1,
                    borderColor: isActive ? `${tabAccent}50` : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={moderateScale(16)}
                    color={isActive ? tabAccent : 'rgba(255,255,255,0.2)'}
                  />
                  <Text
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                      fontWeight: isActive ? '900' : '600',
                      fontSize: moderateScale(14),
                      letterSpacing: 0.5,
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <GestureDetector gesture={swipeGesture}>
          <Animated.ScrollView
            style={[{ flex: 1 }, animatedStyle]}
            contentContainerStyle={{
              padding: wp(5),
              paddingTop: moderateScale(16),
              paddingBottom: insets.bottom + 80,
              gap: 16,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={accent}
                colors={[accent]}
                style={{ backgroundColor: "transparent" }}
              />
            }
          >
            {isLoading ? (
              <View style={{ flex: 1, paddingVertical: 100, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={accent} size="large" />
                <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontWeight: '600' }}>
                  Veriler Getiriliyor...
                </Text>
              </View>
            ) : (
              <>
                {tab === 'classic' && <ClassicStats accent={accent} data={stats} />}
                {tab === 'blitz' && <BlitzStats accent={accent} data={stats} />}
                {tab === 'daily' && <DailyStats accent={accent} data={stats} />}
                {tab === 'blind' && <BlindStats accent={accent} data={stats} />}
                {tab === 'multi' && <MultiStats accent={accent} data={stats} />}
                {tab === 'survival' && <SurvivalStats accent={accent} data={stats} />}
                {tab === 'climb' && <ClimbStats accent={accent} data={stats} />}
              </>
            )}
          </Animated.ScrollView>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
