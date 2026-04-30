import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { useResponsive } from '../../hooks/useResponsive';

export interface ModeConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  unit: string;
}

interface ModeTabsProps {
  modes: ModeConfig[];
  selectedMode: string;
  onSelect: (id: string, index: number) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ modes, selectedMode, onSelect }) => {
  const { moderateScale, spacing, verticalScale } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);

  // Tab index for animation
  const activeIndex = useSharedValue(modes.findIndex(m => m.id === selectedMode));

  // Scroll active tab to center
  useEffect(() => {
    const index = modes.findIndex(m => m.id === selectedMode);
    if (index !== -1) {
      activeIndex.value = withTiming(index, {
        duration: 350,
        easing: Easing.bezier(0.4, 0, 0.2, 1)
      });

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: Math.max(0, index * moderateScale(110) - spacing.xl * 2),
          animated: true,
        });
      }
    }
  }, [selectedMode, modes, moderateScale, spacing.xl]);

  return (
    <View style={{ marginBottom: 0 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: spacing.xs,
        }}
      >
        {modes.map((m, index) => {
          const isActive = selectedMode === m.id;

          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.8}
              onPress={() => onSelect(m.id, index)}
              style={{
                height: verticalScale(42),
                paddingHorizontal: spacing.lg,
                borderRadius: moderateScale(21),
                backgroundColor: isActive ? m.color : 'rgba(255,255,255,0.05)',
                marginRight: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Ionicons
                name={m.icon as any}
                size={moderateScale(16)}
                color={isActive ? '#000' : 'rgba(255,255,255,0.3)'}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={{
                color: isActive ? '#000' : 'rgba(255,255,255,0.4)',
                fontWeight: isActive ? '900' : '600',
                fontSize: moderateScale(13),
              }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
