import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { networkService } from '@/services/networkService';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(networkService.isOnline);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(networkService.isOnline ? 0 : 1)).current;

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      Animated.timing(fadeAnim, {
        toValue: online ? 0 : 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    };

    networkService.addListener(handleNetworkChange);
    return () => networkService.removeListener(handleNetworkChange);
  }, []);

  if (isOnline) return null;

  return (
    <Animated.View style={[styles.floatingContainer, { top: insets.top + 12, opacity: fadeAnim }]}>
      <BlurView intensity={10} tint="dark" style={styles.pill}>
        <View style={styles.dot} />
        <Text style={styles.text}>ÇEVRİMDIŞI</Text>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  text: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
