import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface AchievementItemProps {
  icon: any;
  label: string;
  color?: string;
}

export const AchievementItem = ({ icon, label, color = '#FFD700' }: AchievementItemProps) => {
  const { moderateScale } = useResponsive();
  const size = moderateScale(70);

  return (
    <View style={{ alignItems: 'center', marginRight: moderateScale(20) }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: moderateScale(8)
      }}>
        <Ionicons name={icon} size={moderateScale(32)} color={color} />
      </View>
      <Text style={{ 
        color: Colors.textSecondary, 
        fontSize: moderateScale(11), 
        fontWeight: '600',
        textAlign: 'center'
      }}>
        {label}
      </Text>
    </View>
  );
};
