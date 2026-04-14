import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../hooks/useAuth';
import { statsService } from '../../services/statsService';
import { ACCENTS, TabId } from '../../components/Stats/types';

import ClassicStats from '../../components/Stats/ClassicStats';
import BlitzStats from '../../components/Stats/BlitzStats';
import ClimbStats from '../../components/Stats/ClimbStats';
import MultiStats from '../../components/Stats/MultiStats';
import BlindStats from '../../components/Stats/BlindStats';
import DailyStats from '../../components/Stats/DailyStats';
import SurvivalStats from '../../components/Stats/SurvivalStats';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'classic', label: 'Klasik', icon: 'grid' },
  { id: 'daily', label: 'Günlük', icon: 'calendar' },
  { id: 'blitz', label: 'Blitz', icon: 'flash' },
  { id: 'survival', label: 'Hayatta Kalma', icon: 'heart' },
  { id: 'climb', label: 'Tırmanış', icon: 'trending-up' },
  { id: 'multi', label: 'Çoklu', icon: 'layers' },
  { id: 'blind', label: 'Kör', icon: 'eye-off' },
];

export default function StatsScreen() {
  const { moderateScale, wp, hp } = useResponsive();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('classic');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats', user?.id, activeTab],
    queryFn: () => statsService.getModeStats(user!.id, activeTab),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const activeColor = ACCENTS[activeTab] || '#fff';

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient
        colors={[`${activeColor}15`, '#000', '#000']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: wp(5), paddingTop: moderateScale(10), marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: moderateScale(32), fontWeight: '900', letterSpacing: -1 }}>İstatistikler</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), fontWeight: '700', marginTop: 2 }}>ANALİZ MERKEZİ</Text>
            </View>
            <Pressable 
              onPress={() => refetch()}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: moderateScale(10), borderRadius: 15 }}
            >
              <Ionicons name="refresh" size={20} color={activeColor} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), gap: 10 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabColor = ACCENTS[tab.id as TabId];
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as TabId)}
                  style={{
                    backgroundColor: isActive ? tabColor : 'rgba(255,255,255,0.03)',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: isActive ? 'transparent' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Ionicons name={(isActive ? tab.icon : tab.icon + '-outline') as any} size={16} color={isActive ? '#000' : 'rgba(255,255,255,0.4)'} />
                  <Text style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), fontWeight: '800' }}>{tab.label.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(10) }}>
          {isLoading ? (
             <View style={{ flex: 1, height: 300, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator color={activeColor} />
             </View>
          ) : (
            <>
              {activeTab === 'classic' && <ClassicStats data={stats} accent={activeColor} />}
              {activeTab === 'blitz' && <BlitzStats data={stats} accent={activeColor} />}
              {activeTab === 'climb' && <ClimbStats data={stats} accent={activeColor} />}
              {activeTab === 'multi' && <MultiStats data={stats} accent={activeColor} />}
              {activeTab === 'blind' && <BlindStats data={stats} accent={activeColor} />}
              {activeTab === 'daily' && <DailyStats data={stats} accent={activeColor} />}
              {activeTab === 'survival' && <SurvivalStats data={stats} accent={activeColor} />}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
