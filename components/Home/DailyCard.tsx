import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useDailyGame } from '../../hooks/useDailyGame';

export default function DailyCard() {
  const router = useRouter();
  const { timeLeft, hasPlayed, dailyWord, streak } = useDailyGame();

  const handlePress = () => {
    router.push('/daily-game');
  };
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
      <LinearGradient
        colors={['#1c1c1e', '#131313']}
        style={{
          padding: 24,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#2c2c2e',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Top Chips */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            backgroundColor: 'rgba(99, 153, 34, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(99, 153, 34, 0.3)',
          }}>
            <Text style={{ color: Colors.correct.main, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>
              GÜNÜN KELİMESİ
            </Text>
          </View>
          <View style={{
            backgroundColor: '#2c2c2e',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 4,
          }}>
            <MaterialCommunityIcons name="fire" size={16} color={Colors.misplaced.main} />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
              Seri: {streak || 0}
            </Text>
          </View>
        </View>

        {/* Word Boxes Placeholder */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 4 }}>
            {hasPlayed ? dailyWord : "?????"}
          </Text>
        </View>

        {/* Description */}
        <Text style={{ color: Colors.textSecondary, fontSize: 14, textAlign: 'left', marginBottom: 30, lineHeight: 20 }}>
          {hasPlayed
            ? "Bugünün kelimesini buldun! Yarının kelimesini beklemede kal."
            : "Harfleri birleştir ve bugünün gizli kelimesini bul."}
        </Text>

        {/* Footer Area */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>
              KALAN SÜRE
            </Text>
            <Text style={{ color: Colors.misplaced.main, fontSize: 22, fontWeight: '900' }}>
              {timeLeft}
            </Text>
          </View>

          <Pressable
            onPress={handlePress}
            style={({ pressed }) => ({
              backgroundColor: hasPlayed ? '#3a3a3c' : Colors.correct.main,
              paddingHorizontal: 35,
              paddingVertical: 14,
              borderRadius: 12,
              transform: [{ scale: pressed ? 0.96 : 1 }]
            })}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>
              {hasPlayed ? "SKOR" : "OYNA"}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
