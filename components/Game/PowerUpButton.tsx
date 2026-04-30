import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { PowerUpDefinition, renderPowerUpIcon } from '../../constants/powerUps';
import { useResponsive } from '../../hooks/useResponsive';

interface PowerUpButtonProps {
  def: PowerUpDefinition;          // icon + iconSet birlikte geliyor
  label: string;
  count: number;
  accentColor: string;
  onPress: () => void;
  onEmptyPress?: () => void;
  onTriggerInfo: (label: string) => void;
  isActive?: boolean;
}

const PowerUpButton: React.FC<PowerUpButtonProps> = ({
  def,
  label,
  count,
  accentColor,
  onPress,
  onEmptyPress,
  onTriggerInfo,
  isActive = false
}) => {
  const { wp } = useResponsive();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = count <= 0;

  const handlePress = () => {
    if (isDisabled) {
      // RİSK toggle her zaman çalışır, diğerleri empty popup açar
      if (label !== 'RİSK' && onEmptyPress) onEmptyPress();
      return;
    }

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const handleLongPress = () => {
    onTriggerInfo(label);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={{ alignItems: 'center' }}
      >
        <Animated.View style={{
          transform: [{ scale }],
          width: wp(12),
          height: wp(12),
          borderRadius: wp(12),
          backgroundColor: (isDisabled && label !== "RİSK") ? 'rgba(255,255,255,0.04)' : (isActive ? `${accentColor}40` : `${accentColor}18`),
          borderWidth: 1.5,
          borderColor: isDisabled ? 'rgba(255,255,255,0.08)' : (isActive ? accentColor : `${accentColor}50`),
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: isDisabled ? 'transparent' : accentColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: (isDisabled && label !== "RİSK") ? 0 : 0.5,
          shadowRadius: 10,
        }}>
          {renderPowerUpIcon(
            def,
            24,
            (isDisabled && label !== 'RİSK') ? 'rgba(255,255,255,0.15)' : (label === 'RİSK' && !isActive ? '#666' : accentColor)
          )}

          {/* Count badge */}
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: isDisabled ? '#2a2a2c' : accentColor,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#121212',
          }}>
            <Text style={{
              color: isDisabled ? 'rgba(255,255,255,0.3)' : '#000',
              fontSize: 10,
              fontWeight: '900',
            }}>
              {count}
            </Text>
          </View>
        </Animated.View>

        {/* Label */}
        <Text style={{
          color: (isDisabled && label !== "RİSK") ? 'rgba(255,255,255,0.15)' : (isActive ? '#fff' : 'rgba(255,255,255,0.45)'),
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 5,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

export default PowerUpButton;
