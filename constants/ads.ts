import { TestIds } from "react-native-google-mobile-ads";

// NOT: Gerçek ID'leri aldığında buraya ekleyebilirsin.
// Geliştirme aşamasında TestIds kullanmak güvenlidir (ban riskini önler).

export const AD_UNIT_IDS = {
  BANNER: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || "",
  APP_OPEN: __DEV__
    ? TestIds.APP_OPEN
    : process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ID || "",
  INTERSTITIAL: __DEV__
    ? TestIds.INTERSTITIAL
    : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || "",
  REWARDED_LIFE: __DEV__
    ? TestIds.REWARDED
    : process.env.EXPO_PUBLIC_ADMOB_REWARDED_LIFE_ID || "",
  REWARDED_DOUBLE: __DEV__
    ? TestIds.REWARDED
    : process.env.EXPO_PUBLIC_ADMOB_REWARDED_DOUBLE_ID || "",
  REWARDED_DAILY: __DEV__
    ? TestIds.REWARDED
    : process.env.EXPO_PUBLIC_ADMOB_REWARDED_DAILY_ID || "",
};

// Reklam gösterme sıklığı ayarları
export const AD_CONFIG = {
  INTERSTITIAL_INTERVAL: 3, // Her 3 oyunda bir göster
  REWARDED_LIFE_AMOUNT: 1, // Reklam başı verilecek hak
  REWARDED_COIN_MULTIPLIER: 2, // Reklam başı ödül katlayıcı
};
