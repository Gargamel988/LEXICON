import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Text, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import Colors from "../../constants/Colors";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * Toast Component Wrapper to use hooks
 */
const LexiconToast = ({ type, text1, text2 }: { type: 'success' | 'error' | 'info', text1?: string, text2?: string }) => {
  const { moderateScale, scale, width } = useResponsive();
  
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: Colors.correct.main,
          icon: 'checkmark-circle' as const,
          bgColor: [`${Colors.correct.main}30`, `${Colors.correct.main}10`],
          glowColor: Colors.correct.main
        };
      case 'error':
        return {
          color: Colors.danger,
          icon: 'alert-circle' as const,
          bgColor: [`${Colors.danger}30`, `${Colors.danger}10`],
          glowColor: Colors.danger
        };
      case 'info':
      default:
        return {
          color: Colors.accent,
          icon: 'information-circle' as const,
          bgColor: [`${Colors.accent}30`, `${Colors.accent}10`],
          glowColor: Colors.accent
        };
    }
  };

  const config = getConfig();

  return (
    <View style={{
      width: width * 0.92,
      shadowColor: config.glowColor,
      shadowOffset: { width: 0, height: moderateScale(4) },
      shadowOpacity: 0.4,
      shadowRadius: moderateScale(12),
      elevation: 12,
    }}>
      <LinearGradient
        colors={['#1a1a1a', '#0d0d0d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: moderateScale(20),
          flexDirection: "row",
          alignItems: "center",
          padding: moderateScale(14),
          borderWidth: 1.5,
          borderColor: `${config.color}50`,
          overflow: 'hidden'
        }}
      >
        {/* Animated-like Glow Background Element */}
        <View style={{
          position: 'absolute',
          top: -moderateScale(20),
          left: -moderateScale(20),
          width: moderateScale(80),
          height: moderateScale(80),
          borderRadius: moderateScale(40),
          backgroundColor: config.color,
          opacity: 0.05,
        }} />

        <LinearGradient
          colors={config.bgColor as any}
          style={{
            width: scale(48),
            height: scale(48),
            borderRadius: scale(16),
            justifyContent: "center",
            alignItems: "center",
            marginRight: scale(14),
            borderWidth: 1,
            borderColor: `${config.color}40`
          }}
        >
          <Ionicons name={config.icon} size={scale(26)} color={config.color} />
        </LinearGradient>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{
            color: '#ffffff',
            fontSize: moderateScale(16),
            fontWeight: '900',
            letterSpacing: 0.3,
            marginBottom: moderateScale(2)
          }}>
            {text1}
          </Text>
          {text2 && (
            <Text 
              numberOfLines={2}
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: moderateScale(12.5),
                fontWeight: '600',
                lineHeight: moderateScale(16)
              }}
            >
              {text2}
            </Text>
          )}
        </View>

        {/* Minimal accent line on the right */}
        <View style={{
          width: 4,
          height: '60%',
          backgroundColor: config.color,
          borderRadius: 2,
          marginLeft: 8,
          opacity: 0.6
        }} />
      </LinearGradient>
    </View>
  );
};

export const lexiconToastConfig: ToastConfig = {
  success: (props) => <LexiconToast type="success" text1={props.text1} text2={props.text2} />,
  error: (props) => <LexiconToast type="error" text1={props.text1} text2={props.text2} />,
  info: (props) => <LexiconToast type="info" text1={props.text1} text2={props.text2} />,
};
