import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CellData, CellStatus } from "../types";
import { toUpperTurkish } from "../utils/stringUtils";

interface UseWordGameProps {
  word: string;
  wordLength: number;
  maxRows?: number;
  onSuccess?: (points: number, attempts: number) => void;
  onFail?: (attempts: number) => void;
  onScoreUpdate?: (points: number) => void;
  isBlind?: boolean;
  isRadarActive?: boolean;
}

export const useWordGame = ({
  word,
  wordLength,
  maxRows = 6,
  onSuccess,
  onFail,
  onScoreUpdate,
  isBlind = false,
  isRadarActive = false,
}: UseWordGameProps) => {
  const generateRow = useCallback(
    (length: number, index: number) => ({
      id: `row-${Math.random().toString(36).substr(2, 9)}-${index}`,
      cells: Array(length).fill({ char: "", status: "empty" }),
    }),
    [],
  );

  const [grid, setGrid] = useState<{ id: string; cells: CellData[] }[]>(
    Array.from({ length: maxRows }, (_, i) => generateRow(wordLength, i)),
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintStatuses, setHintStatuses] = useState<
    Record<string, "correct" | "absent">
  >({});
  const [lastFeedback, setLastFeedback] = useState<{
    correctPos: number;
    correctLetters: number;
  } | null>(null);
  const [bonusRows, setBonusRows] = useState(0);
  const [isRiskModeActive, setIsRiskModeActive] = useState(false);
  const [penaltyRows, setPenaltyRows] = useState(0);
  const [jokerStatuses, setJokerStatuses] = useState<
    Record<string, CellStatus>
  >({});

  const currentGuessRef = useRef(currentGuess);
  const wordRef = useRef(word);
  const wordLengthRef = useRef(wordLength);
  const isWaitingRef = useRef(isWaiting);
  const isGameOverRef = useRef(isGameOver);
  const currentRowRef = useRef(currentRow);
  const gridRef = useRef(grid);
  const isRiskModeActiveRef = useRef(isRiskModeActive);
  const penaltyRowsRef = useRef(penaltyRows);

  useEffect(() => {
    currentGuessRef.current = currentGuess;
    wordRef.current = word;
    wordLengthRef.current = wordLength;
    isWaitingRef.current = isWaiting;
    isGameOverRef.current = isGameOver;
    currentRowRef.current = currentRow;
    gridRef.current = grid;
    isRiskModeActiveRef.current = isRiskModeActive;
    penaltyRowsRef.current = penaltyRows;
  }, [
    currentGuess,
    word,
    wordLength,
    isWaiting,
    isGameOver,
    currentRow,
    grid,
    isRiskModeActive,
    penaltyRows,
  ]);

  // Calculate keyboard letter statuses efficiently
  const letterStatuses = useMemo(() => {
    // Start with clues from power-ups (always visible)
    const statuses: Record<string, CellStatus> = {
      ...hintStatuses,
      ...jokerStatuses,
    };

    // In Blind Mode, normally we ONLY show hintStatuses (Magnet, First Letter, etc.).
    // Grid feedback (guesses) is only shown IF Radar is active.
    if (isBlind) {
      if (!isRadarActive) return statuses;

      // If Radar is active, overlay grid feedback
      grid.slice(0, currentRow).forEach((row) => {
        row.cells.forEach((cell) => {
          if (cell.char && cell.status) {
            const char = toUpperTurkish(cell.char);
            const currentStatus = statuses[char];
            if (
              !currentStatus ||
              currentStatus === "absent" ||
              (currentStatus === "present" && cell.status === "correct")
            ) {
              statuses[char] = cell.status;
            }
          }
        });
      });
      return statuses;
    }

    grid.slice(0, currentRow).forEach((row) => {
      row.cells.forEach((cell) => {
        const { char, status } = cell;
        if (!char) return;

        const upperChar = toUpperTurkish(char);
        if (status === "correct") {
          statuses[upperChar] = "correct";
        } else if (status === "present" && statuses[upperChar] !== "correct") {
          statuses[upperChar] = "present";
        } else if (status === "absent" && !statuses[upperChar]) {
          statuses[upperChar] = "absent";
        }
      });
    });
    return statuses;
  }, [grid, currentRow, hintStatuses, jokerStatuses, isBlind, isRadarActive]);

  const resetGameStates = useCallback(
    (newRows: number = maxRows, newLength: number = wordLength) => {
      setGrid(
        Array.from({ length: newRows }, (_, i) => generateRow(newLength, i)),
      );
      setCurrentRow(0);
      setCurrentGuess("");
      setIsGameOver(false);
      setIsWaiting(false);
      setLastFeedback(null);
      setHintStatuses({});
      setJokerStatuses({});
      setBonusRows(0);
      setPenaltyRows(0);
      setIsRiskModeActive(false);
    },
    [maxRows, wordLength],
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      const currentWordValue = wordRef.current;
      const currentGuessValue = currentGuessRef.current;
      const isGameOverValue = isGameOverRef.current;
      const isWaitingValue = isWaitingRef.current;
      const currentRowValue = currentRowRef.current;
      const gridValue = gridRef.current;

      if (isGameOverValue || isWaitingValue) return;

      if (key === "ENTER") {
        if (currentGuessValue.length === wordLengthRef.current) {
          const targetChars = currentWordValue.split("");
          const guessChars = currentGuessValue.split("");
          const statuses: CellStatus[] = Array(wordLengthRef.current).fill(
            "absent",
          );
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

          let riskPenalty = false;
          let riskReward = false;

          const normalizedGuess = currentGuessValue.trim().toUpperCase();
          const normalizedWord = currentWordValue.trim().toUpperCase();

          if (isRiskModeActiveRef.current) {
            if (normalizedGuess === normalizedWord) {
              riskReward = true;
            } else {
              riskPenalty = true;
            }
            setIsRiskModeActive(false);
          }
          let roundScore = 0;
          const finalGrid = [...gridValue];
          finalGrid[currentRowValue] = {
            ...finalGrid[currentRowValue],
            cells: guessChars.map((char, index) => {
              const status = statuses[index];
              if (status === "correct") roundScore += 10;
              else if (status === "present") roundScore += 5;
              return { char, status };
            }),
          };

          if (riskReward) {
            finalGrid.push(
              generateRow(wordLengthRef.current, finalGrid.length),
            );
            setBonusRows((prev) => prev + 1);
          }

          if (normalizedGuess === normalizedWord) {
            setGrid(finalGrid);
            setIsWaiting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const baseBonus = 100;
            const multiplier = maxRows - currentRowValue;
            const totalPoints = roundScore + baseBonus * multiplier;
            onSuccess?.(totalPoints, currentRowValue + 1);
          } else {
            const correctPos = statuses.filter((s) => s === "correct").length;
            const correctLetters = statuses.filter(
              (s) => s === "correct" || s === "present",
            ).length;
            setLastFeedback({ correctPos, correctLetters });

            const currentMaxRows = maxRows + bonusRows - penaltyRowsRef.current;
            if (
              currentRowValue >= currentMaxRows - 1 ||
              (riskPenalty && currentRowValue >= currentMaxRows - 2)
            ) {
              setGrid(finalGrid);
              setIsWaiting(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              onScoreUpdate?.(roundScore - 100);
              onFail?.(currentRowValue + 1);
            } else {
              onScoreUpdate?.(roundScore);

              setGrid(finalGrid);
              if (riskPenalty) {
                // Skips an extra row as penalty (current + next)
                setCurrentRow((prev) => prev + 2);
              } else {
                setCurrentRow((prev) => prev + 1);
              }

              setCurrentGuess("");
            }
          }
        }
      } else if (key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        currentGuessValue.length < wordLengthRef.current &&
        key !== "ENTER"
      ) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [wordLength, maxRows, bonusRows, onSuccess, onFail, onScoreUpdate],
  );

  const getHint = () => {
    // Henüz yeşil olmayan harfleri bul
    const unknownIndices = word
      .split("")
      .map((char, i) => ({ char, i }))
      .filter(({ char }) => letterStatuses[char] !== "correct");

    if (unknownIndices.length === 0) return;

    // Rastgele birini seç ve 'correct' olarak işaretle
    const randomPick =
      unknownIndices[Math.floor(Math.random() * unknownIndices.length)];
    setHintStatuses((prev) => ({ ...prev, [randomPick.char]: "correct" }));
  };

  const addHint = (char: string, status: "correct" | "absent" = "correct") => {
    if (!char) return;
    setHintStatuses((prev) => ({ ...prev, [toUpperTurkish(char)]: status }));
  };
  const useBomb = () => {
    const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");
    const wordUpper = toUpperTurkish(word);
    const wordSet = new Set(wordUpper.split(""));

    // Kelimede olmayan ve henüz ellenmemiş harfleri listele
    // Only pick letters that are NOT in the word AND do not have a status yet on the keyboard
    const candidates = alphabet.filter(
      (char) => !wordSet.has(char) && !letterStatuses[char],
    );

    if (candidates.length === 0) return;

    // Rastgele 3 tanesini seç (veya kalan kaç taneyse)
    const toEliminate = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);

    const newHints = { ...hintStatuses };
    toEliminate.forEach((char) => {
      newHints[char] = "absent";
    });
    setHintStatuses(newHints);
  };

  const useJoker = (char: string) => {
    if (!char) return;
    const upperChar = toUpperTurkish(char);
    const upperWord = toUpperTurkish(word);

    // Check if letter exists in word
    const exists = upperWord.includes(upperChar);
    const status = exists ? "present" : "absent";

    setJokerStatuses((prev) => ({ ...prev, [upperChar]: status }));
  };

  const useVeto = useCallback(() => {
    if (currentRowRef.current === 0) return;

    const targetRow = currentRowRef.current - 1;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[targetRow] = {
        ...newGrid[targetRow],
        cells: Array(wordLengthRef.current).fill({
          char: "",
          status: "empty",
        }),
      };
      return newGrid;
    });

    setCurrentRow((prev) => prev - 1);
    setCurrentGuess("");
  }, [onScoreUpdate]); // onScoreUpdate and others are already in handleKeyPress deps, adding what's needed for safety

  const addExtraAttempt = useCallback(() => {
    setBonusRows((prev) => prev + 1);
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid.push(generateRow(wordLengthRef.current, newGrid.length));
      return newGrid;
    });
  }, [wordLength]);

  useEffect(() => {
    isRiskModeActiveRef.current = isRiskModeActive;
  }, [isRiskModeActive]);

  return {
    grid,
    currentRow,
    currentGuess,
    isWaiting,
    setIsWaiting,
    isGameOver,
    setIsGameOver,
    letterStatuses,
    handleKeyPress,
    resetGameStates,
    setGrid,
    getHint,
    addHint,
    addExtraAttempt,
    useBomb,
    useJoker,
    useVeto,
    isRiskModeActive,
    setIsRiskModeActive,
    lastFeedback,
    maxRows: maxRows + bonusRows - penaltyRows,
  };
};
