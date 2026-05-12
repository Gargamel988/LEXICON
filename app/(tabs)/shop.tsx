import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BannerAd } from '../../components/Ads/BannerAd';
import { FramesSection } from '../../components/Cosmetics/FramesSection';
import { NameTagsSection } from '../../components/Cosmetics/NameTagsSection';
import { BundleSection } from '../../components/Shop/BundleSection';
import { FreeGemButton } from '../../components/Shop/FreeGemButton';
import { GemMarket } from '../../components/Shop/GemMarket';
import { PowerUpSection } from '../../components/Shop/PowerUpSection';
import { UltimateBundle } from '../../components/Shop/UltimateBundle';
import { AD_UNIT_IDS } from '../../constants/ads';
import Colors from '../../constants/Colors';
import { OfflineBanner } from '../../components/Common/OfflineBanner';
import { networkService } from '../../services/networkService';
import { POWER_UP_DEFINITIONS, PowerUpKey } from '../../constants/powerUps';
import { COIN_COLOR, COIN_ICON } from '../../constants/ui';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useProfile } from '../../hooks/useProfile';
import { useResponsive } from '../../hooks/useResponsive';
import { adService } from '../../services/adService';
import { iapService } from '../../services/iapService';
import { POWER_UP_PRICES } from '../../services/inventoryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// \u2500\u2500\u2500 T\u0130CAR\u0130 PAKET TANIMLARI \u2500\u2500\u2500
const BUNDLE_PACKAGES = [
  {
    id: 'bundle_starter',
    label: 'Ba\u015Flang\u0131\u00E7 Seti',
    price: '\u20BA99,99',
    color: '#82b1ff',
    badge: null,
    desc: '1.000 Elmas & 5 ipucu',
    icon: 'rocket-launch-outline',
  },
  {
    id: 'bundle_monthly_adfree',
    label: 'Ayl\u0131k Premium',
    price: '\u20BA29,99',
    color: '#fbbf24',
    badge: 'YEN\u0130',
    desc: 'Reklams\u0131z + 200 Elmas + G\u00FCnl\u00FCk 10 Bonus',
    icon: 'shield-check-outline',
  },
  {
    id: 'bundle_mega',
    label: 'Mega Paket',
    price: '\u20BA349,99',
    color: '#c084fc',
    badge: 'EN POP\u00DCLER',
    desc: '5.000 Elmas + 20 Bomba + Mega \u00C7er\u00E7eve',
    icon: 'fire-circle',
  },
];

const COIN_PACKAGES = [
  { id: 'coins_100', coins: 100, price: '\u20BA19,99', color: '#ffd54f', bonus: null },
  { id: 'coins_500', coins: 750, price: '\u20BA129,99', color: '#ffd54f', bonus: '+250 BONUS' },
  { id: 'coins_1000', coins: 1750, price: '\u20BA249,99', color: '#ffd54f', bonus: '+750 BONUS' },
  { id: 'coins_2000', coins: 3000, price: '\u20BA499,99', color: '#ffd54f', bonus: '+1.000 BONUS' },
  { id: 'coins_5000', coins: 8500, price: '\u20BA999,99', color: '#ffd54f', bonus: '+3.500 BONUS' },
];

const SHOP_POWER_UPS: PowerUpKey[] = Object.keys(POWER_UP_DEFINITIONS) as PowerUpKey[];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { moderateScale, wp } = useResponsive();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { coins, purchase, giveAdReward, isAdRewarding } = useInventory(user?.id);
  const { data: profile } = useProfile(user?.id);

  const [buyingKey, setBuyingKey] = useState<PowerUpKey | null>(null);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);

  const handleBuyIAP = async (product: string | { id: string }) => {
    if (!user?.id) return;
    if (!networkService.isOnline) {
      Toast.show({ type: 'info', text1: 'Çevrimdışı Mod', text2: 'Satın alma işlemi için internet gerekiyor.', position: 'top' });
      return;
    }
    const productId = typeof product === 'string' ? product : product.id;

    setIsPurchasingId(productId);
    try {
      const result = await iapService.purchaseProduct(productId, user.id);
      if (result.success) {
        Toast.show({ type: 'success', text1: 'Satın Alma Başarılı! 🎉', text2: 'Ürün envanterine eklendi.', position: 'top' });
        // Bakiyeyi ve envanteri tazele
        queryClient.invalidateQueries({ queryKey: ['coins', user.id] });
        queryClient.invalidateQueries({ queryKey: ['inventory', user.id] });
        queryClient.invalidateQueries({ queryKey: ['cosmetics_owned', user.id] });
        queryClient.invalidateQueries({ queryKey: ['cosmetics_active', user.id] });
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      } else if (result.error) {
        Toast.show({ type: 'error', text1: 'Satın Alma Hatası', text2: result.error, position: 'top' });
      }
    } catch (err) {
      console.error('Purchase error:', err);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'İşlem sırasında bir sorun oluştu.', position: 'top' });
    } finally {
      setIsPurchasingId(null);
    }
  };

  const handleBuyPowerUp = async (key: PowerUpKey) => {
    const price = POWER_UP_PRICES[key] ?? 50;
    if (coins < price) {
      Toast.show({ type: 'error', text1: 'Yetersiz Elmas', text2: `${price} elmas gerekiyor.`, position: 'top' });
      return;
    }
    Alert.alert('Satın Al', `${POWER_UP_DEFINITIONS[key].label} için ${price} elmas harcansın mı?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: async () => {
          setBuyingKey(key);
          try {
            const result = await purchase({ key, quantity: 1 });
            if (result.success) {
              Toast.show({ type: 'success', text1: 'Başarılı!', text2: 'Ürün envanterine eklendi.', position: 'top' });
            }
          } finally {
            setBuyingKey(null);
          }
        },
      },
    ]);
  };

  const handleWatchAd = () => {
    if (!networkService.isOnline) {
      Toast.show({ type: 'info', text1: 'Çevrimdışı Mod', text2: 'Reklam izlemek için internet gerekiyor.', position: 'top' });
      return;
    }
    setIsAdLoading(true);
    adService.showRewardedAd(
      AD_UNIT_IDS.REWARDED_DAILY,
      async () => {
        setIsAdLoading(false);
        const result = await giveAdReward();
        if (result.success) {
          Toast.show({ type: 'success', text1: '+20 Elmas Kazandın! 🎉', position: 'top' });
        }
      },
      () => {
        setIsAdLoading(false);
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Reklam yüklenemedi.', position: 'top' });
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <OfflineBanner />
      {/* ── HEADER ── */}
      <View style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: wp(5),
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        zIndex: 10,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.correct.main }}>
            <Ionicons name="cart" size={20} color={Colors.correct.main} />
          </View>
          <Text style={{ color: Colors.text, fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 1 }}>MARKET</Text>
        </View>
        <View style={{ backgroundColor: Colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, gap: 6, borderWidth: 1, borderColor: Colors.border }}>
          <Ionicons name={COIN_ICON} size={14} color={COIN_COLOR} />
          <Text style={{ color: Colors.text, fontWeight: '800', fontSize: moderateScale(14) }}>{coins.toLocaleString('tr-TR')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <UltimateBundle
          onBuy={() => handleBuyIAP('bundle_ultimate')}
          isLoading={isPurchasingId === 'bundle_ultimate'}
        />

        <FreeGemButton onWatchAd={handleWatchAd} isLoading={isAdLoading || isAdRewarding} />

        <BundleSection
          bundles={BUNDLE_PACKAGES}
          onBuy={handleBuyIAP}
          loadingId={isPurchasingId}
        />

        <GemMarket
          packages={COIN_PACKAGES}
          onBuy={handleBuyIAP}
          loadingId={isPurchasingId}
        />

        <PowerUpSection
          powerUpKeys={SHOP_POWER_UPS}
          onBuy={handleBuyPowerUp}
          buyingKey={buyingKey}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24, paddingHorizontal: wp(5) }}>
          <Text style={{ color: Colors.text, fontSize: moderateScale(16), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Kozmetik Mağazası</Text>
        </View>

        <View style={{ paddingHorizontal: wp(5) }}>
          <FramesSection
            userId={user?.id ?? ''}
            coins={coins}
            avatarUrl={profile?.avatar_url}
            username={profile?.username ?? user?.email}
            cardWidth={(SCREEN_WIDTH - wp(15)) / 2}
          />
          <View style={{ marginTop: 20 }}>
            <NameTagsSection
              userId={user?.id ?? ''}
              coins={coins}
              username={profile?.username ?? user?.email}
            />
          </View>
        </View>

        {/* ── SPONSORLU İÇERİK ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 20 }}>
          <View style={{ backgroundColor: Colors.card, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: Colors.border }}>
            <View style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 10, fontWeight: '900' }}>AD</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.text, fontSize: 12, fontWeight: '700' }}>SPONSORLU İÇERİK</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 10, marginTop: 2 }}>Premium abonelik ile reklamları kaldırın.</Text>
            </View>
          </View>
        </View>

      </ScrollView>
      <BannerAd />
    </View>
  );
}
