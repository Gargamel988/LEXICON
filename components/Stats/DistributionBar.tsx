import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface Props {
  dist: number[];
  accent: string;
}

export default function DistributionBar({ dist, accent }: Props) {
  const { moderateScale } = useResponsive();
  const max = Math.max(...dist, 1);

  return (
    <View style={{ gap: 7 }}>
      {dist.map((count, index) => {
        const width = count > 0 ? (count / max) * 100 : 0;
        const isHighest = count === max;

        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: moderateScale(11),
              fontWeight: '900',
              width: 14,
              fontVariant: ['tabular-nums']
            }}>
              {index + 1}
            </Text>
            <View style={{
              flex: 1,
              height: moderateScale(18),
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: 9,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.03)',
            }}>
              <View style={{
                width: `${width}%`,
                height: '100%',
                backgroundColor: isHighest ? accent : `${accent}30`,
                borderRadius: 9,
                justifyContent: 'center',
                paddingRight: 8,
                alignItems: 'flex-end',
              }}>
                {count > 0 && (
                  <Text style={{
                    color: '#fff',
                    fontSize: moderateScale(9),
                    fontWeight: '900',
                    fontVariant: ['tabular-nums']
                  }}>
                    {count}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
