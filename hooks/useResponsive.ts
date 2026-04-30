import { useWindowDimensions } from "react-native";

/**
 * useResponsive Hook
 * Tasarımın farklı ekran boyutlarında (Telefon, Tablet) tutarlı görünmesini sağlar.
 */

interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

interface ResponsiveHook {
  width: number;
  height: number;
  isSmallDevice: boolean;
  isTablet: boolean;
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  cellSize: number;
  getCellSize: (letterCount?: number) => number;
  spacing: Spacing;
  wp: (percent: number) => number;
  hp: (percent: number) => number;
  getKeyWidth: (maxKeysInRow?: number) => number;
  KEY_GAP: number;
  KEY_ROW_GAP: number;
}

export const useResponsive = (): ResponsiveHook => {
  const { width, height } = useWindowDimensions();

  // Tasarım baz alınan cihaz: iPhone X (375x812)
  const guidelineBaseWidth = 375;
  const guidelineBaseHeight = 812;

  // Genişliğe göre ölçekleme
  const scale = (size: number) => (width / guidelineBaseWidth) * size;
  
  // Yüksekliğe göre ölçekleme
  const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
  
  // Moderate scale (faktör ile yumuşatılmış ölçekleme)
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  // Cihaz tipi bayrakları
  const isSmallDevice = width < 360;
  const isTablet = width >= 600;

  // Oyun Izgarası Ölçüleri
  const getCellSize = (letterCount: number = 5) => {
    const totalOuterPadding = 48; // 24px her iki yan
    const totalGapPadding = (letterCount - 1) * 8;
    const availableWidth = width - totalOuterPadding - totalGapPadding;
    const size = availableWidth / letterCount;

    // Tabletlerde veya çok geniş ekranlarda hücrelerin devasa olmasını engelle
    return Math.min(size, 75);
  };

  return {
    width,
    height,
    isSmallDevice,
    isTablet,
    scale,
    verticalScale,
    moderateScale,
    cellSize: getCellSize(),
    getCellSize,
    spacing: {
      xs: verticalScale(4),
      sm: verticalScale(8),
      md: verticalScale(16),
      lg: verticalScale(24),
      xl: verticalScale(32),
    },
    // Yüzdesel genişlik/yükseklik yardımcıları
    wp: (percent: number) => (width * percent) / 100,
    hp: (percent: number) => (height * percent) / 100,

    // Klavye Ölçüleri
    getKeyWidth: (maxKeysInRow: number = 10) => {
      const horizontalPadding = scale(20);
      const keyGap = scale(5);
      const totalGap = (maxKeysInRow - 1) * keyGap;
      const availableWidth = width - horizontalPadding - totalGap;
      return availableWidth / maxKeysInRow;
    },
    KEY_GAP: scale(5),
    KEY_ROW_GAP: verticalScale(8),
  };
};
