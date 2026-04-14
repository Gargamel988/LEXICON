import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import AuthButton from '@/components/Auth/AuthButton';
import AuthInput from '@/components/Auth/AuthInput';
import SocialButton from '@/components/Auth/SocialButton';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';
import { LoginForm, loginSchema } from '@/lib/validation';

export default function LoginScreen() {
  const { moderateScale, verticalScale } = useResponsive();
  const { signInMutation, signInWithGoogleMutation } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const handleSocialLogin = () => {
    signInWithGoogleMutation.mutate();
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
            justifyContent: 'space-between',
            paddingTop: verticalScale(10),
            paddingBottom: verticalScale(30),
          }}>
            {/* ÜST GRUP: Logo ve Hoşgeldin Metni */}
            <View>
              <View style={{ alignItems: 'center', marginBottom: verticalScale(25), marginTop: verticalScale(20) }}>
                <View style={{
                  width: moderateScale(52),
                  height: moderateScale(52),
                  backgroundColor: Colors.card,
                  borderRadius: 14,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)'
                }}>
                  <Ionicons name="grid" size={26} color={Colors.correct.main} />
                </View>
                <Text style={{
                  color: Colors.correct.main,
                  fontSize: moderateScale(24),
                  fontWeight: '900',
                  letterSpacing: 4
                }}>
                  LEXICON
                </Text>
                <Text style={{
                  color: Colors.textSecondary,
                  fontSize: moderateScale(10),
                  fontWeight: '700',
                  letterSpacing: 2,
                  marginTop: 2
                }}>
                  THE OBSIDIAN LEXICON
                </Text>
              </View>

              <View style={{ marginBottom: verticalScale(15) }}>
                <Text style={{
                  color: '#fff',
                  fontSize: moderateScale(26),
                  fontWeight: '900',
                  marginBottom: 4
                }}>
                  Giriş Yap
                </Text>
                <Text style={{
                  color: Colors.textSecondary,
                  fontSize: moderateScale(14),
                  fontWeight: '500'
                }}>
                  Macerana kaldığın yerden devam et.
                </Text>
              </View>

              <SocialButton 
                onPress={handleSocialLogin} 
                loading={signInWithGoogleMutation.isPending}
              />

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: verticalScale(12)
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
                <Text style={{
                  color: Colors.textSecondary,
                  marginHorizontal: 16,
                  fontSize: 10,
                  fontWeight: '800'
                }}>
                  VEYA E-POSTA İLE
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
              </View>

              {/* FORM ALANI */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="E-Posta"
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

              <View style={{ marginTop: moderateScale(5) }}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AuthInput
                      label="Şifre"
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
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable style={{ alignSelf: 'flex-end', marginTop: moderateScale(-10), padding: 5 }}>
                    <Text style={{
                      color: Colors.correct.main,
                      fontSize: moderateScale(12),
                      fontWeight: '800'
                    }}>
                      Şifremi Unuttum
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* ALT GRUP: Buton ve Kayıt Linki */}
            <View style={{ marginTop: verticalScale(20) }}>
              <AuthButton
                title="Giriş Yap"
                onPress={handleSubmit((data) => {
                  signInMutation.mutateAsync(data);
                })}
                loading={signInMutation.isPending}
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: verticalScale(15),
              }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Hesabın yok mu? </Text>
                <Link href="/(auth)/register" asChild>
                  <Pressable>
                    <Text style={{ color: Colors.correct.main, fontWeight: '900', fontSize: 13 }}>Kayıt Ol</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
