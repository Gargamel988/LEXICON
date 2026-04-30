import { ACHIEVEMENTS } from "@/constants/achievements";
import { useAuth } from "@/hooks/useAuth";
import { achievementService } from "@/services/achievementService";
import { useCallback } from "react";

export function useAchievementCheck() {
  const { user } = useAuth();

  const checkAchievements = useCallback(
    async (lastGameResult?: any) => {
      if (!user) return;

      try {
        const newUnlockIds =
          await achievementService.checkAndUnlockAchievements(
            user.id,
            lastGameResult,
          );

        if (newUnlockIds && newUnlockIds.length > 0) {
          newUnlockIds.forEach((id) => {
            const achievement = ACHIEVEMENTS.find((a) => a.id === id);
            if (achievement) {
              // Başarım açıldığında kullanıcıya bildir
              // Not: LexiconToast.show() statik bir metodsa veya benzeri bir kullanım varsa çağırılır.
              // Eğer LexiconToast bir bileşense, bir Global Context üzerinden tetiklenmesi gerekebilir.
              console.log(`NEW ACHIEVEMENT UNLOCKED: ${achievement.title}`);

              // Alternatif olarak Alert veya Custom Toast tetiklenebilir
            }
          });
        }
      } catch (error) {
        console.error("Achievement check failed:", error);
      }
    },
    [user],
  );

  return { checkAchievements };
}
