import React from 'react';
import { Text, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import Colors from '../../constants/Colors';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AuthButton({ title, onPress, loading, disabled, style, textStyle }: AuthButtonProps) {
  const { moderateScale } = useResponsive();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: Colors.correct.main,
        height: moderateScale(56),
        borderRadius: moderateScale(16),
        justifyContent: 'center',
        alignItems: 'center',
        opacity: (disabled || loading) ? 0.6 : (pressed ? 0.9 : 1),
        shadowColor: Colors.correct.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        ...style,
      })}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{
          color: '#fff',
          fontSize: moderateScale(16),
          fontWeight: '900',
          letterSpacing: 1.5,
          ...textStyle,
        }}>
          {title.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}
