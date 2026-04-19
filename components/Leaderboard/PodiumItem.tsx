import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface PodiumItemProps {
  rank: 1 | 2 | 3;
  actualRank?: number;
  username: string;
  score: string;
  avatar_url?: string;
  accentColor?: string;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

export const PodiumItem = ({ rank, actualRank, username, score, avatar_url, accentColor = '#4CAF50', isCurrentUser, onPress }: PodiumItemProps) => {
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
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: rankColor,
          padding: 4,
          backgroundColor: 'rgba(255,255,255,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {avatar_url ? (
            avatar_url.startsWith('http') ? (
              <Image
                source={{ uri: avatar_url }}
                style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
              />
            ) : (
              <Text style={{ fontSize: size * 0.5 }}>{avatar_url}</Text>
            )
          ) : (
            <Ionicons name="person" size={size * 0.5} color="#555" />
          )}
        </View>

        {/* Rank Badge */}
        <View style={{
          position: 'absolute',
          bottom: -moderateScale(10),
          alignSelf: 'center',
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

        {/* First Rank Crown (if actually rank 1) */}
        {(actualRank === 1 || (!actualRank && isFirst)) && (
          <View style={{ position: 'absolute', top: -moderateScale(15), alignSelf: 'center' }}>
            <Ionicons name="star" size={moderateScale(24)} color="#FFD700" />
          </View>
        )}
      </View>

      <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={{ color: isCurrentUser ? accentColor : '#fff', fontSize: moderateScale(14), fontWeight: isCurrentUser ? '900' : '800', textAlign: 'center', width: moderateScale(80) }} numberOfLines={1}>
          {username}
        </Text>
        <Text style={{ color: accentColor, fontSize: moderateScale(12), fontWeight: '900', marginTop: 2 }}>
          {score}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
