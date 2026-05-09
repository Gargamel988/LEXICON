import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

const COLORS = ['#FFD700', '#FF4500', '#1E90FF', '#32CD32', '#BA55D3', '#FF69B4'];

interface Particle {
  x: number;
  y: number;
  r: number;
  color: string;
  speed: number;
  angle: number;
}

export const WinConfetti = () => {
  const { width, height } = useWindowDimensions();
  
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      x: Math.random() * width,
      y: -20,
      r: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 2 + 2,
      angle: Math.random() * Math.PI * 2,
    }));
  }, [width]);

  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 3000 });
  }, []);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {particles.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={progress.value * height * p.speed}
          r={p.r}
          color={p.color}
        />
      ))}
    </Canvas>
  );
};
