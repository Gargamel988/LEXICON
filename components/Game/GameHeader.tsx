import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';

interface StatItem {
  label: string;
  value?: string | number;
  customValue?: React.ReactNode;
  color?: string;
  glowColor?: string;
}

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  leftStats: StatItem;
  rightStats: StatItem;
  onBack?: () => void;
  onSettings?: () => void;
  settingsIcon?: keyof typeof Ionicons.glyphMap;
}

export default function GameHeader({
  title,
  subtitle,
  accentColor,
  leftStats,
  rightStats,
  onBack,
  onSettings,
  settingsIcon = 'options-outline',
}: GameHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, wp } = useResponsive();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const glowStyle = (color: string) => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  });

  const iconBtnStyle = (pressed: boolean) => ({
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${accentColor}18`,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: pressed ? 0.6 : 1,
    borderWidth: 1,
    borderColor: `${accentColor}30`,
  });

  const statFontSize = width < 380 ? 26 : 32;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: 'transparent' }}>
      {/* Top Row: Back | Title | Settings */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <Pressable onPress={handleBack} style={({ pressed }) => iconBtnStyle(pressed)}>
          <Ionicons name="close-outline" size={26} color={accentColor} />
        </Pressable>

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{
            color: accentColor,
            fontSize: width > 400 ? 22 : 18,
            fontWeight: '900',
            letterSpacing: 2,
            ...glowStyle(`${accentColor}80`),

          }}>
            {title.split('').join(' ')}
          </Text>
          {subtitle ? (
            <Text style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 2,
              marginTop: 2,
              textTransform: 'uppercase',
            }}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onSettings ? (
          <Pressable
            onPress={() => {

              onSettings();
            }}
            style={({ pressed }) => iconBtnStyle(pressed)}
          >
            <Ionicons name={settingsIcon} size={24} color={accentColor} />
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Divider */}
      <View style={{
        height: 1,
        marginHorizontal: wp(6),
        backgroundColor: `${accentColor}20`,
      }} />

      {/* Stats Row */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(6),
        paddingTop: 10,
      }}>
        <View>
          <Text style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 2,
            marginBottom: 2,
            textTransform: 'uppercase',
          }}>
            {leftStats.label}
          </Text>
          {leftStats.customValue ? (
            leftStats.customValue
          ) : (
            <Text style={{
              color: leftStats.color ?? accentColor,
              fontSize: statFontSize,
              fontWeight: '900',
              fontVariant: ['tabular-nums'],
              ...(leftStats.glowColor ? glowStyle(leftStats.glowColor) : {}),
            }}>
              {leftStats.value}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 2,
            marginBottom: 2,
            textTransform: 'uppercase',
          }}>
            {rightStats.label}
          </Text>
          {rightStats.customValue ? (
            rightStats.customValue
          ) : (
            <Text style={{
              color: rightStats.color ?? '#ffffff',
              fontSize: statFontSize,
              fontWeight: '900',
              fontVariant: ['tabular-nums'],
              ...(rightStats.glowColor ? glowStyle(rightStats.glowColor) : {}),
            }}>
              {rightStats.value}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
