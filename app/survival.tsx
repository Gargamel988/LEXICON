import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import { usePowerUps } from '../hooks/usePowerUps';
import { useResponsive } from '../hooks/useResponsive';
import { useWordGame } from '../hooks/useWordGame';
import { inventoryService } from '../services/inventoryService';
import { statsService } from '../services/statsService';
import { POWER_UP_DEFINITIONS, PowerUpKey } from '../constants/powerUps';
import { getWordByCategory } from '../services/wordService';
import { toUpperTurkish } from '../utils/stringUtils';
import Colors from '../constants/Colors';

const SURVIVAL_ACCENT = Colors.modes.survival.accent;
const SURVIVAL_BG = Colors.modes.survival.background;
const RECOVERY_TARGET = 5;
const DIFFICULTY_MILESTONE = 10;

export default function SurvivalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { getStock } = useInventory(user?.id);
  const { moderateScale } = useResponsive();

  const [gameId, setGameId] = useState(0);
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('karisik');
  const [keyboardLanguage, setKeyboardLanguage] = useState<'TR' | 'EN'>('TR');
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [showmodal, setShowmodal] = useState(false);

  // Survival Specific States
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSessionFairPlay, setIsSessionFairPlay] = useState(true);
  const [sessionBackgroundStats, setSessionBackgroundStats] = useState({ count: 0, totalTime: 0 });
  const resetGameStatesRef = React.useRef<any>(null);
  const setPowerUpStatesRef = React.useRef<any>(null);
  const [activeBuffs, setActiveBuffs] = useState({
    shield: false,
    extraAttempt: false
  });
  const [revealedInfo, setRevealedInfo] = useState<string | null>(null);

  // Timer States
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isGameOver || isSettingsVisible) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isSettingsVisible]);

  // Auto-clear revealed info after 2.5 seconds
  useEffect(() => {
    if (revealedInfo && !isGameOver) {
      const timer = setTimeout(() => {
        setRevealedInfo(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [revealedInfo, isGameOver]);

  // Difficulty Logic: 1-10 -> 4 rows, 11+ -> 3 rows
  const getBaseMaxRows = (count: number) => {
    return count >= DIFFICULTY_MILESTONE ? 3 : 4;
  };

  const currentMaxRows = getBaseMaxRows(solvedCount);

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
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (err) => {
      console.error("[SURVIVAL] Error saving result:", err);
    }
  });

  useEffect(() => {
    const t = setTimeout(() => setShowmodal(true), 100);
    return () => clearTimeout(t);
  }, []);

  const onScoreUpdate = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  // Çift kayıt önlemi — farklı çıkış yollarında (onFail + onBack) tekrar kaydetmeyi engeller
  const hasSavedRef = React.useRef(false);

  // Tüm çıkış senaryolarında (geri tuşu, home, oyun sonu) kaydet
  const saveGameResult = useCallback((isWin: boolean) => {
    if (!user || hasSavedRef.current) return;
    hasSavedRef.current = true;
    if (solvedCount > 0 && isSessionFairPlay) {
      inventoryService.giveWinReward(user.id, 'survival').catch(() => {});
    }
    saveResultMutation.mutate({
      mode: 'survival',
      is_winner: isWin || solvedCount > 0,
      score,
      solved_count: solvedCount,
      duration_seconds: elapsedSeconds,
      category,
      is_fair_play: isSessionFairPlay,
    });
  }, [user, score, solvedCount, elapsedSeconds, category, isSessionFairPlay, saveResultMutation]);

  const onSuccess = useCallback((points: number, fairPlayData: any) => {
    const newSolvedCount = solvedCount + 1;
    setSolvedCount(newSolvedCount);
    setScore(prev => prev + points);

    // Track Fair Play
    if (fairPlayData) {
      if (!fairPlayData.isFairPlay) setIsSessionFairPlay(false);
      setSessionBackgroundStats(prev => ({
        count: prev.count + fairPlayData.backgroundCount,
        totalTime: prev.totalTime + fairPlayData.backgroundTotalTime
      }));
    }

    // Boss Word Reward (+2 life every 10 words)
    if (newSolvedCount % DIFFICULTY_MILESTONE === 0) {
      setLives(l => Math.min(l + 2, 5));
      setRevealedInfo("BOSS YENİLDİ! +2 CAN");
    }
    // Regular Recovery Progress
    else {
      const newProgress = recoveryProgress + 1;
      if (newProgress >= RECOVERY_TARGET) {
        setLives(l => Math.min(l + 1, 5));
        setRecoveryProgress(0);
        setRevealedInfo("CAN DOLDU! +1");
      } else {
        setRecoveryProgress(newProgress);
      }
    }

    // Reset Word Buffs
    setActiveBuffs({ shield: false, extraAttempt: false });

    setTimeout(() => {
      setRevealedInfo(null);
      const randLength = (newSolvedCount + 1) % DIFFICULTY_MILESTONE === 0 ? 7 : 4 + Math.floor(Math.random() * 3);
      const nextWord = getWordByCategory(category, randLength);
      setWord(nextWord);
      resetGameStatesRef.current?.(getBaseMaxRows(newSolvedCount), nextWord.length);
      setGameId(p => p + 1);
    }, 1000);
  }, [solvedCount, category, recoveryProgress, getBaseMaxRows]);

  const onFail = useCallback((attempts: any, fairPlayData: any) => {
    // Track Fair Play
    if (fairPlayData) {
      if (!fairPlayData.isFairPlay) setIsSessionFairPlay(false);
      setSessionBackgroundStats(prev => ({
        count: prev.count + fairPlayData.backgroundCount,
        totalTime: prev.totalTime + fairPlayData.backgroundTotalTime
      }));
    }

    // Check Shield
    if (activeBuffs.shield) {
      setRevealedInfo("KALKAN KORUDU!");
      setActiveBuffs(prev => ({ ...prev, shield: false }));

      setTimeout(() => {
        setRevealedInfo(null);
        const randLength = (solvedCount + 1) % DIFFICULTY_MILESTONE === 0 ? 7 : 4 + Math.floor(Math.random() * 3);
        const nextWord = getWordByCategory(category, randLength);
        setWord(nextWord);
        resetGameStatesRef.current?.(getBaseMaxRows(solvedCount), nextWord.length);
        setGameId(p => p + 1);
      }, 1000);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setActiveBuffs({ shield: false, extraAttempt: false });

    // Show correct word on failure for 3 seconds
    setRevealedInfo(`CEVAP: ${toUpperTurkish(word)}`);

    if (nextLives <= 0) {
      if (user) {
        saveGameResult(false);
      }
      setTimeout(() => {
        setRevealedInfo(null);
        setIsGameOver(true);
      }, 1000);
    } else {
      setTimeout(() => {
        setRevealedInfo(null);
        const randLength = (solvedCount + 1) % DIFFICULTY_MILESTONE === 0 ? 7 : 4 + Math.floor(Math.random() * 3);
        const nextWord = getWordByCategory(category, randLength);
        setWord(nextWord);
        resetGameStatesRef.current?.(getBaseMaxRows(solvedCount), nextWord.length);
        setGameId(p => p + 1);
      }, 1000);
    }
  }, [lives, solvedCount, score, category, user, activeBuffs, word, getBaseMaxRows, saveResultMutation, isSessionFairPlay, elapsedSeconds]);

  const { configs: powerUpConfigs, resetPowerUps, setStates: setPowerUpStates } = usePowerUps(
    ['shield', 'extra', 'risk', 'hint', 'bomb', 'skip'],
    { shield: { count: getStock('shield') }, extra: { count: getStock('extra') }, risk: { count: getStock('risk'), isActive: false }, hint: { count: getStock('hint') }, bomb: { count: getStock('bomb') }, skip: { count: getStock('skip') } },
    (key) => {
      let result: boolean | 'toggle' | void;
      if (key === 'risk') { setIsRiskModeActive(!isRiskModeActive); result = 'toggle'; }
      else if (key === 'shield') {
        if (isGameOver || activeBuffs.shield) return false;
        setActiveBuffs(prev => ({ ...prev, shield: true }));
        setRevealedInfo("Can Kalkanı Aktif!"); result = true;
      } else if (key === 'extra') {
        if (isGameOver || activeBuffs.extraAttempt) return false;
        addExtraAttempt();
        setActiveBuffs(prev => ({ ...prev, extraAttempt: true }));
        setRevealedInfo("+1 Deneme Hakkı!"); result = true;
      } else if (key === 'hint') {
        if (isGameOver) return false;
        getHint();
        if (!word) return false;
        setRevealedInfo(`İpucu: ${toUpperTurkish(word[0])}`); result = true;
      } else if (key === 'bomb') {
        if (isGameOver) return false;
        const s = useBomb();
        if (s === false) return false;
        setRevealedInfo("3 Harf Elendi!"); result = true;
      } else if (key === 'skip') {
        if (isGameOver) return false;
        setRevealedInfo("Kelime Atlandı!");
        setTimeout(() => {
          setRevealedInfo(null);
          const randLength = (solvedCount + 1) % DIFFICULTY_MILESTONE === 0 ? 7 : 4 + Math.floor(Math.random() * 3);
          const nextWord = getWordByCategory(category, randLength);
          setWord(nextWord);
          resetGameStatesRef.current?.(getBaseMaxRows(solvedCount), nextWord.length);
          setGameId(p => p + 1);
        }, 300);
        result = true;
      }
      if (result !== false && result !== undefined && user) {
        inventoryService.usePowerUp(user.id, key as any).catch(() => {});
      }
      return result;
    }
  );

  const handleRiskSuccess = useCallback(() => {
    const rewards: any[] = ['shield', 'extra', 'hint', 'bomb', 'skip'];
    const randomKey = rewards[Math.floor(Math.random() * rewards.length)];
    const label = POWER_UP_DEFINITIONS[randomKey as keyof typeof POWER_UP_DEFINITIONS]?.label || randomKey;

    if (setPowerUpStatesRef.current) {
      setPowerUpStatesRef.current((prev: any) => ({
        ...prev,
        [randomKey]: { ...prev[randomKey], count: (prev[randomKey]?.count || 0) + 1 }
      }));
    }

    setRevealedInfo(`RİSK BAŞARILI! +${label} KAZANDIN!`);
  }, []);

  useEffect(() => {
    setPowerUpStatesRef.current = setPowerUpStates;
  }, [setPowerUpStates]);

  const {
    grid,
    currentRow,
    currentGuess,
    handleKeyPress,
    letterStatuses,
    resetGameStates,
    getHint,
    addExtraAttempt,
    useBomb,
    setIsRiskModeActive,
    isRiskModeActive,
  } = useWordGame({
    word,
    wordLength: word ? word.length : 5,
    maxRows: currentMaxRows,
    onRiskExecuted: () => {
      if (setPowerUpStatesRef.current) {
        setPowerUpStatesRef.current((prev: any) => ({
          ...prev,
          risk: { count: Math.max(0, (prev.risk?.count || 1) - 1), isActive: false }
        }));
      }
    },
    onRiskSuccess: handleRiskSuccess,
    onSuccess,
    onFail,
    onScoreUpdate,
    // Sadece oyun aktifken (settings modal kapalı, oyun bitmemişken) arka plan izle
    isActive: !isSettingsVisible && !isGameOver,
  });

  resetGameStatesRef.current = resetGameStates;

  const startNewGame = (selectedCategory: string, language: 'TR' | 'EN') => {
    hasSavedRef.current = false;  // Yeni oyun için kayıt kilidini sıfırla
    const lengths = [4, 5, 6, 7];
    const randLength = lengths[Math.floor(Math.random() * lengths.length)];
    const newWord = getWordByCategory(selectedCategory, randLength);
    setWord(newWord);
    setCategory(selectedCategory);
    setKeyboardLanguage(language);
    setLives(3);
    setScore(0);
    setSolvedCount(0);
    setIsGameOver(false);
    resetGameStatesRef.current?.(4, newWord.length);
    resetPowerUps({
      shield: { count: getStock('shield') },
      extra: { count: getStock('extra') },
      risk: { count: getStock('risk'), isActive: false },
      hint: { count: getStock('hint') },
      bomb: { count: getStock('bomb') },
      skip: { count: getStock('skip') }
    });
    setGameId(p => p + 1);
    setElapsedSeconds(0);
    setIsSessionFairPlay(true);
    setSessionBackgroundStats({ count: 0, totalTime: 0 });
    setIsSettingsVisible(false);
  };



  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < lives; i++) {
      hearts.push(
        <Ionicons key={i} name="heart" size={moderateScale(20)} color={SURVIVAL_ACCENT} style={{ marginLeft: moderateScale(4) }} />
      );
    }
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', height: moderateScale(30) }}>
        {hearts}
      </View>
    );
  };

  const {
    width: SCREEN_WIDTH,
    spacing,
    verticalScale,
    scale
  } = useResponsive();

  const NOTICE_HEIGHT = verticalScale(50);

  return (
    <GameLayout backgroundColor={SURVIVAL_BG}>
      <GameHeader
        title="CAN MODU"
        subtitle={`${category} • ${formatTime(elapsedSeconds)}`}
        accentColor={SURVIVAL_ACCENT}
        leftStats={{
          label: 'Canlar',
          customValue: renderHearts(),
          color: SURVIVAL_ACCENT,
          glowColor: `${SURVIVAL_ACCENT}66`,
        }}
        rightStats={{
          label: 'Puan',
          value: score,
          color: '#ffffff',
        }}
        onBack={() => {
          // Oyun aktifken geri basılırsa kaydet
          if (!isGameOver && solvedCount > 0 && user) {
            saveGameResult(false);
          }
          router.back();
        }}
        onSettings={() => {
          setIsSettingsVisible(true);
        }}
        settingsIcon="options-outline"
      />

      <View style={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: spacing.md, marginTop: -spacing.md }}>
        {/* TOP STATUS BAR (SOLVED COUNT & BOSS INDICATOR) */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.xs
        }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: scale(10), fontWeight: '800' }}>
              KELİME: <Text style={{ color: SURVIVAL_ACCENT }}>{solvedCount}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {activeBuffs.shield && <Ionicons name="shield-checkmark" size={scale(16)} color="#4fc3f7" />}
            {activeBuffs.extraAttempt && <Ionicons name="add-circle" size={scale(16)} color="#81c784" />}
            {solvedCount % DIFFICULTY_MILESTONE >= 8 && (
              <Animated.View entering={FadeInDown}>
                <Ionicons name="skull" size={scale(16)} color={SURVIVAL_ACCENT} />
              </Animated.View>
            )}
          </View>
        </View>

        {/* STABILIZED NOTICE AREA */}
        <View style={{
          height: NOTICE_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.sm
        }}>
          {revealedInfo ? (
            <Animated.View
              entering={FadeInDown}
              style={{
                backgroundColor: 'rgba(255,59,48,0.1)',
                paddingHorizontal: 20,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: SURVIVAL_ACCENT,
                shadowColor: SURVIVAL_ACCENT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              <Text style={{ color: '#fff', fontSize: scale(11), fontWeight: '800' }}>{revealedInfo}</Text>
            </Animated.View>
          ) : (
            /* RECOVERY PROGRESS BAR (CYBERPUNK STYLE) */
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '50%', height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{
                  width: `${(recoveryProgress / RECOVERY_TARGET) * 100}%`,
                  height: '100%',
                  backgroundColor: SURVIVAL_ACCENT,
                  shadowColor: SURVIVAL_ACCENT,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                }} />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: scale(7), fontWeight: '900', marginTop: 4, letterSpacing: 1 }}>RECOVERY HUD</Text>
            </View>
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <Grid
            key={gameId}
            grid={grid}
            currentRow={currentRow}
            currentGuess={currentGuess}
            maxGridWidth={SCREEN_WIDTH - spacing.xl}
          />
        </View>
      </View>

      <PowerUpToolbar configs={powerUpConfigs} />

      <Keyboard
        onKeyPress={handleKeyPress}
        letterStatuses={letterStatuses}
        language={keyboardLanguage}
      />

      {showmodal && (
        <SettingsModal
          isVisible={isSettingsVisible}
          onClose={() => (word ? setIsSettingsVisible(false) : router.back())}
          onStart={startNewGame}
          mode="survival"
        />
      )}

      <ResultModal
        isVisible={isGameOver}
        status="lose"
        word={word}
        guesses={score}
        mode="survival"
        category={category}
        extraData={solvedCount}
        isFairPlay={isSessionFairPlay}
        backgroundStats={sessionBackgroundStats}
        onRestart={() => {
          setIsGameOver(false);
          setIsSettingsVisible(true);
        }}
        onHome={() => {
          // ResultModal'dan home'a gidilirken de kaydet (zaten onFail kaydetti ama çift kayıt önlemi)
          router.replace('/(tabs)');
        }}
      />
    </GameLayout>
  );
}
