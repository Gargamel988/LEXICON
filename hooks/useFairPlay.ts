import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UseFairPlayProps {
  /**
   * Oyun aktif olduğunda true. False iken listener kurulmaz ve
   * mevcut zamanlama temizlenir. Örn: settings modal kapalı &&  oyun bitmemiş
   */
  isActive?: boolean;
  /** İhlal tespit edildiğinde çağrılır (toast göstermek için) */
  onViolation?: (reason: string) => void;
  /** Oyun bittiğinde arka plana geçişi saymamak için */
  isGameOver?: boolean;
}

export interface FairPlayData {
  isFairPlay: boolean;
  backgroundCount: number;
  backgroundTotalTime: number;
}

export function useFairPlay({
  isActive = true,
  onViolation,
  isGameOver = false,
}: UseFairPlayProps = {}) {
  const [backgroundCount, setBackgroundCount] = useState(0);
  const [backgroundTotalTime, setBackgroundTotalTime] = useState(0);
  const [isFairPlay, setIsFairPlay] = useState(true);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundStartTime = useRef<number | null>(null);

  /** Her yeni oyun başında çağrılır — tüm sayaçları sıfırlar */
  const resetFairPlay = useCallback(() => {
    setBackgroundCount(0);
    setBackgroundTotalTime(0);
    setIsFairPlay(true);
    backgroundStartTime.current = null;
  }, []);

  /** Anlık snapshot — onSuccess/onFail callback'lerine geçirilir */
  const getFairPlayData = useCallback(
    (): FairPlayData => ({
      isFairPlay,
      backgroundCount,
      backgroundTotalTime: Math.round(backgroundTotalTime),
    }),
    [isFairPlay, backgroundCount, backgroundTotalTime]
  );

  useEffect(() => {
    if (!isActive) {
      // Oyun aktif değilse listener kurma, başlatılmış zamanlamayı temizle
      backgroundStartTime.current = null;
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Arka plandan ön plana döndü
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (backgroundStartTime.current) {
          const duration = (Date.now() - backgroundStartTime.current) / 1000;

          // 3 saniyelik tolerans (saate bakma, kaza swipe vb.)
          if (duration > 3) {
            setBackgroundTotalTime((prev) => {
              const newTotal = prev + duration;
              // Toplam arka plan süresi > 10s VEYA 3. geçişten itibaren ihlal
              if (newTotal > 10 || backgroundCount >= 2) {
                setIsFairPlay(false);
                onViolation?.("Arka plana çok fazla çıkış tespit edildi.");
              }
              return newTotal;
            });
          }

          backgroundStartTime.current = null;
        }
      }

      // Arka plana geçti
      if (nextAppState === "background" && !isGameOver) {
        setBackgroundCount((prev) => prev + 1);
        backgroundStartTime.current = Date.now();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isActive, isGameOver, backgroundCount, onViolation]);

  return {
    isFairPlay,
    backgroundCount,
    backgroundTotalTime,
    resetFairPlay,
    getFairPlayData,
  };
}
