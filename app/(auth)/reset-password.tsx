import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';

import AuthButton from '@/components/Auth/AuthButton';
import AuthInput from '@/components/Auth/AuthInput';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { passwordSchema } from '@/lib/validation';

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { moderateScale, verticalScale } = useResponsive();
  const { updatePasswordMutation } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const result = await updatePasswordMutation.mutateAsync(data.password);
      if (result.error) {
        let errorMessage = 'Şifre güncellenirken bir hata oluştu.';
        
        if (result.error.message === "Invalid or expired token") {
          errorMessage = "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar link talep edin.";
        } else if (result.error.message === "New password should be different from the old password") {
          errorMessage = "Yeni şifreniz eski şifrenizle aynı olamaz.";
        } else {
          errorMessage = result.error.message;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: errorMessage,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Şifreniz başarıyla güncellendi.',
        });
        router.replace('/(auth)/login');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Şifre güncellenirken bir hata oluştu.',
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
              alignItems: 'center',
              marginTop: verticalScale(10),
              marginBottom: verticalScale(30)
            }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>LEXICON</Text>
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
                <Ionicons name="shield-checkmark-outline" size={40} color={Colors.correct.main} />
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
                Yeni Şifre Belirle
              </Text>
              <Text style={{
                color: Colors.textSecondary,
                fontSize: moderateScale(15),
                fontWeight: '500',
                lineHeight: 22
              }}>
                Lütfen hesabın için yeni ve güvenli bir şifre belirle.
              </Text>
            </View>

            {/* FORM SECTION */}
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Yeni Şifre"
                    placeholder="••••••••"
                    icon="lock-closed-outline"
                    isPassword
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Şifreyi Onayla"
                    placeholder="••••••••"
                    icon="checkmark-circle-outline"
                    isPassword
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <AuthButton
                title="Şifreyi Güncelle"
                onPress={handleSubmit(onSubmit)}
                loading={updatePasswordMutation.isPending}
                style={{ marginTop: verticalScale(10) }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
