import { MaterialCommunityIcons } from '@expo/vector-icons';
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
}

export const BundleSection: React.FC<BundleSectionProps> = ({ bundles, onBuy }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24, paddingHorizontal: wp(5) }}>
        <Text style={{ color: Colors.text, fontSize: moderateScale(16), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Avantajlı Paketler</Text>
        <Text style={{ color: Colors.correct.main, fontSize: moderateScale(12), fontWeight: '700' }}>TEK SEFERLİK</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), paddingVertical: 10, gap: 12 }}>

        {bundles.map((pkg) => (
          <Pressable
            key={pkg.id}
            onPress={() => onBuy(pkg)}
            style={{ flex: 1, backgroundColor: Colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.border, position: 'relative', minHeight: 160 }}
          >
            {pkg.badge && (
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: Colors.correct.main, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{pkg.badge}</Text>
              </View>
            )}
            <MaterialCommunityIcons name={pkg.icon as any} size={24} color={Colors.correct.main} />
            <Text style={{ color: Colors.text, fontSize: moderateScale(15), fontWeight: '900', marginTop: 12 }}>{pkg.label}</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 11, marginTop: 4 }}>{pkg.desc}</Text>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', marginTop: 'auto', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ color: Colors.text, fontWeight: '900', fontSize: moderateScale(13) }}>{pkg.price}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
