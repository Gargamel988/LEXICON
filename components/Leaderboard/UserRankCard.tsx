import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface UserRankCardProps {
  userRankInfo: any;
  user: any;
  accentColor: string;
  label: string;
  periodLabel: string;
  formatScore: (score: any) => string;
}

export const UserRankCard: React.FC<UserRankCardProps> = ({ 
  userRankInfo, 
  user, 
  accentColor, 
  label, 
  periodLabel, 
  formatScore 
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

      <View style={{
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: spacing.sm,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      }}>
        {user?.user_metadata?.avatar_url ? (
          user.user_metadata.avatar_url.startsWith('http') ? (
            <Image source={{ uri: user.user_metadata.avatar_url }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ fontSize: moderateScale(24) }}>{user.user_metadata.avatar_url}</Text>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(14), fontWeight: '800' }}>
          Senin Sıran
        </Text>
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
