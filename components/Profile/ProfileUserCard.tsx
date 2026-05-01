import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { FREE_FRAME_ID } from '../../constants/frames';
import { useResponsive } from '../../hooks/useResponsive';
import { getLevelInfo } from '../../constants/levels';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';
import { LevelRewardsModal } from './LevelRewardsModal';

interface ProfileUserCardProps {
  user: User | null;
  profile?: { username: string; avatar_url: string } | null;
  level: number | undefined;
  onEdit: () => void;
  activeFrame?: string;
  activeNameTag?: string | null;
  activeTitleId?: string | null;
  xp?: number;
}

export const ProfileUserCard = ({ user, profile, level, onEdit, activeFrame, activeNameTag, activeTitleId, xp = 0 }: ProfileUserCardProps) => {
  const { moderateScale } = useResponsive();
  const [isLevelModalVisible, setIsLevelModalVisible] = React.useState(false);
  const avatarSize = moderateScale(110);

  const levelInfo = getLevelInfo(xp);

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
        <TouchableOpacity
          onPress={() => setIsLevelModalVisible(true)}
          activeOpacity={0.9}
          style={{
            position: 'absolute',
            bottom: moderateScale(-5),
            right: moderateScale(-5),
            zIndex: 10,
            backgroundColor: Colors.accent,
            paddingHorizontal: moderateScale(10),
            paddingVertical: moderateScale(4),
            borderRadius: moderateScale(8),
            borderWidth: 3,
            borderColor: Colors.background,
            shadowColor: Colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}
        >
          <Text style={{ color: Colors.background, fontSize: moderateScale(12), fontWeight: '900' }}>
            LVL {level}
          </Text>
        </TouchableOpacity>
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
        color: 'rgba(255,255,255,0.5)',
        fontSize: moderateScale(12),
        fontWeight: '800',
        marginTop: moderateScale(6),
        letterSpacing: 2,
        textTransform: 'uppercase'
      }}>
        SEVİYE {level}
      </Text>

      {/* XP Progress Bar */}
      <TouchableOpacity
        onPress={() => setIsLevelModalVisible(true)}
        activeOpacity={0.8}
        style={{ width: '85%', marginTop: moderateScale(20), alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8, paddingHorizontal: 4 }}>
          <Text style={{ color: Colors.accent, fontSize: moderateScale(11), fontWeight: '900' }}>XP İLERLEMESİ</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(11), fontWeight: '800' }}>
            {Math.floor(levelInfo.currentXp)} / {levelInfo.nextLevelXp}
          </Text>
        </View>

        <View style={{
          width: '100%',
          height: moderateScale(12),
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          padding: 2
        }}>
          <LinearGradient
            colors={[Colors.accent, '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${levelInfo.progress * 100}%`,
              height: '100%',
              borderRadius: 6,
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
            }}
          />
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          backgroundColor: 'rgba(255,255,255,0.05)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          gap: 6
        }}>
          <Ionicons name="gift-outline" size={14} color={Colors.accent} />
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: moderateScale(10), fontWeight: '700' }}>
            Ödülleri görmek için tıkla
          </Text>
        </View>
      </TouchableOpacity>

      <LevelRewardsModal
        isVisible={isLevelModalVisible}
        onClose={() => setIsLevelModalVisible(false)}
        currentLevel={level || 1}
      />
    </Animated.View>
  );
};
