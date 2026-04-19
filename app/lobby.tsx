import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import GameHeader from '../components/Game/GameHeader';
import GameLayout from '../components/Layout/GameLayout';
import Colors from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useResponsive } from '../hooks/useResponsive';

const LOBBY_ACCENT = Colors.modes.lobby.accent;
const LOBBY_BG = Colors.modes.lobby.background;

export default function LobbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createRoom, joinRoom, isCreating, isJoining } = useMultiplayer();
  const { scale, verticalScale, width } = useResponsive();
  const [roomCode, setRoomCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Deep Link Listener
  const url = Linking.useURL();

  React.useEffect(() => {
    if (url) {
      const { path, queryParams } = Linking.parse(url);
      if (path && path.startsWith('lobby/')) {
        const code = path.split('/')[1];
        if (code) handleAutoJoin(code.toUpperCase());
      }
      else if (queryParams && queryParams.code) {
        handleAutoJoin(queryParams.code.toString().toUpperCase());
      }
    }
  }, [url]);

  const handleAutoJoin = (code: string) => {
    setRoomCode(code);
    Toast.show({
      type: 'success',
      text1: 'Oda Kodu Yakalandı',
      text2: `${code} odasına bağlanılıyor...`,
    });
  };

  const handleCreateRoom = async () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen önce giriş yapın.' });
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    createRoom({ 
      code, 
      hostId: user.id, 
      username: user.email?.split('@')[0] || 'Oyuncu' 
    });
  };

  const handleJoinRoom = async (codeOverride?: string) => {
    const code = (codeOverride || roomCode).toUpperCase();
    if (code.length < 4) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Geçerli bir kod girin.' });
      return;
    }

    if (!user) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen önce giriş yapın.' });
      return;
    }

    joinRoom({ 
      code, 
      userId: user.id, 
      username: user.email?.split('@')[0] || 'Oyuncu' 
    });
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Toast.show({
          type: 'error',
          text1: 'İzin Reddedildi',
          text2: 'QR taramak için kamera izni gerekiyor.',
        });
        return;
      }
    }
    setIsScanning(true);
  };

  const onBarCodeScanned = ({ data }: { data: string }) => {
    setIsScanning(false);
    let code = data;
    if (data.includes('lobby/')) {
      code = data.split('lobby/')[1];
    } else if (data.includes('code=')) {
      code = data.split('code=')[1];
    }
    code = code.substring(0, 6).toUpperCase();
    if (code) {
      handleAutoJoin(code);
    }
  };

  return (
    <GameLayout backgroundColor={LOBBY_BG}>
      <GameHeader
        title="LOBİ"
        subtitle="Multiplayer"
        accentColor={LOBBY_ACCENT}
        onBack={() => router.back()}
        leftStats={{ label: 'AKTİF', value: '0', color: LOBBY_ACCENT }}
        rightStats={{ label: 'ODALAR', value: '0', color: '#fff' }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}
      >
        <Animated.View
          entering={FadeInUp.delay(200).duration(800)}
          style={{ width: '100%', alignItems: 'center' }}
        >
          {/* Main Glass Card */}
          <BlurView intensity={30} tint="dark" style={{ width: '100%', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Ionicons name="people-circle-outline" size={scale(40)} color={LOBBY_ACCENT} />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 12, letterSpacing: 1.5 }}>ARKADAŞLARINLA OYNA</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                Yeni bir oda oluştur veya mevcut bir odaya katıl.
              </Text>
            </View>

            <View style={{ width: '100%', marginBottom: 24 }}>
              <Text style={{ color: LOBBY_ACCENT, fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>ODA KODU</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <TextInput
                  style={{ flex: 1, height: 60, paddingLeft: 44, color: '#fff', fontSize: 24, fontWeight: '700', letterSpacing: 4, textAlign: 'center' }}
                  placeholder="Örn: 54A2"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={roomCode}
                  onChangeText={(text) => setRoomCode(text.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={startScanning}
                  style={{ width: 60, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="scan-outline" size={24} color={LOBBY_ACCENT} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ width: '100%' }}>
              <TouchableOpacity
                onPress={() => handleJoinRoom()}
                activeOpacity={0.8}
                style={{ height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: LOBBY_ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, backgroundColor: LOBBY_ACCENT }}
              >
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 1 }}>ODAYA KATIL</Text>
                <Ionicons name="enter-outline" size={20} color="#000" />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, paddingHorizontal: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '800', marginHorizontal: 15 }}>VEYA</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </View>

              <TouchableOpacity
                onPress={handleCreateRoom}
                activeOpacity={0.7}
                style={{ height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 }}>YENİ ODA KUR</Text>
                <Ionicons name="add-circle-outline" size={20} color={LOBBY_ACCENT} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(800)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, opacity: 0.8 }}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' }}>Rekabetçi ve adil oyun sistemi aktif.</Text>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* QR Code Scanner Modal */}
      <Modal visible={isScanning} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            onBarcodeScanned={onBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <BlurView intensity={80} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ position: 'absolute', top: 60, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 }}>QR KODU TARA</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>Oda kodunu otomatik yakalayın</Text>
            </View>

            <View style={{ width: 250, height: 250, position: 'relative' }}>
              <View style={{ position: 'absolute', width: 40, height: 40, borderColor: LOBBY_ACCENT, top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }} />
              <View style={{ position: 'absolute', width: 40, height: 40, borderColor: LOBBY_ACCENT, top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }} />
              <View style={{ position: 'absolute', width: 40, height: 40, borderColor: LOBBY_ACCENT, bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }} />
              <View style={{ position: 'absolute', width: 40, height: 40, borderColor: LOBBY_ACCENT, bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }} />
            </View>

            <TouchableOpacity
              onPress={() => setIsScanning(false)}
              style={{ position: 'absolute', bottom: 60 }}
            >
              <Ionicons name="close-circle" size={50} color="#fff" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* Show My QR Modal */}
      <Modal visible={showQrModal} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <BlurView intensity={100} tint="dark" style={{ width: '100%', borderRadius: 32, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 2 }}>ODA PAYLAŞ</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Arkadaşın bu kodu tarasın</Text>
            </View>

            <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 24, marginBottom: 20 }}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(Linking.createURL('lobby/' + roomCode))}&color=639922` }}
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
