import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabase";
import { multiplayerService } from "../services/multiplayerService";
import { BattleMove, CellStatus, Row } from "../types";
import { isValidWord } from "../utils/wordUtils";

interface UseBattleGameProps {
  roomId: string;
  userId: string;
  secretWord: string;
  onWin: (userId: string) => void;
  onOpponentMove: (payload: BattleMove) => void;
  playerCount: number;
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
  onOpponentMove,
  playerCount,
}: UseBattleGameProps): UseBattleGameReturn => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [failedPlayers, setFailedPlayers] = useState<Set<string>>(new Set());
  const channelRef = useRef<any>(null);
  const [grid, setGrid] = useState<Row[]>(
    new Array(6).fill(null).map((_, i) => ({
      id: `row-${i}`,
      cells: new Array(secretWord.length).fill(null).map(() => ({
        char: "",
        status: "empty",
      })),
    })),
  );

  const wordLength = secretWord.length;

  // Fonksiyon sızıntılarını önlemek için Ref kullanıyoruz
  const onWinRef = useRef(onWin);
  const onOpponentMoveRef = useRef(onOpponentMove);

  useEffect(() => {
    onWinRef.current = onWin;
    onOpponentMoveRef.current = onOpponentMove;
  }, [onWin, onOpponentMove]);

  // Realtime Broadcast Channel
  useEffect(() => {
    // roomId geçici veya boşsa abonelik açma. secretWord henüz gelmediyse (APPLE fallback ise) bekle.
    if (!roomId || !userId || !secretWord || secretWord === "APPLE") {
      return;
    }

    const channel = supabase
      .channel(`battle:${roomId}`)
      .on(
        "broadcast",
        { event: "move" },
        ({ payload }: { payload: BattleMove }) => {
          if (payload.userId !== userId) {
            onOpponentMoveRef.current(payload);
          }
        },
      )
      .on("broadcast", { event: "win" }, ({ payload }) => {
        setIsGameOver(true);
        onWinRef.current(payload.userId);
      })
      .on("broadcast", { event: "fail" }, ({ payload }) => {
        setFailedPlayers((prev) => {
          const next = new Set(prev);
          next.add(payload.userId);
          return next;
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [roomId, userId, secretWord]);

  const sendMove = (rowIndex: number, statuses: CellStatus[]) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "move",
        payload: {
          userId,
          rowIndex,
          pattern: statuses,
        },
      });
    }
  };

  const sendWin = async () => {
    // Önce DB'yi güncelle (Tie-breaker logic)
    await multiplayerService.setWinner(roomId, userId);

    // Sonra Broadcaster ile ilan et (Anlık efekt için)
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "win",
        payload: { userId },
      });
    }
  };

  const sendFail = () => {
    setFailedPlayers((prev) => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "fail",
        payload: { userId },
      });
    }
  };

  // Check for Draw (Infinite Loop Prevention)
  useEffect(() => {
    // Eğer oyun zaten bittiyse veya yeterli oyuncu yoksa işlem yapma
    if (isGameOver || !roomId || roomId === "") return;

    if (playerCount > 0 && failedPlayers.size >= playerCount) {
      setIsGameOver(true);
      multiplayerService.setDraw(roomId);
      onWinRef.current("draw");
    }
  }, [failedPlayers.size, playerCount, roomId, isGameOver]);

  const handleKeyPress = (key: string) => {
    if (isGameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length === wordLength) {
        if (!isValidWord(currentGuess)) {
          Toast.show({ type: "error", text1: "Geçersiz Kelime" });
          return;
        }

        const targetChars = secretWord.split("");
        const guessChars = currentGuess.split("");
        const statuses: CellStatus[] = Array(wordLength).fill("absent");
        const remainingCounts: Record<string, number> = {};

        targetChars.forEach(
          (c) => (remainingCounts[c] = (remainingCounts[c] || 0) + 1),
        );
        guessChars.forEach((c, i) => {
          if (c === targetChars[i]) {
            statuses[i] = "correct";
            remainingCounts[c]--;
          }
        });
        guessChars.forEach((c, i) => {
          if (
            statuses[i] !== "correct" &&
            remainingCounts[c] > 0 &&
            targetChars.includes(c)
          ) {
            statuses[i] = "present";
            remainingCounts[c]--;
          }
        });

        const newGrid = [...grid];
        newGrid[currentRow] = {
          ...newGrid[currentRow],
          cells: guessChars.map((char, index) => ({
            char,
            status: statuses[index],
          })),
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
          sendFail();
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
  };

  return {
    grid,
    currentRow,
    currentGuess,
    isGameOver,
    handleKeyPress,
  };
};
