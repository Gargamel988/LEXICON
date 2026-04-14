import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

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

const GAME_TIME = 180;
const BLITZ_ACCENT = '#ff7e79';
const BLITZ_BG = '#121212';
const FEVER_BG = '#440000';

export default function TimedGameScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { wp, moderateScale } = useResponsive();

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

    // NEW BLAST MECHANICS
    const [combo, setCombo] = useState(0);
    const [isFrozen, setIsFrozen] = useState(false);

    const { configs: powerUpConfigs } = usePowerUps(['hint', 'bomb', 'freeze', 'skip', 'lightning'], {
        hint: { count: 2 },
        bomb: { count: 2 },
        freeze: { count: 1 },
        skip: { count: 2 },
        lightning: { count: 1 }
    }, (key) => {
        if (key === 'hint') handleHint();
        if (key === 'bomb') handleBomb();
        if (key === 'freeze') handleFreeze();
        if (key === 'skip') handleSkip();
        if (key === 'lightning') handleLightning();
    });

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
                is_winner: solvedCountRef.current > 0,
                score: scoreRef.current,
                attempts: solvedCountRef.current,
                duration_seconds: GAME_TIME,
                category: selectedCategoryRef.current,
            });
        }
    }, [isGameOver, user]);

    const { grid, currentRow, currentGuess, handleKeyPress, letterStatuses, resetGameStates: gameReset, getHint, useBomb, setGrid } = useWordGame({
        word: currentWord,
        wordLength: currentWord ? currentWord.length : 5,
        maxRows: 6,
        onScoreUpdate: (points) => {
            const multiplier = 1 + (combo * 0.2);
            setScore(prev => prev + Math.round(points * multiplier));
        },
        onSuccess: (points) => {
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
        onFail: () => {
            setCombo(0);
            feverValue.value = withTiming(0, { duration: 500 });
            setScore(prev => Math.max(0, prev - 25));
            setRevealedWord(currentWord);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => {
                setRevealedWord(null);
                startNextWord();
            }, 1000);
        },
    });

    const handleHint = () => {
        if (isReady && !isGameOver) {
            getHint();
        }
    };

    const handleBomb = () => {
        if (isReady && !isGameOver) {
            useBomb();
        }
    };

    const handleFreeze = () => {
        if (isReady && !isGameOver && !isFrozen) {
            setIsFrozen(true);
            setTimeout(() => setIsFrozen(false), 5000);
        }
    };

    const handleSkip = () => {
        if (isReady && !isGameOver) {
            setCombo(0);
            feverValue.value = withTiming(0);
            startNextWord();
        }
    };

    const handleLightning = () => {
        if (isReady && !isGameOver && currentWord) {
            setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                const cells = [...newGrid[0].cells];
                cells[0] = { char: currentWord[0], status: 'correct' };
                cells[currentWord.length - 1] = { char: currentWord[currentWord.length - 1], status: 'correct' };
                newGrid[0] = { ...newGrid[0], cells };
                return newGrid;
            });
        }
    };

    // Local configs moved to usePowerUps

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stats', user?.id] });
        },
    });

    const handleStartGame = (category: string) => {
        setSelectedCategory(category);
        setIsReady(true);
        startNextWord(category);
        startTimer();
    };

    const resetTimedGame = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);
        timerProgress.value = 1;
        setTimeLeft(GAME_TIME);
        setScore(0);
        setSolvedCount(0);
        setCombo(0);
        feverValue.value = 0;
        setIsGameOver(false);
        setIsReady(false);
        // Resetting state via setCounts or reset if usePowerUps supported it
        // Since usePowerUps is a hook with internal state, we should probably add a reset mechanism there if needed
        // but for now we'll assumes the component unmounts or we can manually reset counts if we expose a setter.
        // Actually, survival.tsx refactor already happened, let's see how it handled reset.
    };

    const animatedBgStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            feverValue.value,
            [0, 1],
            [BLITZ_BG, FEVER_BG]
        )
    }));

    const timerStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%`,
        backgroundColor: isFrozen ? '#4FC3F7' : (timeLeft < 10 ? '#ff4d4d' : BLITZ_ACCENT)
    }));

    const comboIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ scale: comboScale.value }],
        opacity: comboScale.value > 0 ? 1 : 0
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
                {/* Combo Indicator */}



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
                onRestart={resetTimedGame}
                onHome={() => router.replace('/')}
                mode="timed"
            />
        </GameLayout>
    );
}



