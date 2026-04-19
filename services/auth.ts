import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";

// Ensure the browser can handle the redirect
WebBrowser.maybeCompleteAuthSession();

export const signUp = async (email: string, password: string) => {
  const result = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: Linking.createURL(""),
    },
  });
  return result;
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  return error;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error;
};

export const resetPasswordForEmail = async (email: string) => {
  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL(""),
  });
  return result;
};

export const updateUserPassword = async (password: string) => {
  const result = await supabase.auth.updateUser({
    password: password,
  });
  return result;
};

export const signInWithGoogle = async () => {
  const redirectTo = Linking.createURL("");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === "success") {
    const { url } = res;

    const extractParams = (url: string) => {
      const parts = url.split("#");
      if (parts.length < 2) return Linking.parse(url).queryParams || {};

      const hash = parts[1];
      const params: Record<string, string> = {};
      hash.split("&").forEach((part) => {
        const [key, value] = part.split("=");
        if (key && value) params[key] = decodeURIComponent(value);
      });
      return params;
    };

    const params = extractParams(url);
    const access_token = params.access_token as string;
    const refresh_token = params.refresh_token as string;

    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;
      return data;
    }
  }

  return null;
};
