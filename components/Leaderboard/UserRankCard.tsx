import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { FREE_FRAME_ID } from '../../constants/frames';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';

interface UserRankCardProps {
  userRankInfo: any;
  user: any;
  accentColor: string;
  label: string;
  periodLabel: string;
  formatScore: (score: any) => string;
  activeFrame?: string;
  activeNameTag?: string | null;
  active_title?: string | null;
}

export const UserRankCard: React.FC<UserRankCardProps> = ({ 
  userRankInfo, 
  user, 
  accentColor, 
  label, 
  periodLabel, 
  formatScore,
  activeFrame,
  activeNameTag,
  active_title
}) => {
  const { spacing, moderateScale, verticalScale } = useResponsive();

  if (!userRankInfo || !userRankInfo.rank || Number(userRankInfo.rank) <= 3) return null;

  return (
    <View style={{
      position: 'absolute',
      bottom: verticalScale(90),
      left: spacing.md,
      right: spacing.md,
      backgroundColor: '#1a1a1a',
      borderRadius: moderateScale(24),
      padding: moderateScale(16),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${accentColor}33`,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 20,
    }}>
      <Text style={{ color: accentColor, fontWeight: '900', fontSize: moderateScale(16), marginRight: spacing.md }}>
        #{userRankInfo.rank || '-'}
      </Text>

      <View style={{ marginRight: spacing.sm }}>
        <AvatarWithFrame 
          avatarUrl={user?.user_metadata?.avatar_url} 
          frameId={activeFrame || FREE_FRAME_ID} 
          size={moderateScale(40)} 
          username={user?.user_metadata?.full_name || user?.user_metadata?.username}
        />
      </View>

      <View style={{ flex: 1 }}>
        <UserDisplayName
          username="Senin Sıran"
          nametagId={activeNameTag}
          titleId={active_title}
          size="mini"
          containerStyle={{
            alignItems: 'flex-start',
            minWidth: undefined,
          }}
        />
        <Text style={{ color: '#888', fontSize: moderateScale(10), fontWeight: '700', marginTop: 2 }}>
          {label} Modu {periodLabel}
        </Text>
      </View>

      <Text style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: '900' }}>
        {formatScore(userRankInfo.score || userRankInfo.total_score)}
      </Text>
    </View>
  );
};
