/**
 * E-posta değiştirme bölümü
 * React Hook Form + React Query mutation
 */
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useResponsive } from '../../hooks/useResponsive';
import { supabase } from '../../lib/supabase';
import { SettingCard } from './SettingCard';

interface EmailFormValues {
  newEmail: string;
}

interface EmailSectionProps {
  currentEmail: string;
}

export const EmailSection = ({ currentEmail }: EmailSectionProps) => {
  const { moderateScale } = useResponsive();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EmailFormValues>({
    defaultValues: { newEmail: '' },
  });

  const mutation = useMutation({
    mutationFn: async ({ newEmail }: EmailFormValues) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Doğrulama Gönderildi',
        text2: 'Yeni e-posta adresini kontrol et ve linke tıkla.',
      });
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
  };

  return (
    <SettingCard icon="mail-outline" title="E-posta Değiştir" subtitle={`Mevcut: ${currentEmail}`} accentColor="#4A9EFF">
      <Controller
        control={control}
        name="newEmail"
        rules={{
          required: 'E-posta zorunlu',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Geçerli bir e-posta gir' },
        }}
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={[inputStyle, { borderColor: errors.newEmail ? '#ff3b30' : 'rgba(255,255,255,0.1)' }]}
              placeholder="yeni@eposta.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
            />
            {errors.newEmail && (
              <Text style={{ color: '#ff3b30', fontSize: moderateScale(11), marginTop: 4 }}>
                {errors.newEmail.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit((data) => mutation.mutate(data))}
        disabled={mutation.isPending || !isDirty}
        style={({ pressed }) => ({
          backgroundColor: mutation.isPending || !isDirty ? 'rgba(74,158,255,0.3)' : '#4A9EFF',
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
            <Ionicons name="send-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: moderateScale(14) }}>
              Doğrulama Gönder
            </Text>
          </>
        )}
      </Pressable>
    </SettingCard>
  );
};
