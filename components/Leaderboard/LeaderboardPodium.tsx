import React from 'react';
import { View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { PodiumItem } from './PodiumItem';

interface LeaderboardPodiumProps {
  topThree: any[];
  accentColor: string;
  userId?: string;
  formatScore: (score: any, duration?: number) => string;
  onPlayerPress: (player: any) => void;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ 
  topThree, 
  accentColor, 
  userId, 
  formatScore,
  onPlayerPress
}) => {
  const { spacing, verticalScale, moderateScale } = useResponsive();

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.md,
      minHeight: verticalScale(200),
      marginTop: spacing.md
    }}>
      {/* Rank 2 */}
      {topThree[1] ? (
        <PodiumItem
          rank={2}
          actualRank={topThree[1].rank}
          username={topThree[1].username || 'Oyuncu'}
          score={formatScore(topThree[1].score || topThree[1].total_score, topThree[1].duration)}
          avatar_url={topThree[1].avatar_url}
          isCurrentUser={topThree[1].user_id === userId}
          accentColor={accentColor}
          onPress={() => onPlayerPress(topThree[1])}
        />
      ) : <View style={{ width: moderateScale(80) }} />}

      {/* Rank 1 */}
      {topThree[0] ? (
        <PodiumItem
          rank={1}
          actualRank={topThree[0].rank}
          username={topThree[0].username || 'Şampiyon'}
          score={formatScore(topThree[0].score || topThree[0].total_score, topThree[0].duration)}
          avatar_url={topThree[0].avatar_url}
          isCurrentUser={topThree[0].user_id === userId}
          accentColor={accentColor}
          onPress={() => onPlayerPress(topThree[0])}
        />
      ) : <View style={{ width: moderateScale(100) }} />}

      {/* Rank 3 */}
      {topThree[2] ? (
        <PodiumItem
          rank={3}
          actualRank={topThree[2].rank}
          username={topThree[2].username || 'Oyuncu'}
          score={formatScore(topThree[2].score || topThree[2].total_score, topThree[2].duration)}
          avatar_url={topThree[2].avatar_url}
          isCurrentUser={topThree[2].user_id === userId}
          accentColor={accentColor}
          onPress={() => onPlayerPress(topThree[2])}
        />
      ) : <View style={{ width: moderateScale(80) }} />}
    </View>
  );
};
