import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FREE_FRAME_ID } from '../../constants/frames';
import { useResponsive } from '../../hooks/useResponsive';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';

interface PodiumItemProps {
  rank: 1 | 2 | 3;
  actualRank?: number;
  username: string;
  score: string;
  avatar_url?: string;
  active_frame?: string;
  active_nametag?: string | null;
  active_title?: string | null;
  accentColor?: string;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

export const PodiumItem = ({ rank, actualRank, username, score, avatar_url, active_frame, active_nametag, active_title, accentColor = '#4CAF50', isCurrentUser, onPress }: PodiumItemProps) => {
  const { moderateScale, spacing } = useResponsive();

  const isFirst = rank === 1;
  const size = isFirst ? moderateScale(110) : moderateScale(90);
  const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
  const marginTop = isFirst ? 0 : moderateScale(40);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{ alignItems: 'center', marginTop }}
    >
      <View style={{ position: 'relative' }}>
        {/* Avatar Circle */}
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <AvatarWithFrame
            avatarUrl={avatar_url}
            frameId={active_frame || FREE_FRAME_ID}
            size={size}
            username={username}
          />
        </View>

        {/* Rank Badge */}
        <View style={{
          position: 'absolute',
          bottom: -moderateScale(10),
          alignSelf: 'center',
          zIndex: 10, // Rozetin çerçevenin altında kalmaması için
          backgroundColor: rankColor,
          width: moderateScale(28),
          height: moderateScale(28),
          borderRadius: moderateScale(14),
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#000',
        }}>
          <Text style={{ color: '#000', fontWeight: '900', fontSize: moderateScale(14) }}>{actualRank || rank}</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <UserDisplayName
          username={username}
          nametagId={active_nametag}
          titleId={active_title}
          size={isFirst ? 'small' : 'mini'}
        />
        <Text style={{ color: accentColor, fontSize: moderateScale(12), fontWeight: '900', marginTop: 2 }}>
          {score}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
