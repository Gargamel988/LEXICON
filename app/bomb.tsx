import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { createAnimatedComponent, interpolate, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';

import { RoomPlayer } from '@/types';
import { AvatarWithFrame } from "../components/Cosmetics/AvatarWithFrame";
import ResultModal from '../components/modal/ResultModal';
import { useAuth } from '../hooks/useAuth';
import { useBombGame } from '../hooks/useBombGame';

const { width } = Dimensions.get('window');
const AnimatedLottieBase = createAnimatedComponent(LottieView as any);
type AnimatedLottieViewProps = ComponentProps<typeof LottieView> & { animatedProps?: Partial<ComponentProps<typeof LottieView>> };
const AnimatedLottieView = AnimatedLottieBase as React.ComponentType<AnimatedLottieViewProps>;

interface PlayerAvatarProps {
  player: RoomPlayer;
  index: number;
  total: number;
  isHolder: boolean;
}

export default function BombGameScreen() {
  const { id: roomCode } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState('');

  const {
    room,
    players,
    timeLeft,
    isExploded,
    submitWord,
    errorVisible,
    errorMessage,
    isSubmitting,
    isMyTurn,
    isEliminated,
    returnToLobby,
    leaveRoom,
  } = useBombGame(roomCode);

  // DEBUG LOGS
  useEffect(() => {
    console.log("[BOMB STATUS]", {
      isRoomLoaded: !!room,
      isUserLoaded: !!user,
      roomStatus: room?.status,
      bombHolder: room?.bomb_holder_id,
      myUserId: user?.id,
      isMyTurn: isMyTurn,
      playerCount: players.length
    });
  }, [room?.bomb_holder_id, user?.id, isMyTurn, room?.status, players.length]);

  const lottieRef = useRef<any>(null);
  const bombScale = useSharedValue(1);
  const bombShake = useSharedValue(0);
  const inputShake = useSharedValue(0);
  const inputFlash = useSharedValue(0);
  const flamePulse = useSharedValue(1);
  // timeLeftShared: worklet içinde reaktif kullanım için
  const timeLeftShared = useSharedValue<number>(30);

  useEffect(() => {
    flamePulse.value = withRepeat(withTiming(1.3, { duration: 500 }), -1, true);
  }, []);

  // timeLeft değiştiğinde shared value'yu güncelle
  useEffect(() => {
    timeLeftShared.value = timeLeft ?? 30;
  }, [timeLeft]);

  // Patlama anında animasyonun 164-200 arasını normal hızda oynat
  useEffect(() => {
    if (isExploded && lottieRef.current) {
      lottieRef.current.play(164, 200);
    }
  }, [isExploded]);

  // Sadece fuse kısmı (frame 0-164) → 30 saniyeye map edilir
  const animatedLottieProps = useAnimatedProps(() => {
    if (isExploded) {
      // Patlama başladı, ref.play() hallediyor — progress kontrolünü bırak
      return { progress: 164 / 200 } as any;
    }
    const totalDuration = 30000;
    const explosionStartFrame = 164;
    const totalFrames = 200;
    const currentRemaining = timeLeftShared.value;
    const elapsed = Math.max(0, totalDuration - currentRemaining * 1000);
    const progress = Math.min(1, elapsed / totalDuration);
    return {
      progress: progress * (explosionStartFrame / totalFrames),
    } as any;
  });

  const handleSubmit = async () => {
    if (!input.trim() || !isMyTurn || isSubmitting) return;
    const success = await submitWord(input);
    if (success) {
      setInput('');
      inputFlash.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 400 }));
    } else {
      inputShake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(0, { duration: 50 }));
    }
  };

  const animatedBombStyle = useAnimatedStyle(() => ({ transform: [{ translateX: bombShake.value }, { scale: bombScale.value }] }));
  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inputShake.value }],
    borderColor: inputFlash.value > 0 ? '#4CAF50' : 'rgba(255,255,255,0.2)',
    backgroundColor: inputFlash.value > 0 ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255,255,255,0.05)',
  }));
  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flamePulse.value }],
    opacity: interpolate(flamePulse.value, [1, 1.3], [0.7, 1])
  }));

  const dangerPulse = useSharedValue(0);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 5) {
      const duration = timeLeft <= 3 ? 300 : 600;
      dangerPulse.value = withRepeat(withTiming(1, { duration }), -1, true);
    } else {
      dangerPulse.value = withTiming(0, { duration: 300 });
    }
  }, [timeLeft]);

  const animatedDangerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      dangerPulse.value,
      [0, 1],
      [0, timeLeftShared.value <= 3 ? 0.45 : 0.25]
    ),
  }));


  const PlayerAvatar = React.memo(({ player, isHolder }: { player: RoomPlayer; isHolder: boolean }) => {
    const scale = useSharedValue(1);
    useEffect(() => { scale.value = withTiming(isHolder ? 1.2 : 1, { duration: 300 }); }, [isHolder]);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], zIndex: isHolder ? 10 : 1 }));

    return (
      <Animated.View style={[{ marginHorizontal: 10 }, animatedStyle]}>
        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 54, height: 54, borderRadius: 27,
            borderWidth: isHolder ? 3 : 1.5,
            borderColor: isHolder ? '#FFD54F' : 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center', alignItems: 'center',
            opacity: player.is_eliminated ? 0.3 : 1,
            shadowColor: isHolder ? '#FFD54F' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}>
            <AvatarWithFrame avatarUrl={player.avatar_url} username={player.username} frameId={player.active_frame || ""} size={44} />
            {isHolder && (
              <Animated.View style={[{ position: 'absolute', top: -15 }, animatedFlameStyle]}>
                <Ionicons name="flame" size={24} color="#FF5722" />
              </Animated.View>
            )}
            <View style={{ position: 'absolute', bottom: -10, flexDirection: 'row', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i < (player.lives || 0) ? "#FF5252" : "rgba(255,255,255,0.15)" }} />
              ))}
            </View>
          </View>
          <Text numberOfLines={1} style={{ color: isHolder ? '#FFD54F' : '#FFF', fontSize: 10, fontWeight: '800', marginTop: 12, maxWidth: 65, textAlign: 'center' }}>{player.username}</Text>
        </View>
      </Animated.View>
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1a1a1a', '#050505']} style={{ flex: 1 }}>
        {/* Red Danger Glow Layer */}
        {timeLeft !== null && timeLeft <= 5 && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: '#FF5252' },
              animatedDangerStyle
            ]}
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Top Bar & Players */}
          <View style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => leaveRoom()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={{ backgroundColor: 'rgba(255,213,79,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,213,79,0.2)' }}>
                <Text style={{ color: '#FFD54F', fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>BOMBA OYUNU</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            {/* Players List - Horizontal at Top */}
            <View style={{ height: 100 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
              >
                {players.map((player) => (
                  <PlayerAvatar key={player.id} player={player} isHolder={player.user_id === room?.bomb_holder_id} />
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Main Game Content */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
            scrollEnabled={false}
          >
            {/* 1. Syllable */}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', marginBottom: 10, letterSpacing: 2 }}>İÇERMESİ GEREKEN HARFLER:</Text>
              <View style={{ backgroundColor: 'rgba(255,213,79,0.05)', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, borderWidth: 2, borderColor: '#FFD54F', shadowColor: '#FFD54F', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20 }}>
                <Text style={{ color: '#FFD54F', fontSize: 42, fontWeight: '900', letterSpacing: 8 }}>{room?.bomb_syllable?.toUpperCase()}</Text>
              </View>
            </View>

            {/* 2. Bomb Area */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <Animated.View style={[{ width: width * 0.7, height: width * 0.7 }, animatedBombStyle]}>
                <AnimatedLottieView
                  ref={lottieRef as any}
                  source={require('../assets/animations/Bomb explosion cartoon.json')}
                  animatedProps={animatedLottieProps}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                  loop={false}
                />
                <View style={{ position: 'absolute', top: '55%', width: '100%', alignItems: 'center' }}>
                  <Text style={{
                    color: timeLeft !== null && timeLeft <= 5 ? '#FF5252' : '#FFF',
                    fontSize: 36,
                    fontWeight: '900',
                    textShadowColor: '#000',
                    textShadowRadius: 10,
                    letterSpacing: 2
                  }}>
                    {isMyTurn ? (timeLeft ?? 30) : '⏳'}
                  </Text>
                </View>
              </Animated.View>
            </View>

            {/* 3. Input Section */}
            <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Animated.View style={[{ flex: 1, height: 65, borderRadius: 20, borderWidth: 2, overflow: 'hidden' }, animatedInputStyle]}>
                  <TextInput
                    style={{ flex: 1, paddingHorizontal: 20, color: '#FFF', fontSize: 20, fontWeight: '700' }}
                    placeholder={isMyTurn ? "KELİMENİ YAZ..." : "SIRA RAKİPTE..."}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={input}
                    onChangeText={setInput}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={isMyTurn && !isSubmitting}
                    onSubmitEditing={handleSubmit}
                    blurOnSubmit={false}
                  />
                </Animated.View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isMyTurn || input.length < 2 || isSubmitting}
                  style={{
                    width: 65, height: 65, borderRadius: 20,
                    backgroundColor: isMyTurn && input.length >= 2 ? '#FF5722' : 'rgba(255,255,255,0.05)',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isMyTurn && input.length >= 2 ? '#FF7043' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Ionicons name="send" size={28} color={isMyTurn && input.length >= 2 ? "#FFF" : "rgba(255,255,255,0.2)"} />}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Error Message Floating */}
        {errorVisible && (
          <Animated.View entering={ZoomIn} style={{ position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: '#FF5252', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, shadowColor: '#FF5252', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 15, zIndex: 10000 }}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>{errorMessage}</Text>
          </Animated.View>
        )}

        <ResultModal
          isVisible={isExploded}
          status={players.find(p => !p.is_eliminated)?.user_id === user?.id ? "win" : "lose"}
          word={room?.used_words?.[room.used_words.length - 1] || "—"}
          guesses={room?.used_words?.length || 0}
          onRestart={() => returnToLobby()}
          onHome={() => router.push('/')}
          mode="bomb"
        />

        {/* DEBUG OVERLAY */}
        <View style={{ position: 'absolute', bottom: 100, right: 20, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,213,79,0.3)', zIndex: 1000 }}>
          <Text style={{ color: '#FFD54F', fontSize: 9, fontWeight: 'bold' }}>{isMyTurn ? "SIRA BENDE" : "SIRA RAKİPTE"}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
