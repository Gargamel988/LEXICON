import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View
} from 'react-native';

import { AvatarWithFrame } from '../components/Cosmetics/AvatarWithFrame';
import GameHeader from '../components/Game/GameHeader';
import Grid from '../components/Grid/Grid';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import Colors from '../constants/Colors';
import { FREE_FRAME_ID } from '../constants/frames';
import { useAuth } from '../hooks/useAuth';
import { useBattleGame } from '../hooks/useBattleGame';
import { useRoomState } from '../hooks/useMultiplayer';
import { useResponsive } from '../hooks/useResponsive';
import { statsService } from '../services/statsService';
import { inventoryService } from '../services/inventoryService';
import { BattleMove, CellStatus } from '../types';
import { toUpperTurkish } from '../utils/stringUtils';


const BATTLE_ACCENT = Colors.modes.battle.accent;
const BATTLE_BG = Colors.modes.battle.background;

// Performans için boş tabloyu bir kez oluşturuyoruz
const EMPTY_GRID = new Array(6).fill(null).map(() => new Array(7).fill("empty"));

export default function BattleScreen() {
  const router = useRouter();
  const { id: roomCode } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { scale, verticalScale } = useResponsive();

  // Realtime Room State
  const { room, players, loading, leaveRoom, returnToLobby } = useRoomState(roomCode || "", user?.id);

  // Rakipleri Memoize et (Performans ve kendini görme hatası için)
  const opponents = React.useMemo(() => {
    if (!user?.id || !players) return [];
    return players.filter(p => p.user_id !== user.id);
  }, [players, user?.id]);

  const secretWord = room?.current_word || "APPLE";
  const wordLength = secretWord.length;

  const [opponentsData, setOpponentsData] = useState<Record<string, CellStatus[][]>>({});
  const [winner, setWinner] = useState<string | null>(null);
  const battleResultSavedRef = useRef(false); // Çift kayıt önleme

  // Rakipleri ilklendir
  useEffect(() => {
    if (opponents.length > 0 && wordLength > 0) {
      setOpponentsData(prev => {
        const newData = { ...prev };
        opponents.forEach(p => {
          if (!newData[p.user_id]) {
            newData[p.user_id] = new Array(6).fill(null).map(() => new Array(wordLength).fill("empty"));
          }
        });
        return newData;
      });
    }
  }, [opponents.length, wordLength]);

  const handleReturnToLobby = React.useCallback(() => {
    if (!user || !room) return;
    returnToLobby();
  }, [user, room, returnToLobby]);

  // Status bekleme (waiting) olduğunda lobiye dön
  useEffect(() => {
    if (room?.status === 'waiting') {
      router.replace(`/room/${roomCode}`);
    }
  }, [room?.status, roomCode]);

  const handleWin = React.useCallback((uid: string) => {
    setWinner(uid);
  }, []);

  const handleOpponentMove = React.useCallback((payload: BattleMove) => {
    setOpponentsData(prev => {
      const currentProg = prev[payload.userId];
      if (!currentProg) {
        const newProg = new Array(6).fill(null).map(() => new Array(wordLength).fill("empty"));
        newProg[payload.rowIndex] = payload.pattern;
        return { ...prev, [payload.userId]: newProg };
      }
      const newProg = [...currentProg];
      newProg[payload.rowIndex] = payload.pattern;
      return { ...prev, [payload.userId]: newProg };
    });
  }, [wordLength]);

  // Kanca parametrelerini sabitle (Sonsuz döngüyü ve gereksiz re-connect'i önler)
  const battleConfig = React.useMemo(() => ({
    roomId: room?.id || "",
    userId: user?.id || "",
    secretWord: room?.current_word || "APPLE",
    playerCount: players.length
  }), [room?.id, user?.id, room?.current_word, players.length]);

  const {
    grid,
    currentRow,
    currentGuess,
    handleKeyPress
  } = useBattleGame({
    ...battleConfig,
    onWin: handleWin,
    onOpponentMove: handleOpponentMove,
  });

  useEffect(() => {
    if (room?.winner_id) {
      setWinner(room.winner_id);
    }
  }, [room?.winner_id]);

  // Battle oyun sonucunu kaydet
  useEffect(() => {
    if (!winner || !user?.id || battleResultSavedRef.current) return;
    battleResultSavedRef.current = true;

    const isWinner = winner === user.id;
    const isDraw = winner === 'draw';
    // Kazınılan oyunlarda skor: daha az denemede biten daha yüksek puan
    const baseScore = isDraw ? 50 : isWinner ? Math.max(50, 300 - (currentRow * 40)) : 0;

    statsService.saveGameResult(user.id, {
      mode: 'battle',
      is_winner: isWinner || isDraw,
      attempts: currentRow + 1,
      word_length: secretWord.length,
      score: baseScore,
      category: room?.category,
    }).catch((err) => console.error('[Battle] saveGameResult error:', err));

    if (isWinner) {
      inventoryService.giveWinReward(user.id, 'battle').catch(() => {});
    }
  }, [winner]);

  const letterStatuses = React.useMemo(() => {
    const statuses: Record<string, CellStatus> = {};
    grid.slice(0, currentRow).forEach(row => {
      row.cells.forEach(cell => {
        const char = toUpperTurkish(cell.char);
        if (!char) return;
        if (cell.status === 'correct') statuses[char] = 'correct';
        else if (cell.status === 'present' && statuses[char] !== 'correct') statuses[char] = 'present';
        else if (cell.status === 'absent' && !statuses[char]) statuses[char] = 'absent';
      });
    });
    return statuses;
  }, [grid, currentRow]);

  const getWinnerName = () => {
    if (!winner) return "";
    if (winner === 'draw') return "BERABERE";
    if (winner === user?.id) return "SİZ";
    const w = players.find(p => p.user_id === winner);
    return w?.username || "Rakip";
  };

  if (loading || !room || room.status !== 'started') {
    return (
      <GameLayout backgroundColor={BATTLE_BG}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BATTLE_ACCENT} />
          <Text style={{ color: '#fff', marginTop: 15, fontWeight: '600' }}>
            {room?.status === 'waiting' ? 'Lobiye Dönülüyor...' : 'Savaş Hazırlanıyor...'}
          </Text>
        </View>
      </GameLayout>
    );
  }

  return (
    <GameLayout backgroundColor={BATTLE_BG}>
      <GameHeader
        title="KELİME SAVAŞI"
        subtitle={`${(room?.category === 'karisik' ? 'KARIŞIK' : room?.category?.toUpperCase() || 'KARIŞIK')} `}
        accentColor={BATTLE_ACCENT}
        onBack={() => {
          leaveRoom();
          router.replace('/(tabs)');
        }}
        leftStats={{
          label: 'OYUNCU',
          value: players.length.toString(),
          color: '#fff'
        }}
        rightStats={{
          label: 'DURUM',
          value: winner ? 'BİTTİ' : 'SAVAŞ',
          color: winner ? '#818384' : BATTLE_ACCENT
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: scale(15) }}>
        {/* Main Battle Area */}
        <View style={{
          flexDirection: 'row',
          flex: 1,
          gap: scale(12),
          paddingTop: verticalScale(10)
        }}>

          {/* My Grid (Left/Center) */}
          <View style={{ flex: 4, alignItems: 'center' }}>
            {/* My Avatar */}
            <View style={{ marginBottom: verticalScale(10) }}>
              <AvatarWithFrame
                avatarUrl={players.find(p => p.user_id === user?.id)?.avatar_url}
                username={players.find(p => p.user_id === user?.id)?.username}
                frameId={players.find(p => p.user_id === user?.id)?.active_frame || FREE_FRAME_ID}
                size={scale(60)}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              gap: 6
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: BATTLE_ACCENT }} />
              <Text style={{
                color: '#fff',
                fontSize: 10,
                fontWeight: '900',
                letterSpacing: 2,
                opacity: 0.6
              }}>SENİN TABLON</Text>
            </View>

            <Grid
              grid={grid}
              currentRow={currentRow}
              currentGuess={currentGuess}
              maxGridWidth={wordLength <= 5 ? scale(260) : scale(320)}
            />
          </View>

          {/* Opponents miniature list (Right) */}
          <View style={{ flex: 1.2 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {opponents.map((opp) => (
                <View key={opp.user_id} style={{ marginBottom: 5 }}>
                  <View style={{ marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AvatarWithFrame
                      avatarUrl={opp.avatar_url}
                      username={opp.username}
                      frameId={opp.active_frame || FREE_FRAME_ID}
                      size={scale(24)}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: winner === opp.user_id ? Colors.correct.main : 'rgba(255,255,255,0.4)' }} />
                        <Text style={{
                          color: winner === opp.user_id ? Colors.correct.main : 'rgba(255,255,255,0.6)',
                          fontSize: 9,
                          fontWeight: '900',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase'
                        }} numberOfLines={1}>{opp.username}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: scale(3),
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: winner === opp.user_id ? `${Colors.correct.main}44` : 'rgba(255,255,255,0.07)',
                    alignItems: 'center',
                  }}>
                    {(opponentsData[opp.user_id] || EMPTY_GRID).slice(0, 6).map((rowPattern, rIdx) => (
                      <View key={rIdx} style={{
                        flexDirection: 'row',
                        gap: scale(1.5),
                        marginBottom: scale(1.5)
                      }}>
                        {rowPattern.slice(0, wordLength).map((status, sIdx) => (
                          <View
                            key={sIdx}
                            style={{
                              width: scale(9),
                              height: scale(9),
                              borderRadius: 1.5,
                              backgroundColor: status === 'correct' ? Colors.correct.main :
                                status === 'present' ? Colors.misplaced.main :
                                  status === 'absent' ? Colors.wrong.dark : 'rgba(255,255,255,0.05)'
                            }}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              {players.length === 1 && (
                <View style={{ paddingVertical: 20, justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
                  <Ionicons name="people-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 7, marginTop: 5, textAlign: 'center' }}>RAKİP BEKLENİYOR</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Keyboard Area */}
        <View style={{ marginBottom: 10, opacity: !!winner ? 0.3 : 1 }}>
          <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
        </View>
      </View>

      {/* Result Modal */}
      <ResultModal
        isVisible={!!winner}
        status={winner === 'draw' ? 'draw' : (winner === user?.id ? 'win' : 'lose')}
        word={secretWord}
        guesses={currentRow + 1}
        mode="battle"
        category={room?.category}
        extraData={getWinnerName()}
        onRestart={handleReturnToLobby}
        onHome={() => leaveRoom().then(() => router.replace('/(tabs)'))}
      />
    </GameLayout>
  );
}
