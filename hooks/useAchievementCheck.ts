import { ACHIEVEMENTS } from "@/constants/achievements";
import { useAuth } from "@/hooks/useAuth";
import { achievementService } from "@/services/achievementService";
import { useCallback } from "react";
import Toast from "react-native-toast-message";

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
              Toast.show({
                type: "success",
                text1: "Başarım Açıldı! 🏆",
                text2: `"${achievement.title}" başarımını açtın!`,
              });
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
