import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PowerUpKey, POWER_UP_DEFINITIONS, renderPowerUpIcon } from '../../constants/powerUps';
import { POWER_UP_PRICES } from '../../services/inventoryService';
import { COIN_ICON, COIN_COLOR } from '../../constants/ui';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface PowerUpSectionProps {
  powerUpKeys: PowerUpKey[];
  onBuy: (key: PowerUpKey) => void;
  buyingKey: PowerUpKey | null;
}

export const PowerUpSection: React.FC<PowerUpSectionProps> = ({ powerUpKeys, onBuy, buyingKey }) => {
  const { moderateScale, wp } = useResponsive();

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24, paddingHorizontal: wp(5) }}>
        <Text style={{ color: Colors.text, fontSize: moderateScale(16), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Güçlendiriciler</Text>
      </View>
      <View style={{ paddingHorizontal: wp(5), gap: 10 }}>
        {powerUpKeys.map((key) => {
          const def = POWER_UP_DEFINITIONS[key];
          if (!def) return null;
          const price = POWER_UP_PRICES[key] ?? 50;
          const isLoading = buyingKey === key;
          return (
            <View key={key} style={{ backgroundColor: Colors.card, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${def.accentColor}15`, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: `${def.accentColor}30` }}>
                  {renderPowerUpIcon(def, 22, def.accentColor)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontWeight: '800', fontSize: moderateScale(14) }}>{def.label}</Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 11, marginTop: 2 }} numberOfLines={1}>{def.description}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => onBuy(key)}
                disabled={isLoading}
                style={({ pressed }) => ({
                  backgroundColor: Colors.background,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  opacity: (pressed || isLoading) ? 0.8 : 1,
                  minWidth: 80,
                  justifyContent: 'center'
                })}
              >
                {isLoading ? <ActivityIndicator size="small" color={Colors.correct.main} /> : (
                  <>
                    <Ionicons name={COIN_ICON} size={12} color={COIN_COLOR} />
                    <Text style={{ color: Colors.text, fontWeight: '900', fontSize: moderateScale(13) }}>{price}</Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};
