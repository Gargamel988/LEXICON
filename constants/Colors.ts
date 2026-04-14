/**
 * Antigravity Cyberpunk Design System Colors
 * Based on user-provided hex codes for Game States.
 */

export const Colors = {
  // Brand / Theme
  background: "#0f0f0f",
  card: "#1a1a1a",
  border: "#333333",
  text: "#ffffff",
  textSecondary: "#888780",
  
  // Game States
  correct: {
    main: "#639922",
    dark: "#3B6D11",
  },
  misplaced: {
    main: "#EF9F27",
    dark: "#BA7517",
  },
  wrong: {
    main: "#888780",
    dark: "#444441",
  },
  
  // UI Accents
  accent: "#639922", // Using green as primary accent
  danger: "#ff4444",
  success: "#639922",
  
  // Transparency helpers
  glass: "rgba(255, 255, 255, 0.05)",
  overlay: "rgba(0, 0, 0, 0.7)",
};

export default Colors;
