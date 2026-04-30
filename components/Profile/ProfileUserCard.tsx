import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { FREE_FRAME_ID } from '../../constants/frames';
import { useResponsive } from '../../hooks/useResponsive';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';

interface ProfileUserCardProps {
  user: User | null;
  profile?: { username: string; avatar_url: string } | null;
  level: number | undefined;
  rank: string | undefined;
  onEdit: () => void;
  activeFrame?: string;
  activeNameTag?: string | null;
  activeTitleId?: string | null;
  xp?: number;
}

export const ProfileUserCard = ({ user, profile, level, rank, onEdit, activeFrame, activeNameTag, activeTitleId, xp = 0 }: ProfileUserCardProps) => {
  const { moderateScale } = useResponsive();
  const avatarSize = moderateScale(110);

  return (
    <Animated.View
      entering={FadeInDown.duration(600)}
      style={{ alignItems: 'center', marginTop: moderateScale(20), marginBottom: moderateScale(30) }}
    >
      <View style={{ position: 'relative' }}>
        {activeFrame && activeFrame !== FREE_FRAME_ID ? (
          <View style={{ width: avatarSize, height: avatarSize, justifyContent: 'center', alignItems: 'center' }}>
            <AvatarWithFrame
              avatarUrl={profile?.avatar_url || user?.user_metadata?.avatar_url}
              frameId={activeFrame}
              size={avatarSize * 0.9}
            />
          </View>
        ) : (
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
        )}
        <View style={{
          position: 'absolute',
          bottom: moderateScale(-5),
          right: moderateScale(-5),
          zIndex: 10, // Rozetin çerçevenin altında kalmaması için
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
        <UserDisplayName
          username={profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Oyuncu"}
          nametagId={activeNameTag}
          titleId={activeTitleId}
          size="large"
        />
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

      {/* XP Progress Bar */}
      <View style={{ width: '80%', marginTop: moderateScale(12), alignItems: 'center' }}>
        <View style={{ 
          width: '100%', 
          height: moderateScale(8), 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: 4, 
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)'
        }}>
          {(() => {
            const currentLevel = level || 1;
            const currentLevelTotalXp = (() => {
              let total = 0;
              let threshold = 2000;
              for (let i = 1; i < currentLevel; i++) {
                total += threshold;
                threshold += 500;
              }
              return total;
            })();
            const nextLevelThreshold = 2000 + (currentLevel - 1) * 500;
            const xpInCurrentLevel = xp - currentLevelTotalXp;
            const progress = Math.min(Math.max(xpInCurrentLevel / nextLevelThreshold, 0), 1);
            
            return (
              <View style={{ 
                width: `${progress * 100}%`, 
                height: '100%', 
                backgroundColor: Colors.accent,
                shadowColor: Colors.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
              }} />
            );
          })()}
        </View>
        <Text style={{ 
          color: 'rgba(255,255,255,0.3)', 
          fontSize: moderateScale(10), 
          fontWeight: '700', 
          marginTop: 4,
          letterSpacing: 0.5
        }}>
          SONRAKİ SEVİYE İÇİN XP: {(() => {
            const currentLevel = level || 1;
            const currentLevelTotalXp = (() => {
              let total = 0;
              let threshold = 2000;
              for (let i = 1; i < currentLevel; i++) {
                total += threshold;
                threshold += 500;
              }
              return total;
            })();
            const nextLevelThreshold = 2000 + (currentLevel - 1) * 500;
            const xpInCurrentLevel = xp - currentLevelTotalXp;
            return `${Math.floor(xpInCurrentLevel)} / ${nextLevelThreshold}`;
          })()}
        </Text>
      </View>
    </Animated.View>
  );
};
