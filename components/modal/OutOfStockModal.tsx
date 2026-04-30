import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSet } from '../../constants/powerUps';
import { renderPowerUpIcon } from '../../utils/renderPowerUpIcon';

interface OutOfStockModalProps {
  isVisible: boolean;
  powerUpLabel: string;
  powerUpIcon: string;
  powerUpIconSet?: IconSet;
  powerUpColor: string;
  onClose: () => void;
}

const OutOfStockModal: React.FC<OutOfStockModalProps> = ({
  isVisible,
  powerUpLabel,
  powerUpIcon,
  powerUpIconSet,
  powerUpColor,
  onClose,
}) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 70, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [isVisible]);

  const handleGoToShop = () => {
    onClose();
    setTimeout(() => router.push('/(tabs)/shop' as any), 280);
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end', opacity: overlayAnim }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <Animated.View style={{
          backgroundColor: '#18181c',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 44,
          alignItems: 'center',
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 20,
          transform: [{ translateY: slideAnim }],
        }}>
          {/* Drag handle */}
          <View style={{
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.18)',
            marginBottom: 28,
          }} />

          {/* Icon ring */}
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 1.5,
            backgroundColor: `${powerUpColor}18`,
            borderColor: `${powerUpColor}35`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <View style={{
              width: 78,
              height: 78,
              borderRadius: 39,
              backgroundColor: `${powerUpColor}28`,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {renderPowerUpIcon(
                { icon: powerUpIcon, iconSet: powerUpIconSet },
                42,
                powerUpColor
              )}
            </View>
          </View>

          {/* Empty badge */}
          <View style={{
            position: 'absolute',
            top: 58,
            right: '50%',
            marginRight: -52,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#ff3b30',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#18181c',
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>0</Text>
          </View>

          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 10, letterSpacing: 0.2 }}>
            Stok Bitti!
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            <Text style={{ color: powerUpColor, fontWeight: '800' }}>{powerUpLabel}</Text>
            {' '}güçlendirmen tükendi.{'\n'}Mağazadan daha fazlasını edinebilirsin.
          </Text>

          {/* Shop CTA */}
          <Pressable
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: Colors.accent,
              paddingVertical: 16,
              borderRadius: 18,
              width: '100%',
              marginBottom: 12,
              opacity: pressed ? 0.82 : 1,
            })}
            onPress={handleGoToShop}
          >
            <Ionicons name="storefront-outline" size={20} color="#000" />
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 }}>
              Mağazaya Git
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </Pressable>

          <Pressable
            style={{ paddingVertical: 13, width: '100%', alignItems: 'center' }}
            onPress={onClose}
          >
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '600' }}>
              Kapat
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default OutOfStockModal;
