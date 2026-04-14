import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import PowerUpButton from './PowerUpButton';

export interface PowerUpConfig {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count: number;
  accentColor: string;
  onPress: () => void;
  description: string;
  isActive?: boolean;
}

interface PowerUpToolbarProps {
  configs: PowerUpConfig[];
  containerStyle?: any;
}

const PowerUpToolbar: React.FC<PowerUpToolbarProps> = ({ configs, containerStyle }) => {
  const { wp } = useResponsive();
  const [activeInfo, setActiveInfo] = useState<{ label: string; description: string } | null>(null);
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  const handleTriggerInfo = (label: string, description: string) => {
    setActiveInfo({ label, description });
    bubbleAnim.setValue(0);
    Animated.spring(bubbleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8
    }).start();
  };

  useEffect(() => {
    if (activeInfo) {
      const timer = setTimeout(() => {
        Animated.timing(bubbleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => setActiveInfo(null));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeInfo]);

  return (
    <View style={[{ alignItems: 'center', width: '100%' }, containerStyle]}>
      {/* Explanation Bubble */}
      {activeInfo && (
        <Animated.View style={{
          position: 'absolute',
          top: -45,
          backgroundColor: '#2a2a2c',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          zIndex: 100,
          transform: [
            { translateY: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            { scale: bubbleAnim }
          ],
          opacity: bubbleAnim,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
            {activeInfo.label}: {activeInfo.description}
          </Text>
          {/* Triangle Pointer */}
          <View style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            marginLeft: -6,
            width: 12,
            height: 12,
            backgroundColor: '#2a2a2c',
            transform: [{ rotate: '45deg' }],
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }} />
        </Animated.View>
      )}

      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: configs.length > 5 ? wp(3) : wp(5),
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}>
        {configs.map((config) => (
          <PowerUpButton
            key={config.key}
            icon={config.icon}
            label={config.label}
            count={config.count}
            accentColor={config.accentColor}
            onPress={config.onPress}
            onTriggerInfo={() => handleTriggerInfo(config.label, config.description)}
            isActive={config.isActive}
          />
        ))}
      </View>
    </View>
  );
};

export default PowerUpToolbar;
