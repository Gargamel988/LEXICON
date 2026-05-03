import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const logoTranslateY = useSharedValue(20);

  useEffect(() => {
    // Start animation
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });
    logoTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) });

    // Wait and then trigger completion
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: logoTranslateY.value }
    ],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Image
          source={require('../../assets/images/backround_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Optional: Add a subtle loading indicator or text below */}
      <Animated.View style={[styles.footer, { opacity: opacity.value }]}>
        <View style={styles.barContainer}>
          <Animated.View style={styles.bar} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  barContainer: {
    width: 100,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    width: '40%',
    height: '100%',
    backgroundColor: Colors.accent,
  }
});
