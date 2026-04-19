import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import InfoTooltip from '../Common/InfoTooltip';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  large?: boolean;
  icon?: string;
  trend?: string;
  info?: string;
}

export default function StatCard({ label, value, sub, accent, large = false, icon, trend, info }: StatCardProps) {
  const { moderateScale } = useResponsive();

  return (
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 24,
      padding: moderateScale(16),
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
      justifyContent: 'center',
      minHeight: moderateScale(95),
      zIndex: info ? 10 : 1,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        {icon && <Ionicons name={icon as any} size={moderateScale(14)} color={accent} />}
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>{label}</Text>
        {info && <InfoTooltip content={info} size={11} />}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={{
          color: '#fff',
          fontSize: moderateScale(large ? 28 : 22),
          fontWeight: '900',
          fontVariant: ['tabular-nums'],
        }}>
          {value}
        </Text>
        {trend && (
          <Text style={{ color: trend.startsWith('+') ? '#4ade80' : '#ff4d4d', fontSize: moderateScale(10), fontWeight: '800' }}>
            {trend}
          </Text>
        )}
      </View>

      {sub && (
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(9.5), marginTop: 4, fontWeight: '700' }}>
          {sub}
        </Text>
      )}
    </View>
  );
}
