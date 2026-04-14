import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { AchievementItem } from './AchievementItem';

export const ProfileAchievements = () => {
  const { moderateScale } = useResponsive();

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600)}
      style={{ marginBottom: moderateScale(30) }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(16) }}>
        <Text style={{ color: Colors.text, fontSize: moderateScale(18), fontWeight: '800' }}>Başarılar</Text>
        <Text style={{ color: Colors.accent, fontSize: moderateScale(14), fontWeight: '700' }}>Tümünü Gör</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <AchievementItem icon="trophy" label="İlk Adım" color="#FFD700" />
        <AchievementItem icon="flash" label="Hızlı Çözücü" color="#4FC3F7" />
        <AchievementItem icon="flame" label="Durdurulamaz" color="#FF7043" />
        <AchievementItem icon="skull" label="Zor Ölüm" color="#CFD8DC" />
        <AchievementItem icon="star" label="Efsanevi" color="#E1BEE7" />
      </ScrollView>
    </Animated.View>
  );
};
