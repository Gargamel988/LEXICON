import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface SettingsRowProps {
  icon: any;
  label: string;
  value?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export const SettingsRow = ({ icon, label, value, onPress, isDestructive = false }: SettingsRowProps) => {
  const { moderateScale } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        marginBottom: moderateScale(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)'
      }}
    >
      <View style={{
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        backgroundColor: isDestructive ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(12)
      }}>
        <Ionicons name={icon} size={moderateScale(20)} color={isDestructive ? '#ff4444' : Colors.text} />
      </View>
      <Text style={{ 
        flex: 1, 
        color: isDestructive ? '#ff4444' : Colors.text, 
        fontSize: moderateScale(16), 
        fontWeight: '600' 
      }}>
        {label}
      </Text>
      {value && (
        <Text style={{ color: Colors.textSecondary, marginRight: moderateScale(8), fontSize: moderateScale(14) }}>
          {value}
        </Text>
      )}
      <Ionicons 
        name="chevron-forward" 
        size={moderateScale(20)} 
        color={isDestructive ? '#ff4444' : 'rgba(255,255,255,0.2)'} 
      />
    </TouchableOpacity>
  );
};
