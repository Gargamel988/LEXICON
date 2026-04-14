import { User } from '@supabase/supabase-js';
import React from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface ProfileUserCardProps {
  user: User | null;
  level: number | undefined;
  rank: string | undefined;
}

export const ProfileUserCard = ({ user, level, rank }: ProfileUserCardProps) => {
  const { moderateScale } = useResponsive();
  const avatarSize = moderateScale(110);

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={{ alignItems: 'center', marginTop: moderateScale(20), marginBottom: moderateScale(30) }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={user?.user_metadata?.avatar_url || require('@/assets/images/premium_avatar_man.png')}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: moderateScale(28),
            borderWidth: 2,
            borderColor: Colors.accent
          }}
        />
        <View style={{
          position: 'absolute',
          bottom: moderateScale(-5),
          right: moderateScale(-5),
          backgroundColor: Colors.accent,
          paddingHorizontal: moderateScale(10),
          paddingVertical: moderateScale(4),
          borderRadius: moderateScale(8),
          borderWidth: 3,
          borderColor: Colors.background
        }}>
          <Text style={{ color: Colors.background, fontSize: moderateScale(12), fontWeight: '900' }}>
            LVL {level}
          </Text>
        </View>
      </View>

      <Text style={{
        color: Colors.text,
        fontSize: moderateScale(26),
        fontWeight: '800',
        marginTop: moderateScale(16)
      }}>
        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Oyuncu"}
      </Text>

      <Text style={{
        color: Colors.textSecondary,
        fontSize: moderateScale(13),
        fontWeight: '700',
        marginTop: moderateScale(4),
        textTransform: 'uppercase',
        letterSpacing: 1.5
      }}>
        SEVİYE {level} • {rank}
      </Text>
    </Animated.View>
  );
};
