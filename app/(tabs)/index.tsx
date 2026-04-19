import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailyCard from '../../components/Home/DailyCard';
import ModeCard from '../../components/Home/ModeCard';
import AuthWarningModal from '../../components/modal/AuthWarningModal';
import Colors from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

type GameMode = {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  badge?: string;
}

const GAME_MODES: GameMode[] = [
  { id: 'klasik', title: 'Klasik', description: 'Sakin ve zamansız bir deneyim.', icon: 'grid-outline', link: '/game' },
  { id: 'hizli', title: 'Hızlı', description: 'Zamana karşı kıyasıya rekabet.', icon: 'stopwatch-outline', link: '/blitz' },
  { id: 'korleme', title: 'Kör Mod', description: 'Hislerine güvenir misin?', icon: 'eye-off-outline', link: '/blind' },
  { id: 'survival', title: 'Hayatta Kal', description: 'Canların bitene kadar hayatta kal.', icon: 'heart-outline', link: '/survival' },
  { id: 'coklu', title: 'Çoklu', description: 'Aynı anda birden fazla kelime.', icon: 'layers-outline', link: '/multi' },
  { id: 'tirma', title: 'Tırmanış', description: 'Zirveye giden yol! Giderek zorlaşan kelimeler.', icon: 'trending-up-outline', link: '/climb' },
  { id: 'lobi', title: 'Çok Oyunculu', description: 'Arkadaşlarınla oda kur; 1vs1 Battle veya Bomba Kimde oyna!', icon: 'people-outline', link: '/lobby', },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthWarningVisible, setIsAuthWarningVisible] = React.useState(false);
  const [pendingModeLink, setPendingModeLink] = React.useState<string | null>(null);

  const handleModePress = (id: string) => {
    const selectedMode = GAME_MODES.find(m => m.id === id);
    if (!selectedMode) return;

    // Klasik mod dışındaki modlar için giriş kontrolü
    if (id !== 'klasik' && !user) {
      setPendingModeLink(selectedMode.link);
      setIsAuthWarningVisible(true);
      return;
    }

    router.push(selectedMode.link as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']} >
      {/* CUSTOM HEADER */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}>


        <View style={{ alignItems: 'center' }}>
          <Text style={{
            color: Colors.correct.main,
            fontSize: 24,
            fontWeight: '900',
            letterSpacing: 2,
          }}>
            LEXİCON
          </Text>
        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {/* DAILY FEATURE CARD */}
        <DailyCard />

        {/* GAME MODES SECTION */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>Oyun Modları</Text>
            <Pressable>
              <Text style={{ color: Colors.textSecondary, fontSize: 14, fontWeight: '600' }}>Tümünü Gör</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {GAME_MODES.map((mode) => (
              <ModeCard
                key={mode.id}
                title={mode.title}
                description={mode.description}
                icon={mode.icon as keyof typeof Ionicons.glyphMap}
                badge={mode.badge}
                onPress={() => handleModePress(mode.id)}
              />
            ))}
          </View>
        </View>



      </ScrollView>

      <AuthWarningModal
        isVisible={isAuthWarningVisible}
        onClose={() => setIsAuthWarningVisible(false)}
        onContinueWithoutLogin={() => {
          if (pendingModeLink) {
            router.push(pendingModeLink as any);
          }
        }}
      />
    </SafeAreaView>
  );
}
