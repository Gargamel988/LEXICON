import { useQuery } from "@tanstack/react-query";
import { statsService } from "../services/statsService";

/**
 * Kullanıcının profiles tablosundaki verilerini fetch eden ve cache'leyen hook.
 * @param userId Kullanıcı ID'si
 */
export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      try {
        const data = await statsService.getProfile(userId!);
        return data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5000, // 5 saniye boyunca aynı veriyi kullan, sonsuz döngüyü engelle
    gcTime: 1000 * 60 * 60,
  });
};
