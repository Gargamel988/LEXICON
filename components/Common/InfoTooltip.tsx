import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { Pressable, Text, View, Modal, Dimensions } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useResponsive } from '../../hooks/useResponsive';

interface InfoTooltipProps {
  content: string;
  size?: number;
  color?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InfoTooltip({ content, size = 14, color = 'rgba(255,255,255,0.3)' }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const { moderateScale } = useResponsive();
  const anchorRef = useRef<View>(null);

  const toggleTooltip = () => {
    if (!visible && anchorRef.current) {
      anchorRef.current.measureInWindow((x, y, w, h) => {
        setPosition({ x, y, w, h });
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  };

  const tooltipWidth = Math.min(SCREEN_WIDTH * 0.75, 260);
  
  // Logic to prevent tooltip from going off-screen horizontally
  let leftPos = position.x + (position.w / 2) - (tooltipWidth / 2);
  if (leftPos < 16) leftPos = 16;
  if (leftPos + tooltipWidth > SCREEN_WIDTH - 16) leftPos = SCREEN_WIDTH - tooltipWidth - 16;

  // Triangle offset relative to the tooltip box
  const triangleLeft = position.x + (position.w / 2) - leftPos - 6;

  return (
    <>
      <View ref={anchorRef} collapsable={false} style={{ alignSelf: 'center' }}>
        <Pressable 
          onPress={toggleTooltip}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="information-circle-outline" size={moderateScale(size)} color={color} />
        </Pressable>
      </View>

      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'transparent' }} 
          onPress={() => setVisible(false)} 
        >
          <Animated.View 
            entering={ZoomIn.duration(200)}
            exiting={ZoomOut.duration(150)}
            style={{
              position: 'absolute',
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              width: tooltipWidth,
              left: leftPos,
              // Position above the icon
              top: position.y - 12 - (moderateScale(content.length > 50 ? 55 : 40)), // Dynamic adjustment approximation
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Triangle pointing to the icon */}
            <View 
              style={{
                position: 'absolute',
                bottom: -6,
                left: triangleLeft,
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderTopWidth: 6,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: 'rgba(255,255,255,0.15)',
              }} 
            />
            <Text 
              style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: '600',
                lineHeight: 16,
                textAlign: 'center',
              }}
            >
              {content}
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
