import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { AvatarWithFrame } from '../../components/Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../../components/Cosmetics/UserDisplayName';
import GameHeader from '../../components/Game/GameHeader';
import GameLayout from '../../components/Layout/GameLayout';
import Colors from '../../constants/Colors';
import { WORDS } from '../../data/words';
import { useAuth } from '../../hooks/useAuth';
import { useRoomState } from '../../hooks/useMultiplayer';
import { useResponsive } from '../../hooks/useResponsive';
import { getWordByCategory } from '../../services/wordService';

const LOBBY_ACCENT = Colors.modes.lobby.accent;
const LOBBY_BG = Colors.modes.lobby.background;

const categories = ['karisik', ...Object.keys(WORDS)];
const lengths = [4, 5, 6, 7];

export default function RoomScreen() {
  const router = useRouter();
  const { id: rawRoomCode } = useLocalSearchParams<{ id: string }>();
  const roomCode = (rawRoomCode as string)?.trim().toUpperCase();
  const { user } = useAuth();
  const { width } = useResponsive();

  const {
    room,
    players,
    isHost,
    loading,
    toggleReady,
    startGame,
    startBombGame,
    leaveRoom,
    updateSettings,
    changeMode,
    isStarting
  } = useRoomState(roomCode as string, user?.id);

  const [showQrModal, setShowQrModal] = useState(false);
  const shareLink = Linking.createURL('lobby/' + roomCode);

  useEffect(() => {
    // Sadece ekran mount olduğunda yapılacak işlemler varsa buraya
    return () => {
      // Oyun başladığında leaveRoom yaparsak lobi bozulur.
      // O yüzden burayı boş bırakıyoruz.
    };
  }, []);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(roomCode);
    Toast.show({ type: 'success', text1: 'Bağlantı Kopyalandı' });
  };
  ;

  const handleStartGame = () => {
    const isEveryoneReady = players.every(p => p.is_ready);
    if (!isEveryoneReady && players.length > 1) {
      Toast.show({ type: 'info', text1: 'Hazır Olmayanlar Var', text2: 'Tüm oyuncuların hazır olmasını bekleyin.' });
      return;
    }

    if (room?.mode === 'bomb') {
      startBombGame();
    } else {
      const word = getWordByCategory(room?.category || 'karisik', room?.word_length || 5);
      startGame(word);
    }
  };

  const handleUpdateCategory = (cat: string) => {
    if (!isHost) return;
    updateSettings(cat, room?.word_length || 5);
  };

  const handleUpdateLength = (len: number) => {
    if (!isHost) return;
    updateSettings(room?.category || 'karisik', len);
  };

  if (loading) {
    return (
      <GameLayout backgroundColor={LOBBY_BG}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={LOBBY_ACCENT} />
          <Text style={{ color: '#fff', marginTop: 15, fontWeight: '600' }}>Odaya bağlanılıyor...</Text>
        </View>
      </GameLayout>
    );
  }

  const currentPlayer = players.find(p => p.user_id === user?.id) || players[0]; // Fallback if sync is slow

  return (
    <GameLayout backgroundColor={LOBBY_BG}>
      <GameHeader
        title="BEKLEME ODASI"
        subtitle={`Oda: ${roomCode}`}
        accentColor={LOBBY_ACCENT}
        onBack={() => {
          leaveRoom();
          router.replace('/(tabs)');
        }}
        leftStats={{ label: 'OYUNCU', value: `${players.length}/4`, color: LOBBY_ACCENT }}
        rightStats={{ label: 'DURUM', value: 'CANLI', color: '#fff' }}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }}>
        <Animated.View entering={FadeInUp.duration(600)} style={{ width: '100%', marginBottom: 24 }}>
          <BlurView intensity={20} tint="dark" style={{ borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>ODA KODU</Text>
                <Text style={{ color: LOBBY_ACCENT, fontSize: 32, fontWeight: '900', letterSpacing: 4 }}>{roomCode}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={handleCopyLink}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Ionicons name="copy-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowQrModal(true)}
                  style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Ionicons name="qr-code-outline" size={20} color={LOBBY_ACCENT} />
                </TouchableOpacity>
              </View>
            </View>


          </BlurView>
        </Animated.View>

        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
          {isHost ? 'MAÇ AYARLARINI SEÇ VE BAŞLAT' : 'HOSTUN MAÇI BAŞLATMASI BEKLENİYOR'}
        </Text>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: LOBBY_ACCENT, fontSize: 11, fontWeight: '800', marginBottom: 10 }}>MOD SEÇİMİ</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['battle', 'bomb'].map((m) => (
                <TouchableOpacity
                  key={m}
                  disabled={!isHost}
                  onPress={() => changeMode(m as any)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: room?.mode === m ? LOBBY_ACCENT : 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    borderColor: room?.mode === m ? LOBBY_ACCENT : 'transparent'
                  }}
                >
                  <Text style={{ color: room?.mode === m ? '#000' : '#fff', fontWeight: '800', fontSize: 13 }}>
                    {m === 'battle' ? 'KELİME SAVAŞI' : 'BOMBA KİMDE?'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  disabled={!isHost}
                  onPress={() => handleUpdateCategory(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: room?.category === cat ? LOBBY_ACCENT : 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    borderColor: room?.category === cat ? LOBBY_ACCENT : 'transparent'
                  }}
                >
                  <Text style={{ color: room?.category === cat ? '#000' : '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>
                    {cat === 'karisik' ? 'Karışık' : cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {room?.mode === 'battle' && (
            <View>
              <Text style={{ color: LOBBY_ACCENT, fontSize: 11, fontWeight: '800', marginBottom: 10 }}>HARF SAYISI</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {lengths.map((len) => (
                  <TouchableOpacity
                    key={len}
                    disabled={!isHost}
                    onPress={() => handleUpdateLength(len)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: room?.word_length === len ? LOBBY_ACCENT : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{ color: room?.word_length === len ? '#000' : '#fff', fontWeight: '800' }}>{len}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>OYUNCULAR</Text>
        </View>

        {players.map((player, index) => (
          <Animated.View key={player.id} entering={FadeInDown.delay(index * 100).duration(600)} style={{ marginBottom: 12 }}>
            <BlurView intensity={10} tint="light" style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: player.is_host ? `${LOBBY_ACCENT}33` : 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View>
                  <AvatarWithFrame
                    avatarUrl={player.avatar_url}
                    frameId={player.active_frame || ''}
                    size={48}
                    username={player.username}
                  />
                  {player.is_host && (
                    <View style={{ position: 'absolute', top: -10, right: -5, backgroundColor: '#000', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: LOBBY_ACCENT }}>
                      <Text style={{ fontSize: 10 }}>👑</Text>
                    </View>
                  )}
                </View>
                <View>
                  <UserDisplayName
                    username={player.username}
                    nametagId={player.active_nametag}
                    titleId={player.active_title}
                    size="small"
                  />
                  {player.is_host && (
                    <Text style={{ color: LOBBY_ACCENT, fontSize: 10, fontWeight: '800', marginTop: 2 }}>HOST / ODA SAHİBİ</Text>
                  )}
                  {player.user_id === user?.id && !player.is_host && (
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', marginTop: 2 }}>SİZ</Text>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: player.is_ready ? LOBBY_ACCENT : 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '700' }}>
                  {player.is_ready ? 'HAZIR' : 'BEKLİYOR'}
                </Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: player.is_ready ? LOBBY_ACCENT : 'rgba(255,255,255,0.2)' }} />
              </View>
            </BlurView>
          </Animated.View>
        ))}

        {/* Waiting Slots */}
        {[...Array(4 - players.length)].map((_, i) => (
          <View key={`empty-${i}`} style={{ height: 60, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: '600' }}>Oyuncu Bekleniyor...</Text>
          </View>
        ))}
      </ScrollView>

      {/* Buttons Container */}
      <View style={{ padding: 20, paddingBottom: 30, gap: 12 }}>
        {!isHost && (
          <TouchableOpacity
            onPress={() => toggleReady(!!currentPlayer?.is_ready)}
            activeOpacity={0.8}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: currentPlayer?.is_ready ? 'rgba(255,255,255,0.1)' : LOBBY_ACCENT,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: currentPlayer?.is_ready ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ color: currentPlayer?.is_ready ? '#fff' : '#000', fontSize: 16, fontWeight: '800' }}>
              {currentPlayer?.is_ready ? 'HAZIRLIKTAN ÇIK' : 'HAZIRIM'}
            </Text>
          </TouchableOpacity>
        )}

        {isHost && (
          <TouchableOpacity
            onPress={handleStartGame}
            disabled={isStarting}
            activeOpacity={0.8}
            style={{
              height: 64,
              borderRadius: 20,
              backgroundColor: LOBBY_ACCENT,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              shadowColor: LOBBY_ACCENT,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
              opacity: players.length >= 2 && players.every(p => p.is_ready) ? 1 : 0.5
            }}
          >
            {isStarting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={{ color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>OYUNU BAŞLAT</Text>
                <Ionicons name="play-forward" size={22} color="#000" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* QR Code Modal */}
      <Modal visible={showQrModal} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <BlurView intensity={100} tint="dark" style={{ width: '100%', borderRadius: 32, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 2 }}>ODA PAYLAŞ</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Arkadaşın bu kodu tarasın</Text>
            </View>

            <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 24, marginBottom: 20 }}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}&color=639922` }}
                style={{ width: width * 0.6, height: width * 0.6 }}
                contentFit="contain"
              />
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>ODA KODU</Text>
              <Text style={{ color: LOBBY_ACCENT, fontSize: 32, fontWeight: '900', letterSpacing: 4 }}>{roomCode}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowQrModal(false)}
              style={{ height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: LOBBY_ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, backgroundColor: LOBBY_ACCENT, width: '100%', marginTop: 20 }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 1 }}>TAMAM</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </GameLayout>
  );
}
