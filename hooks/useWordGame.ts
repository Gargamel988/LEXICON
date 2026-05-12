import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { CellStatus, Row } from "../types";
import { toUpperTurkish } from "../utils/stringUtils";
import { isValidWord } from "../utils/wordUtils";
import { useFairPlay } from "./useFairPlay";

interface UseWordGameProps {
  word: string;
  wordLength: number;
  maxRows?: number;
  onSuccess?: (
    points: number,
    attempts: number,
    fairPlayData: {
      isFairPlay: boolean;
      backgroundCount: number;
      backgroundTotalTime: number;
    },
  ) => void;
  onFail?: (
    attempts: number,
    fairPlayData: {
      isFairPlay: boolean;
      backgroundCount: number;
      backgroundTotalTime: number;
    },
  ) => void;
  onScoreUpdate?: (points: number) => void;
  onRiskExecuted?: () => void;
  onRiskSuccess?: () => void;
  onFairPlayViolation?: (reason: string) => void;
  isBlind?: boolean;
  isRadarActive?: boolean;
  /** Sadece true olduğunda arka plan tespiti çalışır (oyun aktifken, settings modal kapalıyken) */
  isActive?: boolean;
}

export const useWordGame = ({
  word,
  wordLength,
  maxRows = 6,
  onSuccess,
  onFail,
  onScoreUpdate,
  onRiskExecuted,
  onRiskSuccess,
  onFairPlayViolation,
  isBlind = false,
  isRadarActive = false,
  isActive = true, // Varsayılan true: mevcut modlar değişmeden çalışır
}: UseWordGameProps) => {
  const generateRow = useCallback(
    (length: number, index: number) => ({
      id: `row-${Math.random().toString(36).substr(2, 9)}-${index}`,
      cells: Array(length).fill({ char: "", status: "empty" }),
    }),
    [],
  );

  const [grid, setGrid] = useState<Row[]>(
    Array.from({ length: maxRows }, (_, i) => generateRow(wordLength, i)),
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hintStatuses, setHintStatuses] = useState<Record<string, CellStatus>>(
    {},
  );
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
  const [analysisStatuses, setAnalysisStatuses] = useState<
    Record<string, CellStatus>
  >({});

  // Fair Play — useFairPlay hook'u ile yönetilir
  const {
    isFairPlay,
    backgroundCount,
    backgroundTotalTime,
    resetFairPlay,
    getFairPlayData,
  } = useFairPlay({
    isActive,
    isGameOver,
    onViolation: onFairPlayViolation,
  });

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
      ...analysisStatuses,
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
      setAnalysisStatuses({});
      resetFairPlay(); // useFairPlay sıfırlama
    },
    [maxRows, wordLength, resetFairPlay],
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
          if (!isValidWord(currentGuessValue)) {
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
            onRiskExecuted?.(); // Notify consumption
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

          if (normalizedGuess === normalizedWord) {
            setGrid(finalGrid);
            setIsWaiting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const baseBonus = 100;
            const multiplier = maxRows - currentRowValue;
            let totalPoints = roundScore + baseBonus * multiplier;
            if (riskReward) {
              totalPoints *= 2;
              onRiskSuccess?.();
            }
            onSuccess?.(totalPoints, currentRowValue + 1, getFairPlayData());
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
              onFail?.(currentRowValue + 1, getFairPlayData());
            } else {
              onScoreUpdate?.(roundScore);

              if (riskPenalty) {
                // Penalty: current row stays as clues, but last row is deleted
                setPenaltyRows((prev) => prev + 1);

                let updatedGrid = [...gridValue];
                // Remove the last row as penalty
                if (updatedGrid.length > 0) {
                  updatedGrid.pop();
                }

                setGrid(updatedGrid);
                setCurrentRow((prev) => prev + 1);

                Toast.show({
                  type: "error",
                  text1: "Risk Başarısız!",
                  text2: "En alttan bir hak kaybettin!",
                  position: "top",
                  visibilityTime: 3000,
                });
              } else {
                setGrid(finalGrid);
                setCurrentRow((prev) => prev + 1);
              }

              setCurrentGuess("");
            }
          }
        }
      } else if (key === "⌫") {
        // Clear analysis colors if any
        const currentRowCells = gridValue[currentRowValue].cells;
        if (currentRowCells.some((c) => c.status !== "empty")) {
          setGrid((prev) => {
            const next = [...prev];
            next[currentRowValue] = {
              id: `clear-${Math.random().toString(36).substr(2, 9)}-${currentRowValue}`,
              cells: Array(wordLengthRef.current).fill({
                char: "",
                status: "empty",
              }),
            };
            return next;
          });
        }
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        currentGuessValue.length < wordLengthRef.current &&
        key !== "ENTER"
      ) {
        // Clear analysis colors if any before adding a new char
        const currentRowCells = gridValue[currentRowValue].cells;
        if (currentRowCells.some((c) => c.status !== "empty")) {
          setGrid((prev) => {
            const next = [...prev];
            next[currentRowValue] = {
              id: `clear-${Math.random().toString(36).substr(2, 9)}-${currentRowValue}`,
              cells: Array(wordLengthRef.current).fill({
                char: "",
                status: "empty",
              }),
            };
            return next;
          });
        }
        setCurrentGuess((prev) => prev + key);
      }
    },
    [
      wordLength,
      maxRows,
      bonusRows,
      onSuccess,
      onFail,
      onScoreUpdate,
      onRiskExecuted,
    ],
  );

  const getHint = () => {
    // Sadece klavyede durumu olmayan (sarı veya yeşil OLMAYAN) harfleri bul
    const unknownIndices = word
      .split("")
      .map((char, i) => ({ char: toUpperTurkish(char), i }))
      .filter(({ char }) => !letterStatuses[char]);

    if (unknownIndices.length === 0) {
      Toast.show({
        type: "error",
        text1: "İpucu Kullanılamadı",
        text2: "Açılacak yeni bir harf kalmadı.",
        position: "top",
        visibilityTime: 2000,
      });
      return false;
    }

    // Rastgele birini seç ve 'correct' olarak işaretle
    const randomPick =
      unknownIndices[Math.floor(Math.random() * unknownIndices.length)];
    setHintStatuses((prev) => ({ ...prev, [randomPick.char]: "correct" }));
    return true;
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

    if (candidates.length === 0) {
      Toast.show({
        type: "error",
        text1: "Bomba Kullanılamadı",
        text2: "Eleyecek harf kalmadı.",
        position: "top",
        visibilityTime: 2000,
      });
      return false;
    }

    // Rastgele 3 tanesini seç (veya kalan kaç taneyse)
    const toEliminate = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);

    const newHints = { ...hintStatuses };
    toEliminate.forEach((char) => {
      newHints[char] = "absent";
    });
    setHintStatuses(newHints);
    return true;
  };

  const useJoker = (char: string) => {
    if (!char) return false;
    const upperChar = toUpperTurkish(char);
    const upperWord = toUpperTurkish(word);

    // Check if letter exists in word
    const exists = upperWord.includes(upperChar);
    const status = exists ? "present" : "absent";

    setJokerStatuses((prev) => ({ ...prev, [upperChar]: status }));
    return true;
  };

  const useVeto = useCallback(() => {
    if (currentRowRef.current === 0) return false;

    const targetRow = currentRowRef.current - 1;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[targetRow] = {
        id: `row-veto-${Math.random().toString(36).substr(2, 9)}`, // ID'yi değiştirerek komple yeniden mount ettiriyoruz
        cells: Array.from({ length: wordLengthRef.current }, () => ({
          char: "",
          status: "empty",
        })),
      };
      return newGrid;
    });

    setCurrentRow((prev) => prev - 1);
    setCurrentGuess("");
    return true;
  }, [onScoreUpdate]); // onScoreUpdate and others are already in handleKeyPress deps, adding what's needed for safety

  const addExtraAttempt = useCallback(() => {
    setBonusRows((prev) => prev + 1);
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid.push(generateRow(wordLengthRef.current, newGrid.length));
      return newGrid;
    });
  }, [wordLength]);

  const useLightning = useCallback(() => {
    if (!wordRef.current) return false;
    const currentWord = wordRef.current;

    // Update hintStatuses to mark these letters on the keyboard as first and last
    setHintStatuses((prev) => ({
      ...prev,
      [toUpperTurkish(currentWord[0])]: "first",
      [toUpperTurkish(currentWord[currentWord.length - 1])]: "last",
    }));

    return true;
  }, []);
  const useMirror = useCallback(() => {
    if (!wordRef.current) return false;
    const wordUpper = toUpperTurkish(wordRef.current);
    const charArray = wordUpper.split("");
    const uniqueChars = new Set(charArray);
    const hasDuplicates = uniqueChars.size < charArray.length;

    Toast.show({
      type: "info",
      text1: "Ayna Tarandı",
      text2: hasDuplicates
        ? "Bu kelimede aynı harften birden fazla var!"
        : "Bu kelimede her harf benzersiz (tekrar yok).",
      position: "top",
      visibilityTime: 3000,
    });

    return true;
  }, []);

  const useAnalysis = useCallback(() => {
    const currentGuessValue = currentGuessRef.current;
    const currentWordValue = wordRef.current;
    const currentRowValue = currentRowRef.current;
    const wordLen = wordLengthRef.current;

    if (currentGuessValue.length !== wordLen) {
      Toast.show({
        type: "error",
        text1: "Eksik Kelime",
        text2: "Analiz için kelimeyi tamamlamalısın.",
        position: "top",
      });
      return false;
    }

    const targetChars = currentWordValue.split("");
    const guessChars = currentGuessValue.split("");
    const statuses: CellStatus[] = Array(wordLen).fill("absent");
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

    // Permanent keyboard update
    setAnalysisStatuses((prev) => {
      const next = { ...prev };
      guessChars.forEach((char, index) => {
        const status = statuses[index];
        const upperChar = toUpperTurkish(char);
        if (status === "correct") next[upperChar] = "correct";
        else if (status === "present" && next[upperChar] !== "correct")
          next[upperChar] = "present";
        else if (!next[upperChar]) next[upperChar] = "absent";
      });
      return next;
    });

    // Temporary grid update
    setGrid((prev) => {
      const next = [...prev];
      next[currentRowValue] = {
        ...next[currentRowValue],
        cells: guessChars.map((char, index) => ({
          char,
          status: statuses[index],
        })),
      };
      return next;
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-clear after 2 seconds with new ID
    setTimeout(() => {
      setGrid((prev) => {
        // Only clear if still on the same row and it has analysis colors
        if (
          prev[currentRowValue] &&
          prev[currentRowValue].cells.some((c) => c.status !== "empty")
        ) {
          const next = [...prev];
          next[currentRowValue] = {
            id: `row-clear-${Math.random().toString(36).substr(2, 9)}-${currentRowValue}`,
            cells: Array(wordLen).fill({ char: "", status: "empty" }),
          };
          return next;
        }
        return prev;
      });
    }, 2000);

    return true;
  }, []);

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
    useLightning,
    useMirror,
    useAnalysis,
    isRiskModeActive,
    setIsRiskModeActive,
    lastFeedback,
    maxRows: maxRows + bonusRows - penaltyRows,
    isFairPlay,
    backgroundStats: {
      count: backgroundCount,
      totalTime: backgroundTotalTime,
    },
  };
};
