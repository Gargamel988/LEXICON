import React from 'react';
import { Text, View, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { SettingsRow } from './SettingsRow';

interface ProfileSettingsListProps {
  onLogout: () => void;
}

export const ProfileSettingsList = ({ onLogout }: ProfileSettingsListProps) => {
  const { moderateScale } = useResponsive();

  const handleNotImplemented = (feature: string) => {
    Alert.alert("Gelecek Özellik", `${feature} yakında eklenecek!`);
  };

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
        icon="person-outline" 
        label="Hesap Ayarları" 
        onPress={() => handleNotImplemented("Hesap Ayarları")} 
      />
      <SettingsRow 
        icon="notifications-outline" 
        label="Bildirimler" 
        onPress={() => handleNotImplemented("Bildirimler")} 
      />
      <SettingsRow 
        icon="shield-checkmark-outline" 
        label="Gizlilik ve Güvenlik" 
        onPress={() => handleNotImplemented("Gizlilik ve Güvenlik")} 
      />
      <SettingsRow 
        icon="help-circle-outline" 
        label="Yardım ve Destek" 
        onPress={() => handleNotImplemented("Yardım ve Destek")} 
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
