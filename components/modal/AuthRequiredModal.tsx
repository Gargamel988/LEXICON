import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';

interface AuthRequiredModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function AuthRequiredModal({ 
  isVisible, 
  onClose, 
  title = "Giriş Gerekli", 
  description = "Bu özelliği kullanmak için giriş yapmanız gerekiyor." 
}: AuthRequiredModalProps) {
  const { wp, moderateScale, verticalScale, spacing } = useResponsive();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(isVisible);
  const animProgress = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      animProgress.value = withSpring(1, { damping: 20, stiffness: 90 });
    } else {
      animProgress.value = withTiming(0, { duration: 250 });
      const t = setTimeout(() => {
        setShouldRender(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value,
    transform: [
      { scale: interpolate(animProgress.value, [0, 1], [0.95, 1]) },
      { translateY: interpolate(animProgress.value, [0, 1], [10, 0]) }
    ],
  }));

  if (!shouldRender && !isVisible) return null;

  const absoluteFill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

  return (
    <View style={{ ...absoluteFill, zIndex: 1000 }} pointerEvents={isVisible ? 'auto' : 'none'}>
      {/* Background Overlay */}
      <Animated.View style={[{ ...absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' }, overlayStyle]}>
        <BlurView intensity={20} style={{ ...absoluteFill }} tint="dark" />
        <TouchableOpacity activeOpacity={1} style={{ ...absoluteFill }} onPress={onClose} />
      </Animated.View>

      {/* Modal Card */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Animated.View style={[{
          width: wp(82),
          backgroundColor: 'rgba(28, 28, 30, 0.95)',
          borderRadius: moderateScale(28),
          padding: moderateScale(28),
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }, cardStyle]}>
          
          {/* Icon Header */}
          <View style={{
            width: moderateScale(64),
            height: moderateScale(64),
            borderRadius: moderateScale(32),
            backgroundColor: 'rgba(99, 153, 34, 0.08)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: verticalScale(20),
            borderWidth: 1,
            borderColor: 'rgba(99, 153, 34, 0.15)',
          }}>
            <Ionicons name="lock-closed" size={moderateScale(28)} color={Colors.correct.main} />
          </View>

          <Text style={{ 
            color: '#fff', 
            fontSize: moderateScale(20), 
            fontWeight: '800', 
            textAlign: 'center',
            marginBottom: verticalScale(10),
          }}>
            {title}
          </Text>

          <Text style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: moderateScale(14), 
            fontWeight: '400', 
            textAlign: 'center',
            lineHeight: moderateScale(20),
            marginBottom: verticalScale(28),
            paddingHorizontal: moderateScale(10),
          }}>
            {description}
          </Text>

          {/* Action Buttons */}
          <View style={{ width: '100%', gap: verticalScale(10) }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                router.push("/(auth)/login");
              }}
              style={{
                width: '100%',
                backgroundColor: Colors.correct.main,
                paddingVertical: verticalScale(14),
                borderRadius: moderateScale(14),
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: moderateScale(15), fontWeight: '700' }}>
                Giriş Yap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                paddingVertical: verticalScale(12),
                borderRadius: moderateScale(14),
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: moderateScale(14), fontWeight: '600' }}>
                Vazgeç
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
