/**
 * NameTagsSection — Shop içindeki isimlikler bölümü
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { NAMETAGS } from '../../constants/nametags';
import { useCosmetics } from '../../hooks/useCosmetics';
import { useResponsive } from '../../hooks/useResponsive';
import { NameTagCard } from './NameTagCard';

interface Props {
  userId: string;
  coins: number;
  username?: string;
}

export const NameTagsSection = ({ userId, coins, username }: Props) => {
  const { moderateScale } = useResponsive();
  const {
    ownedCosmetics,
    activeNameTag,
    setActiveNameTag,
    isSettingActive,
    buyCosmetic,
    isBuying,
  } = useCosmetics(userId);

  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // Rarity bazlı renk eşleşmesi
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#fbbf24'; // Altın
      case 'epic': return '#c084fc';      // Mor
      case 'rare': return '#82cfff';      // Mavi
      default: return '#ffffff';          // Beyaz (common)
    }
  };

  const handleActivate = async (id: string | null) => {
    setActivatingId(id);
    try {
      await setActiveNameTag(id);
      Toast.show({ type: 'success', text1: 'İsimlik güncellendi ✨', position: 'top' });
    } finally {
      setActivatingId(null);
    }
  };

  const handleBuy = (item: typeof NAMETAGS[0]) => {
    if (item.coinPrice !== null) {
      if (coins < item.coinPrice) {
        Toast.show({
          type: 'error',
          text1: 'Yetersiz Elmas',
          text2: `${item.coinPrice} elmas gerekiyor.`,
          position: 'top',
        });
        return;
      }

      Alert.alert(
        'İsimlik Satın Al',
        `${item.name} için ${item.coinPrice} elmas harcamak istiyor musun?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Satın Al',
            onPress: async () => {
              setBuyingId(item.id);
              try {
                await buyCosmetic(item.id, item.coinPrice!);
                Toast.show({
                  type: 'success',
                  text1: `${item.name} kazanıldı! 🎉`,
                  position: 'top',
                });
              } catch (e: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Satın alma başarısız',
                  text2: e?.message || 'Bir sorun oluştu',
                  position: 'top',
                });
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
    <View style={{ marginTop: 32 }}>
      {/* Başlık */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="card-outline" size={20} color="#fbbf24" />
          <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 0.5 }}>
            Özel İsimlikler
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

      {/* Liste */}
      <View>
        {/* Varsayılan (İsimlik Yok) */}
        <NameTagCard
          nametag={{
            id: 'none',
            name: 'Varsayılan',
            image: null,
            price: null,
            coinPrice: null,
            rarity: 'common',
            description: 'Standart görünüm'
          }}
          color="#fff"
          isOwned={true}
          isActive={activeNameTag === null || activeNameTag === 'none'}
          username={username || 'OYUNCU'}
          onActivate={() => handleActivate(null)}
          onBuy={() => { }}
        />

        {NAMETAGS.map((item) => (
          <NameTagCard
            key={item.id}
            nametag={item}
            color={getRarityColor(item.rarity)}
            isOwned={ownedCosmetics.includes(item.id)}
            isActive={activeNameTag === item.id}
            username={username || 'OYUNCU'}
            isBuying={isBuying && buyingId === item.id}
            isSettingActive={isSettingActive && activatingId === item.id}
            onActivate={() => handleActivate(item.id)}
            onBuy={() => handleBuy(item)}
          />
        ))}
      </View>
    </View>
  );
};
