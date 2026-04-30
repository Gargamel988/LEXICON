import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationsSection } from '../../components/Notifications/NotificationsSection';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

export default function NotificationsScreen() {
  const router = useRouter();
  const { moderateScale } = useResponsive();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }} pointerEvents="none">
        <LinearGradient colors={['rgba(74,158,255,0.08)', 'transparent']} style={{ flex: 1 }} />
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
            Bildirimler
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(11), marginTop: 1 }}>
            Bildirim tercihlerini yönet
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
      >
        <NotificationsSection />

        {/* Bilgi notu */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', gap: 10,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          padding: 14, marginTop: 4,
        }}>
          <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.3)" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, color: 'rgba(255,255,255,0.3)', fontSize: moderateScale(11), lineHeight: 17 }}>
            Tercihler cihazına kaydedilir. Gerçek push bildirimleri üretim sürümünde (development build) aktif olur.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
