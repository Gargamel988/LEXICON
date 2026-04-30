/**
 * Şifre değiştirme bölümü
 * React Hook Form + React Query mutation + güç göstergesi
 */
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useResponsive } from '../../hooks/useResponsive';
import { supabase } from '../../lib/supabase';
import { SettingCard } from './SettingCard';

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

/** 1-4 arası güç skoru */
function passwordStrength(pw: string): number {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.max(1, score);
}

const STRENGTH_COLORS = ['', '#ff3b30', '#ff9500', '#ffd60a', '#30d158'];
const STRENGTH_LABELS = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];

export const PasswordSection = () => {
  const { moderateScale } = useResponsive();
  const [showPw, setShowPw] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPw = watch('newPassword');
  const strength = passwordStrength(newPw);

  const mutation = useMutation({
    mutationFn: async ({ newPassword }: PasswordFormValues) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Şifre Güncellendi ✓' });
      reset();
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: 'Hata', text2: err.message });
    },
  });

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff' as const,
    fontSize: moderateScale(14),
    paddingRight: 48, // eye button için boşluk
  };

  return (
    <SettingCard icon="lock-closed-outline" title="Şifre Değiştir" subtitle="En az 8 karakter" accentColor="#30d158">

      {/* Yeni şifre */}
      <Controller
        control={control}
        name="newPassword"
        rules={{
          required: 'Şifre zorunlu',
          minLength: { value: 8, message: 'En az 8 karakter olmalı' },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 12 }}>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[inputStyle, { borderColor: errors.newPassword ? '#ff3b30' : 'rgba(255,255,255,0.1)' }]}
                placeholder="Yeni şifre"
                placeholderTextColor="rgba(255,255,255,0.25)"
                secureTextEntry={!showPw}
                value={value}
                onChangeText={onChange}
              />
              <Pressable
                onPress={() => setShowPw(s => !s)}
                hitSlop={10}
                style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="rgba(255,255,255,0.35)"
                />
              </Pressable>
            </View>
            {errors.newPassword && (
              <Text style={{ color: '#ff3b30', fontSize: moderateScale(11), marginTop: 4 }}>
                {errors.newPassword.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Güç göstergesi */}
      {newPw.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
            {[1, 2, 3, 4].map(lvl => (
              <View
                key={lvl}
                style={{
                  flex: 1, height: 4, borderRadius: 2,
                  backgroundColor: lvl <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </View>
          <Text style={{ color: STRENGTH_COLORS[strength], fontSize: moderateScale(11), fontWeight: '700' }}>
            {STRENGTH_LABELS[strength]}
          </Text>
        </View>
      )}

      {/* Şifre tekrar */}
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: 'Tekrar gir',
          validate: (val) => val === newPw || 'Şifreler eşleşmiyor',
        }}
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={[inputStyle, {
                paddingRight: 16,
                borderColor: errors.confirmPassword ? '#ff3b30'
                  : (value && value === newPw ? '#30d158' : 'rgba(255,255,255,0.1)'),
              }]}
              placeholder="Yeni şifre (tekrar)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry={!showPw}
              value={value}
              onChangeText={onChange}
            />
            {errors.confirmPassword && (
              <Text style={{ color: '#ff3b30', fontSize: moderateScale(11), marginTop: 4 }}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit((data) => mutation.mutate(data))}
        disabled={mutation.isPending}
        style={({ pressed }) => ({
          backgroundColor: mutation.isPending ? 'rgba(48,209,88,0.3)' : '#30d158',
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center' as const,
          opacity: pressed ? 0.85 : 1,
          flexDirection: 'row' as const,
          justifyContent: 'center' as const,
          gap: 8,
        })}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: moderateScale(14) }}>
              Şifreyi Güncelle
            </Text>
          </>
        )}
      </Pressable>
    </SettingCard>
  );
};
