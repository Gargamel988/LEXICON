import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import DailyResultModal from '../components/modal/DailyResultModal';
import { useDailyGame } from '../hooks/useDailyGame';
import { usePowerUps } from '../hooks/usePowerUps';
import { useWordGame } from '../hooks/useWordGame';
import Colors from '../constants/Colors';

const DAILY_ACCENT = Colors.modes.daily.accent;
const DAILY_BG = Colors.modes.daily.background;

export default function DailyGameScreen() {
  const router = useRouter();
  const { dailyWord, isLoading, hasPlayed, playData, timeLeft, submitResult, streak } = useDailyGame();

  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [finalData, setFinalData] = useState<any>(null);

  useEffect(() => {
    if (isGameOver || isLoading || !dailyWord) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, dailyWord]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { grid, currentRow, currentGuess, handleKeyPress, letterStatuses, isGameOver, setIsGameOver, resetGameStates, getHint, useBomb } = useWordGame({
    word: dailyWord || '',
    wordLength: dailyWord?.length || 5,
    onSuccess: async (points: number, attempts: number, fairPlayData: { isFairPlay: boolean, backgroundCount: number, backgroundTotalTime: number }) => {
      const resultData = { 
        attempts, 
        duration_seconds: elapsedSeconds, 
        is_winner: true, 
        streak: streak + 1,
        isFairPlay: fairPlayData?.isFairPlay,
        backgroundStats: {
          count: fairPlayData?.backgroundCount ?? 0,
          totalTime: fairPlayData?.backgroundTotalTime ?? 0
        }
      };
      setFinalData(resultData);
      setIsResultVisible(true);
      setIsGameOver(true);

      try {
        const res = await submitResult({ 
          attempts, 
          duration: elapsedSeconds, 
          isWinner: true,
          is_fair_play: fairPlayData?.isFairPlay 
        });

        if (res && !res.success && res.reason === 'fair_play_violation') {
          Toast.show({
            type: 'info',
            text1: 'Adil Oyun Uyarısı',
            text2: 'Arka plana çok fazla geçiş yaptığınız için bu oyunun puanı kaydedilmedi.',
            position: 'top',
            visibilityTime: 4000
          });
        }
      } catch (e) {
        console.error('Lexicon: Submit error', e);
      }
    },
    onFail: async (attempts: number, fairPlayData: { isFairPlay: boolean, backgroundCount: number, backgroundTotalTime: number }) => {
      const resultData = { 
        attempts, 
        duration_seconds: elapsedSeconds, 
        is_winner: false, 
        streak: 0,
        isFairPlay: fairPlayData?.isFairPlay,
        backgroundStats: {
          count: fairPlayData?.backgroundCount ?? 0,
          totalTime: fairPlayData?.backgroundTotalTime ?? 0
        }
      };
      setFinalData(resultData);
      setIsResultVisible(true);
      setIsGameOver(true);

      try {
        const res = await submitResult({ 
          attempts, 
          duration: elapsedSeconds, 
          isWinner: false,
          is_fair_play: fairPlayData?.isFairPlay 
        });

        if (res && !res.success && res.reason === 'fair_play_violation') {
          Toast.show({
            type: 'info',
            text1: 'Adil Oyun Uyarısı',
            text2: 'Arka plana çok fazla geçiş yaptığınız için bu oyunun puanı kaydedilmedi.',
            position: 'top',
            visibilityTime: 4000
          });
        }
      } catch (e) {
        console.error('Lexicon: Submit error', e);
      }
    },
  });

  useEffect(() => {
    if (dailyWord) resetGameStates(6, dailyWord.length);
  }, [dailyWord]);

  const { configs: powerUpConfigs } = usePowerUps(['hint', 'bomb'], {
    hint: { count: 1 },
    bomb: { count: 1 }
  }, (key) => {
    if (key === 'hint') {
      const success = getHint();
      return success !== false;
    }
    if (key === 'bomb') {
      const success = useBomb();
      return success !== false;
    }
    return false;
  });

  useEffect(() => {
    if (hasPlayed && playData) {
      // playData artık game_results tablosundan geliyor
      setFinalData({
        attempts: playData.attempts,
        duration_seconds: playData.duration_seconds,
        is_winner: playData.is_winner,
        rank: playData.rank,
        isFairPlay: playData.is_fair_play ?? true
      });
      setIsResultVisible(true);
      setIsGameOver(true);
    }
  }, [hasPlayed, playData]);

  /* ── Loading Screen ── */
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DAILY_BG, gap: 16 }}>
        <ActivityIndicator size="large" color={DAILY_ACCENT} />
        <Text style={{ color: `${DAILY_ACCENT}80`, fontWeight: '700', letterSpacing: 2, fontSize: 12 }}>YÜKLENİYOR...</Text>
      </View>
    );
  }

  /* ── Error Screen ── */
  if (!dailyWord) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DAILY_BG, padding: 25 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,126,121,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff7e79" />
        </View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' }}>KELİME HAZIR DEĞİL</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
          Günün kelimesi henüz sisteme yüklenmemiş. Lütfen biraz sonra tekrar dene.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ marginTop: 40, paddingHorizontal: 40, paddingVertical: 15, backgroundColor: DAILY_ACCENT, borderRadius: 15, opacity: pressed ? 0.8 : 1 })}
        >
          <Text style={{ color: '#000', fontWeight: '900', letterSpacing: 1 }}>GERİ DÖN</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GameLayout backgroundColor={DAILY_BG}>

      {/* ── Header + Stats ── */}
      <GameHeader
        title="GÜNLÜK"
        subtitle={isGameOver ? "Oyun Bitti" : `Süre: ${formatTime(elapsedSeconds)}`}
        accentColor={DAILY_ACCENT}
        leftStats={{
          label: 'Güncel Seri',
          value: streak || 0,
          color: DAILY_ACCENT,
          glowColor: `${DAILY_ACCENT}66`,
        }}
        rightStats={{
          label: 'Yeni Kelime',
          value: timeLeft,
          color: '#ffffff',
        }}
        onBack={() => router.back()}
        settingsIcon="calendar-outline"
      />

      {/* ── Grid ── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Grid grid={grid} currentRow={currentRow} currentGuess={currentGuess} />
      </View>

      <PowerUpToolbar configs={powerUpConfigs} />

      {/* ── Klavye ── */}
      <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />

      {/* ── Modal ── */}
      <DailyResultModal
        isVisible={isResultVisible}
        status={finalData?.is_winner ? 'win' : 'lose'}
        word={dailyWord}
        rank={finalData?.rank}
        streak={streak || 0}
        duration={finalData?.duration_seconds || finalData?.duration}
        timeLeft={timeLeft}
        guesses={(grid as any).map((r: any) => ({ cells: r.cells }))} // Adjusting to match expected structure if needed, but let's see
        isFairPlay={finalData?.isFairPlay}
        backgroundStats={finalData?.backgroundStats}
        onClose={() => router.replace('/(tabs)' as any)}
      />
    </GameLayout>
  );
}
