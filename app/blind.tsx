import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { statsService } from '@/services/statsService';
import { inventoryService } from '@/services/inventoryService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { usePowerUps } from '../hooks/usePowerUps';
import { useResponsive } from '../hooks/useResponsive';
import { useWordGame } from '../hooks/useWordGame';
import { getWordByCategory } from '../services/wordService';
import { BlindDifficulty, BlindModeSettings } from '../types';
import { toUpperTurkish } from '../utils/stringUtils';
import Colors from '../constants/Colors';



const BLIND_ACCENT = Colors.modes.blind.accent;
const BLIND_BG = Colors.modes.blind.background;

const DIFFICULTIES: Record<BlindDifficulty, { name: string, multiplier: number, color: string }> = {
  'TAM_KOR': { name: 'Tam Kör', multiplier: 3.0, color: '#ff3b30' },
  'YARI_KOR': { name: 'Yarı Kör', multiplier: 2.0, color: '#FFD54F' },
  'RENKSIZ': { name: 'Renksiz', multiplier: 1.5, color: '#4caf50' },
};

export default function BlindMode() {
  const router = useRouter();
  const { spacing } = useResponsive();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { getStock } = useInventory(user?.id);

  const [settings, setSettings] = useState<BlindModeSettings | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'win' | 'lose'>('playing');
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isRadarActive, setIsRadarActive] = useState(false);
  const [forceShowFeedback, setForceShowFeedback] = useState(false);
  const [revealedInfo, setRevealedInfo] = useState<string | null>(null);
  const [seenAuraLetters, setSeenAuraLetters] = useState<Set<string>>(new Set());

  const { configs: powerUpConfigs, resetPowerUps, } = usePowerUps(['first_letter', 'magnet', 'radar'], {
    first_letter: { count: getStock('first_letter') }, magnet: { count: getStock('magnet') }, radar: { count: getStock('radar') }
  }, (key) => {
    let result: boolean | void;
    if (key === 'first_letter') { handleFirstLetter(); result = true; }
    else if (key === 'magnet') { handleMagnet(); result = true; }
    else if (key === 'radar') { handleRadar(); result = true; }
    if (result !== false && result !== undefined && user) {
      inventoryService.usePowerUp(user.id, key as any).catch(() => {});
    }
    return result;
  });

  const [startTime, setStartTime] = useState<number | null>(null);

  const feedbackScale = useSharedValue(1);

  const {
    width: SCREEN_WIDTH,
    verticalScale,
    scale
  } = useResponsive();

  const NOTICE_HEIGHT = verticalScale(45);

  const {
    grid,
    currentRow,
    currentGuess,
    letterStatuses,
    handleKeyPress,
    resetGameStates,
    lastFeedback,
    addHint,
    isFairPlay,
    backgroundStats
  } = useWordGame({
    word: currentWord,
    wordLength: settings?.length || 5,
    maxRows: settings?.maxAttempts || 6,
    isBlind: true,
    isRadarActive: isRadarActive,
    onSuccess: (points, attempts, fairPlayData) => {
      const difficultyMultiplier = settings ? DIFFICULTIES[settings.difficulty].multiplier : 1;
      const finalScore = Math.round(points * difficultyMultiplier);
      setTotalPoints(finalScore);
      setGameStatus('win');
      setIsResultVisible(true);
      submitResult(finalScore, true, fairPlayData);
    },
    onFail: (attempts, fairPlayData) => {
      setGameStatus('lose');
      setIsResultVisible(true);
      submitResult(0, false, fairPlayData);
    },
    onScoreUpdate: (points) => {
      setTotalPoints(prev => prev + points);
    },
    // Sadece oyun aktifken arka plan izle
    isActive: !isSettingsVisible && gameStatus === 'playing',
  });

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
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });

  const submitResult = async (finalScore: number, isWin: boolean, fairPlayData?: any) => {
    try {
      if (!user) return;
      if (isWin && fairPlayData?.isFairPlay !== false) {
        inventoryService.giveWinReward(user.id, 'blind').catch(() => {});
      }
      saveResultMutation.mutate({
        mode: 'blind',
        score: finalScore,
        is_winner: isWin,
        word_length: settings?.length || 5,
        attempts: currentRow + 1,
        category: settings?.category || 'karisik',
        difficulty: settings?.difficulty || 'TAM_KOR',
        duration_seconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        is_fair_play: fairPlayData?.isFairPlay
      });
    } catch (error) {
      console.error('Lexicon: Error submitting blind result:', error);
    }
  };

  const startGame = (category: string, length: number = 5, difficulty: BlindDifficulty = 'TAM_KOR') => {
    const word = getWordByCategory(category, length);
    const newSettings: BlindModeSettings = {
      category,
      length,
      difficulty,
      maxAttempts: 6 // Standardized
    };
    setSettings(newSettings);
    setCurrentWord(word);
    resetPowerUps({ first_letter: { count: getStock('first_letter') }, magnet: { count: getStock('magnet') }, radar: { count: getStock('radar') } });
    resetGameStates(6, word.length);
    setGameStatus('playing');
    setIsSettingsVisible(false);
    setSeenAuraLetters(new Set());
    setStartTime(Date.now());
  };

  const handleRestart = () => {
    setIsResultVisible(false);
    setIsSettingsVisible(true);
    resetPowerUps({ first_letter: { count: getStock('first_letter') }, magnet: { count: getStock('magnet') }, radar: { count: getStock('radar') } });
    setForceShowFeedback(false);
    setIsRadarActive(false);
    setSeenAuraLetters(new Set());
  };

  const handleFirstLetter = () => {
    if (gameStatus === 'playing') {
      addHint(currentWord[0], 'correct');
      setRevealedInfo(`İlk harf '${currentWord[0]}' olarak açıldı!`);
      setTimeout(() => setRevealedInfo(null), 3500);
    }
  };

  const handleMagnet = () => {
    if (gameStatus === 'playing') {
      const wordUpper = toUpperTurkish(currentWord);
      const unknownIndices = wordUpper
        .split('')
        .map((char, i) => ({ char, i }))
        .filter(({ char }) => letterStatuses[char] !== 'correct');

      if (unknownIndices.length > 0) {
        const pick = unknownIndices[Math.floor(Math.random() * unknownIndices.length)];
        addHint(pick.char, 'correct');
        setRevealedInfo(`Mıknatıs '${pick.char}' harfini çekti! ${pick.i + 1}. sırada.`);
        setTimeout(() => setRevealedInfo(null), 4000);
      }
    }
  };

  const handleRadar = () => {
    if (gameStatus === 'playing') {
      setIsRadarActive(true);
      setTimeout(() => setIsRadarActive(false), 3000);
    }
  };

  useEffect(() => {
    if (lastFeedback) {
      feedbackScale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [lastFeedback]);

  const feedbackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedbackScale.value }]
  }));

  const renderFeedback = () => {
    if (!settings || !lastFeedback || (settings.difficulty === 'TAM_KOR' && !forceShowFeedback)) return null;

    return (
      <Animated.View entering={FadeInDown}>
        <Animated.View
          style={[{
            backgroundColor: 'rgba(255,255,255,0.05)',
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(10),
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing.lg
          }, feedbackStyle]}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#4caf50', fontSize: scale(20), fontWeight: '900' }}>{lastFeedback.correctPos}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: scale(8), fontWeight: '700' }}>DOĞRU YER</Text>
          </View>
          {settings.difficulty === 'RENKSIZ' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#ffcc00', fontSize: scale(20), fontWeight: '900' }}>{lastFeedback.correctLetters - lastFeedback.correctPos}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: scale(8), fontWeight: '700' }}>YANLIŞ YER</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <GameLayout backgroundColor={BLIND_BG}>
      <GameHeader
        title="KÖR MOD"
        subtitle={settings ? `${DIFFICULTIES[settings.difficulty].name} • ${DIFFICULTIES[settings.difficulty].multiplier}X` : 'AYARLAR'}
        accentColor={BLIND_ACCENT}
        leftStats={{
          label: 'Deneme',
          value: settings ? `${currentRow + 1}/6` : '0/6',
          color: BLIND_ACCENT,
          glowColor: `${BLIND_ACCENT}66`,
        }}
        rightStats={{
          label: 'Puan',
          value: totalPoints,
          color: '#ffffff',
        }}
        onBack={() => router.back()}
        onSettings={() => {
          setIsSettingsVisible(true);
        }}
        settingsIcon="options-outline"
      />

      {/* NO-OVERLAP GRID AREA */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{
          height: NOTICE_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.lg
        }}>
          {revealedInfo ? (
            <Animated.View
              entering={FadeInDown}
              style={{
                backgroundColor: 'rgba(255, 213, 79, 0.1)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: BLIND_ACCENT,
              }}
            >
              <Text style={{ color: BLIND_ACCENT, fontWeight: '700', fontSize: scale(13), textAlign: 'center' }}>{revealedInfo}</Text>
            </Animated.View>
          ) : renderFeedback()}
        </View>

        <View style={{ alignItems: 'center', marginBottom: spacing.md }} >
          <Grid
            grid={grid}
            currentRow={currentRow}
            currentGuess={currentGuess}
            isBlind={true}
            maxGridWidth={SCREEN_WIDTH - spacing.xl}
          />
        </View>
      </View>

      <PowerUpToolbar configs={powerUpConfigs} />

      <Keyboard
        onKeyPress={(key) => {
          // Aura Detection Feature: Trigger ONLY in TAM_KOR mode, once per game per letter
          if (settings?.difficulty === 'TAM_KOR' && key !== 'ENTER' && key !== '⌫') {
            const upperKey = toUpperTurkish(key);
            const wordUpper = toUpperTurkish(currentWord);

            if (wordUpper.includes(upperKey) && !seenAuraLetters.has(upperKey)) {
              setRevealedInfo(`'${upperKey}' harfi var!`);
              setSeenAuraLetters(prev => new Set(prev).add(upperKey));
              setTimeout(() => setRevealedInfo(null), 1200);
            }
          }
          handleKeyPress(key);
        }}
        letterStatuses={letterStatuses}
        isBlind={true}
      />

      <SettingsModal
        isVisible={isSettingsVisible}
        onClose={() => {
          if (currentWord) setIsSettingsVisible(false);
          else router.back();
        }}
        onStart={startGame}
        mode="blind"
      />

      <ResultModal
        isVisible={isResultVisible}
        status={gameStatus === 'win' ? 'win' : 'lose'}
        word={currentWord}
        guesses={totalPoints}
        mode="blind" 
        category={settings ? DIFFICULTIES[settings.difficulty].name : undefined}
        extraData={currentRow + 1}
        isFairPlay={isFairPlay}
        backgroundStats={backgroundStats}
        onRestart={handleRestart}
        onHome={() => router.replace('/')}
      />
    </GameLayout>
  );
}
