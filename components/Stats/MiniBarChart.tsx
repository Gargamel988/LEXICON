import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface Props {
  scores: number[];
  accent: string;
}

export default function MiniBarChart({ scores, accent }: Props) {
  const { hp, wp, moderateScale } = useResponsive();
  const max = Math.max(...scores, 1);

  return (
    <View style={{ height: 80, flexDirection: 'row', alignItems: 'baseline', gap: wp(2), paddingBottom: 10 }}>
      {scores.map((score, idx) => {
        const height = max === 0 ? 5 : (score / max) * 60 + 5;
        return (
          <View key={idx} style={{ flex: 1, alignItems: 'center', height: 80, justifyContent: 'flex-end' }}>
            <View style={{
              width: '80%',
              height,
              backgroundColor: score === max ? accent : `${accent}40`,
              borderRadius: 6,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }} />
            <Text style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: moderateScale(8),
              marginTop: 4,
              fontWeight: '900'
            }}>
              #{idx + 1}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
