export const XP_THRESHOLD_BASE = 3000;
export const XP_THRESHOLD_INCREMENT = 1000;

export const TITLE_REWARDS: Record<number, string> = {
  5: 'title_rookie',
  10: 'title_hunter',
  15: 'title_veteran',
  20: 'title_champion',
  25: 'title_lexicon',
  30: 'title_perfect',
  40: 'title_wordsmith',
  50: 'title_legend',
};

export const TITLE_LABELS: Record<number, string> = {
  5: 'Acemi Avcı',
  10: 'Kelime Avcısı',
  15: 'Deneyimli',
  20: 'Şampiyon',
  25: 'Leksikograf',
  30: 'Kusursuz',
  40: 'Kelime Ustası',
  50: 'Efsane',
};

export const getLevelInfo = (currentXp: number) => {
  let currentLevel = 1;
  let xpThreshold = XP_THRESHOLD_BASE;
  let cumulativeXp = 0;

  while (currentXp >= cumulativeXp + xpThreshold) {
    cumulativeXp += xpThreshold;
    currentLevel++;
    xpThreshold += XP_THRESHOLD_INCREMENT;
  }

  const nextLevelThreshold = xpThreshold;
  const progressXp = currentXp - cumulativeXp;
  const progress = Math.min(Math.max(progressXp / nextLevelThreshold, 0), 1);

  return {
    level: currentLevel,
    progress,
    currentXp: progressXp,
    nextLevelXp: nextLevelThreshold,
    totalXpToNext: cumulativeXp + xpThreshold
  };
};
