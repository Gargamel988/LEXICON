import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface PodiumItemProps {
  rank: 1 | 2 | 3;
  username: string;
  score: string;
  avatar_url?: string;
  accentColor?: string;
}

export const PodiumItem = ({ rank, username, score, avatar_url, accentColor = '#4CAF50' }: PodiumItemProps) => {
  const { moderateScale, spacing } = useResponsive();

  const isFirst = rank === 1;
  const size = isFirst ? moderateScale(110) : moderateScale(90);
  const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
  const marginTop = isFirst ? 0 : moderateScale(40);

  return (
    <View style={{ alignItems: 'center', marginTop }}>
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
          shadowColor: rankColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 10,
        }}>
          {avatar_url ? (
            <Image
              source={{ uri: avatar_url }}
              style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
            />
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
          <Text style={{ color: '#000', fontWeight: '900', fontSize: moderateScale(14) }}>{rank}</Text>
        </View>

        {/* First Rank Crown */}
        {isFirst && (
          <View style={{ position: 'absolute', top: -moderateScale(15), alignSelf: 'center' }}>
            <Ionicons name="star" size={moderateScale(24)} color="#FFD700" />
          </View>
        )}
      </View>

      <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(14), fontWeight: '800', textAlign: 'center', width: moderateScale(80) }} numberOfLines={1}>
          {username}
        </Text>
        <Text style={{ color: accentColor, fontSize: moderateScale(12), fontWeight: '900', marginTop: 2 }}>
          {score}
        </Text>
      </View>
    </View>
  );
};
