import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from 'expo-linking';
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { AppState } from "react-native";
import Toast from 'react-native-toast-message';
import { CustomSplashScreen } from "../components/Common/CustomSplashScreen";
import { lexiconToastConfig } from '../components/Common/LexiconToast';
import Colors from '../constants/Colors';
import { adService } from "../services/adService";
import { statsService } from '../services/statsService';

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => { /* Reloading in dev might cause this to fail */ });

// URL'den tokenları ayıkla (Supabase hash/fragment kullanır)
function parseSupabaseUrl(url: string) {
  const parts = url.split('#');
  if (parts.length < 2) return {};

  const hash = parts[parts.length - 1];
  const params: Record<string, string> = {};
  hash.split('&').forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) params[key] = value;
  });
  return params;
}

// Auth durumunu ve yükleme ekranını yöneten alt bileşen
function RootContent() {
  const { loading, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const url = Linking.useURL();

  // Deep Link Dinleyici - E-posta onayı ve Şifre Sıfırlama için
  useEffect(() => {
    if (url) {
      const params = parseSupabaseUrl(url);
      const { access_token, refresh_token, type } = params;

      if (access_token && refresh_token) {
        supabase.auth.setSession({
          access_token: access_token,
          refresh_token: refresh_token,
        }).then(({ error }) => {
          if (!error) {
            if (type === 'recovery') {
              router.replace("/(auth)/reset-password");
            } else {
              router.replace("/(tabs)");
            }
          }
        });
      }
    }
  }, [url]);

  useEffect(() => {
    if (user?.id) {
      statsService.getProfile(user.id).then(profile => {
        if (profile) adService.isAdFree = !!profile.no_ads;
      }).catch(() => { });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading) {
      // Native splash'i gizle, kendi animasyonlu splash'imizi gösteriyoruz
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [loading]);

  if (loading || showSplash) {
    return (
      <CustomSplashScreen onAnimationComplete={() => setShowSplash(false)} />
    );
  }

  return (
    <>
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Kök arka plan rengini ayarla
    SystemUI.setBackgroundColorAsync(Colors.background);

    // Reklam servisini başlat
    adService.init().catch(err => {
      // console.error("AdService init error:", err)
    });

    // Uygulama Açıkken Reklamı (App Open Ad) Dinleyicisi
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        adService.showAppOpenAd();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootContent />
      <Toast
        config={lexiconToastConfig}
        position="top"
        topOffset={60}
      />
    </QueryClientProvider>
  );
}
