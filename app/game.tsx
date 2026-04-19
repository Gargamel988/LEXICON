import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { PowerUpStates, usePowerUps } from '../hooks/usePowerUps';
import { useWordGame } from '../hooks/useWordGame';
import { statsService } from '../services/statsService';
import { getWordByCategory } from '../services/wordService';
import Colors from '../constants/Colors';

const CLASSIC_ACCENT = Colors.modes.classic.accent;
const CLASSIC_BG = Colors.modes.classic.background;

export default function GameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const setPowerUpStatesRef = React.useRef<React.Dispatch<React.SetStateAction<PowerUpStates>> | null>(null);

  const [gameId, setGameId] = useState(0);
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('hepsi');
  const [wordLength, setWordLength] = useState(5);
  const [showmodal, setShowmodal] = useState(false);
  const [result, setResult] = useState<{
    status: 'win' | 'lose';
    guesses: number;
    isVisible: boolean;
    isFairPlay: boolean;
    backgroundStats?: { count: number; totalTime: number };
  }>({ status: 'win', guesses: 0, isVisible: false, isFairPlay: true });

  const [startTime, setStartTime] = useState<number | null>(null);

  // Yan sonuç kaydı için Mutation
  const saveResultMutation = useMutation({
    mutationFn: (data: any) => statsService.saveGameResult(user!.id, data),
    onSuccess: (res) => {
      if (!res.success && res.reason === 'fair_play_violation') {
        Toast.show({
          type: 'info',
          text1: 'Adil Oyun Uyarısı',
          text2: 'Arka plana çok fazla geçiş yaptığınız için bu oyunun puanı kaydedilmedi.',
          position: 'top',
          visibilityTime: 4000
        });
      }
      queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
    }
  });

  // Show SettingsModal after first render
  useEffect(() => {
    const t = setTimeout(() => setShowmodal(true), 100);
    return () => clearTimeout(t);
  }, []);

  const {
    grid,
    currentRow,
    currentGuess,
    handleKeyPress,
    letterStatuses,
    resetGameStates,
    getHint,
    useBomb,
    useJoker,
    useVeto,
    useMirror,
    maxRows,
    isFairPlay: gameFairPlay,
    backgroundStats: gameBackgroundStats,
  } = useWordGame({
    word,
    wordLength,
    onSuccess: (points: number, attempts: number, fairPlayData) => {
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      saveResultMutation.mutate({
        mode: 'classic',
        is_winner: true,
        attempts: attempts,
        word_length: wordLength,
        category: category,
        score: points || 0,
        duration_seconds: duration,
        is_fair_play: fairPlayData?.isFairPlay
      });

      setTimeout(() => {
        setResult({ 
          status: 'win', 
          guesses: attempts, 
          isVisible: true,
          isFairPlay: fairPlayData?.isFairPlay ?? true,
          backgroundStats: {
            count: fairPlayData?.backgroundCount ?? 0,
            totalTime: fairPlayData?.backgroundTotalTime ?? 0
          }
        });
      }, 1500);
    },
    onFail: async (attempts: number, fairPlayData) => {
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      saveResultMutation.mutate({
        mode: 'classic',
        is_winner: false,
        attempts: attempts,
        word,
        category,
        word_length: wordLength,
        duration_seconds: duration,
        is_fair_play: fairPlayData?.isFairPlay
      });
      setTimeout(() => {
        setResult({ 
          status: 'lose', 
          guesses: 6, 
          isVisible: true,
          isFairPlay: fairPlayData?.isFairPlay ?? true,
          backgroundStats: {
            count: fairPlayData?.backgroundCount ?? 0,
            totalTime: fairPlayData?.backgroundTotalTime ?? 0
          }
        });
      }, 1500);
    },
  });

  const [isSettingsVisible, setIsSettingsVisible] = useState(true);

  const { configs: powerUpConfigs, resetPowerUps, setStates: setPowerUpStates } = usePowerUps(
    ['hint', 'bomb', 'joker', 'veto', 'mirror'],
    {
      hint: { count: 2 },
      bomb: { count: 1 },
      joker: { count: 2 },
      veto: { count: 1 },
      mirror: { count: 1 }
    },
    (key) => {
      if (key === 'hint') return getHint();
      if (key === 'bomb') return useBomb();
      if (key === 'joker') {
        if (currentGuess.length > 0) return useJoker(currentGuess[currentGuess.length - 1]);
        return false;
      }
      if (key === 'veto') {
        if (currentRow > 0) return useVeto();
        return false;
      }
      if (key === 'mirror') return useMirror();
    }
  );

  useEffect(() => {
    setPowerUpStatesRef.current = setPowerUpStates;
  }, [setPowerUpStates]);


  const startNewGame = (selectedCategory: string, selectedLength: number) => {
    const newWord = getWordByCategory(selectedCategory, selectedLength);
    setWord(newWord);
    setCategory(selectedCategory);
    setWordLength(selectedLength);
    setGameId(p => p + 1);
    resetGameStates(6, newWord.length);
    resetPowerUps({
      hint: { count: 2 },
      bomb: { count: 1 },
      joker: { count: 2 },
      veto: { count: 1 },
      mirror: { count: 1 }
    });
    setIsSettingsVisible(false);
    setResult(prev => ({ ...prev, isVisible: false }));
    setStartTime(Date.now());
  };



  return (
    <GameLayout backgroundColor={CLASSIC_BG}>

      {/* ── Header + Stats (sabit, flex almaz) ── */}
      <GameHeader
        title="KLASİK"
        subtitle={category}
        accentColor={CLASSIC_ACCENT}
        leftStats={{
          label: 'Deneme',
          value: `${currentRow + 1}/${maxRows}`,
          color: CLASSIC_ACCENT,
          glowColor: `${CLASSIC_ACCENT}66`,
        }}
        rightStats={{
          label: 'Harf',
          value: wordLength,
          color: '#ffffff',
        }}
        onBack={() => router.back()}
        onSettings={() => {

          setIsSettingsVisible(true);
        }}
        settingsIcon="options-outline"
      />

      {/* ── Grid (kalan alanı doldurur, ortalanır) ── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
        <Grid
          key={gameId}
          grid={grid}
          currentRow={currentRow}
          currentGuess={currentGuess}
        />
      </View>

      {/* ── Power-Ups ── */}
      <PowerUpToolbar configs={powerUpConfigs} />

      {/* ── Klavye ── */}
      <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} language='TR' />

      {/* ── Modaller ── */}
      {showmodal && (
        <SettingsModal
          isVisible={isSettingsVisible}
          onClose={() => (word ? setIsSettingsVisible(false) : router.back())}
          onStart={startNewGame}
          mode="classic"
        />
      )}

      <ResultModal
        isVisible={result.isVisible}
        status={result.status}
        word={word}
        guesses={result.guesses}
        isFairPlay={result.isFairPlay}
        backgroundStats={result.backgroundStats}
        onRestart={() => startNewGame(category, wordLength)}
        onNewGame={() => {
          setResult(p => ({ ...p, isVisible: false }));
          setIsSettingsVisible(true);
        }}
        onHome={() => router.replace('/(tabs)')}
      />
    </GameLayout>
  );
}
