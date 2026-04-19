import { User } from '@supabase/supabase-js';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface ProfileUserCardProps {
  user: User | null;
  profile?: { username: string; avatar_url: string } | null;
  level: number | undefined;
  rank: string | undefined;
  onEdit: () => void;
}

export const ProfileUserCard = ({ user, profile, level, rank, onEdit }: ProfileUserCardProps) => {
  const { moderateScale } = useResponsive();
  const avatarSize = moderateScale(110);

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={{ alignItems: 'center', marginTop: moderateScale(20), marginBottom: moderateScale(30) }}
    >
      <View style={{ position: 'relative' }}>
        <View style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: moderateScale(28),
          borderWidth: 2,
          borderColor: Colors.accent,
          backgroundColor: 'rgba(255,255,255,0.03)',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {profile?.avatar_url && profile.avatar_url.startsWith('http') ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Text style={{ fontSize: avatarSize * 0.5 }}>
              {profile?.avatar_url || user?.user_metadata?.avatar_url || '👤'}
            </Text>
          )}
        </View>
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

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(16) }}>
        <Text style={{
          color: Colors.text,
          fontSize: moderateScale(26),
          fontWeight: '800',
        }}>
          {profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Oyuncu"}
        </Text>
        <TouchableOpacity 
          onPress={onEdit}
          style={{ 
            marginLeft: moderateScale(10), 
            padding: moderateScale(6),
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: moderateScale(10)
          }}
        >
          <Ionicons name="pencil" size={moderateScale(16)} color={Colors.accent} />
        </TouchableOpacity>
      </View>

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
