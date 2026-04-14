import React from 'react';
import { Text, View } from 'react-native';
import Colors from '../../constants/Colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label: string;
  nextReward: string;
}

export default function ProgressBar({ progress, label, nextReward }: ProgressBarProps) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
      <View style={{
        backgroundColor: '#1c1c1e',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2c2c2e',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{label}</Text>
          <Text style={{ color: Colors.correct.main, fontSize: 16, fontWeight: '900' }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {/* Track */}
        <View style={{
          height: 8,
          backgroundColor: '#2c2c2e',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          {/* Fill */}
          <View style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: Colors.correct.main,
            borderRadius: 4,
          }} />
        </View>

        <Text style={{
          color: Colors.textSecondary,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          SONRAKİ ÖDÜL: {nextReward}
        </Text>
      </View>
    </View>
  );
}
