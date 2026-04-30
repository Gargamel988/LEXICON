/**
 * Paylaşılan kart wrapper — her sekme içeriği bunu kullanır.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface SettingCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export const SettingCard = ({
  icon,
  title,
  subtitle,
  accentColor = '#fff',
  children,
}: SettingCardProps) => {
  const { moderateScale } = useResponsive();

  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.07)',
      padding: 20,
      marginBottom: 16,
    }}>
      {/* Başlık */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: `${accentColor}18`,
          borderWidth: 1, borderColor: `${accentColor}30`,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name={icon} size={20} color={accentColor} />
        </View>
        <View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: moderateScale(15) }}>{title}</Text>
          {subtitle && (
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
      </View>

      {children}
    </View>
  );
};
