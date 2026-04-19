import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

export type Period = 'all_time' | 'weekly' | 'daily';

interface PeriodTabsProps {
  period: Period;
  onSelect: (p: Period) => void;
  accentColor: string;
}

export const PeriodTabs: React.FC<PeriodTabsProps> = ({ period, onSelect, accentColor }) => {
  const { moderateScale, spacing, verticalScale } = useResponsive();

  const PERIODS: { id: Period; label: string }[] = [
    { id: 'daily', label: 'Günlük' },
    { id: 'weekly', label: 'Haftalık' },
    { id: 'all_time', label: 'Tüm Zamanlar' }
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: moderateScale(16),
      padding: 4,
      marginBottom: verticalScale(20),
      marginHorizontal: spacing.xs,
    }}>
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => onSelect(p.id)}
          style={{
            flex: 1,
            paddingVertical: verticalScale(10),
            borderRadius: moderateScale(12),
            backgroundColor: period === p.id ? accentColor : 'transparent',
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
  );
};
