import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { View } from 'react-native';
import { KEYBOARD_LAYOUTS } from '../../constants/game';
import { CellStatus } from '../../types';
import Key from './Key';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses?: Record<string, CellStatus>;
  letterStatusesArray?: Record<string, CellStatus>[]; // For Multi-Mode
  isBlind?: boolean;
  language?: 'TR' | 'EN';
}

const Keyboard = ({
  onKeyPress,
  letterStatuses,
  letterStatusesArray,
  isBlind,
  language = 'TR'
}: KeyboardProps) => {
  const { getKeyWidth, KEY_GAP, KEY_ROW_GAP, scale } = useResponsive();

  const rows = KEYBOARD_LAYOUTS;

  // Widest row calculation: ENTER and ⌫ are 1.5x width
  const maxKeysPerRow = Math.max(...rows.map((row) => {
    const specialKeysCount = row.filter(k => k === 'ENTER' || k === '⌫').length;
    return row.length - specialKeysCount + (specialKeysCount * 1.5);
  }));

  const dynamicKeyWidth = getKeyWidth(maxKeysPerRow);

  return (
    <View style={{
      gap: KEY_ROW_GAP,
      width: '100%',
      paddingHorizontal: scale(10),
      marginBottom: KEY_ROW_GAP
    }}>
      {rows.map((row, i) => (
        <View key={i} style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: KEY_GAP
        }}>
          {row.map((key) => {
            const multiStatuses = letterStatusesArray
              ? letterStatusesArray.map(set => set[key] || 'empty')
              : undefined;

            return (
              <Key
                key={key}
                label={key}
                onPress={onKeyPress}
                status={letterStatuses ? letterStatuses[key] : undefined}
                statuses={multiStatuses}
                isBlind={isBlind}
                width={dynamicKeyWidth}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

Keyboard.displayName = 'Keyboard';

export default Keyboard;
