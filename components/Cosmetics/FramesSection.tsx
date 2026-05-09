/**
 * FramesSection — Shop içindeki çerçeveler bölümü
 */
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { FRAMES } from '../../constants/frames';
import { useCosmetics } from '../../hooks/useCosmetics';
import { useResponsive } from '../../hooks/useResponsive';
import { iapService } from '../../services/iapService';
import { FrameCard } from './FrameCard';

interface Props {
  userId: string;
  coins: number;
  avatarUrl?: string | null;
  username?: string;
  cardWidth: number;
}

export const FramesSection = ({ userId, coins, avatarUrl, username, cardWidth }: Props) => {
  const { moderateScale } = useResponsive();
  const queryClient = useQueryClient();
  const {
    ownedFrames,
    activeFrame,
    isLoadingCosmetics,
    setActiveFrame,
    isSettingActive,
    buyFrame,
    isBuying,
  } = useCosmetics(userId);

  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleActivate = async (frameId: string) => {
    setActivatingId(frameId);
    try {
      await setActiveFrame(frameId);
      Toast.show({ type: 'success', text1: 'Çerçeve güncellendi ✨', position: 'top' });
    } finally {
      setActivatingId(null);
    }
  };

  const handleBuy = (frame: typeof FRAMES[0]) => {
    if (frame.coinPrice !== null) {
      // Elmasla satın al
      if (coins < frame.coinPrice) {
        Toast.show({
          type: 'error',
          text1: 'Yetersiz Elmas',
          text2: `${frame.coinPrice} elmas gerekiyor.`,
          position: 'top',
        });
        return;
      }
      Alert.alert(
        'Çerçeve Satın Al',
        `${frame.name} için ${frame.coinPrice} elmas harcamak istiyor musun?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Satın Al',
            onPress: async () => {
              setBuyingId(frame.id);
              try {
                await buyFrame(frame.id, frame.coinPrice!);
                Toast.show({
                  type: 'success',
                  text1: `${frame.name} kazanıldı! 🎉`,
                  position: 'top',
                });
              } catch (e: any) {
                console.error('[DEBUG] FramesSection.tsx Satın Alma Hatası:', e);
                Toast.show({
                  type: 'error',
                  text1: 'Satın alma başarısız',
                  text2: e?.message || JSON.stringify(e),
                  position: 'top',
                });
              } finally {
                setBuyingId(null);
              }
            },
          },
        ]
      );
    } else if (frame.price) {
      // Gerçek para — IAP
      Alert.alert(
        'Satın Al',
        `${frame.name} çerçevesini ${frame.price} karşılığında satın almak istiyor musun?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Satın Al',
            onPress: async () => {
              setBuyingId(frame.id);
              try {
                const result = await iapService.purchaseProduct(frame.id, userId);
                if (result.success) {
                  Toast.show({ type: 'success', text1: `${frame.name} açıldı! ✨`, position: 'top' });
                  queryClient.invalidateQueries({ queryKey: ['cosmetics_owned', userId] });
                } else if (result.error) {
                  Toast.show({ type: 'error', text1: 'Hata', text2: result.error, position: 'top' });
                }
              } catch (e: any) {
                Toast.show({ type: 'error', text1: 'Beklenmedik bir hata oluştu', position: 'top' });
              } finally {
                setBuyingId(null);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View>
      {/* Başlık */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="person-circle-outline" size={20} color="#c084fc" />
          <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 0.5 }}>
            Avatar Çerçeveleri
          </Text>
        </View>
        <Text style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: moderateScale(9), fontWeight: '800',
          letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          KOZMETİK
        </Text>
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {FRAMES.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            isOwned={ownedFrames.some(f => f.id === frame.id)}
            isActive={activeFrame?.id === frame.id}

            avatarUrl={avatarUrl}
            username={username}
            coins={coins}
            width={cardWidth}
            isBuying={isBuying && buyingId === frame.id}
            isSettingActive={isSettingActive && activatingId === frame.id}
            onActivate={() => handleActivate(frame.id)}
            onBuy={() => handleBuy(frame)}
          />
        ))}
      </View>
    </View>
  );
};
