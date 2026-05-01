import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface FreeGemButtonProps {
  onWatchAd: () => void;
  isLoading: boolean;
}

export const FreeGemButton: React.FC<FreeGemButtonProps> = ({ onWatchAd, isLoading }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View style={{ paddingHorizontal: wp(5), marginTop: 40, marginBottom: 20 }}>
      <Pressable
        onPress={onWatchAd}
        disabled={isLoading}
        style={({ pressed }) => ({
          backgroundColor: Colors.correct.main,
          borderRadius: 20,
          paddingVertical: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: (pressed || isLoading) ? 0.9 : 1,
        })}
      >
        <Ionicons name="play-circle" size={24} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(16) }}>
          {isLoading ? 'YÜKLENİYOR...' : 'Ücretsiz Elmas Kazan'}
        </Text>
      </Pressable>
    </View>
  );
};
