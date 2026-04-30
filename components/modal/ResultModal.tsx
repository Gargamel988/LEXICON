import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, Share, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Colors from '../../constants/Colors';
import { useResponsive } from '../../hooks/useResponsive';
import { CellData, Row } from '../../types';

interface ResultModalProps {
  isVisible: boolean;
  status: 'win' | 'lose' | 'draw';
  word: string;
  guesses: number;
  onRestart: () => void;
  onHome: () => void;
  onNewGame?: () => void;
  mode?: 'classic' | 'timed' | 'multi' | 'blind' | 'survival' | 'climb' | 'blitz' | 'battle' | 'bomb';
  extraData?: string | number;
  allGrids?: (Row[] | CellData[][])[];
  grid?: Row[] | CellData[][]; // Single-player grid for emoji share
  category?: string;
  isFairPlay?: boolean;
  backgroundStats?: { count: number; totalTime: number };
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  allGrids,
  grid,
  category,
  isFairPlay = true,
  backgroundStats
}) => {
  const { scale, verticalScale, moderateScale } = useResponsive();

  const isWin = status === 'win';
  const isMulti = mode === 'multi';
  const isClimb = mode === 'climb';
  const isBattle = mode === 'battle';
  const isBomb = mode === 'bomb';
  const isSurvival = mode === 'survival';
  const isBlitz = mode === 'blitz';
  const isBlind = mode === 'blind';
  const isClassic = mode === 'classic';

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  // Get accent color from centralized Colors
  const modeAccent = Colors.modes[mode as keyof typeof Colors.modes]?.accent || Colors.accent;
  const accentColor = status === 'draw' ? Colors.wrong.main : (isWin ? modeAccent : Colors.danger);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isVisible]);

  const getModeEmoji = () => {
    if (isMulti) return '👥';
    if (isSurvival) return '❤️';
    if (isClimb) return '🧗';
    if (isBomb) return '💣';
    if (isBattle) return '⚔️';
    if (isBlitz) return '⚡';
    if (isBlind) return '👁️';
    return '🔤';
  };



  const getModeName = () => {
    if (isMulti) return 'Çoklu Mod';
    if (isSurvival) return 'Can Modu';
    if (isClimb) return 'Tırmanma Modu';
    if (isBomb) return 'Bomba Kimde?';
    if (isBattle) return 'Kelime Savaşı';
    if (isBlitz) return 'Blitz';
    if (isBlind) return 'Blind';
    return 'Klasik';
  };

  const buildEmojiGrid = (gridData: (Row | CellData[])[]) => {
    if (!gridData || !Array.isArray(gridData)) return '';
    return gridData
      .filter(row => {
        if (!row) return false;
        if (Array.isArray(row)) {
          return row.some(cell => cell && cell.status !== 'empty');
        }
        return row.cells && row.cells.some(cell => cell && cell.status !== 'empty');
      })
      .map(row => {
        const cells = Array.isArray(row) ? row : row.cells;
        return cells.map((cell: CellData) => {
          if (cell?.status === 'correct') return '🟩';
          if (cell?.status === 'present') return '🟨';
          return '⬛';
        }).join('');
      }).join('\n');
  };

  const handleShare = async () => {
    const modeEmoji = getModeEmoji();
    const modeName = getModeName();
    const lines: string[] = [];

    lines.push(`${modeEmoji} LEXICON — ${modeName}`);
    lines.push('');
    if (category) {
      lines.push(`${isBlind ? '👁️ Mod' : '🗂️ Kategori'} : ${category}`);
    }


    if (isBomb) {
      lines.push(isWin ? '✅ Hayatta kaldım!' : '💥 Bomba bende patladı!');
    } else if (isBattle) {
      lines.push(isWin ? `✅ ${extraData} karşısında zafer!` : `❌ ${extraData} kazandı.`);
    } else if (isClassic) {
      lines.push(isWin ? `🎯 Kelimeyi ${guesses}/6 denemede buldum!` : `❌ Kelimeyi bulamadım...`);
    }

    if (!isClassic) {
      lines.push(`🏆 Puan: ${guesses.toLocaleString('tr-TR')}`);
    }

    if (extraData && !isBattle && !isClassic) {
      if (isMulti) lines.push(`📈 İlerleme: ${extraData}`);
      else if (isSurvival) lines.push(`💡 Bilinen: ${extraData} Kelime`);
      else if (isClimb) lines.push(`🎯 Ulaşılan Tur: ${extraData}`);
      else if (isBlitz) lines.push(`⚡ Bilinen: ${extraData} Kelime`);
      else if (isBlind) lines.push(`👁️ ${extraData}. Tahminde Buldum`);
    }
    if (isBlitz || isSurvival || isClimb) lines.push(`🔤 Son Kelime: ${word}`)
    else lines.push(`🔤 Kelime: ${word}`);

    // Add grid for Classic mode
    if (isClassic && grid) {
      lines.push('');
      lines.push(buildEmojiGrid(grid));
    }

    if (isMulti && allGrids) {
      lines.push('');
      allGrids.forEach((gridItem, idx) => {
        lines.push(`#${idx + 1}`);
        lines.push(buildEmojiGrid(gridItem));
      });
    }

    lines.push('');
    if (!isFairPlay) lines.push('⚠️ Adil oyun dışı saptandı.');
    lines.push('🔗 lexicon.game');

    try {
      await Share.share({ message: lines.join('\n') });
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
          backgroundColor: Colors.overlay,
        },
        backdropStyle
      ]} />

      {/* Modal Card */}
      <Animated.View style={[
        {
          width: scale(340),
          backgroundColor: Colors.card,
          borderRadius: moderateScale(30),
          padding: scale(25),
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.border,
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
        },
        cardStyle
      ]}>
        <View style={{
          width: scale(90),
          height: scale(90),
          borderRadius: scale(45),
          backgroundColor: `${accentColor}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: verticalScale(15),
          borderWidth: 2,
          borderColor: `${accentColor}33`
        }}>
          <Ionicons
            name={status === 'draw' ? 'remove-circle-outline' : (isBomb ? (isWin ? "shield-checkmark" : "flame") : (isWin ? "trophy" : "close-circle"))}
            size={scale(45)}
            color={accentColor}
          />
        </View>

        <Text style={{
          color: Colors.text,
          fontSize: moderateScale(24),
          fontWeight: '900',
          textAlign: 'center',
          letterSpacing: 1,
          textTransform: 'uppercase'
        }}>
          {status === 'draw' ? "BERABERE!" :
            isBattle ? (isWin ? "SAVAŞI KAZANDIN!" : "SAVAŞ KAYBEDİLDİ!") :
              isSurvival ? "HAYATTA KALAMADIN!" :
                isClimb ? "OYUN BİTTİ!" :
                  isBlitz ? "SÜRE DOLDU!" :
                    isBomb ? (isWin ? "SAVAŞI KAZANDIN!" : "BOMBA PATLADI!") :
                      (isWin ? "TEBRİKLER!" : "BİTMEDİ!")}
        </Text>

        <View style={{ marginTop: verticalScale(10), alignItems: 'center', gap: scale(4) }}>
          {(isSurvival || isClimb || isBlitz || isBlind || isMulti) ? (
            <>
              <Text style={{ color: accentColor, fontSize: moderateScale(32), fontWeight: '900' }}>
                {(guesses || 0).toLocaleString('tr-TR')} PUAN
              </Text>
              <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(13), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {isSurvival ? `${extraData || 0} KELİME ÇÖZDÜN` :
                  isClimb ? `${extraData || 1}. TURA ULAŞTIN` :
                    isBlitz ? `${extraData || 0} KELİME BİLDİN` :
                      isBlind ? `${extraData || 0} TAHMİNDE BİLDİN` :
                        isMulti ? `${extraData || 0} KELİME BİLDİN` :
                          `${extraData || 0} KELİME BİLDİN`}
              </Text>
            </>
          ) : (
            <View style={{ paddingHorizontal: scale(10) }}>
              <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(15), fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
                {status === 'draw' ? "İkiniz de kelimeyi bulamadınız." :
                  isBattle ? (isWin ? (extraData === 'SİZ' ? 'Tebrikler, zafer kazandın!' : `${extraData} karşısında zafer kazandın!`) : `${extraData} bu turu senden önce bitirdi.`) :
                    isBomb ? (isWin ? "Rakibi patlatarak hayatta kalmayı başardın!" : "Süre bitti ve bomba sende patladı...") :
                      isWin ? "Sözlüğün ustası yola devam ediyor." : "Maalesef tüm kelimeleri bulamadın."}
              </Text>
            </View>
          )}
        </View>

        {/* Word Display Section */}
        {(!isWin || isMulti || isSurvival || isBlitz || isClimb || isBlind || isBomb) ? (
          <View style={{
            backgroundColor: Colors.glass,
            paddingVertical: verticalScale(12),
            paddingHorizontal: scale(20),
            borderRadius: moderateScale(15),
            marginTop: verticalScale(20),
            alignItems: 'center',
            width: '100%',
            borderWidth: 1,
            borderColor: Colors.border
          }}>
            <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(10), fontWeight: '700', letterSpacing: 1.5 }}>
              {isMulti ? "KELİMELER" : isBomb ? "PATLAYAN KELİME" : "GİZLİ KELİME"}
            </Text>
            <Text style={{ color: Colors.text, fontSize: moderateScale(20), fontWeight: '900', letterSpacing: 3, marginTop: verticalScale(2), textAlign: 'center' }}>
              {word}
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: Colors.glass,
            paddingVertical: verticalScale(12),
            paddingHorizontal: scale(20),
            borderRadius: moderateScale(15),
            marginTop: verticalScale(20),
            alignItems: 'center',
            width: '100%',
            borderWidth: 1,
            borderColor: Colors.border
          }}>
            <Text style={{ color: Colors.textSecondary, fontSize: moderateScale(10), fontWeight: '700', letterSpacing: 1.5 }}>
              PERFORMANS DEĞERLENDİRMESİ
            </Text>
            <Text style={{ color: Colors.text, fontSize: moderateScale(18), fontWeight: '800', letterSpacing: 1, marginTop: verticalScale(5), textAlign: 'center' }}>
              {guesses <= 2 ? "DÂHİCE!" : guesses <= 4 ? "HARİKA!" : "İYİ İŞ!"}
            </Text>
          </View>
        )}

        {/* Fair Play Status Badge */}
        {!isFairPlay && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(6),
            borderRadius: scale(10),
            marginTop: verticalScale(15),
            gap: scale(6),
            borderWidth: 1,
            borderColor: 'rgba(255, 149, 0, 0.2)'
          }}>
            <Ionicons name="warning-outline" size={scale(14)} color="#ff9500" />
            <Text style={{ color: '#ff9500', fontSize: moderateScale(11), fontWeight: '800', textTransform: 'uppercase' }}>
              RESMİ OLMAYAN SKOR
            </Text>
          </View>
        )}

        {/* Buttons Section */}
        <View style={{ width: '100%', marginTop: verticalScale(25), gap: verticalScale(10) }}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({
              backgroundColor: accentColor,
              height: verticalScale(52),
              borderRadius: moderateScale(16),
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: scale(10),
              opacity: pressed ? 0.9 : 1,
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            })}
          >
            <Ionicons name="share-social" size={scale(20)} color="#fff" />
            <Text style={{ color: '#fff', fontSize: moderateScale(16), fontWeight: '900' }}>SKORU PAYLAŞ</Text>
          </Pressable>

          {onNewGame && (
            <Pressable
              onPress={onNewGame}
              style={({ pressed }) => ({
                backgroundColor: Colors.glass,
                height: verticalScale(48),
                borderRadius: moderateScale(14),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: Colors.text, fontSize: moderateScale(14), fontWeight: '800' }}>YENİ OYUN / AYARLAR</Text>
            </Pressable>
          )}

          <View style={{ flexDirection: 'row', gap: scale(10) }}>
            <Pressable
              onPress={onRestart}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: Colors.wrong.dark,
                height: verticalScale(48),
                borderRadius: moderateScale(14),
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: Colors.text, fontSize: moderateScale(14), fontWeight: '900' }}>
                {(isBattle || isBomb) ? "LOBİYE DÖN" : "TEKRAR"}
              </Text>
            </Pressable>

            <Pressable
              onPress={onHome}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: 'transparent',
                height: verticalScale(48),
                borderRadius: moderateScale(14),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: Colors.text, fontSize: moderateScale(14), fontWeight: '700' }}>ANA SAYFA</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ResultModal;
