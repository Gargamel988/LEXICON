import { useResponsive } from '@/hooks/useResponsive';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CellStatus } from '../../types';

interface KeyProps {
  label: string;
  onPress: (key: string) => void;
  status?: CellStatus;
  statuses?: CellStatus[]; // For Multi-Mode
  isBlind?: boolean;
  width?: number; // Dynamic width based on layout
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STATUS_COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent: '#222',
  default: '#444',
  first: '#6aaa64',
  last: '#6aaa64'
};

const Key: React.FC<KeyProps> = ({ label, onPress, status, statuses, isBlind, width: propWidth }) => {
  const { scale, verticalScale, moderateScale } = useResponsive();
  const scaleAnim = useSharedValue(1);
  const bgColor = useSharedValue(STATUS_COLORS.default);

  const getBgColor = (s?: CellStatus) => {
    if (s === 'correct' || s === 'first' || s === 'last') return STATUS_COLORS.correct;
    if (s === 'present') return STATUS_COLORS.present;
    if (s === 'absent') return STATUS_COLORS.absent;
    return STATUS_COLORS.default;
  };

  useEffect(() => {
    if (!statuses) {
      bgColor.value = withTiming(getBgColor(status), { duration: 300 });
    }
  }, [status, statuses, isBlind]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      backgroundColor: statuses ? 'transparent' : bgColor.value,
    };
  });

  const handlePressIn = () => {
    scaleAnim.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withTiming(1, { duration: 100 });
  };

  const isSpecialKey = label === 'ENTER' || label === '⌫';

  // Render multiple color indicators
  const renderMultiBackground = () => {
    if (!statuses || isSpecialKey) return null;

    // Determine grid layout for quadrants
    const count = statuses.length; // 2, 4, or 6
    const flexDir = count === 2 ? 'column' : 'row';
    const wrap = count > 2 ? 'wrap' : 'nowrap';
    const boxWidth = count === 2 ? '100%' : '50%';
    const boxHeight = count <= 2 ? '50%' : count <= 4 ? '50%' : '33.33%';

    return (
      <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: flexDir, flexWrap: wrap, borderRadius: scale(4), overflow: 'hidden' }}>
        {statuses.map((s, i) => (
          <View
            key={i}
            style={{
              width: boxWidth,
              height: boxHeight,
              backgroundColor: getBgColor(s),
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </View>
    );
  };

  const renderStatusBadge = () => {
    if (status !== 'first' && status !== 'last') return null;

    return (
      <View style={{
        position: 'absolute',
        top: 2,
        right: 4,
        backgroundColor: '#fff',
        borderRadius: 4,
        paddingHorizontal: 3,
        paddingVertical: 1,
        zIndex: 10
      }}>
        <Text style={{
          fontSize: moderateScale(8),
          color: STATUS_COLORS.correct,
          fontWeight: '900'
        }}>
          {status === 'first' ? 'İ' : 'S'}
        </Text>
      </View>
    );
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(label)}
      style={[
        {
          height: verticalScale(45),
          borderRadius: scale(4),
          alignItems: 'center',
          justifyContent: 'center',
          width: isSpecialKey ? (propWidth || scale(30)) * 1.5 : (propWidth || scale(30)),
          overflow: 'hidden'
        },
        animatedStyle
      ]}
    >
      {renderMultiBackground()}
      {renderStatusBadge()}
      <Text style={{
        color: '#fff',
        fontWeight: '900',
        fontSize: label === 'ENTER' ? moderateScale(10) : moderateScale(18),
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2
      }}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};

Key.displayName = 'Key';

export default Key;
