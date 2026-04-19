import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { Easing, FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import GameHeader from '../components/Game/GameHeader';
import PowerUpToolbar from '../components/Game/PowerUpToolbar';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import SettingsModal from '../components/modal/SettingsModal';
import { useAuth } from '../hooks/useAuth';
import { usePowerUps } from '../hooks/usePowerUps';
import { useResponsive } from '../hooks/useResponsive';
import { useWordGame } from '../hooks/useWordGame';
import { statsService } from '../services/statsService';
import { getWordByCategory } from '../services/wordService';
import Colors from '../constants/Colors';

const GAME_TIME = 180;
const BLITZ_ACCENT = Colors.modes.blitz.accent;
const BLITZ_BG = Colors.modes.blitz.background;
const FEVER_BG = '#440000';

export default function TimedGameScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { wp, moderateScale } = useResponsive();
    const setPowerUpStatesRef = useRef<any>(null);

    const [isReady, setIsReady] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('karisik');

    const [gameId, setGameId] = useState(0);
    const [score, setScore] = useState(0);
    const [solvedCount, setSolvedCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [currentCategory, setCurrentCategory] = useState('');
    const [revealedWord, setRevealedWord] = useState<string | null>(null);
    const [isSessionFairPlay, setIsSessionFairPlay] = useState(true);
    const [sessionBackgroundStats, setSessionBackgroundStats] = useState({ count: 0, totalTime: 0 });

    // NEW BLAST MECHANICS
    const [combo, setCombo] = useState(0);
    const [isFrozen, setIsFrozen] = useState(false);

    const { configs: powerUpConfigs, setStates: setPowerUpStates, resetPowerUps } = usePowerUps(['hint', 'bomb', 'freeze', 'skip', 'lightning', 'risk'], {
        hint: { count: 3 },
        bomb: { count: 2 },
        freeze: { count: 2 },
        skip: { count: 3 },
        lightning: { count: 2 },
        risk: { count: 1, isActive: false }
    }, (key) => {
        if (key === 'hint') return handleHint();
        if (key === 'bomb') return handleBomb();
        if (key === 'freeze') return handleFreeze();
        if (key === 'skip') return handleSkip();
        if (key === 'lightning') return handleLightning();
        if (key === 'risk') {
            setIsRiskModeActive(!isRiskModeActive);
            return 'toggle';
        }
    });

    useEffect(() => {
        setPowerUpStatesRef.current = setPowerUpStates;
    }, [setPowerUpStates]);

    const comboScale = useSharedValue(0);
    const feverValue = useSharedValue(0); // 0 to 1
    const timerProgress = useSharedValue(1);
    const timerInterval = useRef<any>(null);
    const isFrozenRef = useRef(false);

    const scoreRef = useRef(0);
    const solvedCountRef = useRef(0);
    const selectedCategoryRef = useRef(selectedCategory);

    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { solvedCountRef.current = solvedCount; }, [solvedCount]);
    useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);
    useEffect(() => { isFrozenRef.current = isFrozen; }, [isFrozen]);

    const startNextWord = useCallback((overrideCategory?: string) => {
        const cat = overrideCategory || selectedCategoryRef.current;
        const targetLength = Math.floor(Math.random() * 4) + 4;
        const word = getWordByCategory(cat === 'karisik' ? 'karisik' : cat, targetLength);
        const newWord = word.toUpperCase();

        setCurrentWord(newWord);
        setCurrentCategory(cat === 'karisik' ? 'Karışık' : cat);
        gameReset(6, newWord.length);
        setGameId(prev => prev + 1);
    }, []);

    const handleGameOver = useCallback(async () => {
        if (isGameOver) return;
        setIsGameOver(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        if (user) {
            saveResultMutation.mutate({
                mode: 'blitz',
                score: scoreRef.current,
                solved_count: solvedCountRef.current,
                is_winner: true,
                duration_seconds: GAME_TIME,
                category: selectedCategoryRef.current,
                is_fair_play: isSessionFairPlay
            });
        }
    }, [isGameOver, user]);

    const { grid, currentRow, currentGuess, handleKeyPress, letterStatuses, resetGameStates: gameReset, getHint, useBomb, setGrid, useLightning, isRiskModeActive, setIsRiskModeActive } = useWordGame({
        word: currentWord,
        wordLength: currentWord ? currentWord.length : 5,
        maxRows: 6,
        onRiskExecuted: () => {
            if (setPowerUpStatesRef.current) {
                setPowerUpStatesRef.current((prev: any) => ({
                    ...prev,
                    risk: { count: Math.max(0, (prev.risk?.count || 1) - 1), isActive: false }
                }));
            }
        },
        onScoreUpdate: (points) => {
            const multiplier = 1 + (combo * 0.2);
            setScore(prev => prev + Math.round(points * multiplier));
        },
        onSuccess: (points, attempts, fairPlayData) => {
            // Track Fair Play
            if (fairPlayData) {
                if (!fairPlayData.isFairPlay) setIsSessionFairPlay(false);
                setSessionBackgroundStats(prev => ({
                    count: prev.count + fairPlayData.backgroundCount,
                    totalTime: prev.totalTime + fairPlayData.backgroundTotalTime
                }));
            }

            const multiplier = 1 + (combo * 0.2);
            const speedBonus = Math.floor((timeLeft / GAME_TIME) * 50);
            const totalBonus = Math.round((points + speedBonus) * multiplier);

            setScore(prev => prev + totalBonus);
            setSolvedCount(prev => prev + 1);

            // Combo Logic
            const newCombo = combo + 1;
            setCombo(newCombo);

            // Visual feedback
            comboScale.value = withSequence(
                withSpring(1.5, { damping: 2, stiffness: 80 }),
                withDelay(500, withSpring(0))
            );

            // Fever background shift
            feverValue.value = withTiming(Math.min(newCombo / 10, 1), { duration: 1000 });

            // 3-Row Bonus (+10s)
            if (newCombo > 0 && newCombo % 3 === 0) {
                setTimeLeft(prev => prev + 10);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            setTimeout(() => startNextWord(), 600);
        },
        onFail: (attempts, fairPlayData) => {
            // Track Fair Play
            if (fairPlayData) {
                if (!fairPlayData.isFairPlay) setIsSessionFairPlay(false);
                setSessionBackgroundStats(prev => ({
                    count: prev.count + fairPlayData.backgroundCount,
                    totalTime: prev.totalTime + fairPlayData.backgroundTotalTime
                }));
            }

            setCombo(0);
            feverValue.value = withTiming(0, { duration: 500 });
            setScore(prev => Math.max(0, prev - 25));
            setRevealedWord(currentWord);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => {
                setRevealedWord(null);
                startNextWord();
            }, 1500);
        },
    });

    const handleHint = () => {
        if (isReady && !isGameOver) {
            const success = getHint();
            return success;
        }
        return false;
    };

    const handleBomb = () => {
        if (isReady && !isGameOver) {
            const success = useBomb();
            return success;
        }
        return false;
    };

    const handleFreeze = () => {
        if (isReady && !isGameOver && !isFrozen) {
            setIsFrozen(true);
            setTimeout(() => setIsFrozen(false), 5000);
            return true;
        }
        return false;
    };

    const handleSkip = () => {
        if (isReady && !isGameOver) {
            setCombo(0);
            feverValue.value = withTiming(0);
            startNextWord();
            return true;
        }
        return false;
    };

    const handleLightning = () => {
        if (isReady && !isGameOver && currentWord) {
            return useLightning();
        }
        return false;
    };

    const startTimer = () => {
        timerInterval.current = setInterval(() => {
            if (isFrozenRef.current) return; // Don't tick while frozen

            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerInterval.current) clearInterval(timerInterval.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        timerProgress.value = 1;
        timerProgress.value = withTiming(0, { duration: (timeLeft || GAME_TIME) * 1000, easing: Easing.linear });
    };

    useEffect(() => {
        if (timeLeft === 0 && isReady && !isGameOver) {
            handleGameOver();
        }
    }, [timeLeft, isReady, isGameOver, handleGameOver]);

    useEffect(() => {
        return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
    }, []);

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
        },
    });

    const handleStartGame = (category: string) => {
        setSelectedCategory(category);
        setIsReady(true);
        startNextWord(category);
        resetPowerUps({ hint: { count: 3 }, bomb: { count: 2 }, freeze: { count: 2 }, skip: { count: 2 }, lightning: { count: 2 }, risk: { count: 2 } });
        startTimer();
    };

    const resetTimedGame = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);
        timerProgress.value = 1;
        setTimeLeft(GAME_TIME);
        resetPowerUps({ hint: { count: 3 }, bomb: { count: 2 }, freeze: { count: 2 }, skip: { count: 2 }, lightning: { count: 2 }, risk: { count: 2 } });

        setScore(0);
        setSolvedCount(0);
        setCombo(0);
        feverValue.value = 0;
        setIsGameOver(false);
        setIsReady(false);
        setIsSessionFairPlay(true);
        setSessionBackgroundStats({ count: 0, totalTime: 0 });
    };


    const timerStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
        backgroundColor: isFrozen ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : BLITZ_ACCENT)
    }));




    return (
        <GameLayout backgroundColor="transparent">
            <GameHeader
                title="BLİTZ"
                subtitle={currentWord ? `${currentWord.length} Harf • ${currentCategory.toUpperCase()}` : "Hazırlanıyor..."}
                accentColor={BLITZ_ACCENT}
                leftStats={{
                    label: 'Süre',
                    value: `${timeLeft}s`,
                    color: isFrozen ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : BLITZ_ACCENT),
                    glowColor: `${isFrozen ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : BLITZ_ACCENT)}66`,
                }}
                rightStats={{
                    label: combo > 1 ? `🔥 x${(1 + combo * 0.2).toFixed(1)}` : 'Skor',
                    value: score,
                    color: combo > 1 ? '#ffcc00' : '#ffffff'
                }}
                onBack={() => router.back()}
                onSettings={() => {
                    resetTimedGame();
                }}
                settingsIcon="flash-sharp"
            />

            <View style={{ paddingHorizontal: wp(6), marginBottom: 12 }}>
                <View style={{
                    height: 6,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}>
                    <Animated.View style={[{ height: '100%', borderRadius: 3, }, timerStyle]} />
                </View>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {revealedWord && (
                    <Animated.View
                        entering={FadeInDown.duration(600).springify().damping(12)}
                        exiting={FadeOutUp.duration(400)}
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            paddingHorizontal: 32,
                            paddingVertical: 16,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: BLITZ_ACCENT,
                            shadowColor: BLITZ_ACCENT,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                    >
                        <Animated.Text style={{
                            color: '#fff',
                            fontSize: 36,
                            fontWeight: '900',
                            letterSpacing: 6,
                            textTransform: 'uppercase',
                        }}>
                            {revealedWord}
                        </Animated.Text>
                    </Animated.View>
                )}
                <Grid key={gameId} grid={grid} currentRow={currentRow} currentGuess={currentGuess} />
            </View>

            <PowerUpToolbar configs={powerUpConfigs} />

            <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />

            <SettingsModal
                isVisible={!isReady}
                onClose={() => router.back()}
                onStart={handleStartGame}
                mode="blitz"
            />

            <ResultModal
                isVisible={isGameOver}
                status={solvedCount > 0 ? "win" : "lose"}
                word={currentWord}
                guesses={score}
                extraData={solvedCount}
                isFairPlay={isSessionFairPlay}
                backgroundStats={sessionBackgroundStats}
                onRestart={resetTimedGame}
                onHome={() => router.replace('/')}
                mode="timed"
            />
        </GameLayout>
    );
}
