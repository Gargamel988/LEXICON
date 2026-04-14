import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Colors from '../../constants/Colors';

interface ModeCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  accentColor?: string;
  onPress: () => void;
}

export default function ModeCard({ title, description, icon, badge, accentColor, onPress }: ModeCardProps) {
  const finalColor = accentColor || Colors.correct.main;
  return (
    <View style={{ width: '48%', marginBottom: 16 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: '#1c1c1e',
          borderRadius: 20,
          padding: 16,
          height: 160,
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: '#2c2c2e',
          transform: [{ scale: pressed ? 0.97 : 1 }]
        })}
      >
        <View style={{
          width: 44,
          height: 44,
          backgroundColor: `${finalColor}15`,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons name={icon} size={28} color={finalColor} />
        </View>

        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{title}</Text>
            {badge && (
              <View style={{
                backgroundColor: finalColor,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{badge}</Text>
              </View>
            )}
          </View>
          <Text
            style={{ color: Colors.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '500' }}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
