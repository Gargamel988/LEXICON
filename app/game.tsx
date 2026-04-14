import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { usePowerUps } from '../hooks/usePowerUps';
import { useWordGame } from '../hooks/useWordGame';
import { statsService } from '../services/statsService';
import { getWordByCategory } from '../services/wordService';

const CLASSIC_ACCENT = '#82b1ff';
const CLASSIC_BG = '#121212';

export default function GameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [gameId, setGameId] = useState(0);
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('hepsi');
  const [wordLength, setWordLength] = useState(5);
  const [showmodal, setShowmodal] = useState(false);
  const [result, setResult] = useState<{
    status: 'win' | 'lose';
    guesses: number;
    isVisible: boolean;
  }>({ status: 'win', guesses: 0, isVisible: false });

  // Yan sonuç kaydı için Mutation
  const saveResultMutation = useMutation({
    mutationFn: (data: any) => statsService.saveGameResult(user!.id, data),
    onSuccess: (data) => {
      // İstatistik sayfasını geçersiz kıl (yenilemeyi tetikle)
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
    isRiskModeActive,
    setIsRiskModeActive,
    maxRows,
  } = useWordGame({
    word,
    wordLength,
    onSuccess: (points: number, attempts: number) => {
      if (user) {
        saveResultMutation.mutate({
          mode: 'classic',
          is_winner: true,
          attempts: attempts,
          word_length: wordLength,
          category: category,
          score: points || 0,
        });

      }
      setTimeout(() => {
        setResult({ status: 'win', guesses: attempts, isVisible: true });
      }, 1500);
    },
    onFail: async (attempts: number) => {
      if (user) {
        saveResultMutation.mutate({
          mode: 'classic',
          is_winner: false,
          attempts: attempts,
          word,
          category,
          word_length: wordLength
        });
      }
      setTimeout(() => {
        setResult({ status: 'lose', guesses: 6, isVisible: true });
      }, 1500);
    },
  });

  const [isSettingsVisible, setIsSettingsVisible] = useState(true);

  const { configs: powerUpConfigs, resetPowerUps } = usePowerUps(
    ['hint', 'bomb', 'joker', 'veto', 'risk'],
    {
      hint: { count: 3 },
      bomb: { count: 1 },
      joker: { count: 1 },
      veto: { count: 1 },
      risk: { count: 0, isActive: false }
    },
    (key) => {
      if (key === 'hint') getHint();
      if (key === 'bomb') useBomb();
      if (key === 'joker') {
        if (currentGuess.length > 0) useJoker(currentGuess[currentGuess.length - 1]);
      }
      if (key === 'veto') {
        if (currentRow > 0) useVeto();
      }
      if (key === 'risk') {
        setIsRiskModeActive(!isRiskModeActive);
      }
    }
  );

  const startNewGame = (selectedCategory: string, selectedLength: number) => {
    const newWord = getWordByCategory(selectedCategory, selectedLength);
    setWord(newWord);
    setCategory(selectedCategory);
    setWordLength(selectedLength);
    setGameId(p => p + 1);
    resetGameStates(6, newWord.length);
    resetPowerUps({
      hint: { count: 3 },
      bomb: { count: 1 },
      joker: { count: 1 },
      veto: { count: 1 },
      risk: { count: 0, isActive: false }
    });
    setIsSettingsVisible(false);
    setResult(prev => ({ ...prev, isVisible: false }));
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
