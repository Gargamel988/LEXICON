import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthButton from '@/components/Auth/AuthButton';
import Colors from '@/constants/Colors';
import { useResponsive } from '@/hooks/useResponsive';

export default function VerifyEmailScreen() {
  const { moderateScale, verticalScale } = useResponsive();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: 'signup' | 'recovery' }>();

  // Sayfa içeriğini tipe göre ayarla
  const isRecovery = type === 'recovery';
  
  const content = {
    title: isRecovery ? "Şifre Yenileme" : "E-Postanı Kontrol Et",
    description: isRecovery 
      ? "Şifreni sıfırlaman için sana özel bir bağlantı gönderdik. Lütfen gelen kutunu kontrol et." 
      : "Hesabını aktifleştirmek için sana bir doğrulama linki gönderdik. Maceraya devam etmek için lütfen linke tıkla.",
    icon: isRecovery ? "key-outline" : "mail-unread-outline" as any,
    accentColor: isRecovery ? "#ef4444" : Colors.correct.main 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{
        flex: 1,
        paddingHorizontal: moderateScale(24),
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* ICON CONTAINER */}
        <View style={{
          width: moderateScale(100),
          height: moderateScale(100),
          borderRadius: 24,
          backgroundColor: Colors.card,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: verticalScale(30),
          // Glow effect
          shadowColor: content.accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 15,
          elevation: 5
        }}>
          <Ionicons name={content.icon} size={moderateScale(44)} color={content.accentColor} />
        </View>

        {/* TEXT CONTENT */}
        <Text style={{
          color: '#fff',
          fontSize: moderateScale(28),
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: 10
        }}>
          {content.title}
        </Text>
        
        <Text style={{
          color: Colors.textSecondary,
          fontSize: moderateScale(15),
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: verticalScale(40),
          paddingHorizontal: 10
        }}>
          {content.description}
        </Text>

        {/* ACTIONS */}
        <View style={{ width: '100%', gap: 15 }}>
          <AuthButton
            title="Giriş Sayfasına Dön"
            onPress={() => router.replace('/(auth)/login')}
          />
          
          <Pressable 
            onPress={() => { /* Resend logic placeholder */ }}
            style={{ 
              alignItems: 'center', 
              paddingVertical: 10 
            }}
          >
            <Text style={{ 
              color: content.accentColor, 
              fontSize: 14, 
              fontWeight: '800'
            }}>
              Link gelmedi mi? Tekrar Gönder
            </Text>
          </Pressable>
        </View>

        {/* INFO BOX */}
        <View style={{
          position: 'absolute',
          bottom: verticalScale(30),
          padding: 15,
          backgroundColor: Colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
          width: '100%'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="information-circle-outline" size={18} color={content.accentColor} />
            <Text style={{ color: content.accentColor, fontWeight: '900', fontSize: 13, letterSpacing: 1 }}>BİLGİ</Text>
          </View>
          <Text style={{ color: Colors.textSecondary, fontSize: 12, lineHeight: 18 }}>
            {isRecovery 
              ? "Linke tıkladığında yeni şifre belirleme ekranına yönlendirileceksin." 
              : "Doğrulama linkine tıkladığında uygulama otomatik olarak açılacak ve giriş yapacaktır."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
