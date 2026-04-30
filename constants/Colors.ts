/**
 * Antigravity Cyberpunk Design System Colors
 * Based on user-provided hex codes for Game States.
 */

export const Colors = {
  // Brand / Theme
  background: "#121212",
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

  // Game Modes
  modes: {
    classic: { accent: "#82b1ff", background: "#121212" },
    daily: { accent: "#4cd964", background: "#121212" },
    survival: { accent: "#ff3b30", background: "#121212" },
    blitz: { accent: "#ff7e79", background: "#121212" },
    climb: { accent: "#CF4C13", background: "#121212" },
    blind: { accent: "#FFD54F", background: "#121212" },
    multi: { accent: "#9c27b0", background: "#121212" },
    lobby: { accent: "#639922", background: "#121212" },
    battle: { accent: "#FF0055", background: "#121212" },
    bomb: { accent: "#FF5722", background: "#121212" },
    timed: { accent: "#82b1ff", background: "#121212" },
  },
};

export default Colors;
