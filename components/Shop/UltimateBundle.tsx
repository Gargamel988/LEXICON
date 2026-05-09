import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface UltimateBundleProps {
  onBuy: () => void;
  isLoading?: boolean;
}

export const UltimateBundle: React.FC<UltimateBundleProps> = ({ onBuy, isLoading }) => {
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

          <View style={{ marginTop: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,214,0,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="diamond" size={14} color="#ffd600" />
              </View>
              <Text style={{ color: '#fff', fontSize: moderateScale(13), fontWeight: '700' }}>10.000 Elmas</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={14} color="#3b82f6" />
              </View>
              <Text style={{ color: '#fff', fontSize: moderateScale(13), fontWeight: '700' }}>Sınırsız Reklamsız Oyun</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(192,132,252,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={14} color="#c084fc" />
              </View>
              <Text style={{ color: '#fff', fontSize: moderateScale(13), fontWeight: '700' }}>Özel Hareketli Çerçeve</Text>
            </View>
          </View>

          <Pressable
            onPress={onBuy}
            disabled={isLoading}
            style={({ pressed }) => ({
              backgroundColor: Colors.correct.main,
              marginTop: 20,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              opacity: (pressed || isLoading) ? 0.9 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>
              {isLoading ? 'BEKLEYİN...' : 'HEMEN AL - ₺1.999,99'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};
