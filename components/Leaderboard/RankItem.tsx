import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';

interface RankItemProps {
  rank: number;
  username: string;
  score: string;
  avatar_url?: string;
  isCurrentUser?: boolean;
  accentColor?: string;
}

export const RankItem = ({ rank, username, score, avatar_url, isCurrentUser, accentColor = '#4CAF50' }: RankItemProps) => {
  const { wp, moderateScale, spacing } = useResponsive();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: isCurrentUser ? `${accentColor}1A` : 'rgba(255,255,255,0.03)',
      borderRadius: moderateScale(16),
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: isCurrentUser ? `${accentColor}4D` : 'rgba(255,255,255,0.05)',
    }}>
      {/* Rank Number */}
      <Text style={{
        color: isCurrentUser ? accentColor : '#666',
        fontSize: moderateScale(16),
        fontWeight: '900',
        width: moderateScale(30),
        textAlign: 'center'
      }}>
        {rank}
      </Text>

      {/* Avatar */}
      <View style={{
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginHorizontal: spacing.sm,
      }}>
        {avatar_url ? (
          <Image source={{ uri: avatar_url }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="person" size={moderateScale(24)} color="#444" />
          </View>
        )}
      </View>

      {/* Username */}
      <Text style={{
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: '700',
        flex: 1
      }} numberOfLines={1}>
        {username}
      </Text>

      {/* Score */}
      <Text style={{
        color: accentColor,
        fontSize: moderateScale(14),
        fontWeight: '800'
      }}>
        {score}
      </Text>
    </View>
  );
};
