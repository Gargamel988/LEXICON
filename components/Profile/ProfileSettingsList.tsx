import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { SettingsRow } from './SettingsRow';

interface ProfileSettingsListProps {
  onLogout: () => void;
}

export const ProfileSettingsList = ({ onLogout }: ProfileSettingsListProps) => {
  const { moderateScale } = useResponsive();
  const router = useRouter();


  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(600)}
      style={{ marginBottom: moderateScale(40) }}
    >
      <Text style={{
        color: Colors.text,
        fontSize: moderateScale(18),
        fontWeight: '800',
        marginBottom: moderateScale(16)
      }}>
        Ayarlar
      </Text>

      <SettingsRow
        icon="albums-outline"
        label="Koleksiyonlarım"
        onPress={() => router.push('/(profile)/collections')}
      />
      <SettingsRow
        icon="trophy-outline"
        label="Başarımlar"
        onPress={() => router.push('/(profile)/achievements')}
      />

      <SettingsRow
        icon="person-outline"
        label="Hesap Ayarları"
        onPress={() => router.push('/(profile)/account-settings')}
      />
      <SettingsRow
        icon="notifications-outline"
        label="Bildirimler"
        onPress={() => router.push('/(profile)/notifications')}
      />
      <SettingsRow
        icon="shield-checkmark-outline"
        label="Gizlilik ve Güvenlik"
        onPress={() => router.push('/(profile)/privacy')}
      />
      <SettingsRow
        icon="help-circle-outline"
        label="Yardım ve Destek"
        onPress={() => router.push('/(profile)/help-support')}
      />

      <View style={{ marginTop: moderateScale(8) }}>
        <SettingsRow
          icon="log-out-outline"
          label="Çıkış Yap"
          isDestructive
          onPress={onLogout}
        />
      </View>

    </Animated.View>
  );
};
