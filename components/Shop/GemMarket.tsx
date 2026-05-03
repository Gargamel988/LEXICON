import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { COIN_COLOR, COIN_ICON } from '../../constants/ui';
import { useResponsive } from '../../hooks/useResponsive';

interface GemPack {
  id: string;
  coins: number;
  price: string;
  color: string;
  bonus: string | null;
}

interface GemMarketProps {
  packages: GemPack[];
  onBuy: (pkg: GemPack) => void;
}

export const GemMarket: React.FC<GemMarketProps> = ({ packages, onBuy }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24, paddingHorizontal: wp(5) }}>
        <Text style={{ color: Colors.text, fontSize: moderateScale(16), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Elmas Market</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(5), paddingVertical: 10, gap: 12 }}>
        {packages.map((pkg) => (
          <Pressable
            key={pkg.id}
            onPress={() => onBuy(pkg)}
            style={{
              width: 140,

              backgroundColor: Colors.card, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: pkg.bonus ? Colors.correct.main : Colors.border
            }}
          >
            {pkg.bonus && (
              <View style={{ position: 'absolute', top: -10, alignSelf: 'center', backgroundColor: Colors.correct.main, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, zIndex: 5 }}>
                <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{pkg.bonus}</Text>
              </View>
            )}
            <Ionicons name={COIN_ICON} size={28} color={COIN_COLOR} />
            <Text style={{ color: Colors.text, fontSize: moderateScale(18), fontWeight: '900', marginTop: 12 }}>{pkg.coins}</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 2 }}>ELMAS</Text>
            <View style={{ width: '100%', height: 1, backgroundColor: Colors.border, marginVertical: 12 }} />
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', marginTop: 'auto', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ color: Colors.text, fontWeight: '800', fontSize: moderateScale(13) }}>{pkg.price}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
