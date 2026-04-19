import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/statsService';

/**
 * Kullanıcının profiles tablosundaki verilerini fetch eden ve cache'leyen hook.
 * @param userId Kullanıcı ID'si
 */
export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => statsService.getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  });
};
