import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactSection } from '../../components/HelpSupport/ContactSection';
import { FaqSection } from '../../components/HelpSupport/FaqSection';
import { LegalSection } from '../../components/HelpSupport/LegalSection';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { moderateScale } = useResponsive();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      {/* Gradient */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,196,0,0.08)', 'transparent']}
          style={{ flex: 1 }}
        />
      </View>

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 12,
      }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
          })}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(18) }}>
            Yardım ve Destek
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 1 }}>
            SSS · İletişim · Yasal
          </Text>
        </View>

        {/* Hızlı destek butonu */}
        <Pressable
          onPress={() => {
            // ContactSection e-posta ile aynı davranış
            import('expo-linking').then((Linking) =>
              Linking.openURL('mailto:destek@lexicon.app?subject=LEX%C4%B0CON%20Destek')
            );
          }}
          style={({ pressed }) => ({
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: pressed ? 'rgba(74,158,255,0.2)' : 'rgba(74,158,255,0.1)',
            borderWidth: 1, borderColor: 'rgba(74,158,255,0.25)',
            justifyContent: 'center', alignItems: 'center',
          })}
        >
          <Ionicons name="mail-outline" size={18} color="#4A9EFF" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}
      >
        {/* SSS */}
        <FaqSection />

        {/* İletişim */}
        <ContactSection />

        {/* Yasal + Puan */}
        <LegalSection />
      </ScrollView>
    </SafeAreaView>
  );
}
