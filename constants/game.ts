export const INITIAL_GRID = Array(6)
  .fill(null)
  .map(() => Array(5).fill({ char: "", status: "empty" }));

export const KEYBOARD_LAYOUTS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "Ö", "Ç", "⌫"],
];

// Default layout for legacy components
export const KEYBOARD_ROWS = KEYBOARD_LAYOUTS;
