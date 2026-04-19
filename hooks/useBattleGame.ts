import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CellStatus, Row, BattleMove } from "../types";
import { isValidWord } from "../utils/wordUtils";
import { multiplayerService } from "../services/multiplayerService";
import Toast from "react-native-toast-message";

interface UseBattleGameProps {
  roomId: string;
  userId: string;
  secretWord: string;
  onWin: (userId: string) => void;
  onOpponentMove: (payload: BattleMove) => void;
}

interface UseBattleGameReturn {
  grid: Row[];
  currentRow: number;
  currentGuess: string;
  isGameOver: boolean;
  handleKeyPress: (key: string) => void;
}

export const useBattleGame = ({
  roomId,
  userId,
  secretWord,
  onWin,
  onOpponentMove
}: UseBattleGameProps): UseBattleGameReturn => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [grid, setGrid] = useState<Row[]>(
    new Array(6).fill(null).map((_, i) => ({
      id: `row-${i}`,
      cells: new Array(secretWord.length).fill(null).map(() => ({
        char: "",
        status: "empty",
      })),
    }))
  );

  const wordLength = secretWord.length;

  // Realtime Broadcast Channel
  useEffect(() => {
    const channel = supabase.channel(`battle:${roomId}`)
      .on('broadcast', { event: 'move' }, ({ payload }: { payload: BattleMove }) => {
        if (payload.userId !== userId) {
          onOpponentMove(payload);
        }
      })
      .on('broadcast', { event: 'win' }, ({ payload }) => {
        setIsGameOver(true);
        onWin(payload.userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, secretWord]);

  const sendMove = (rowIndex: number, statuses: CellStatus[]) => {
    supabase.channel(`battle:${roomId}`).send({
      type: 'broadcast',
      event: 'move',
      payload: {
        userId,
        rowIndex,
        pattern: statuses
      }
    });
  };

  const sendWin = async () => {
    // Önce DB'yi güncelle (Tie-breaker logic)
    await multiplayerService.setWinner(roomId, userId);
    
    // Sonra Broadcaster ile ilan et (Anlık efekt için)
    supabase.channel(`battle:${roomId}`).send({
      type: 'broadcast',
      event: 'win',
      payload: { userId }
    });
  };

  const handleKeyPress = (key: string) => {
    if (isGameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length === wordLength) {
        if (!isValidWord(currentGuess)) {
           Toast.show({ type: 'error', text1: 'Geçersiz Kelime' });
           return;
        }

        const targetChars = secretWord.split("");
        const guessChars = currentGuess.split("");
        const statuses: CellStatus[] = Array(wordLength).fill("absent");
        const remainingCounts: Record<string, number> = {};

        targetChars.forEach(c => remainingCounts[c] = (remainingCounts[c] || 0) + 1);
        guessChars.forEach((c, i) => {
          if (c === targetChars[i]) {
            statuses[i] = "correct";
            remainingCounts[c]--;
          }
        });
        guessChars.forEach((c, i) => {
          if (statuses[i] !== "correct" && remainingCounts[c] > 0 && targetChars.includes(c)) {
            statuses[i] = "present";
            remainingCounts[c]--;
          }
        });

        const newGrid = [...grid];
        newGrid[currentRow] = {
          ...newGrid[currentRow],
          cells: guessChars.map((char, index) => ({ char, status: statuses[index] }))
        };
        setGrid(newGrid);

        // Send move to opponent
        sendMove(currentRow, statuses);

        if (currentGuess === secretWord) {
          sendWin();
          onWin(userId);
          setIsGameOver(true);
        } else if (currentRow === 5) {
          setIsGameOver(true);
          // Lose logic handled by checking if opponent wins
        } else {
          setCurrentRow(prev => prev + 1);
          setCurrentGuess("");
        }
      }
    } else if (key === "⌫") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key);
    }
  };

  return {
    grid,
    currentRow,
    currentGuess,
    isGameOver,
    handleKeyPress
  };
};
