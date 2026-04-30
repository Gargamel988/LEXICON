import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { inventoryService, InventoryMap } from '../services/inventoryService';
import { PowerUpKey } from '../constants/powerUps';

export const useInventory = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Coin bakiyesi
  const {
    data: coins = 0,
    isLoading: isCoinsLoading,
    refetch: refetchCoins,
  } = useQuery({
    queryKey: ['coins', userId],
    queryFn: () => inventoryService.getCoins(userId!),
    enabled: !!userId,
    staleTime: 30_000, // 30 saniye cache
  });

  // Envanter
  const {
    data: inventory = {} as InventoryMap,
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
  } = useQuery({
    queryKey: ['inventory', userId],
    queryFn: () => inventoryService.getInventory(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Güçlendirme satın al
  const purchaseMutation = useMutation({
    mutationFn: ({ key, quantity }: { key: PowerUpKey; quantity?: number }) =>
      inventoryService.purchasePowerUp(userId!, key, quantity ?? 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coins', userId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  // Güçlendirme kullan (oyun sırasında)
  const usePowerUpMutation = useMutation({
    mutationFn: (key: PowerUpKey) =>
      inventoryService.usePowerUp(userId!, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  // Reklam ödülü
  const adRewardMutation = useMutation({
    mutationFn: () => inventoryService.giveAdReward(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coins', userId] });
    },
  });

  // Belirli bir güçlendirmenin stok miktarı
  const getStock = useCallback(
    (key: PowerUpKey): number => inventory[key] ?? 0,
    [inventory]
  );

  // Stokta var mı?
  const hasStock = useCallback(
    (key: PowerUpKey): boolean => (inventory[key] ?? 0) > 0,
    [inventory]
  );

  return {
    coins,
    inventory,
    isLoading: isCoinsLoading || isInventoryLoading,
    getStock,
    hasStock,
    refetch: () => {
      refetchCoins();
      refetchInventory();
    },
    // Mutasyonlar
    purchase: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    purchaseError: purchaseMutation.error,
    usePowerUp: usePowerUpMutation.mutateAsync,
    giveAdReward: adRewardMutation.mutateAsync,
    isAdRewarding: adRewardMutation.isPending,
  };
};
