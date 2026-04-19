import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { CellStatus } from '../../types';

interface CellProps {
  char?: string;
  status: CellStatus;
  index: number;
  size?: number;
  height?: number; // optional — defaults to size (square)
  isBlind?: boolean;
}

const Cell = ({ char, status, index, size = 58, height, isBlind }: CellProps) => {
  const cellHeight = height ?? size;
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);

  useEffect(() => {
    if (char && status === 'empty') {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [char]);

  useEffect(() => {
    if (status !== 'empty') {
      rotateX.value = withDelay(
        index * 150,
        withTiming(180, {
          duration: 400,
          easing: Easing.inOut(Easing.quad)
        })
      );
    } else {
      rotateX.value = withTiming(0, { duration: 400 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateX: `${rotateX.value}deg` }
      ],
    };
  });

  const isFlipped = useDerivedValue(() => rotateX.value > 90);

  const bgStyle = useAnimatedStyle(() => {
    let bgColor = "transparent";
    let borderColor = "#3a3a3c";

    if (isFlipped.value) {
      if (isBlind) {
        bgColor = "#3a3a3c";
        borderColor = "#3a3a3c";
      } else if (status === "correct") {
        bgColor = "#6aaa64";
        borderColor = "#6aaa64";
      } else if (status === "present") {
        bgColor = "#c9b458";
        borderColor = "#c9b458";
      } else if (status === "absent") {
        bgColor = "#3a3a3c";
        borderColor = "#3a3a3c";
      }
    } else {
      if (char) {
        bgColor = "transparent";
        borderColor = "#565758";
      } else {
        bgColor = "transparent";
        borderColor = "#3a3a3c";
      }
    }

    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateX: isFlipped.value ? '180deg' : '0deg' }]
    };
  });

  return (
    <Animated.View
      entering={ZoomIn.duration(600).delay(index * 35)}
      exiting={ZoomOut.duration(400)}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: cellHeight,
            borderWidth: size > 50 ? 2 : 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Math.max(4, size / 10),
          },
          animatedStyle,
          bgStyle
        ]}
      >
        <Animated.Text
          style={[
            {
              color: '#fff',
              fontSize: size * 0.48,
              fontWeight: '900',
              lineHeight: cellHeight,
            },
            textStyle
          ]}
        >
          {char || ''}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

Cell.displayName = 'Cell';

export default Cell;
