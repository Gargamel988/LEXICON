import { useCallback, useMemo, useState } from "react";
import { CellData, CellStatus } from "../types";

interface UseMultiWordGameProps {
  words: string[];
  wordLength: number;
  maxRows?: number;
  onSuccess?: (stats: any) => void;
  onFail?: (stats: any) => void;
  onCombo?: (multiplier: number) => void;
}

export const useMultiWordGame = ({
  words,
  wordLength,
  maxRows = 9,
  onSuccess,
  onFail,
  onCombo,
}: UseMultiWordGameProps) => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [excludedChars, setExcludedChars] = useState<string[]>([]);

  // Each word has its own grid
  const [grids, setGrids] = useState<CellData[][][]>(
    words.map(() =>
      Array.from({ length: maxRows }, () =>
        Array(wordLength).fill({ char: "", status: "empty" }),
      ),
    ),
  );

  const [solvedStates, setSolvedStates] = useState<boolean[]>(
    words.map(() => false),
  );

  const [solvedAtRow, setSolvedAtRow] = useState<(number | null)[]>(
    words.map(() => null),
  );

  const [revealedHints, setRevealedHints] = useState<number[][]>(
    words.map(() => []),
  );

  // Keyboard statuses for each word
  const letterStatusesArray = useMemo(() => {
    return grids.map((grid, wordIndex) => {
      const statuses: Record<string, CellStatus> = {};

      // First, add the revealed hints
      revealedHints[wordIndex].forEach((letterIndex) => {
        const char = words[wordIndex][letterIndex];
        statuses[char] = "correct";
      });

      grid.slice(0, currentRow).forEach((row) => {
        row.forEach((cell) => {
          const { char, status } = cell;
          if (status === "correct") statuses[char] = "correct";
          else if (status === "present" && statuses[char] !== "correct")
            statuses[char] = "present";
          else if (status === "absent" && !statuses[char])
            statuses[char] = "absent";
        });
      });

      excludedChars.forEach((char) => {
        if (!statuses[char]) statuses[char] = "absent";
      });

      return statuses;
    });
  }, [grids, currentRow, revealedHints, words, excludedChars]);

  const resetGameStates = useCallback(
    (newWords: string[], newLength: number, newRows: number = 9) => {
      setGrids(
        newWords.map(() =>
          Array.from({ length: newRows }, () =>
            Array(newLength).fill({ char: "", status: "empty" }),
          ),
        ),
      );
      setSolvedStates(newWords.map(() => false));
      setSolvedAtRow(newWords.map(() => null));
      setRevealedHints(newWords.map(() => []));
      setExcludedChars([]);
      setCurrentRow(0);
      setCurrentGuess("");
      setIsWaiting(false);
      setIsGameOver(false);
    },
    [],
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isGameOver || isWaiting) return;

      if (key === "ENTER") {
        if (currentGuess.length === wordLength) {
          const newGrids = [...grids];
          const newSolvedStates = [...solvedStates];
          const newSolvedAtRow = [...solvedAtRow];

          words.forEach((word, wordIndex) => {
            if (newSolvedStates[wordIndex]) return;

            const targetChars = word.split("");
            const guessChars = currentGuess.split("");
            const statuses: CellStatus[] = Array(wordLength).fill("absent");
            const remainingCounts: Record<string, number> = {};

            targetChars.forEach((char) => {
              remainingCounts[char] = (remainingCounts[char] || 0) + 1;
            });

            guessChars.forEach((char, index) => {
              if (char === targetChars[index]) {
                statuses[index] = "correct";
                remainingCounts[char]--;
              }
            });

            guessChars.forEach((char, index) => {
              if (statuses[index] !== "correct" && remainingCounts[char] > 0) {
                if (targetChars.includes(char)) {
                  statuses[index] = "present";
                  remainingCounts[char]--;
                }
              }
            });

            newGrids[wordIndex][currentRow] = guessChars.map((char, index) => ({
              char,
              status: statuses[index],
            }));

            if (currentGuess === word) {
              newSolvedStates[wordIndex] = true;
              newSolvedAtRow[wordIndex] = currentRow + 1;
              // Success feedback
            }
          });

          // Combo Detection
          const freshlySolvedCount = newSolvedStates.filter(
            (s, i) => !solvedStates[i] && s,
          ).length;
          if (freshlySolvedCount > 1) {
            onCombo?.(freshlySolvedCount);
          }

          // Domino Effect Logic
          const freshlySolvedIndices = words
            .map((_, i) => i)
            .filter((i) => !solvedStates[i] && newSolvedStates[i]);

          if (freshlySolvedIndices.length > 0) {
            const newRevealedHints = [...revealedHints];

            freshlySolvedIndices.forEach((solvedIdx) => {
              // Find the next unsolved word index (circular search)
              let targetIndex = -1;
              for (let i = 1; i < words.length; i++) {
                const nextIdx = (solvedIdx + i) % words.length;
                if (!newSolvedStates[nextIdx]) {
                  targetIndex = nextIdx;
                  break;
                }
              }

              if (targetIndex !== -1) {
                const targetWord = words[targetIndex];
                const possibleIndices = [];
                for (let j = 0; j < wordLength; j++) {
                  // Check if it's already guessed correctly in any row or already revealed
                  const isCorrect = newGrids[targetIndex].some(
                    (r) => r[j].status === "correct",
                  );
                  if (
                    !isCorrect &&
                    !newRevealedHints[targetIndex].includes(j)
                  ) {
                    possibleIndices.push(j);
                  }
                }

                if (possibleIndices.length > 0) {
                  const revealedIdx =
                    possibleIndices[
                      Math.floor(Math.random() * possibleIndices.length)
                    ];
                  newRevealedHints[targetIndex] = [
                    ...newRevealedHints[targetIndex],
                    revealedIdx,
                  ];

                  // Fill future rows in the grid with this revealed letter
                  for (let row = currentRow + 1; row < maxRows; row++) {
                    newGrids[targetIndex][row][revealedIdx] = {
                      char: targetWord[revealedIdx],
                      status: "correct",
                    };
                  }
                }
              }
            });
            setRevealedHints(newRevealedHints);
          }

          setGrids(newGrids);
          setSolvedStates(newSolvedStates);
          setSolvedAtRow(newSolvedAtRow);

          const totalSolved = newSolvedStates.filter((s) => s).length;
          const isGameWon = totalSolved === words.length;

          if (isGameWon) {
            setIsWaiting(true);
            setIsGameOver(true);
            onSuccess?.({
              solvedAtRow: newSolvedAtRow,
              totalAttempts: currentRow + 1,
            });
          } else if (currentRow === maxRows - 1) {
            setIsWaiting(true);
            setIsGameOver(true);
            onFail?.({
              solvedAtRow: newSolvedAtRow,
              totalAttempts: maxRows,
              words,
            });
          } else {
            setCurrentRow((prev) => prev + 1);
            setCurrentGuess("");
          }
        }
      } else if (key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < wordLength) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [
      currentGuess,
      currentRow,
      grids,
      isGameOver,
      isWaiting,
      solvedStates,
      words,
      wordLength,
      maxRows,
      revealedHints,
      onSuccess,
      onFail,
      onCombo,
    ],
  );

  const addHintToGrid = useCallback(
    (wordIndex: number) => {
      if (wordIndex < 0 || wordIndex >= words.length || solvedStates[wordIndex])
        return null;

      const targetWord = words[wordIndex];
      const possibleIndices = [];
      for (let j = 0; j < wordLength; j++) {
        const isCorrect = grids[wordIndex].some(
          (r) => r[j].status === "correct",
        );
        if (!isCorrect && !revealedHints[wordIndex].includes(j)) {
          possibleIndices.push(j);
        }
      }

      if (possibleIndices.length > 0) {
        const revealedIdx =
          possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
        const newRevealedHints = [...revealedHints];
        newRevealedHints[wordIndex] = [
          ...newRevealedHints[wordIndex],
          revealedIdx,
        ];
        setRevealedHints(newRevealedHints);

        // Update future rows
        const newGrids = [...grids];
        for (let row = currentRow; row < maxRows; row++) {
          newGrids[wordIndex][row][revealedIdx] = {
            char: targetWord[revealedIdx],
            status: "correct",
          };
        }
        setGrids(newGrids);
        return targetWord[revealedIdx];
      }
      return null;
    },
    [
      words,
      wordLength,
      grids,
      revealedHints,
      currentRow,
      maxRows,
      solvedStates,
    ],
  );

  const addLightning = useCallback(
    (wordIndex: number) => {
      if (wordIndex < 0 || wordIndex >= words.length || solvedStates[wordIndex])
        return false;

      const targetWord = words[wordIndex];
      const newRevealedHints = [...revealedHints];
      const indicesToReveal = [0, wordLength - 1];

      indicesToReveal.forEach((idx) => {
        if (!newRevealedHints[wordIndex].includes(idx)) {
          newRevealedHints[wordIndex].push(idx);
        }
      });

      setRevealedHints(newRevealedHints);

      const newGrids = [...grids];
      indicesToReveal.forEach((idx) => {
        for (let row = currentRow; row < maxRows; row++) {
          newGrids[wordIndex][row][idx] = {
            char: targetWord[idx],
            status: "correct",
          };
        }
      });
      setGrids(newGrids);
      return true;
    },
    [
      words,
      wordLength,
      grids,
      revealedHints,
      currentRow,
      maxRows,
      solvedStates,
    ],
  );

  const useMultiBomb = useCallback((bombs: string[]) => {
    setExcludedChars((prev) => [...prev, ...bombs]);
  }, []);

  return {
    grids,
    currentRow,
    currentGuess,
    isWaiting,
    isGameOver,
    letterStatusesArray,
    handleKeyPress,
    resetGameStates,
    solvedStates,
    solvedAtRow,
    addHintToGrid,
    addLightning,
    useMultiBomb,
  };
};
