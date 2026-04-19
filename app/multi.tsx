import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import MultiGrid from '../components/Grid/MultiGrid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { useMultiWordGame } from '../hooks/useMultiWordGame';
import { usePowerUps } from '../hooks/usePowerUps';
import { useResponsive } from '../hooks/useResponsive';
import { statsService } from '../services/statsService';
import { getWordByCategory } from '../services/wordService';
import Colors from '../constants/Colors';

const MULTI_ACCENT = Colors.modes.multi.accent;
const MULTI_BG = Colors.modes.multi.background;

// Points configuration
const BASE_POINTS = 500;
const CHAIN_BONUS = 250;
const CLEAN_BONUS = 1500;

export default function MultiModeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [gameId, setGameId] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [category, setCategory] = useState('karisik');
  const [wordLength, setWordLength] = useState(5);
  const [wordCount, setWordCount] = useState(4);
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showmodal, setShowmodal] = useState(false);
  const [result, setResult] = useState<{
    status: 'win' | 'lose';
    guesses: number;
    isVisible: boolean;
    words: string[];
    bonus?: number;
  }>({ status: 'win', guesses: 0, isVisible: false, words: [] });

  const [startTime, setStartTime] = useState<number | null>(null);

  const [score, setScore] = useState(0);
  const [revealedInfo, setRevealedInfo] = useState<string | null>(null);
  const [comboText, setComboText] = useState<string | null>(null);

  // Result mutation for stats
  const saveResultMutation = useMutation({
    mutationFn: (data: any) => statsService.saveGameResult(user!.id, data),
    onSuccess: (res) => {
      if (res && !res.success && res.reason === 'fair_play_violation') {
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
    grids,
    currentRow,
    currentGuess,
    letterStatusesArray,
    solvedStates,
    handleKeyPress,
    resetGameStates,
    addHintToGrid,
    addLightning,
    useMultiBomb,
    useMultiAnalysis,
  } = useMultiWordGame({
    words,
    wordLength,
    maxRows: 9,
    onCombo: (multiplier) => {
      setComboText(`COMBO x${multiplier}!`);
      setScore(prev => prev + (CHAIN_BONUS * (multiplier - 1)));
      setTimeout(() => setComboText(null), 2000);
    },
    onSuccess: (stats) => {
      // Clean Solution Bonus (Solved all in < 9 guesses)
      let bonusPoints = 0;
      if (stats.totalAttempts < 9) {
        bonusPoints += CLEAN_BONUS;
      }

      setScore(prev => prev + bonusPoints);

      if (user) {
        saveResultMutation.mutate({
          mode: 'multi',
          is_winner: true,
          attempts: stats.totalAttempts,
          solved_at_row: stats.solvedAtRow,
          category,
          word_count: wordCount,
          score: score + bonusPoints,
          duration_seconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
        });
      }
      setTimeout(() => {
        setResult({
          status: 'win',
          guesses: stats.totalAttempts,
          isVisible: true,
          words,
          bonus: bonusPoints
        });
      }, 1500);
    },
    onFail: (stats) => {
      if (user) {
        saveResultMutation.mutate({
          mode: 'multi',
          is_winner: false,
          attempts: 9,
          solved_at_row: stats.solvedAtRow,
          category,
          word_count: wordCount,
          duration_seconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
        });
      }
      setTimeout(() => {
        setResult({ status: 'lose', guesses: 9, isVisible: true, words });
      }, 1500);
    },
  });

  const { configs: powerUpConfigs, resetPowerUps } = usePowerUps(
    ['hint', 'lightning', 'bomb', 'analysis', 'bridge'],
    {
      hint: { count: 3 },
      lightning: { count: 2 },
      bomb: { count: 3 },
      analysis: { count: 2 },
      bridge: { count: 2 }
    },
    (key) => {
      if (key === 'hint') handleHint();
      if (key === 'lightning') handleLightning();
      if (key === 'bomb') handleBomb();
      if (key === 'analysis') handleAnalysis();
      if (key === 'bridge') handleBridge();
    }
  );

  const solvedCount = solvedStates.filter(s => s).length;

  const startNewGame = (selectedCategory: string, selectedLength: number, selectedCount: number = 4) => {
    setIsStarting(true);
    setScore(0);
    resetPowerUps({ hint: { count: 3 }, lightning: { count: 2 }, bomb: { count: 3 }, analysis: { count: 2 }, bridge: { count: 2 } });
    setRevealedInfo(null);
    setComboText(null);

    // Give UI a chance to render the loading state before heavy logic
    setTimeout(() => {
      // Fetch multiple unique words
      const newWords: string[] = [];
      const startTime = Date.now();

      while (newWords.length < selectedCount && Date.now() - startTime < 1000) {
        const w = getWordByCategory(selectedCategory, selectedLength);
        if (!newWords.includes(w)) {
          newWords.push(w);
        }
      }

      setWords(newWords);
      setCategory(selectedCategory);
      setWordLength(selectedLength);
      setWordCount(selectedCount);
      setGameId(p => p + 1);
      resetGameStates(newWords, selectedLength, 9);
      setIsStarting(false);
      setIsSettingsVisible(false);
      setResult(prev => ({ ...prev, isVisible: false }));
      setStartTime(Date.now());
    }, 100);
  };

  // Power-up Handlers
  const handleHint = () => {
    let activated = false;
    words.forEach((_, idx) => {
      if (!solvedStates[idx]) {
        addHintToGrid(idx);
        activated = true;
      }
    });

    if (activated) {
      setRevealedInfo("İpucu: Tüm ızgaralar!");
      setTimeout(() => setRevealedInfo(null), 2000);
    }
  };

  const handleLightning = () => {
    const unsolvedIndices = words.map((_, i) => i).filter(i => !solvedStates[i]);
    if (unsolvedIndices.length > 0) {
      const idx = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)];
      addLightning(idx);
      setRevealedInfo(`Şimşek: Izgara ${idx + 1}!`);
      setTimeout(() => setRevealedInfo(null), 2000);
    }
  };

  const handleBomb = () => {
    const allChars = words.join("").toUpperCase();
    const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");
    const unusedWrong = alphabet.filter(c => !allChars.includes(c));

    // Pick 3
    const bombs = [];
    for (let i = 0; i < 3 && unusedWrong.length > 0; i++) {
      const idx = Math.floor(Math.random() * unusedWrong.length);
      bombs.push(unusedWrong.splice(idx, 1)[0]);
    }

    if (bombs.length > 0) {
      useMultiBomb(bombs);
      setRevealedInfo(`Bomba: ${bombs.join(", ")} elendi!`);
      setTimeout(() => setRevealedInfo(null), 2000);
    }
  };

  const handleAnalysis = () => {
    if (currentGuess.length !== wordLength) return false;

    const success = useMultiAnalysis();
    if (success) {
      setRevealedInfo("Analiz: Kelimeler tarandı!");
      setTimeout(() => setRevealedInfo(null), 2000);
      return true;
    }
    return false;
  };

  const handleBridge = () => {
    const unsolved = words.map((w, i) => ({ w: w.toUpperCase(), i })).filter(x => !solvedStates[x.i]);
    if (unsolved.length < 2) return;

    // Find any common letter between any pair
    for (let i = 0; i < unsolved.length; i++) {
      for (let j = i + 1; j < unsolved.length; j++) {
        const common = unsolved[i].w.split("").filter(c => unsolved[j].w.includes(c));
        if (common.length > 0) {
          const letter = common[0];
          setRevealedInfo(`Köprü: ${unsolved[i].i + 1} & ${unsolved[j].i + 1} -> "${letter}"`);
          setTimeout(() => setRevealedInfo(null), 2500);
          return;
        }
      }
    }
    setRevealedInfo("Köprü: Bağlantılı harf yok!");
    setTimeout(() => setRevealedInfo(null), 2000);
  };

  const {
    spacing,
    verticalScale,
    scale
  } = useResponsive();

  const NOTICE_HEIGHT = verticalScale(45);

  return (
    <GameLayout backgroundColor={MULTI_BG}>

      <GameHeader
        title="ÇOKLU MOD"
        subtitle={category}
        accentColor={MULTI_ACCENT}
        leftStats={{
          label: 'İlerleme',
          value: `${solvedCount}/${wordCount}`,
          color: MULTI_ACCENT,
          glowColor: `${MULTI_ACCENT}66`,
        }}
        rightStats={{
          label: 'Puan',
          value: score,
          color: '#ffffff',
        }}
        onBack={() => router.back()}
        onSettings={() => {

          setIsSettingsVisible(true);
        }}
        settingsIcon="options-outline"
      />

      {/* Main Grid Area */}
      <View style={{ flex: 1 }}>

        {/* STABILIZED NOTICE AREA */}
        <View style={{
          height: NOTICE_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {revealedInfo && (
            <Animated.View
              entering={FadeInDown}
              style={{
                backgroundColor: 'rgba(156,39,176,0.15)',
                paddingHorizontal: 20,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: MULTI_ACCENT,
                shadowColor: MULTI_ACCENT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: scale(11),
                fontWeight: '800',
                textShadowColor: 'rgba(156, 39, 176, 0.5)',
                textShadowRadius: 4,
                letterSpacing: 0.5
              }}>{revealedInfo}</Text>
            </Animated.View>
          )}
          {comboText && (
            <Animated.View
              entering={FadeInDown}
              style={{
                marginTop: 5,
                backgroundColor: 'rgba(255, 213, 79, 0.1)',
                paddingHorizontal: 15,
                paddingVertical: 4,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#ffd54f'
              }}
            >
              <Text style={{
                color: '#ffd54f',
                fontSize: scale(15),
                fontWeight: '900',
                textShadowColor: 'rgba(255, 213, 79, 0.6)',
                textShadowRadius: 6,
                letterSpacing: 1
              }}>
                {comboText}
              </Text>
            </Animated.View>
          )}
        </View>

        {words.length > 0 && (
          <MultiGrid
            key={gameId}
            grids={grids}
            currentRow={currentRow}
            currentGuess={currentGuess}
            solvedStates={solvedStates}
          />
        )}
      </View>

      <PowerUpToolbar configs={powerUpConfigs} />

      {/* Keyboard */}
      <Keyboard
        onKeyPress={handleKeyPress}
        letterStatusesArray={letterStatusesArray}
      />


      {/* Modals */}
      {showmodal && (
        <SettingsModal
          isVisible={isSettingsVisible}
          onClose={() => (words.length > 0 ? setIsSettingsVisible(false) : router.back())}
          onStart={(cat, len, count) => startNewGame(cat, len, count)}
          mode="multi"
          isLoading={isStarting}
        />
      )}

      <ResultModal
        isVisible={result.isVisible}
        status={result.status}
        word={result.words.join(' • ')} // Using separator for cleaner look
        guesses={result.guesses}
        mode="multi"
        extraData={`${solvedCount}/${wordCount}`}
        onRestart={() => setIsSettingsVisible(true)}
        onHome={() => router.replace('/(tabs)')}
      />
    </GameLayout>
  );
}
