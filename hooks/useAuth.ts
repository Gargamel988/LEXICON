import { User } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabase";
import {
  resetPasswordForEmail,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  updateUserPassword,
} from "../services/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUp(email, password),
    onSuccess: (result) => {
      if (result.error) {
        Toast.show({
          type: "error",
          text1: "Kayıt Hatası",
          text2:
            result.error.message === "User already registered"
              ? "Bu e-posta adresi zaten kullanımda."
              : result.error.message,
        });
        return;
      }

      if (!result.data?.session) {
        router.replace({
          pathname: "/(auth)/verify",
          params: { type: "signup" },
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Hoş Geldiniz!",
          text2: "Kaydınız başarıyla tamamlandı.",
        });
        router.replace("/(tabs)");
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Hata",
        text2: error.message,
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: (error) => {
      if (error) {
        Toast.show({
          type: "error",
          text1: "Giriş Başarısız",
          text2:
            error.message === "Invalid login credentials"
              ? "E-posta veya şifre hatalı."
              : error.message,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Başarılı Giriş",
        text2: "Tekrar hoş geldiniz!",
      });
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Bağlantı Hatası",
        text2: "Sunucuyla bağlantı kurulamadı.",
      });
    },
  });

  const signInWithGoogleMutation = useMutation({
    mutationFn: () => signInWithGoogle(),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Başarılı",
        text2: "Google ile giriş yapıldı!",
      });
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Google Hatası",
        text2:
          error.message || "Giriş işlemi iptal edildi veya bir hata oluştu.",
      });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      Toast.show({
        type: "info",
        text1: "Oturum Kapatıldı",
        text2: "Tekrar görüşmek üzere.",
      });
      router.replace("/(auth)/login");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => resetPasswordForEmail(email),
    onSuccess: (result) => {
      if (result.error) {
        Toast.show({
          type: "error",
          text1: "Kayıt Hatası",
          text2: result.error.message,
        });
        return;
      }
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (password: string) => updateUserPassword(password),
    onSuccess: (result) => {
      if (!result.error) {
        Toast.show({
          type: "success",
          text1: "Başarılı",
          text2: "Şifreniz güncellendi.",
        });
        router.replace("/(tabs)/profile");
      }
    },
  });

  return {
    user,
    loading,
    signUpMutation,
    signInMutation,
    signOutMutation,
    forgotPasswordMutation,
    updatePasswordMutation,
    signInWithGoogleMutation,
  };
};
