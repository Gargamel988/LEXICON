import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import GameHeader from '@/components/Game/GameHeader';
import PowerUpToolbar from '@/components/Game/PowerUpToolbar';
import Grid from '@/components/Grid/Grid';
import Keyboard from '@/components/Keyboard/Keyboard';
import GameLayout from '@/components/Layout/GameLayout';
import ResultModal from '@/components/modal/ResultModal';
import SettingsModal from '@/components/modal/SettingsModal';
import { useAuth } from '@/hooks/useAuth';
import { useInventory } from '@/hooks/useInventory';
import { usePowerUps } from '@/hooks/usePowerUps';
import { useResponsive } from '@/hooks/useResponsive';
import { useWordGame } from '@/hooks/useWordGame';
import { inventoryService } from '@/services/inventoryService';
import { statsService } from '@/services/statsService';
import { getWordByCategory } from '@/services/wordService';
import { FadeInDown } from 'react-native-reanimated';
import Colors from '../constants/Colors';


const CLIMB_ACCENT = Colors.modes.climb.accent;
const CLIMB_BG = Colors.modes.climb.background;

const getRoundConfig = (round: number) => {
    const cycle = Math.floor((round - 1) / 12) + 1;
    const index = (round - 1) % 12 + 1;

    // Base configuration sequence for Cycle 1
    const config = [
        { L: 4, T: 60, A: 6 }, // 1
        { L: 4, T: 50, A: 5 }, // 2
        { L: 5, T: 60, A: 6 }, // 3
        { L: 5, T: 50, A: 5 }, // 4
        { L: 5, T: 40, A: 4 }, // 5
        { L: 6, T: 60, A: 6 }, // 6
        { L: 6, T: 50, A: 5 }, // 7
        { L: 6, T: 40, A: 4 }, // 8
        { L: 7, T: 60, A: 6 }, // 9
        { L: 7, T: 50, A: 5 }, // 10
        { L: 7, T: 40, A: 4 }, // 11
        { L: 7, T: 30, A: 3 }, // 12
    ];

    const current = config[index - 1];

    // After Round 12, lock T and A to hardest levels
    const T = round > 12 ? 30 : current.T;
    const A = round > 12 ? 3 : current.A;

    return {
        wordLength: current.L,
        timeLimit: T,
        maxAttempts: A,
        multiplier: cycle
    };
};

export default function ClimbGameScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { getStock } = useInventory(user?.id);
    const { wp } = useResponsive();

    const [isReady, setIsReady] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('karisik');

    const [gameId, setGameId] = useState(0);
    const [score, setScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [currentCategory, setCurrentCategory] = useState('');
    const [revealedWord, setRevealedWord] = useState<string | null>(null);
    const [noticeContent, setNoticeContent] = useState<string | null>(null);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [totalStartTime, setTotalStartTime] = useState<number | null>(null);
    const [isSessionFairPlay, setIsSessionFairPlay] = useState(true);
    const [sessionBackgroundStats, setSessionBackgroundStats] = useState({ count: 0, totalTime: 0 });

    const { configs: powerUpConfigs, resetPowerUps } = usePowerUps(['time', 'hint', 'freeze', 'extra', 'skip'], {
        time: { count: getStock('time') }, hint: { count: getStock('hint') }, freeze: { count: getStock('freeze') }, extra: { count: getStock('extra') }, skip: { count: getStock('skip') }
    }, (key) => {
        let result: boolean | undefined = undefined;
        if (key === 'time') result = handleAddTime();
        else if (key === 'hint') result = handleHint();
        else if (key === 'freeze') result = handleFreeze();
        else if (key === 'extra') result = handleExtraAttempt();
        else if (key === 'skip') result = handleSkip();
        if (result !== false && result !== undefined && user) {
            inventoryService.usePowerUp(user.id, key as any).catch(() => { });
        }
        return result;
    });

    const timerProgress = useSharedValue(1);
    const timerInterval = useRef<any>(null);
    const isTimerPausedRef = useRef(false);

    const lastWordRef = useRef('');
    const scoreRef = useRef(0);
    const currentRoundRef = useRef(1);
    const selectedCategoryRef = useRef(selectedCategory);

    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
    useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);

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
        onError: (err) => {
            console.error("[CLIMB] Error saving result:", err);
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Oyun sonucu kaydedilemedi.'
            });
        }
    });

    const startNextWord = useCallback((overrideCategory?: string, nextRound?: number) => {
        const cat = overrideCategory || selectedCategoryRef.current;
        const targetRound = nextRound || currentRoundRef.current;
        const config = getRoundConfig(targetRound);

        let word = getWordByCategory(cat === 'karisik' ? 'karisik' : cat, config.wordLength).toUpperCase();

        // Prevent back-to-back duplicate words
        if (word === lastWordRef.current) {
            word = getWordByCategory(cat === 'karisik' ? 'karisik' : cat, config.wordLength).toUpperCase();
        }

        lastWordRef.current = word;
        setCurrentWord(word);
        setCurrentCategory(cat === 'karisik' ? 'Karışık' : cat);
        gameReset(config.maxAttempts, word.length);
        setGameId(prev => prev + 1);
        setIsTimerPaused(false);
        isTimerPausedRef.current = false;
        setNoticeContent(null);
    }, []);

    const handleGameOver = useCallback(async () => {
        if (isGameOver) return;
        setIsGameOver(true);
        if (timerInterval.current) clearInterval(timerInterval.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        if (user) {
            // Elmas ödülü — en az 1 tur geçildiyse
            if (currentRoundRef.current > 1 && isSessionFairPlay) {
                inventoryService.giveWinReward(user.id, 'climb').catch(() => { });
            }
            saveResultMutation.mutate({
                mode: 'climb',
                is_winner: false,
                score: scoreRef.current,
                attempts: currentRoundRef.current,
                duration_seconds: totalStartTime ? Math.floor((Date.now() - totalStartTime) / 1000) : 0,
                category: selectedCategoryRef.current,
                is_fair_play: isSessionFairPlay
            });
        }
    }, [isGameOver, user]);

    const {
        grid,
        currentRow,
        currentGuess,
        handleKeyPress,
        letterStatuses,
        resetGameStates: gameReset,
        getHint,
        addExtraAttempt
    } = useWordGame({
        word: currentWord,
        wordLength: currentWord ? currentWord.length : 5,
        maxRows: 6,
        onScoreUpdate: (points) => {
            setScore(prev => prev + points);
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

            const config = getRoundConfig(currentRoundRef.current);

            const timeBonus = timeLeft * config.multiplier;
            const savedAttempts = (config.maxAttempts - (currentRow + 1));
            const attemptBonus = savedAttempts * 10 * config.multiplier;
            const totalBonus = points + timeBonus + attemptBonus;

            setScore(prev => prev + totalBonus);

            const nextRound = currentRoundRef.current + 1;
            setCurrentRound(nextRound);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (timerInterval.current) clearInterval(timerInterval.current);

            setTimeout(() => {
                const nextConfig = getRoundConfig(nextRound);
                startNextWord(undefined, nextRound);
                startTimer(nextConfig.timeLimit);
            }, 600);
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

            if (timerInterval.current) clearInterval(timerInterval.current);
            setRevealedWord(currentWord);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => {
                setRevealedWord(null);
                handleGameOver();
            }, 800); // Shorter delay for better flow
        },
        // Sadece oyun başladıktan sonra arka plan izle
        isActive: isReady && !isGameOver,
    });

    const handleStartGame = (category: string) => {
        setSelectedCategory(category);
        setIsReady(true);
        setCurrentRound(1);
        resetPowerUps({ time: { count: getStock('time') }, hint: { count: getStock('hint') }, freeze: { count: getStock('freeze') }, extra: { count: getStock('extra') }, skip: { count: getStock('skip') } });
        const config = getRoundConfig(1);
        startNextWord(category, 1);
        startTimer(config.timeLimit);
        setTotalStartTime(Date.now());
    };

    const startTimer = (limitSeconds: number) => {
        if (timerInterval.current) clearInterval(timerInterval.current);
        setTimeLeft(limitSeconds);
        timerProgress.value = 1;

        timerInterval.current = setInterval(() => {
            if (isTimerPausedRef.current) return; // Freeze logic using ref to bypass closure

            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerInterval.current) clearInterval(timerInterval.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timerProgress.value = withTiming(0, { duration: limitSeconds * 1000, easing: Easing.linear });
    };

    useEffect(() => {
        if (timeLeft === 0 && !isGameOver && isReady) {
            handleGameOver();
        }
    }, [timeLeft, isGameOver, isReady]);

    const resetTimedGame = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);
        timerProgress.value = 1;
        setTimeLeft(60);
        setScore(0);
        setCurrentRound(1);
        setIsGameOver(false);
        resetPowerUps({ time: { count: getStock('time') }, hint: { count: getStock('hint') }, freeze: { count: getStock('freeze') }, extra: { count: getStock('extra') }, skip: { count: getStock('skip') } });
        setIsReady(false);
        setIsTimerPaused(false);
        isTimerPausedRef.current = false;
        setNoticeContent(null);
        setIsSessionFairPlay(true);
        setSessionBackgroundStats({ count: 0, totalTime: 0 });
    };

    // Power-up Handlers
    const handleAddTime = () => {
        setTimeLeft(prev => prev + 10);
        setNoticeContent("+10 SANİYE!");

        // Restart animation with new duration
        const newDuration = (timeLeft + 10) * 1000;
        timerProgress.value = withTiming(0, { duration: newDuration, easing: Easing.linear });

        setTimeout(() => setNoticeContent(null), 2000);
        return true;
    };

    const handleHint = () => {
        const success = getHint();
        if (success === false) return false;
        setNoticeContent("İPUCU VERİLDİ!");
        setTimeout(() => setNoticeContent(null), 2000);
        return true;
    };

    const handleFreeze = () => {
        if (isReady && !isGameOver && !isTimerPausedRef.current) {
            setIsTimerPaused(true);
            isTimerPausedRef.current = true;
            setNoticeContent("ZAMAN DONDURULDU! (5s)");

            // Pause animation
            const currentVal = timerProgress.value;
            timerProgress.value = currentVal;

            setTimeout(() => {
                setIsTimerPaused(false);
                isTimerPausedRef.current = false;
                setNoticeContent(null);
                // Resume animation with remaining time
                timerProgress.value = withTiming(0, {
                    duration: timeLeft * 1000,
                    easing: Easing.linear
                });
            }, 5000);

            return true;
        }
        return false;
    };

    const handleExtraAttempt = () => {
        addExtraAttempt();
        setNoticeContent("+1 DENEME HAKKI!");
        setTimeout(() => setNoticeContent(null), 2000);
        return true;
    };

    const handleSkip = () => {
        setNoticeContent("TUR ATLANDI!");

        if (timerInterval.current) clearInterval(timerInterval.current);

        setTimeout(() => {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            const nextConfig = getRoundConfig(nextRound);
            startNextWord(undefined, nextRound);
            startTimer(nextConfig.timeLimit);
        }, 500);
        return true;
    };

    // Local configs moved to usePowerUps

    const progressStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
    }));

    if (!isReady) {
        return (
            <View style={{ flex: 1, backgroundColor: CLIMB_BG }}>
                <SettingsModal
                    isVisible={!isReady}
                    onClose={() => router.back()}
                    onStart={handleStartGame}
                    mode="climb"
                />
            </View>
        );
    }

    return (
        <GameLayout backgroundColor={CLIMB_BG}>
            <GameHeader
                title="TIRMANIŞ"
                subtitle={`Tur ${currentRound} • ${currentWord.length} Harf`}
                accentColor={CLIMB_ACCENT}
                leftStats={{
                    label: 'Süre',
                    value: `${timeLeft}s`,
                    color: isTimerPaused ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : CLIMB_ACCENT),
                    glowColor: `${isTimerPaused ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : CLIMB_ACCENT)}66`,
                }}
                rightStats={{ label: 'Skor', value: score, color: '#ffffff' }}
                onBack={() => router.back()}
                onSettings={() => {
                    resetTimedGame();
                }}
                settingsIcon="refresh-sharp"
            />

            <View style={{ paddingHorizontal: wp(6), marginBottom: 16 }}>
                <View style={{
                    height: 6,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}>
                    <Animated.View style={[
                        {
                            height: '100%',
                            borderRadius: 3,
                            backgroundColor: isTimerPaused ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : CLIMB_ACCENT),
                        },
                        progressStyle
                    ]} />
                </View>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Notice Area */}
                <View style={{ height: 40, justifyContent: 'center' }}>
                    {noticeContent && (
                        <Animated.View entering={FadeInDown} style={{
                            backgroundColor: 'rgba(255, 152, 0, 0.15)',
                            paddingHorizontal: 20,
                            paddingVertical: 4,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: CLIMB_ACCENT,
                            shadowColor: CLIMB_ACCENT,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 5,
                        }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>{noticeContent}</Text>
                        </Animated.View>
                    )}
                </View>

                <Grid
                    key={gameId}
                    grid={grid}
                    currentRow={currentRow}
                    currentGuess={currentGuess}
                />
            </View>

            <PowerUpToolbar configs={powerUpConfigs} />

            {revealedWord && (
                <View style={{
                    position: 'absolute',
                    top: '45%',
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 100
                }}>
                    <View style={{
                        backgroundColor: '#ff4d4d',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 15,
                        elevation: 5
                    }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 2 }}>{revealedWord}</Text>
                    </View>
                </View>
            )}

            <Keyboard
                onKeyPress={handleKeyPress}
                letterStatuses={letterStatuses}
            />

            <ResultModal
                isVisible={isGameOver}
                status="lose"
                word={currentWord}
                guesses={score}
                category={selectedCategory}
                extraData={currentRound}
                isFairPlay={isSessionFairPlay}
                backgroundStats={sessionBackgroundStats}
                onRecoverLife={() => {
                    setIsGameOver(false);
                    startTimer(15); // Ek süre vererek devam et
                }}
                onRestart={resetTimedGame}
                onHome={() => router.replace('/')}
                mode="climb"
            />
        </GameLayout>
    );
}
