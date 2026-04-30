import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FramesSection } from '../../components/Cosmetics/FramesSection';
import { NameTagsSection } from '../../components/Cosmetics/NameTagsSection';
import { TitlesSection } from '../../components/Cosmetics/TitlesSection';
import Colors from '../../constants/Colors';
import { useCosmetics } from '../../hooks/useCosmetics';
import { POWER_UP_DEFINITIONS, PowerUpKey, renderPowerUpIcon } from '../../constants/powerUps';
import { COIN_COLOR, COIN_ICON, COIN_LABEL } from '../../constants/ui';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useProfile } from '../../hooks/useProfile';
import { useResponsive } from '../../hooks/useResponsive';
import { POWER_UP_PRICES } from '../../services/inventoryService';

// ─── Bundle paketler: elmas + güçlendirme + belki reklamsız ───
type BundleItem = { icon: string; iconSet?: 'Ionicons' | 'MaterialCommunityIcons'; text: string };

const BUNDLE_PACKAGES = [
  {
    id: 'bundle_starter',
    label: 'Başlangıç Paketi',
    price: '₺29,99',
    color: '#82b1ff',
    badge: null as string | null,
    includes: [
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '150 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '3× İpucu' },
      { icon: 'bomb', iconSet: 'MaterialCommunityIcons', text: '2× Bomba' },
    ] as BundleItem[],
    noAds: false,
  },
  {
    id: 'bundle_popular',
    label: 'Popüler Paket',
    price: '₺79,99',
    color: '#4ade80',
    badge: 'POPÜLER',
    includes: [
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '500 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '8× İpucu' },
      { icon: 'bomb', iconSet: 'MaterialCommunityIcons', text: '5× Bomba' },
      { icon: 'cards-playing-outline', iconSet: 'MaterialCommunityIcons', text: '3× Joker' },
    ] as BundleItem[],
    noAds: false,
  },
  {
    id: 'bundle_pro',
    label: 'Pro Paket',
    price: '₺149,99',
    color: '#ffd54f',
    badge: null as string | null,
    includes: [
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '1.200 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '15× İpucu' },
      { icon: 'bomb', iconSet: 'MaterialCommunityIcons', text: '10× Bomba' },
      { icon: 'cards-playing-outline', iconSet: 'MaterialCommunityIcons', text: '8× Joker' },
      { icon: 'arrow-undo', iconSet: 'Ionicons', text: '5× Veto' },
    ] as BundleItem[],
    noAds: false,
  },
  {
    id: 'bundle_noads',
    label: 'Reklamsız Paket',
    price: '₺49,99',
    color: '#a78bfa',
    badge: null as string | null,
    includes: [
      { icon: 'ban', iconSet: 'Ionicons', text: 'Reklam Yok' },
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '200 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '5× İpucu' },
    ] as BundleItem[],
    noAds: true,
  },
  {
    id: 'bundle_mega',
    label: 'Mega Paket',
    price: '₺249,99',
    color: '#f97316',
    badge: null as string | null,
    includes: [
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '3.500 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '30× İpucu' },
      { icon: 'bomb', iconSet: 'MaterialCommunityIcons', text: '20× Bomba' },
      { icon: 'cards-playing-outline', iconSet: 'MaterialCommunityIcons', text: '15× Joker' },
      { icon: 'arrow-undo', iconSet: 'Ionicons', text: '10× Veto' },
    ] as BundleItem[],
    noAds: false,
  },
  {
    id: 'bundle_ultimate',
    label: 'Ultimate Paket',
    price: '₺499,99',
    color: '#f59e0b',
    badge: 'EN İYİ DEĞER',
    includes: [
      { icon: 'ban', iconSet: 'Ionicons', text: 'Reklam Yok' },
      { icon: 'diamond-outline', iconSet: 'Ionicons', text: '10.000 Elmas' },
      { icon: 'bulb', iconSet: 'Ionicons', text: '50× İpucu' },
      { icon: 'bomb', iconSet: 'MaterialCommunityIcons', text: '30× Bomba' },
      { icon: 'cards-playing-outline', iconSet: 'MaterialCommunityIcons', text: '25× Joker' },
      { icon: 'arrow-undo', iconSet: 'Ionicons', text: '20× Veto' },
    ] as BundleItem[],
    noAds: true,
  },
];

// ─── Sadece elmas paketleri ───
const COIN_PACKAGES = [
  { id: 'coins_100', coins: 100, price: '₺19,99', label: 'Başlangıç', color: '#82b1ff', bonus: '+10 Bonus', popular: false, bestValue: false },
  { id: 'coins_300', coins: 300, price: '₺49,99', label: 'Orta', color: '#4ade80', bonus: '+30 Bonus', popular: true, bestValue: false },
  { id: 'coins_700', coins: 700, price: '₺99,99', label: 'Büyük', color: '#ffd54f', bonus: '+100 Bonus', popular: false, bestValue: false },
  { id: 'coins_2000', coins: 2000, price: '₺249,99', label: 'Mega', color: '#ff7e79', bonus: '+400 Bonus', popular: false, bestValue: false },
  { id: 'coins_5000', coins: 5000, price: '₺499,99', label: 'Süper', color: '#c084fc', bonus: '+1.250 Bonus', popular: false, bestValue: false },
  { id: 'coins_12000', coins: 12000, price: '₺999,99', label: 'Efsane', color: '#f97316', bonus: '+4.000 Bonus', popular: false, bestValue: true },
];

// ─── Mağazada satılan güçlendirmeler (tümü) ───
const SHOP_POWER_UPS: PowerUpKey[] = [
  'hint', 'bomb', 'joker', 'veto', 'mirror',
  'extra', 'shield', 'skip', 'first_letter', 'freeze',
  'time', 'analysis', 'radar', 'magnet', 'lightning',
  'scan', 'bridge', 'risk',
];

// ─── Bölüm başlığı ───
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { moderateScale } = useResponsive();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900', letterSpacing: 0.5 }}>{title}</Text>
      {subtitle && (
        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ─── IAP uyarısı ───
const showComingSoon = () =>
  Toast.show({ type: 'info', text1: 'Yakında!', text2: 'Ödeme entegrasyonu yapım aşamasında.', position: 'top' });

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { moderateScale, wp } = useResponsive();
  const { user } = useAuth();
  const { coins, getStock, purchase, isPurchasing, giveAdReward, isAdRewarding } = useInventory(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { ownedTitles } = useCosmetics(user?.id);

  const [buyingKey, setBuyingKey] = useState<PowerUpKey | null>(null);

  // Güçlendirme satın al
  const handleBuyPowerUp = async (key: PowerUpKey) => {
    const price = POWER_UP_PRICES[key] ?? 0;
    if (coins < price) {
      Toast.show({ type: 'error', text1: 'Yetersiz Elmas', text2: `${price} elmas gerekiyor.`, position: 'top' });
      return;
    }
    Alert.alert(
      'Satın Al',
      `${POWER_UP_DEFINITIONS[key].label} için ${price} elmas harcamak istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al',
          onPress: async () => {
            setBuyingKey(key);
            try {
              const result = await purchase({ key, quantity: 1 });
              if (result.success) {
                Toast.show({ type: 'success', text1: 'Satın Alındı!', text2: `${POWER_UP_DEFINITIONS[key].label} envanterine eklendi.`, position: 'top' });
              } else if (result.reason === 'insufficient_coins') {
                Toast.show({ type: 'error', text1: 'Yetersiz Elmas', position: 'top' });
              }
            } catch {
              Toast.show({ type: 'error', text1: 'Bir hata oluştu', position: 'top' });
            } finally {
              setBuyingKey(null);
            }
          },
        },
      ]
    );
  };

  // Reklam izle
  const handleWatchAd = async () => {
    Alert.alert('Reklam İzle', '20 elmas kazanmak için reklam izlemek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'İzle',
        onPress: async () => {
          const result = await giveAdReward();
          if (result.success) {
            Toast.show({ type: 'success', text1: '+20 Elmas Kazandın! 🎉', text2: `Yeni bakiyen: ${result.newBalance} elmas`, position: 'top' });
          }
        },
      },
    ]);
  };

  // Bundle satın al
  const handleBuyBundle = (pkg: typeof BUNDLE_PACKAGES[0]) => {
    const includesText = pkg.includes.map((i) => `• ${i.text}`).join('\n');
    Alert.alert(
      pkg.label,
      `${pkg.price} karşılığında bu paketi almak istiyor musun?\n\nİçerikler:\n${includesText}`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: showComingSoon },
      ]
    );
  };

  // Sadece elmas satın al
  const handleBuyCoins = (pkg: typeof COIN_PACKAGES[0]) => {
    Alert.alert(
      pkg.label,
      `${pkg.coins.toLocaleString('tr-TR')} elmas için ${pkg.price} ödemek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: showComingSoon },
      ]
    );
  };

  const cardWidth = (wp(90) - 12) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>

      {/* ── Header ── */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: wp(5),
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}>
        <Text style={{ color: '#fff', fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5 }}>
          MAĞAZA
        </Text>
        <View style={{
          backgroundColor: 'rgba(255,214,0,0.12)',
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 8,
          borderRadius: 20, gap: 7,
          borderWidth: 1, borderColor: 'rgba(255,214,0,0.25)',
        }}>
          <Ionicons name={COIN_ICON} size={15} color={COIN_COLOR} />
          <Text style={{ color: COIN_COLOR, fontWeight: '900', fontSize: moderateScale(16) }}>
            {coins.toLocaleString('tr-TR')}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Reklam Banner ── */}
        <View style={{ paddingHorizontal: wp(5), marginTop: 20, marginBottom: 28 }}>
          <Pressable
            onPress={handleWatchAd}
            disabled={isAdRewarding}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(99,153,34,0.25)' : 'rgba(99,153,34,0.12)',
              borderRadius: 20, padding: 20,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderWidth: 1, borderColor: 'rgba(99,153,34,0.35)',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: 'rgba(99,153,34,0.2)',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Ionicons name="play-circle" size={28} color={Colors.accent} />
              </View>
              <View>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: moderateScale(15) }}>Reklam İzle</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: moderateScale(12), marginTop: 2 }}>+20 elmas kazan, ücretsiz!</Text>
              </View>
            </View>
            {isAdRewarding
              ? <ActivityIndicator color={Colors.accent} />
              : (
                <View style={{
                  backgroundColor: Colors.accent,
                  paddingHorizontal: 16, paddingVertical: 8,
                  borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
                }}>
                  <Ionicons name={COIN_ICON} size={13} color="#000" />
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: moderateScale(13) }}>+20</Text>
                </View>
              )
            }
          </Pressable>
        </View>

        {/* ── Bundle Paketleri ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 32 }}>
          <SectionTitle title="Paketler" subtitle="GERÇEK PARA" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {BUNDLE_PACKAGES.map((pkg) => (
              <Pressable
                key={pkg.id}
                onPress={() => handleBuyBundle(pkg)}
                style={({ pressed }) => ({
                  width: cardWidth,
                  backgroundColor: pressed ? `${pkg.color}14` : `${pkg.color}08`,
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1.5,
                  borderColor: pkg.badge ? `${pkg.color}55` : `${pkg.color}28`,
                  position: 'relative',
                  overflow: 'visible',
                  // ✅ Buton her zaman alta yapışık
                  justifyContent: 'space-between',
                  minHeight: 180,
                })}
              >
                {/* Rozet */}
                {pkg.badge && (
                  <View style={{
                    position: 'absolute', top: -10, alignSelf: 'center',
                    backgroundColor: pkg.color,
                    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
                  }}>
                    <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>{pkg.badge}</Text>
                  </View>
                )}

                {/* Üst içerik: isim + maddeler */}
                <View style={{ flex: 1 }}>
                  {/* Reklamsız rozet (sağ üst) */}
                  {pkg.noAds && (
                    <View style={{
                      position: 'absolute', top: 0, right: 0,
                      backgroundColor: `${pkg.color}25`,
                      padding: 4, borderRadius: 8,
                    }}>
                      <Ionicons name="ban-outline" size={14} color={pkg.color} />
                    </View>
                  )}

                  {/* Paket adı */}
                  <Text style={{
                    color: pkg.color, fontWeight: '900',
                    fontSize: moderateScale(13), marginBottom: 10,
                    paddingRight: pkg.noAds ? 24 : 0,
                  }}>
                    {pkg.label}
                  </Text>

                  {/* İçerikler */}
                  <View style={{ gap: 5 }}>
                    {pkg.includes.map((item) => (
                      <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {renderPowerUpIcon({ icon: item.icon, iconSet: item.iconSet as any }, 12, pkg.color)}
                        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: moderateScale(11), fontWeight: '700' }}>
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Fiyat butonu — her zaman alta yapışık */}
                <View style={{
                  width: '100%',
                  backgroundColor: pkg.badge ? pkg.color : `${pkg.color}30`,
                  paddingVertical: 9, borderRadius: 12, alignItems: 'center',
                  marginTop: 14,
                }}>
                  <Text style={{
                    color: pkg.badge ? '#000' : '#fff',
                    fontWeight: '900', fontSize: moderateScale(13),
                  }}>
                    {pkg.price}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Sadece Elmas ── */}
        <View style={{ paddingHorizontal: wp(5), marginBottom: 32 }}>
          <SectionTitle title="Elmas Paketleri" subtitle="SADECE ELMAS" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {COIN_PACKAGES.map((pkg) => (
              <Pressable
                key={pkg.id}
                onPress={() => handleBuyCoins(pkg)}
                style={({ pressed }) => ({
                  width: cardWidth,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  borderRadius: 20, padding: 18, alignItems: 'center',
                  borderWidth: 1,
                  borderColor: (pkg.popular || pkg.bestValue) ? `${pkg.color}50` : 'rgba(255,255,255,0.07)',
                  position: 'relative', overflow: 'visible',
                })}
              >
                {(pkg.popular || pkg.bestValue) && (
                  <View style={{
                    position: 'absolute', top: -10, alignSelf: 'center',
                    backgroundColor: pkg.color, paddingHorizontal: 10,
                    paddingVertical: 3, borderRadius: 8,
                  }}>
                    <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>
                      {pkg.bestValue ? '🏆 EN İYİ DEĞER' : 'POPÜLER'}
                    </Text>
                  </View>
                )}
                <Ionicons name={COIN_ICON} size={30} color={pkg.color} style={{ marginBottom: 10 }} />
                <Text style={{ color: '#fff', fontSize: moderateScale(18), fontWeight: '900' }}>
                  {pkg.coins.toLocaleString('tr-TR')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                  {COIN_LABEL.toUpperCase()}
                </Text>
                <Text style={{ color: pkg.color, fontSize: 10, fontWeight: '900', marginTop: 4 }}>
                  {pkg.bonus}
                </Text>
                <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 }} />
                <View style={{
                  width: '100%',
                  backgroundColor: (pkg.popular || pkg.bestValue) ? pkg.color : 'rgba(255,255,255,0.07)',
                  paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                }}>
                  <Text style={{ color: (pkg.popular || pkg.bestValue) ? '#000' : '#fff', fontWeight: '900', fontSize: moderateScale(13) }}>
                    {pkg.price}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Güçlendirmeler ── */}
        <View style={{ paddingHorizontal: wp(5) }}>
          <SectionTitle title="Güçlendirmeler" subtitle="ELMASLA SATIN AL" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SHOP_POWER_UPS.map((key) => {
              const def = POWER_UP_DEFINITIONS[key];
              const price = POWER_UP_PRICES[key] ?? 0;
              const stock = getStock(key);
              const isLoading = isPurchasing && buyingKey === key;
              const canAfford = coins >= price;

              return (
                <View
                  key={key}
                  style={{
                    width: cardWidth,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 18,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.06)',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'space-between',
                    minHeight: 140,
                  }}
                >
                  {/* İkon */}
                  <View style={{
                    width: 52, height: 52, borderRadius: 15,
                    backgroundColor: `${def.accentColor}18`,
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1, borderColor: `${def.accentColor}30`,
                  }}>
                    {renderPowerUpIcon(def, 26, def.accentColor)}
                  </View>

                  {/* İsim + açıklama */}
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{
                      color: '#fff', fontWeight: '800',
                      fontSize: moderateScale(12), textAlign: 'center',
                    }}>
                      {def.label}
                    </Text>
                    {stock > 0 && (
                      <Text style={{
                        color: def.accentColor, fontSize: 10,
                        fontWeight: '700', marginTop: 3,
                      }}>
                        Stok: {stock}
                      </Text>
                    )}
                  </View>

                  {/* Fiyat butonu */}
                  <Pressable
                    onPress={() => handleBuyPowerUp(key)}
                    disabled={isLoading || !canAfford}
                    style={({ pressed }) => ({
                      width: '100%',
                      backgroundColor: canAfford
                        ? pressed ? 'rgba(255,214,0,0.25)' : 'rgba(255,214,0,0.12)'
                        : 'rgba(255,255,255,0.05)',
                      paddingVertical: 8,
                      borderRadius: 12,
                      flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', gap: 5,
                      borderWidth: 1,
                      borderColor: canAfford ? 'rgba(255,214,0,0.3)' : 'rgba(255,255,255,0.08)',
                    })}
                  >
                    {isLoading
                      ? <ActivityIndicator size="small" color="#ffd600" />
                      : (
                        <>
                          <Ionicons
                            name={COIN_ICON}
                            size={12}
                            color={canAfford ? COIN_COLOR : 'rgba(255,255,255,0.3)'}
                          />
                          <Text style={{
                            color: canAfford ? COIN_COLOR : 'rgba(255,255,255,0.3)',
                            fontWeight: '900', fontSize: moderateScale(12),
                          }}>
                            {price}
                          </Text>
                        </>
                      )
                    }
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: wp(5), marginTop: 10 }}>
          <FramesSection
            userId={user?.id ?? ''}
            coins={coins}
            avatarUrl={profile?.avatar_url}
            username={profile?.username ?? user?.email}
            cardWidth={cardWidth}
          />
        </View>

        {/* ── Özel İsimlikler ── */}
        <View style={{ paddingHorizontal: wp(5) }}>
          <NameTagsSection
            userId={user?.id ?? ''}
            coins={coins}
            username={profile?.username ?? user?.email}
          />
        </View>

        {/* ── Unvanlar ── */}
        <View style={{ paddingHorizontal: wp(5) }}>
          <TitlesSection 
            ownedTitlesIds={ownedTitles.map(t => t.id)}
          />
        </View>

      </ScrollView>
    </View>
  );
}
