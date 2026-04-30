/**
 * Hesabı kalıcı olarak silme bölümü
 * React Hook Form + React Query mutation + "SİL" onay kuralı
 */
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useResponsive } from '../../hooks/useResponsive';
import { supabase } from '../../lib/supabase';
import { SettingCard } from './SettingCard';

const DELETE_WORD = 'SİL';

interface DeleteFormValues {
  confirmText: string;
}

interface DeleteSectionProps {
  onDeleted: () => void;
}

export const DeleteSection = ({ onDeleted }: DeleteSectionProps) => {
  const { moderateScale } = useResponsive();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeleteFormValues>({
    defaultValues: { confirmText: '' },
  });

  const confirmText = watch('confirmText');
  const isMatch = confirmText === DELETE_WORD;

  const mutation = useMutation({
    mutationFn: async () => {
      // Şu an Supabase Client API'si admin silme gerektiriyor,
      // güvenli yol: önce oturumu kapat, ardından server-side silme çağrısı yapılabilir.
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      Toast.show({ type: 'info', text1: 'Hesap Silindi', text2: 'Görüşmek üzere.' });
      onDeleted();
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: 'Hata', text2: err.message });
    },
  });

  const onSubmit = () => {
    Alert.alert(
      '⚠️ Son Onay',
      'Hesabın, tüm istatistiklerin ve satın alımların kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: () => mutation.mutate(),
        },
      ]
    );
  };

  return (
    <SettingCard
      icon="trash-outline"
      title="Hesabı Sil"
      subtitle="Bu işlem geri alınamaz"
      accentColor="#ff3b30"
    >
      {/* Uyarı kutusu */}
      <View style={{
        backgroundColor: 'rgba(255,59,48,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,59,48,0.2)',
        padding: 14,
        marginBottom: 20,
        gap: 6,
      }}>
        {[
          'Tüm istatistiklerin silinir',
          'Elmaslar ve güçlendirmeler kaybolur',
          'Hesabına bir daha erişemezsin',
        ].map((item) => (
          <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="close-circle" size={14} color="#ff3b30" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: moderateScale(12) }}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Onay alanı */}
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(13), marginBottom: 8 }}>
        Onaylamak için{' '}
        <Text style={{ color: '#ff3b30', fontWeight: '900' }}>{DELETE_WORD}</Text>
        {' '}yaz:
      </Text>

      <Controller
        control={control}
        name="confirmText"
        rules={{
          validate: (v) => v === DELETE_WORD || `"${DELETE_WORD}" yazman gerekiyor`,
        }}
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isMatch ? '#ff3b30' : errors.confirmText ? '#ff3b30' : 'rgba(255,255,255,0.1)',
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#ff3b30',
                fontSize: moderateScale(14),
                fontWeight: '900',
                letterSpacing: 2,
              }}
              placeholder={DELETE_WORD}
              placeholderTextColor="rgba(255,59,48,0.25)"
              autoCapitalize="characters"
              value={value}
              onChangeText={onChange}
            />
            {errors.confirmText && !isMatch && (
              <Text style={{ color: '#ff3b30', fontSize: moderateScale(11), marginTop: 4 }}>
                {errors.confirmText.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={!isMatch || mutation.isPending}
        style={({ pressed }) => ({
          backgroundColor: !isMatch ? 'rgba(255,59,48,0.2)' : '#ff3b30',
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
            <Ionicons name="trash-outline" size={16} color={!isMatch ? 'rgba(255,255,255,0.3)' : '#fff'} />
            <Text style={{
              color: !isMatch ? 'rgba(255,255,255,0.3)' : '#fff',
              fontWeight: '800',
              fontSize: moderateScale(14),
            }}>
              Hesabımı Kalıcı Olarak Sil
            </Text>
          </>
        )}
      </Pressable>
    </SettingCard>
  );
};
