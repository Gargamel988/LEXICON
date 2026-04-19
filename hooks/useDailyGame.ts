import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { dailyGameService } from "../services/dailyGame";
import { statsService } from "../services/statsService";
import { useAuth } from "./useAuth";

export const useDailyGame = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState("");

  // 1. Bugünün kelimesini çek
  const dailyWordQuery = useQuery({
    queryKey: ["dailyWord"],
    queryKeyHashFn: () => {
      const now = new Date();
      return `dailyWord-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    },
    queryFn: () => dailyGameService.getDailyWord(),
    staleTime: 1000 * 60 * 60, // 1 saat
  });

  const dailyStatsQuery = useQuery({
    queryKey: ["stats", user?.id, "daily"],
    queryFn: () => (user ? statsService.getModeStats(user.id, "daily") : null),
    enabled: !!user,
  });

  // 2. Kullanıcının bugün oynayıp oynamadığını kontrol et
  const playStatusQuery = useQuery({
    queryKey: ["dailyPlayStatus", user?.id],
    queryFn: () =>
      user ? dailyGameService.checkHasPlayedToday(user.id) : null,
    enabled: !!user,
  });

  // 3. Gece yarısına kalan süreyi hesapla
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  // 4. Sonuç gönderimi (Mutation)
  const submitResultMutation = useMutation({
    mutationFn: async ({
      attempts,
      duration,
      isWinner,
      is_fair_play,
    }: {
      attempts: number;
      duration: number;
      isWinner: boolean;
      is_fair_play?: boolean;
    }) => {
      if (!user) throw new Error("Oturum açılmamış.");
      return statsService.saveGameResult(user.id, {
        mode: "daily",
        attempts,
        duration_seconds: duration,
        is_winner: isWinner,
        is_fair_play,
      });
    },
    onSuccess: () => {
      // İstatistikleri ve oynama durumunu güncelle
      queryClient.invalidateQueries({
        queryKey: ["dailyPlayStatus", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["stats", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return {
    dailyWord: dailyWordQuery.data?.word,
    isLoading: dailyWordQuery.isLoading || playStatusQuery.isLoading,
    hasPlayed: !!playStatusQuery.data,
    playData: playStatusQuery.data,
    streak: dailyStatsQuery.data?.streak || 0,
    timeLeft,
    submitResult: submitResultMutation.mutateAsync,
    isSubmitting: submitResultMutation.isPending,
  };
};
