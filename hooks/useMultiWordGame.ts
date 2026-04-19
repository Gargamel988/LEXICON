import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { CellStatus, Row } from "../types";
import { toUpperTurkish } from "../utils/stringUtils";
import { isValidWord } from "../utils/wordUtils";

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
  const [analysisStatusesArray, setAnalysisStatusesArray] = useState<
    Record<string, CellStatus>[]
  >(words.map(() => ({})));

  // Each word has its own grid (using Row[] for unique IDs)
  const [grids, setGrids] = useState<Row[][]>(
    words.map((_, wordIndex) =>
      new Array(maxRows).fill(null).map((_, rowIndex) => ({
        id: `grid-${wordIndex}-row-${rowIndex}`,
        cells: new Array(wordLength).fill(null).map(() => ({
          char: "",
          status: "empty",
        })),
      })),
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
      const statuses: Record<string, CellStatus> = {
        ...analysisStatusesArray[wordIndex],
      };
      const targetWord = words[wordIndex];

      if (!targetWord) return statuses;

      // First, add the revealed hints
      const currentHints = revealedHints[wordIndex] || [];
      currentHints.forEach((letterIndex) => {
        const char = targetWord[letterIndex];
        if (char) statuses[char] = "correct";
      });

      grid.slice(0, currentRow).forEach((row) => {
        row.cells.forEach((cell) => {
          const { char, status } = cell;
          if (!char) return;
          const upper = toUpperTurkish(char);
          if (status === "correct") statuses[upper] = "correct";
          else if (status === "present" && statuses[upper] !== "correct")
            statuses[upper] = "present";
          else if (status === "absent" && !statuses[upper])
            statuses[upper] = "absent";
        });
      });

      excludedChars.forEach((char) => {
        if (!statuses[char]) statuses[char] = "absent";
      });

      return statuses;
    });
  }, [
    grids,
    currentRow,
    revealedHints,
    words,
    excludedChars,
    analysisStatusesArray,
  ]);

  const resetGameStates = useCallback(
    (newWords: string[], newLength: number, newRows: number = 9) => {
      setGrids(
        newWords.map((_, wordIndex) =>
          new Array(newRows).fill(null).map((_, rowIndex) => ({
            id: `grid-reset-${wordIndex}-row-${rowIndex}`,
            cells: new Array(newLength).fill(null).map(() => ({
              char: "",
              status: "empty",
            })),
          })),
        ),
      );
      setSolvedStates(newWords.map(() => false));
      setSolvedAtRow(newWords.map(() => null));
      setRevealedHints(newWords.map(() => []));
      setExcludedChars([]);
      setAnalysisStatusesArray(newWords.map(() => ({})));
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
          if (!isValidWord(currentGuess)) {
            Toast.show({
              type: "error",
              text1: "Geçersiz Kelime",
              text2: "Kelime dağarcığımızda bulunmuyor.",
              position: "top",
              visibilityTime: 2000,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
          }
          const newGrids = grids.map((g) => [...g]);
          const newSolvedStates = [...solvedStates];
          const newSolvedAtRow = [...solvedAtRow];
          const newRevealedHints = [...revealedHints];

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

            newGrids[wordIndex][currentRow] = {
              ...newGrids[wordIndex][currentRow],
              cells: guessChars.map((char, index) => ({
                char,
                status: statuses[index],
              })),
            };

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
                    (r) => r.cells[j].status === "correct",
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
        // Clear analysis colors if any in current row
        const hasAnalysis = grids.some(
          (g) => g[currentRow].cells[0].status !== "empty",
        );
        if (hasAnalysis) {
          setGrids((prev) =>
            prev.map((grid) => {
              const newGrid = [...grid];
              newGrid[currentRow] = {
                id: `multi-clear-${Math.random().toString(36).substr(2, 9)}-${currentRow}`,
                cells: Array(wordLength).fill({ char: "", status: "empty" }),
              };
              return newGrid;
            }),
          );
        }
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < wordLength) {
        // Clear analysis colors if any before adding a new char
        const hasAnalysis = grids.some(
          (g) => g[currentRow].cells[0].status !== "empty",
        );
        if (hasAnalysis) {
          setGrids((prev) =>
            prev.map((grid) => {
              const newGrid = [...grid];
              newGrid[currentRow] = {
                id: `multi-clear-${Math.random().toString(36).substr(2, 9)}-${currentRow}`,
                cells: Array(wordLength).fill({ char: "", status: "empty" }),
              };
              return newGrid;
            }),
          );
        }
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
          (r) => r.cells[j].status === "correct",
        );
        if (!isCorrect && !revealedHints[wordIndex].includes(j)) {
          possibleIndices.push(j);
        }
      }

      if (possibleIndices.length > 0) {
        const revealedIdx =
          possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
        setRevealedHints((prev) => {
          const next = [...prev];
          next[wordIndex] = [...(prev[wordIndex] || []), revealedIdx];
          return next;
        });

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

      const newGrids = grids.map((g) => [...g]);
      const targetGrid = newGrids[wordIndex];
      const targetRow = { ...targetGrid[currentRow] };
      const newCells = [...targetRow.cells];

      indicesToReveal.forEach((idx) => {
        if (!newRevealedHints[wordIndex].includes(idx)) {
          newRevealedHints[wordIndex].push(idx);
          newCells[idx] = {
            char: words[wordIndex][idx].toUpperCase(),
            status: "correct",
          };
        }
      });

      targetRow.cells = newCells;
      targetGrid[currentRow] = targetRow;
      setGrids(newGrids);

      setRevealedHints(newRevealedHints);
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

  const useMultiAnalysis = useCallback(() => {
    if (currentGuess.length !== wordLength) {
      Toast.show({
        type: "error",
        text1: "Eksik Kelime",
        text2: `Analiz için ${wordLength} harf yazmalısın.`,
      });
      return false;
    }

    const newGrids = grids.map((g) => [...g]);

    words.forEach((word, wordIndex) => {
      if (solvedStates[wordIndex]) return;

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

      newGrids[wordIndex][currentRow] = {
        ...newGrids[wordIndex][currentRow],
        cells: guessChars.map((char, index) => ({
          char,
          status: statuses[index],
        })),
      };
    });

    // Persistent keyboard update
    setAnalysisStatusesArray((prev) => {
      const next = [...prev];
      words.forEach((word, wordIndex) => {
        if (solvedStates[wordIndex]) return;
        const targetChars = word.split("");
        const guessChars = currentGuess.split("");
        const currentStatuses = { ...(next[wordIndex] || {}) };

        const remainingCounts: Record<string, number> = {};
        targetChars.forEach(
          (c) => (remainingCounts[c] = (remainingCounts[c] || 0) + 1),
        );

        const results: CellStatus[] = Array(wordLength).fill("absent");
        guessChars.forEach((c, idx) => {
          if (c === targetChars[idx]) {
            results[idx] = "correct";
            remainingCounts[c]--;
          }
        });
        guessChars.forEach((c, idx) => {
          if (
            results[idx] !== "correct" &&
            remainingCounts[c] > 0 &&
            targetChars.includes(c)
          ) {
            results[idx] = "present";
            remainingCounts[c]--;
          }
        });

        guessChars.forEach((char, idx) => {
          const status = results[idx];
          const upper = toUpperTurkish(char);
          if (status === "correct") currentStatuses[upper] = "correct";
          else if (status === "present" && currentStatuses[upper] !== "correct")
            currentStatuses[upper] = "present";
          else if (!currentStatuses[upper]) currentStatuses[upper] = "absent";
        });
        next[wordIndex] = currentStatuses;
      });
      return next;
    });

    setGrids(newGrids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-clear after 2 seconds with new IDs
    setTimeout(() => {
      setGrids((prev) => {
        const hasAnalysis = prev.some(
          (g) =>
            g[currentRow] &&
            g[currentRow].cells.some((c) => c.status !== "empty"),
        );
        if (!hasAnalysis) return prev;

        return prev.map((grid) => {
          const newGrid = [...grid];
          newGrid[currentRow] = {
            id: `multi-clear-${Math.random().toString(36).substr(2, 9)}-${currentRow}`,
            cells: Array(wordLength).fill({ char: "", status: "empty" }),
          };
          return newGrid;
        });
      });
    }, 2000);

    return true;
  }, [currentGuess, words, wordLength, grids, currentRow, solvedStates]);

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
    useMultiAnalysis,
  };
};
