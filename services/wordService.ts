import { CategoryWords, WORDS } from "../data/words";

export const usedWords: Record<string, string[]> = {};

// Belirli bir uzunluktaki tüm kelimeleri döndüren fonksiyon
export const getWordsByLength = (length: number): string[] => {
  const allWords: string[] = [];
  Object.values(WORDS).forEach((category) => {
    const lengthWords = category[length as keyof CategoryWords];
    if (lengthWords) {
      allWords.push(...lengthWords);
    }
  });
  return allWords;
};

// Günlük kelimeyi rastgele seçen fonksiyon (Varsayılan 5 harf)
export const getDailyWord = (length: number = 5) => {
  const words = getWordsByLength(length);
  if (words.length === 0) return "ELMAS";
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex].toUpperCase();
};

// Belirli bir kategoriden ve uzunluktan kelime seçen fonksiyon
export const getWordByCategory = (category: string, length: number) => {
  const categoryKey = category.toLowerCase();

  if (categoryKey === "karisik" || !WORDS[categoryKey]) {
    return getDailyWord(length);
  }

  const words = WORDS[categoryKey][length as keyof CategoryWords];
  if (!words || words.length === 0) {
    return getDailyWord(length);
  }

  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex].toUpperCase();
};

export const getRandomWord = () => {
  const categories = Object.keys(WORDS);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];

  // O kategorideki mevcut uzunlukları al (3, 4, 5, 6, 7)
  const availableLengths = Object.keys(
    WORDS[randomCategory],
  ) as unknown as (keyof CategoryWords)[];
  const randomLength =
    availableLengths[Math.floor(Math.random() * availableLengths.length)];

  const wordsInCategory = WORDS[randomCategory][randomLength];

  if (!wordsInCategory || wordsInCategory.length === 0) {
    // Fallback
    return getDailyWord(5);
  }

  const randomWord =
    wordsInCategory[Math.floor(Math.random() * wordsInCategory.length)];

  // Kullanılan kelimeleri takip et
  if (!usedWords[randomCategory]) {
    usedWords[randomCategory] = [];
  }

  if (!usedWords[randomCategory].includes(randomWord)) {
    usedWords[randomCategory].push(randomWord);
  }

  return {
    word: randomWord.toUpperCase(),
    category: randomCategory,
    length: randomLength,
  };
};
