import { DICTIONARY } from "../data/dictionary";
import { CategoryWords, WORDS } from "../data/words";
import { toUpperTurkish } from "./stringUtils";

/**
 * Word Utility Engine
 * Handles validation, randomization, and scoring for the Turkish word game.
 */

// Global sets for fast O(1) lookups
let validationSet: Set<string> | null = null;
let gameWordsByLength: Record<number, string[]> = {};

/**
 * Normalizes and initializes the word dictionaries.
 * This happens lazily on the first call to any word function.
 */
const ensureInitialized = () => {
  if (validationSet) return;

  validationSet = new Set<string>();

  // 1. Add all Curated Game Words (Themed)
  Object.values(WORDS).forEach((category) => {
    Object.keys(category).forEach((lenStr) => {
      const len = parseInt(lenStr);
      const list = category[len as keyof CategoryWords];
      if (list) {
        list.forEach((w) => {
          const normalized = toUpperTurkish(w);
          validationSet!.add(normalized);

          // Categorize by length for getRandomWord fallback/classic mode
          if (!gameWordsByLength[len]) gameWordsByLength[len] = [];
          if (!gameWordsByLength[len].includes(normalized)) {
            gameWordsByLength[len].push(normalized);
          }
        });
      }
    });
  });

  // 2. Add all Dictionary Words (General validation)
  Object.keys(DICTIONARY).forEach((lenStr) => {
    const len = parseInt(lenStr);
    const list = DICTIONARY[len];
    if (list) {
      list.forEach((w) => validationSet!.add(toUpperTurkish(w)));
    }
  });
};

/**
 * Validates if a word exists in either our curated themes or the general dictionary.
 */
export const isValidWord = (word: string): boolean => {
  if (!word || word.length < 4 || word.length > 7) return false;
  ensureInitialized();

  const upperWord = toUpperTurkish(word);
  const len = upperWord.length;

  // Check themed words first
  const isThemed = gameWordsByLength[len]?.includes(upperWord);
  if (isThemed) return true;

  // Check general dictionary
  return validationSet!.has(upperWord);
};

/**
 * Picks a random word for a new game.
 * Priority is given to categorized words for better gameplay quality.
 */
export const getRandomWord = (length: number, category?: string): string => {
  ensureInitialized();

  let candidates: string[] = [];

  if (category && WORDS[category]) {
    candidates = WORDS[category][length as keyof CategoryWords] || [];
  } else {
    // If no category or category empty, pick from any curated game word of that length
    candidates = gameWordsByLength[length] || [];
  }

  // Final fallback: if no curated words exist for this length (unlikely), pick from dictionary
  if (candidates.length === 0) {
    candidates = DICTIONARY[length] || [];
  }

  if (candidates.length === 0) {
    throw new Error(`No words found for length ${length}`);
  }

  return toUpperTurkish(
    candidates[Math.floor(Math.random() * candidates.length)],
  );
};

/**
 * Calculates a point value for a word based on letter difficulty.
 * Turkish letter scores (inspired by Scrabble)
 */
const LETTER_SCORES: Record<string, number> = {
  A: 1,
  E: 1,
  İ: 1,
  I: 1,
  L: 1,
  R: 1,
  T: 1,
  U: 1,
  N: 1,
  O: 1,
  S: 1,
  D: 2,
  K: 2,
  M: 2,
  Y: 2,
  B: 3,
  C: 3,
  P: 3,
  Ş: 4,
  V: 4,
  Z: 4,
  G: 5,
  H: 5,
  Ç: 5,
  Ğ: 8,
  Ö: 7,
  Ü: 3,
  F: 7,
  J: 10,
};

export const calculateWordScore = (word: string): number => {
  const upperWord = toUpperTurkish(word);
  let baseScore = 0;

  for (const char of upperWord) {
    baseScore += LETTER_SCORES[char] || 1;
  }

  // Length bonus
  const lengthBonus = (word.length - 4) * 5;

  return baseScore + lengthBonus;
};

/**
 * Returns all available category keys.
 */
export const getAllCategories = (): string[] => {
  return Object.keys(WORDS);
};

/**
 * Returns all game words for a specific length.
 */
export const getWordsByLength = (length: number): string[] => {
  ensureInitialized();
  return gameWordsByLength[length] || [];
};

/**
 * Bomb Modu için rastgele bir hece (2 harfli yaygın kombinasyon) üretir.
 * Sözlükteki kelimelerden rastgele seçilerek cevaplanabilir olması garanti edilir.
 */
export const getRandomSyllable = (): string => {
  ensureInitialized();
  const words = gameWordsByLength[5] || gameWordsByLength[6] || [];
  if (words.length === 0) return "MA"; // Fallback

  const randomWord = words[Math.floor(Math.random() * words.length)];
  const start = Math.floor(Math.random() * (randomWord.length - 1));
  return randomWord.substring(start, start + 2);
};
