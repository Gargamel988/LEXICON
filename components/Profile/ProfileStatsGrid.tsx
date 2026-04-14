import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { AggregateStats } from '../../services/statsService';
import StatCard from '../Stats/StatCard';

interface ProfileStatsGridProps {
  stats: AggregateStats;
}

export const ProfileStatsGrid = ({ stats }: ProfileStatsGridProps) => {
  const { moderateScale } = useResponsive();

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600)}
      style={{ marginBottom: moderateScale(30) }}
    >
      <View style={{ marginBottom: moderateScale(12) }}>
        <StatCard
          label="Toplam Puan"
          value={stats.totalPoints.toLocaleString()}
          accent={Colors.accent}
          large
        />
      </View>
      <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
        <StatCard
          label="Toplam Galibiyet"
          value={stats.totalWins.toString()}
          accent="#4ade80"
        />
        <StatCard
          label="En İyi Seri"
          value={stats.bestStreak.toString()}
          accent="#f472b6"
        />
      </View>
    </Animated.View>
  );
};
