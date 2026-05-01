import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface UltimateBundleProps {
  onBuy: () => void;
}

export const UltimateBundle: React.FC<UltimateBundleProps> = ({ onBuy }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View style={{ paddingHorizontal: wp(5), marginTop: 15 }}>
      <LinearGradient
        colors={[Colors.card, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: 2, borderWidth: 1, borderColor: 'rgba(99, 153, 34, 0.3)' }}
      >
        <View style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', borderRadius: 26, padding: 24, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ backgroundColor: Colors.correct.main, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>TEK SEFERLİK</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '900' }}>SINIRLI SÜRE</Text>
            </View>
          </View>
          
          <Text style={{ color: Colors.text, fontSize: moderateScale(22), fontWeight: '900' }}>ULTIMATE PAKET</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(13), marginTop: 6, lineHeight: 20 }}>
            10.000 Elmas + Reklamsız Oyun +{"\n"}Özel Çerçeve
          </Text>
          
          <Pressable
            onPress={onBuy}
            style={({ pressed }) => ({
              backgroundColor: Colors.correct.main,
              marginTop: 20,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>HEMEN AL - ₺1.999,99</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};
