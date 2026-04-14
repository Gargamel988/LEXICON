import { useWindowDimensions } from "react-native";

/**
 * useResponsive Hook
 * Designed specifically for the Word Game grid and premium UI.
 * Handles scaling for fonts, padding, and game-specific metrics like cell sizes.
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Guidance values based on iPhone X (375x812)
  const guidelineBaseWidth = 375;
  const guidelineBaseHeight = 812;

  // Scale functions
  const scale = (size: number) => (width / guidelineBaseWidth) * size;
  const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  // Device type flags
  const isSmallDevice = width < 360;
  const isTablet = width >= 600;

  // Game Grid Metrics (Default 5 letter word)
  // Logic: 5 cells + 4 gaps of 8px + 40px outer padding
  const getCellSize = (letterCount: number = 5) => {
    const totalOuterPadding = 48; // 24px each side
    const totalGapPadding = (letterCount - 1) * 8;
    const availableWidth = width - totalOuterPadding - totalGapPadding;
    const size = availableWidth / letterCount;

    // Safety cap for extremely large screens/tablets to prevent massive cells
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
    cellSize: getCellSize(), // Default cell size for 5 letters
    getCellSize, // Function for dynamic word lengths
    spacing: {
      xs: verticalScale(4),
      sm: verticalScale(8),
      md: verticalScale(16),
      lg: verticalScale(24),
      xl: verticalScale(32),
    },
    // Percentage helpers
    wp: (percent: number) => (width * percent) / 100,
    hp: (percent: number) => (height * percent) / 100,

    // Keyboard Specific Metrics
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
