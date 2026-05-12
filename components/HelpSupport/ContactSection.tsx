/**
 * İletişim bölümü
 * E-posta + Destek sitesi linki
 */
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

import Toast from 'react-native-toast-message';

const SUPPORT_EMAIL = 'omeraydin1.web@gmail.com';
const DEVELOPER_URL = 'https://hatayyazilim.com/contact';

interface ContactRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}

const ContactRow = ({ icon, label, description, color, onPress }: ContactRowProps) => {
  const { moderateScale } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        padding: 14,
        marginBottom: 8,
      })}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: `${color}18`,
        borderWidth: 1, borderColor: `${color}30`,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: moderateScale(14) }}>{label}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
    </Pressable>
  );
};

export const ContactSection = () => {
  const { moderateScale } = useResponsive();

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=LEXİCON%20Destek`).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'E-posta uygulaması açılamadı.'
      });
    });
  };

  const handleWeb = () => {
    WebBrowser.openBrowserAsync(DEVELOPER_URL);
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: 'rgba(74,158,255,0.15)',
          borderWidth: 1, borderColor: 'rgba(74,158,255,0.25)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#4A9EFF" />
        </View>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>
          Bize Ulaşın
        </Text>
      </View>

      <ContactRow
        icon="mail-outline"
        label="E-posta ile Yaz"
        description={SUPPORT_EMAIL}
        color="#4A9EFF"
        onPress={handleEmail}
      />
      <ContactRow
        icon="globe-outline"
        label="Destek Merkezi"
        description="Sık sorulan sorular ve kılavuzlar"
        color="#a78bfa"
        onPress={handleWeb}
      />
      <ContactRow
        icon="code-slash-outline"
        label="Geliştirici — Hatay Yazılım"
        description="hatayyazilim.com/contact"
        color="#34d399"
        onPress={() => WebBrowser.openBrowserAsync(DEVELOPER_URL)}
      />
    </View>
  );
};
