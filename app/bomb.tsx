import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Animated as RNAnimated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming, Easing, interpolate, Extrapolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useBombGame } from '../hooks/useBombGame';
import { useResponsive } from '../hooks/useResponsive';
import { Colors } from '../constants/Colors';
import ResultModal from '../components/modal/ResultModal';
import { useAuth } from '../hooks/useAuth';
import { toUpperTurkish } from '../utils/stringUtils';

const { width } = Dimensions.get('window');

const BOMB_ACCENT = '#FF5722'; // Orange-Red
const BOMB_SECONDARY = '#FFC107'; // Amber

export default function BombScreen() {
  const { code: roomCode } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { scale, verticalScale } = useResponsive();
  
  const { 
    room, 
    players, 
    timeLeft, 
    isExploded, 
    submitWord, 
    errorVisible, 
    errorMessage,
    isSubmitting,
    isMyTurn 
  } = useBombGame(roomCode);

  const [input, setInput] = useState('');
  
  // Reanimated values
  const bombShake = useSharedValue(0);
  const bombScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    // Pulse animation (Always active)
    bombScale.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Glow pulsate (Always active)
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Shake: ONLY when turn is mine AND time is low (< 5s)
    if (isMyTurn && timeLeft < 5) {
      const intensity = Math.max(2, (5 - timeLeft) * 4);
      bombShake.value = withRepeat(
        withSequence(
          withTiming(-intensity, { duration: 40 }),
          withTiming(intensity, { duration: 40 })
        ),
        -1,
        true
      );
    } else {
      bombShake.value = withTiming(0);
    }
  }, [timeLeft, isMyTurn]);

  const handleSubmit = async () => {
    if (input.length < 2 || isSubmitting) return;
    
    // UI'da hemen temizle (Hızlı hissiyat)
    const currentInput = input;
    setInput('');
    
    const success = await submitWord(currentInput);
    if (!success) {
      // Hata durumunda kelimeyi geri getir (opsiyonel, ama genellikle hata varken temiz kalması istenir)
      // Biz burada hata mesajını hook'tan alıyoruz.
    }
  };

  const animatedBombStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bombShake.value },
      { scale: bombScale.value }
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: bombScale.value * 1.5 }]
  }));

  const currentHolder = players.find(p => p.user_id === room?.bomb_holder_id);

  return (
    <LinearGradient colors={['#1A0F0A', '#3E1C11', '#1A0F0A']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaWithHeader onBack={() => router.back()} title="BOMBA KİMDE?" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Turn Indicator */}
        <View style={styles.turnHeader}>
          <View style={[styles.statusBadge, isMyTurn ? styles.myTurnBadge : styles.opponentTurnBadge]}>
            <Text style={styles.statusText}>
              {isMyTurn ? "BOMBA SENDE!" : `${currentHolder?.username || 'Rakip'}'de!`}
            </Text>
          </View>
        </View>

        {/* Syllable Challenge */}
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeLabel}>İÇİNDE BU HARFLER GEÇMELİ:</Text>
          <Text style={styles.syllableText}>{room?.bomb_syllable || '...'}</Text>
        </View>

        {/* Bomb Visual Area */}
        <View style={styles.bombContainer}>
          <Animated.View style={[styles.bombGlow, animatedGlowStyle]} />
          <Animated.View style={[styles.bombBase, animatedBombStyle]}>
             <Ionicons name="nuclear-outline" size={scale(180)} color={BOMB_ACCENT} />
              <View style={styles.timerOverlay}>
                {isMyTurn ? (
                  <Text style={[styles.timerText, timeLeft < 3 && styles.timerDanger]}>
                    {timeLeft.toFixed(1)}
                  </Text>
                ) : (
                  <Text style={[styles.timerText, { fontSize: 22, opacity: 0.7 }]}>
                    BEKLE...
                  </Text>
                )}
              </View>
          </Animated.View>
        </View>

        {/* Error Message Pin */}
        {errorVisible && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.footer}>
          <TextInput
            style={[styles.input, (!isMyTurn || isSubmitting) && styles.disabledInput]}
            value={input}
            onChangeText={v => setInput(toUpperTurkish(v))}
            placeholder={isMyTurn ? (isSubmitting ? "Gönderiliyor..." : "Kelimeyi patlat!") : "Bekle..."}
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={isMyTurn && !isExploded && !isSubmitting}
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!isMyTurn || input.length < 2 || isSubmitting) && styles.disabledSend]}
            onPress={handleSubmit}
            disabled={!isMyTurn || input.length < 2 || isSubmitting}
          >
            <Ionicons name={isSubmitting ? "reload" : "flash"} size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ResultModal
        isVisible={isExploded}
        status={isMyTurn ? 'lose' : 'win'}
        word={room?.used_words?.join(', ') || ''}
        guesses={room?.used_words?.length || 0}
        onRestart={() => router.replace('/lobby')}
        onHome={() => router.replace('/')}
        mode="bomb"
        extraData={isMyTurn ? "Bomba Sende Patladı!" : "Rakibi Patlattın!"}
      />
    </LinearGradient>
  );
}

function SafeAreaWithHeader({ onBack, title }: any) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={28} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'Outfit-Bold'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnHeader: {
    marginTop: 20,
  },
  statusBadge: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
  },
  myTurnBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
    borderColor: '#FF5722',
  },
  opponentTurnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  challengeContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  challengeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  syllableText: {
    color: '#FFD54F',
    fontSize: 48,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 213, 79, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  bombContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bombGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF5722',
  },
  bombBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: '#444',
  },
  timerOverlay: {
    position: 'absolute',
    top: '45%',
  },
  timerText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold'
  },
  timerDanger: {
    color: '#FF0000',
  },
  errorContainer: {
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    position: 'absolute',
    bottom: 120,
  },
  errorText: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    padding: 20,
    paddingBottom: 40,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disabledInput: {
    opacity: 0.5,
  },
  sendButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FF5722',
    borderRadius: 15,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5722',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  disabledSend: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  }
});
