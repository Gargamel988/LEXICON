import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface BundlePack {
  id: string;
  label: string;
  price: string;
  color: string;
  badge: string | null;
  desc: string;
  icon: string;
}

interface BundleSectionProps {
  bundles: BundlePack[];
  onBuy: (pkg: BundlePack) => void;
  loadingId?: string | null;
}

export const BundleSection: React.FC<BundleSectionProps> = ({ bundles, onBuy, loadingId }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32, paddingHorizontal: wp(5) }}>
        <Text style={{ color: Colors.text, fontSize: moderateScale(17), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Avantajlı Paketler</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(10), fontWeight: '800' }}>TEK SEFERLİK</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), paddingVertical: 15, gap: 16 }}>
        {bundles.map((pkg) => (
          <Pressable
            key={pkg.id}
            onPress={() => onBuy(pkg)}
            disabled={!!loadingId}
            style={({ pressed }) => ({
              width: wp(65),
              borderRadius: 30,
              overflow: 'hidden',
              opacity: (pressed || (loadingId === pkg.id)) ? 0.9 : 1,
              shadowColor: pkg.color,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
            })}
          >
            <LinearGradient
              colors={[pkg.color + '20', Colors.card]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, minHeight: 230, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 30 }}
            >
              {pkg.badge && (
                <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: pkg.color, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, zIndex: 10 }}>
                  <Text style={{ color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>{pkg.badge}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                <View style={{ width: 50, height: 50, borderRadius: 18, backgroundColor: pkg.color + '30', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: pkg.color + '50' }}>
                  <MaterialCommunityIcons name={pkg.icon as any} size={28} color={pkg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontSize: moderateScale(16), fontWeight: '900' }}>{pkg.label}</Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600' }}>Özel Teklif</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {pkg.desc.split(/[&+] /).map((item, idx) => (
                  <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{item.trim()}</Text>
                  </View>
                ))}
              </View>

              <View style={{
                backgroundColor: pkg.color,
                marginTop: 'auto',
                paddingVertical: 12,
                borderRadius: 18,
                alignItems: 'center',
                shadowColor: pkg.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}>
                <Text style={{ color: '#000', fontWeight: '900', fontSize: moderateScale(14) }}>
                  {loadingId === pkg.id ? '...' : pkg.price}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
