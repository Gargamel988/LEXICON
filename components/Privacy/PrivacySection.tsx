/**
 * Gizlilik ayarları bölümü
 * React Hook Form + React Query mutation + Supabase profiles update
 */
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useResponsive } from '../../hooks/useResponsive';
import { supabase } from '../../lib/supabase';

interface PrivacySettings {
  is_public: boolean;
  show_on_leaderboard: boolean;
}

async function fetchPrivacy(userId: string): Promise<PrivacySettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_public, show_on_leaderboard')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as PrivacySettings;
}

async function updatePrivacy(userId: string, patch: Partial<PrivacySettings>) {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}

interface ToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  color?: string;
  onToggle: (v: boolean) => void;
  isLoading?: boolean;
}

const ToggleRow = ({
  icon, label, description, value, color = '#4A9EFF', onToggle, isLoading,
}: ToggleRowProps) => {
  const { moderateScale } = useResponsive();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    }}>
      <View style={{
        width: 38, height: 38, borderRadius: 11,
        backgroundColor: `${color}18`,
        borderWidth: 1, borderColor: `${color}28`,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: moderateScale(13) }}>{label}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), marginTop: 2 }}>
          {description}
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        /* Native-style Toggle */
        <View
          onTouchEnd={() => onToggle(!value)}
          style={{
            width: 48, height: 28, borderRadius: 14,
            backgroundColor: value ? color : 'rgba(255,255,255,0.12)',
            justifyContent: 'center',
            paddingHorizontal: 3,
            alignItems: value ? 'flex-end' : 'flex-start',
          }}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }} />
        </View>
      )}
    </View>
  );
};

interface PrivacySectionProps {
  userId: string;
}

export const PrivacySection = ({ userId }: PrivacySectionProps) => {
  const { moderateScale } = useResponsive();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['privacy', userId],
    queryFn: () => fetchPrivacy(userId),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<PrivacySettings>) => updatePrivacy(userId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy', userId] });
      Toast.show({ type: 'success', text1: 'Kaydedildi' });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Değişiklik kaydedilemedi.' });
    },
  });

  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.07)',
      paddingHorizontal: 16,
      marginBottom: 16,
    }}>
      {/* Başlık */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: 'rgba(167,139,250,0.15)',
          borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name="shield-checkmark-outline" size={17} color="#a78bfa" />
        </View>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>
          Gizlilik
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#a78bfa" style={{ paddingBottom: 20 }} />
      ) : (
        <>
          <ToggleRow
            icon="person-outline"
            label="Herkese Açık Profil"
            description="Diğer oyuncular profilini görebilir"
            value={data?.is_public ?? true}
            color="#a78bfa"
            onToggle={(v) => mutation.mutate({ is_public: v })}
            isLoading={mutation.isPending}
          />
          <ToggleRow
            icon="trophy-outline"
            label="Liderboard'da Görün"
            description="Sıralamada adın listede çıksın"
            value={data?.show_on_leaderboard ?? true}
            color="#ffc400"
            onToggle={(v) => mutation.mutate({ show_on_leaderboard: v })}
            isLoading={mutation.isPending}
          />
        </>
      )}
    </View>
  );
};
