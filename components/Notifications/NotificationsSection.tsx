/**
 * Bildirim toggle bileşeni
 * expo-notifications ile izin yönetimi + async storage ile tercih saklama
 */
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

const STORAGE_KEY = 'notification_prefs';

interface NotifPrefs {
  game_results: boolean;
  daily_reminder: boolean;
  leaderboard: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  game_results: true,
  daily_reminder: true,
  leaderboard: false,
};

async function loadPrefs(): Promise<NotifPrefs> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PREFS;
  return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
}

async function savePrefs(prefs: NotifPrefs): Promise<NotifPrefs> {
  // İzin kontrolü — development build / production'da çalışır
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: asked } = await Notifications.requestPermissionsAsync();
    if (asked !== 'granted') {
      Alert.alert(
        'Bildirim İzni Gerekli',
        'Bildirimleri açmak için cihaz ayarlarından izin ver.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
        ],
      );
      return loadPrefs(); // toggle'ı geri al
    }
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  return prefs;
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

const ToggleRow = ({ icon, label, description, value, color = '#4A9EFF', onToggle, isLoading }: ToggleRowProps) => {
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
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
          }} />
        </View>
      )}
    </View>
  );
};

export const NotificationsSection = () => {
  const { moderateScale } = useResponsive();
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notifPrefs'],
    queryFn: loadPrefs,
  });

  const mutation = useMutation({
    mutationFn: savePrefs,
    onSuccess: (updated) => {
      queryClient.setQueryData(['notifPrefs'], updated);
    },
  });

  const toggle = (key: keyof NotifPrefs) => {
    if (!prefs) return;
    mutation.mutate({ ...prefs, [key]: !prefs[key] });
  };

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
          backgroundColor: 'rgba(74,158,255,0.15)',
          borderWidth: 1, borderColor: 'rgba(74,158,255,0.25)',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons name="notifications-outline" size={17} color="#4A9EFF" />
        </View>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>
          Bildirimler
        </Text>
      </View>

      {isLoading || !prefs ? (
        <ActivityIndicator color="#4A9EFF" style={{ paddingBottom: 20 }} />
      ) : (
        <>
          <ToggleRow
            icon="game-controller-outline"
            label="Oyun Sonuçları"
            description="Maç sonu ve çok oyunculu sonuçlar"
            value={prefs.game_results}
            color="#4A9EFF"
            onToggle={() => toggle('game_results')}
            isLoading={mutation.isPending}
          />
          <ToggleRow
            icon="calendar-outline"
            label="Günlük Hatırlatıcı"
            description="Her gün yeni bulmaca için bildir"
            value={prefs.daily_reminder}
            color="#30d158"
            onToggle={() => toggle('daily_reminder')}
            isLoading={mutation.isPending}
          />
          <ToggleRow
            icon="trophy-outline"
            label="Liderboard Değişimi"
            description="Sıralaman değişince haber ver"
            value={prefs.leaderboard}
            color="#ffc400"
            onToggle={() => toggle('leaderboard')}
            isLoading={mutation.isPending}
          />
        </>
      )}

      {/* Platform uyarısı */}
      {Platform.OS === 'android' && (
        <Text style={{
          color: 'rgba(255,255,255,0.2)',
          fontSize: 10,
          textAlign: 'center',
          paddingBottom: 12,
          marginTop: 4,
        }}>
          Sistem bildirim ayarları önceliklidir
        </Text>
      )}
    </View>
  );
};
