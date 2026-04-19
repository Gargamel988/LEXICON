import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View
} from 'react-native';

import GameHeader from '../components/Game/GameHeader';
import Keyboard from '../components/Keyboard/Keyboard';
import GameLayout from '../components/Layout/GameLayout';
import ResultModal from '../components/modal/ResultModal';
import Colors from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { useBattleGame } from '../hooks/useBattleGame';
import { useMultiplayer, useRoomState } from '../hooks/useMultiplayer';
import { useResponsive } from '../hooks/useResponsive';
import { CellStatus, BattleMove } from '../types';
import Grid from '../components/Grid/Grid';
import { toUpperTurkish } from '../utils/stringUtils';

const BATTLE_ACCENT = Colors.modes.battle.accent;
const BATTLE_BG = Colors.modes.battle.background;

export default function BattleScreen() {
  const router = useRouter();
  const { code: roomCode } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const { scale, verticalScale } = useResponsive();
  const { createRoom } = useMultiplayer();

  // Realtime Room State
  const { room, players, loading } = useRoomState(roomCode || "", user?.id);

  const secretWord = room?.current_word || "APPLE";
  const wordLength = secretWord.length;

  const [opponentsData, setOpponentsData] = useState<Record<string, CellStatus[][]>>({});
  const [winner, setWinner] = useState<string | null>(null);

  // Rakipleri ilklendir
  useEffect(() => {
    if (players.length > 0 && wordLength > 0) {
      setOpponentsData(prev => {
        const newData = { ...prev };
        players.forEach(p => {
          if (p.user_id !== user?.id && !newData[p.user_id]) {
            newData[p.user_id] = new Array(6).fill(null).map(() => new Array(wordLength).fill("empty"));
          }
        });
        return newData;
      });
    }
  }, [players.length, wordLength]);

  const handleRematch = () => {
    if (!user) return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    createRoom({
      code: newCode,
      hostId: user.id,
      username: (user.user_metadata?.username || user.email?.split('@')[0]) || 'Oyuncu',
    });
  };

  const {
    grid,
    currentRow,
    currentGuess,
    isGameOver,
    handleKeyPress
  } = useBattleGame({
    roomId: room?.id || "temp",
    userId: user?.id || "me",
    secretWord,
    onWin: (uid) => {
      setWinner(uid);
    },
    onOpponentMove: (payload: BattleMove) => {
      setOpponentsData(prev => {
        const currentProg = prev[payload.userId];
        if (!currentProg) {
           // Eğer henüz ilklendirilmemişse yeni oluştur
           const newProg = new Array(6).fill(null).map(() => new Array(wordLength).fill("empty"));
           newProg[payload.rowIndex] = payload.pattern;
           return { ...prev, [payload.userId]: newProg };
        }
        const newProg = [...currentProg];
        newProg[payload.rowIndex] = payload.pattern;
        return { ...prev, [payload.userId]: newProg };
      });
    }
  });

  useEffect(() => {
    if (room?.winner_id) {
      setWinner(room.winner_id);
    }
  }, [room?.winner_id]);

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
    if (winner === user?.id) return "SİZ";
    const w = players.find(p => p.user_id === winner);
    return w?.username || "Rakip";
  };

  if (loading || !room) {
    return (
      <GameLayout backgroundColor={BATTLE_BG}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BATTLE_ACCENT} />
          <Text style={{ color: '#fff', marginTop: 15 }}>Savaş Hazırlanıyor...</Text>
        </View>
      </GameLayout>
    );
  }

  return (
    <GameLayout backgroundColor={BATTLE_BG}>
      <GameHeader
        title="KELİME SAVAŞI"
        subtitle="İLK BULAN KAZANIR"
        accentColor={BATTLE_ACCENT}
        onBack={() => router.back()}
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
          <View style={{ flex: 3.2, alignItems: 'center' }}>
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
            
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Grid 
                grid={grid}
                currentRow={currentRow}
                currentGuess={currentGuess}
                maxGridWidth={scale(260)}
              />
            </View>
                  {/* Opponents miniature list (Right) */}
          <ScrollView 
            style={{ flex: 1, paddingLeft: scale(8) }}
            contentContainerStyle={{ gap: 15 }}
            showsVerticalScrollIndicator={false}
          >
            {players.filter(p => p.user_id !== user?.id).map((opp) => (
              <View key={opp.user_id} style={{ marginBottom: 5 }}>
                <View style={{ marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: winner === opp.user_id ? Colors.correct.main : 'rgba(255,255,255,0.4)' }} />
                  <Text style={{ 
                    color: winner === opp.user_id ? Colors.correct.main : 'rgba(255,255,255,0.6)', 
                    fontSize: 9, 
                    fontWeight: '900', 
                    letterSpacing: 0.5,
                    textTransform: 'uppercase'
                  }} numberOfLines={1}>{opp.username}</Text>
                </View>

                <View style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  padding: scale(3), 
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: winner === opp.user_id ? `${Colors.correct.main}44` : 'rgba(255,255,255,0.07)',
                  alignItems: 'center',
                }}>
                  {(opponentsData[opp.user_id] || new Array(6).fill(null).map(() => new Array(wordLength).fill("empty"))).map((rowPattern, rIdx) => (
                    <View key={rIdx} style={{ 
                      flexDirection: 'row', 
                      gap: scale(1.5), 
                      marginBottom: scale(1.5) 
                    }}>
                      {rowPattern.map((status, sIdx) => (
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
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
                 <Ionicons name="people-outline" size={24} color="#fff" />
                 <Text style={{ color: '#fff', fontSize: 8, marginTop: 5, textAlign: 'center' }}>RAKİP BEKLENİYOR</Text>
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
        status={winner === user?.id ? 'win' : 'lose'}
        word={secretWord}
        guesses={currentRow + 1}
        mode="battle"
        extraData={getWinnerName()}
        onRestart={handleRematch}
        onHome={() => router.replace('/(tabs)')}
      />
    </GameLayout>
  );
}
