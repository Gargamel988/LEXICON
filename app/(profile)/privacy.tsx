import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrivacySection } from '../../components/Privacy/PrivacySection';
import Colors from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

export default function PrivacyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { moderateScale } = useResponsive();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }} pointerEvents="none">
        <LinearGradient colors={['rgba(167,139,250,0.08)', 'transparent']} style={{ flex: 1 }} />
      </View>

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14, gap: 12,
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
        <View>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(18) }}>
            Gizlilik ve Güvenlik
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 1 }}>
            Profil ve liderboard görünürlüğü
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
      >
        {user?.id && <PrivacySection userId={user.id} />}

        {/* Bilgi notu */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', gap: 10,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          padding: 14,
        }}>
          <Ionicons name="shield-outline" size={16} color="rgba(255,255,255,0.3)" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(11), lineHeight: 17 }}>
            Profilini gizlersen diğer oyuncular seni liderboardda ve oyuncu profillerinde göremez.
            Oyun verilen anonim olarak istatistiklere katkı sağlamaya devam eder.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
