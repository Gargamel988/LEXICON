import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';

import AuthButton from '@/components/Auth/AuthButton';
import AuthInput from '@/components/Auth/AuthInput';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { moderateScale, verticalScale } = useResponsive();
  const { forgotPasswordMutation } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const result = await forgotPasswordMutation.mutateAsync(data.email);
      if (result.error) {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: result.error.message,
        });
      } else {
        router.replace({ pathname: '/(auth)/verify', params: { type: 'recovery' } });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Beklenmedik bir hata oluştu.',
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            flex: 1,
            paddingHorizontal: moderateScale(24),
            paddingBottom: verticalScale(30),
          }}>
            {/* HEADER */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: verticalScale(10),
              marginBottom: verticalScale(30)
            }}>
              <Pressable
                onPress={() => router.back()}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 8,
                  padding: 5
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>GERİ</Text>
              </Pressable>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>LEXICON</Text>

              <View style={{ width: 44 }} />
            </View>

            {/* ICON SECTION */}
            <View style={{ alignItems: 'center', marginBottom: verticalScale(30) }}>
              <View style={{
                width: moderateScale(80),
                height: moderateScale(80),
                backgroundColor: Colors.card,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)'
              }}>
                <Ionicons name="key-outline" size={40} color={Colors.correct.main} />
              </View>
            </View>

            {/* TITLE SECTION */}
            <View style={{ marginBottom: verticalScale(30) }}>
              <Text style={{
                color: '#fff',
                fontSize: moderateScale(28),
                fontWeight: '900',
                marginBottom: 12
              }}>
                Şifreni mi Unuttun?
              </Text>
              <Text style={{
                color: Colors.textSecondary,
                fontSize: moderateScale(15),
                fontWeight: '500',
                lineHeight: 22
              }}>
                E-posta adresini gir, sana şifreni sıfırlaman için bir bağlantı gönderelim.
              </Text>
            </View>

            {/* FORM SECTION */}
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="E-Posta Adresi"
                    placeholder="ornek@eposta.com"
                    icon="at-outline"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <AuthButton
                title="Sıfırlama Bağlantısı Gönder"
                onPress={handleSubmit(onSubmit)}
                loading={forgotPasswordMutation.isPending}
                style={{ marginTop: verticalScale(10) }}
              />
            </View>

            {/* FOOTER INFO */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 20,
              marginTop: verticalScale(20),
            }}>
              <Text style={{ color: '#222', fontSize: 10, fontWeight: '800' }}>OBSIDIAN PROTOCOL</Text>
              <Text style={{ color: '#222', fontSize: 10, fontWeight: '800' }}>ENCRYPTED</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
