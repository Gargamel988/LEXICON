import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, Share, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { CellData } from '../../types';

interface ResultModalProps {
  isVisible: boolean;
  status: 'win' | 'lose';
  word: string;
  guesses: number;
  onRestart: () => void;
  onHome: () => void;
  onNewGame?: () => void;
  mode?: 'classic' | 'timed' | 'multi' | 'blind' | 'survival' | 'climb';
  extraData?: string | number; // Blitz için kelime sayısı, Multi için solved/total
  allGrids?: CellData[][][]; // Multi-Mode grids for emoji share
}

const { height } = Dimensions.get('window');

const ResultModal: React.FC<ResultModalProps> = ({
  isVisible,
  status,
  word,
  guesses,
  onRestart,
  onHome,
  onNewGame,
  mode = 'classic',
  extraData,
  allGrids
}) => {
  const isWin = status === 'win';
  const isMulti = mode === 'multi';
  const isTimed = mode === 'timed';
  const isClimb = mode === 'climb';
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  const CLIMB_ACCENT = '#CF4C13';
  const SURVIVAL_ACCENT = '#ff3b30';
  const MULTI_ACCENT = '#9c27b0';
  const WIN_COLOR = '#6aaa64';
  const LOSE_COLOR = '#ff4d4d';

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 60 });

      if (isWin || isTimed) {

      } else {

      }
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(height, { duration: 300 });
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isVisible]);

  const handleShare = async () => {

    let modeName = 'Kelime Oyunu';
    if (isMulti) modeName = 'Çoklu Mod';
    else if (mode === 'survival') modeName = 'Can Modu';
    else if (isClimb) modeName = 'Tırmanma Modu';

    let message = `Lexicon ${modeName}\n`;
    message += `Skor: ${guesses}\n`;

    if (extraData) {
      if (isMulti) message += `İlerleme: ${extraData}\n`;
      else if (mode === 'survival') message += `Bilinen: ${extraData}\n`;
      else if (isClimb) message += `Ulaşılan Tur: ${extraData}\n`;
    }
    message += `Kelimeler: ${word}\n\n`;

    if (isMulti && allGrids) {
      // Create emoji grid for each word
      allGrids.forEach((grid, idx) => {
        if (!grid || !Array.isArray(grid)) return;

        message += `Kelime #${idx + 1}:\n`;
        const emojiRows = grid
          .filter(row => row && Array.isArray(row) && row.some(cell => cell && cell.status !== 'empty'))
          .map(row =>
            row.map(cell => {
              if (!cell) return '⬛';
              if (cell.status === 'correct') return '🟩';
              if (cell.status === 'present') return '🟨';
              return '⬛';
            }).join('')
          ).join('\n');
        message += emojiRows + '\n\n';
      });
    }

    message += `https://lexicon.game`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!shouldRender && !isVisible) return null;

  const accentColor = mode === 'survival' ? SURVIVAL_ACCENT : (isMulti ? MULTI_ACCENT : (isClimb ? CLIMB_ACCENT : (isWin ? WIN_COLOR : LOSE_COLOR)));

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      {/* Backdrop */}
      <Animated.View style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
        },
        backdropStyle
      ]} />

      {/* Modal Card */}
      <Animated.View style={[
        {
          width: '95%',
          backgroundColor: '#121213',
          borderRadius: 30,
          padding: 30,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        },
        cardStyle
      ]}>
        <Ionicons
          name={isWin ? "trophy" : "close-circle"}
          size={70}
          color={accentColor}
        />

        <Text style={{
          color: '#fff',
          fontSize: 28,
          fontWeight: '900',
          marginTop: 15,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          {mode === 'survival' ? "HAYATTA KALAMADIN!" : (isClimb ? "OYUN BİTTİ!" : (isTimed ? "SÜRE DOLDU!" : (isWin ? "TEBRİKLER!" : "BİTMEDİ!")))}
        </Text>

        <View style={{ marginTop: 10, alignItems: 'center', gap: 4 }}>
          {isTimed || mode === 'survival' ? (
            <>
              <Text style={{ color: mode === 'survival' ? SURVIVAL_ACCENT : '#4cd964', fontSize: 24, fontWeight: '900' }}>
                {guesses.toLocaleString('tr-TR')} PUAN
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                {mode === 'survival' ? `${extraData} KELİME ÇÖZDÜN` : isClimb ? `${extraData}. TURA ULAŞTIN` : `${extraData} KELİME BİLDİN`}
              </Text>
            </>
          ) : (
            <Text style={{ color: '#818384', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
              {isWin ? "Sözlüğün ustası yola devam ediyor." : "Maalesef tüm kelimeleri bulamadın."}
              {isMulti && ` (${extraData})`}
            </Text>
          )}
        </View>

        {(!isWin || isMulti || mode === 'survival' || isTimed) ? (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 15,
            marginTop: 20,
            alignItems: 'center',
            width: '100%'
          }}>
            <Text style={{ color: '#818384', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
              {isMulti ? "KELİMELER" : "GİZLİ KELİME"}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2, marginTop: 2, textAlign: 'center' }}>{word}</Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 15,
            marginTop: 20,
            alignItems: 'center',
            width: '100%'
          }}>
            <Text style={{ color: '#818384', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
              PERFORMANS DEĞERLENDİRMESİ
            </Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1, marginTop: 5, textAlign: 'center' }}>
              {guesses <= 2 ? "DÂHİCE!" : guesses <= 4 ? "HARİKA!" : "İYİ İŞ!"}
            </Text>
          </View>
        )}

        <View style={{ width: '100%', marginTop: 25, gap: 10 }}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({
              backgroundColor: accentColor,
              height: 55,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>SKORU PAYLAŞ</Text>
          </Pressable>

          {onNewGame && (
            <Pressable
              onPress={() => {

                onNewGame();
              }}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(255,255,255,0.08)',
                height: 50,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>YENİ OYUN / AYARLAR</Text>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => {

                onRestart();
              }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: '#3a3a3c',
                height: 50,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>TEKRAR</Text>
            </Pressable>

            <Pressable
              onPress={() => {

                onHome();
              }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: 'transparent',
                height: 50,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>ANA SAYFA</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ResultModal;
