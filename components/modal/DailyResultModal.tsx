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

interface DailyResultModalProps {
  isVisible: boolean;
  status: 'win' | 'lose';
  word: string;
  rank?: number | null;
  streak?: number;
  attempts?: number;
  duration?: number;
  timeLeft: string;
  onClose: () => void;
  guesses?: any[][];
  isFairPlay?: boolean;
  backgroundStats?: { count: number; totalTime: number };
}

const { height } = Dimensions.get('window');

const DailyResultModal: React.FC<DailyResultModalProps> = ({
  isVisible,
  status,
  word,
  rank,
  streak,
  attempts,
  duration,
  timeLeft,
  onClose,
  guesses,
  isFairPlay = true,
  backgroundStats
}) => {
  const isWin = status === 'win';
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 40 });

    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(height, { duration: 300 });
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isVisible]);

  const handleShare = async () => {

    const dateStr = new Date().toLocaleDateString('tr-TR');

    let emojiGrid = '';
    if (guesses) {
      emojiGrid = guesses
        .filter(row => row.some(cell => cell.status !== 'empty'))
        .map(row =>
          row.map(cell => {
            if (cell.status === 'correct') return '🟩';
            if (cell.status === 'present') return '🟨';
            return '⬛';
          }).join('')
        ).join('\n');
    }

    let message = `Lexicon Günlük Kelime (${dateStr})\n`;
    message += `Skor: ${isWin ? attempts : 'X'}/6\n`;
    if (isWin && rank) message += `Sıra: #${rank}\n`;
    if (streak) message += `Seri: ${streak}🔥\n\n`;
    if (emojiGrid) message += `${emojiGrid}\n\n`;
    if (!isFairPlay) message += `⚠️ Bu skor yardımcı araçlarla alınmış olabilir.\n`;
    message += `https://lexicon.game`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!shouldRender && !isVisible) return null;

  const StatItem = ({ label, value, icon, color }: any) => (
    <View style={{ alignItems: 'center', flex: 1, padding: 10 }}>
      <Ionicons name={icon} size={20} color={color || '#818384'} />
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{value || '-'}</Text>
      <Text style={{ color: '#818384', fontSize: 10, fontWeight: '700', marginTop: 2 }}>{label}</Text>
    </View>
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      {/* Backdrop */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)' }, backdropStyle]} />

      {/* Modal Card */}
      <Animated.View style={[{
        width: '92%',
        backgroundColor: '#121213',
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isWin ? Colors.correct.main + '40' : 'rgba(255,255,255,0.1)'
      }, cardStyle]}>

        <Ionicons name={isWin ? "trophy" : "close-circle"} size={60} color={isWin ? Colors.correct.main : Colors.wrong.main} />

        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 10, textAlign: 'center' }}>
          {isWin ? "MÜKEMMEL!" : "OLMADI..."}
        </Text>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, width: '100%', marginTop: 25, padding: 15, flexDirection: 'row', justifyContent: 'space-around' }}>
          <StatItem label="DENEME" value={`${isWin ? attempts : 'X'}/6`} icon="list" color={Colors.correct.main} />
          <StatItem label="SIRALAMA" value={rank ? `#${rank}` : '-'} icon="globe-outline" color="#4dabf7" />
          <StatItem label="SERİ" value={streak ? `${streak}` : '0'} icon="flame" color="#ff922b" />
        </View>

        <View style={{ flexDirection: 'row', width: '100%', marginTop: 15, gap: 15 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 12 }}>
            <Text style={{ color: '#818384', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>GİZLİ KELİME</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginTop: 4 }}>{word.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 12 }}>
            <Text style={{ color: '#818384', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>YENİ KELİME</Text>
            <Text style={{ color: Colors.correct.main, fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 4 }}>{timeLeft}</Text>
          </View>
        </View>

        {/* Fair Play Status Badge */}
        {!isFairPlay && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 149, 0, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            marginTop: 15,
            gap: 6,
            borderWidth: 1,
            borderColor: 'rgba(255, 149, 0, 0.3)'
          }}>
            <Ionicons name="warning-outline" size={14} color="#ff9500" />
            <Text style={{ color: '#ff9500', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
              RESMİ OLMAYAN SKOR
            </Text>
          </View>
        )}
        {backgroundStats && backgroundStats.count > 0 && (
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 5 }}>
            Uygulama Geçişi: {backgroundStats.count} | Süre: {backgroundStats.totalTime}s
          </Text>
        )}

        <View style={{ width: '100%', marginTop: 30, gap: 12 }}>
          <Pressable onPress={handleShare} style={({ pressed }) => ({ backgroundColor: Colors.correct.main, height: 55, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, opacity: pressed ? 0.9 : 1 })}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>SKORU PAYLAŞ</Text>
          </Pressable>

          <Pressable onPress={onClose} style={({ pressed }) => ({ height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: '#818384', fontSize: 14, fontWeight: '700' }}>KAPAT</Text>
          </Pressable>
        </View>

      </Animated.View>
    </View>
  );
};

export default DailyResultModal;
