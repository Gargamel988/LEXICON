import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
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
import { RegisterForm, registerSchema } from '@/lib/validation';

export default function RegisterScreen() {
  const { moderateScale, verticalScale } = useResponsive();
  const { signUpMutation, signInWithGoogleMutation } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false
    }
  });

  const handleSocialRegister = () => {
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
            {/* ÜST GRUP */}
            <View>
              {/* HEADER - Daha kompakt */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: verticalScale(10),
                marginBottom: verticalScale(15),
                gap: 12
              }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>LEXICON</Text>
                <View style={{ width: 1, height: 16, backgroundColor: '#333' }} />
                <Text style={{ color: Colors.correct.main, fontSize: 10, fontWeight: '800' }}>YENİ HESAP</Text>
              </View>

              {/* TITLE - Minimal */}
              <View style={{ marginBottom: verticalScale(15) }}>
                <Text style={{
                  color: '#fff',
                  fontSize: moderateScale(26),
                  fontWeight: '900',
                  marginBottom: 4
                }}>
                  Hesap Oluştur
                </Text>
                <Text style={{
                  color: Colors.textSecondary,
                  fontSize: moderateScale(14),
                  fontWeight: '500'
                }}>
                  Maceraya katılmak için bilgileri gir.
                </Text>
              </View>

              {/* Hızlı Kayıt */}
               <SocialButton 
                onPress={handleSocialRegister} 
                loading={signInWithGoogleMutation.isPending}
              />

              {/* DIVIDER */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: verticalScale(12)
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
                <Text style={{ color: Colors.textSecondary, marginHorizontal: 16, fontSize: 10, fontWeight: '800' }}>VEYA</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
              </View>

              {/* FORM ALANI - Sıkı Düzen */}
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: verticalScale(-5) }}>
                    <AuthInput
                      label="Kullanıcı Adı"
                      placeholder="kullanıcı_adı"
                      icon="person-outline"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.username?.message}
                    />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: verticalScale(-5) }}>
                    <AuthInput
                      label="E-Posta"
                      placeholder="ornek@mail.com"
                      icon="mail-outline"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />

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

              {/* TERMS - Kompakt */}
              <Controller
                control={control}
                name="terms"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    onPress={() => onChange(!value)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      backgroundColor: value ? Colors.correct.main : '#111',
                      borderWidth: 1.5,
                      borderColor: value ? Colors.correct.main : '#333',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {value && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12, flex: 1 }}>
                      Kullanım koşullarını ve gizliliği kabul ediyorum.
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* ALT GRUP */}
            <View style={{ marginTop: verticalScale(10) }}>
              <AuthButton
                title="Kayıt Ol"
                onPress={handleSubmit((data) => {
                  signUpMutation.mutateAsync(data);
                })}
                loading={signUpMutation.isPending}
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: verticalScale(12),
              }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Zaten bir hesabın var mı? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={{ color: Colors.correct.main, fontWeight: '900', fontSize: 13 }}>Giriş Yap</Text>
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
