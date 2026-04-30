/**
 * Yasal bağlantılar + Uygulamayı Puanla
 */
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

const TERMS_URL = 'https://lexicon.app/kullanim-kosullari';
const PRIVACY_URL = 'https://lexicon.app/gizlilik-politikasi';

interface LegalRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
}

const LegalRow = ({ icon, label, color = 'rgba(255,255,255,0.5)', onPress, badge, badgeColor }: LegalRowProps) => {
  const { moderateScale } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 4,
        opacity: pressed ? 0.7 : 1,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      })}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: moderateScale(14), fontWeight: '600' }}>
        {label}
      </Text>
      {badge && (
        <View style={{
          backgroundColor: `${badgeColor ?? '#ffc400'}20`,
          borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
          borderWidth: 1, borderColor: `${badgeColor ?? '#ffc400'}40`,
        }}>
          <Text style={{ color: badgeColor ?? '#ffc400', fontSize: moderateScale(10), fontWeight: '800' }}>
            {badge}
          </Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.15)" />
    </Pressable>
  );
};

export const LegalSection = () => {
  const { moderateScale } = useResponsive();

  const handleRate = async () => {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
  };

  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.07)',
      paddingHorizontal: 16,
      marginBottom: 32,
    }}>
      <LegalRow
        icon="star-outline"
        label="Uygulamayı Puanla"
        color="#ffc400"
        badge="⭐ 5 saniye"
        badgeColor="#ffc400"
        onPress={handleRate}
      />
      <LegalRow
        icon="document-text-outline"
        label="Kullanım Koşulları"
        onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}
      />
      <LegalRow
        icon="shield-outline"
        label="Gizlilik Politikası"
        onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
      />
      <View style={{ paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: moderateScale(11), fontWeight: '600' }}>
          LEXİCON v1.0.0 · Tüm hakları saklıdır
        </Text>
      </View>
    </View>
  );
};
