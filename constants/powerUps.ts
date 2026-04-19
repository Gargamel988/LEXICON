import { Ionicons } from "@expo/vector-icons";

export type PowerUpKey =
  | "joker"
  | "hint"
  | "skip"
  | "risk"
  | "shield"
  | "extra"
  | "bomb"
  | "veto"
  | "lightning"
  | "scan"
  | "bridge"
  | "first_letter"
  | "magnet"
  | "radar"
  | "freeze"
  | "time"
  | "analysis"
  | "mirror";

export interface PowerUpDefinition {
  key: PowerUpKey;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accentColor: string;
  description: string;
  alwaysEnabled?: boolean;
}

export const POWER_UP_DEFINITIONS: Record<PowerUpKey, PowerUpDefinition> = {
  hint: {
    key: "hint",
    icon: "bulb-outline",
    label: "İPUCU",
    accentColor: "#ffd54f",
    description: "Rastgele bir doğru harfi açar.",
  },
  bomb: {
    key: "bomb",
    icon: "nuclear-outline",
    label: "BOMBA",
    accentColor: "#ff8a65",
    description: "Yanlış harfleri eler.",
  },
  joker: {
    key: "joker",
    icon: "color-wand-outline",
    label: "JOKER",
    accentColor: "#e040fb",
    description: "Son harfin yerini/varlığını söyler.",
  },
  veto: {
    key: "veto",
    icon: "refresh-outline",
    label: "VETO",
    accentColor: "#ff5252",
    description: "Son tahmini siler, hakkı iade eder.",
  },
  risk: {
    key: "risk",
    icon: "flame-outline",
    label: "RİSK",
    accentColor: "#ff3d00",
    description: "🔥 Tam İsabet: +2 Hak | Hata: -2 Hak.",
  },
  shield: {
    key: "shield",
    icon: "shield-checkmark-outline",
    label: "KALKAN",
    accentColor: "#4fc3f7",
    description: "Can kaybetmeni önler.",
  },
  extra: {
    key: "extra",
    icon: "add-circle-outline",
    label: "+1 HAK",
    accentColor: "#81c784",
    description: "Ekstra deneme hakkı verir.",
  },
  skip: {
    key: "skip",
    icon: "play-forward-outline",
    label: "ATLA",
    accentColor: "#ba68c8",
    description: "Kelimeyi atlar.",
  },
  lightning: {
    key: "lightning",
    icon: "flash-outline",
    label: "ŞİMŞEK",
    accentColor: "#4fc3f7",
    description: "İlk ve son harfi klavyede işaretler.",
  },
  scan: {
    key: "scan",
    icon: "search-outline",
    label: "TARAMA",
    accentColor: "#81c784",
    description: "Ortak bir harfi bulur.",
  },
  bridge: {
    key: "bridge",
    icon: "git-compare-outline",
    label: "KÖPRÜ",
    accentColor: "#ba68c8",
    description: "İki ızgara arasındaki aynı yerdeki ortak harfi bulur.",
  },
  first_letter: {
    key: "first_letter",
    icon: "text-outline",
    label: "İLK HARF",
    accentColor: "#ffd54f",
    description: "Kelimenin ilk harfini açar.",
  },
  magnet: {
    key: "magnet",
    icon: "magnet-outline",
    label: "MIKNATIS",
    accentColor: "#ff5252",
    description: "Doğru bir harfi yerleştirir.",
  },
  radar: {
    key: "radar",
    icon: "eye-outline",
    label: "RADAR",
    accentColor: "#ba68c8",
    description: "Klavyeyi 3 saniye renklendirir.",
  },
  freeze: {
    key: "freeze",
    icon: "snow-outline",
    label: "DONDUR",
    accentColor: "#4fc3f7",
    description: "Zamanı 5 saniyeliğine durdurur.",
  },
  time: {
    key: "time",
    icon: "timer-outline",
    label: "SÜRE+",
    accentColor: "#4fc3f7",
    description: "+10 saniye ekler.",
  },
  analysis: {
    key: "analysis",
    icon: "analytics-outline",
    label: "ANALİZ",
    accentColor: "#81c784",
    description: "Yazdığın kelimeyi can gitmeden analiz eder.",
  },
  mirror: {
    key: "mirror",
    icon: "copy-outline",
    label: "AYNA",
    accentColor: "#ce93d8",
    description: "Kelimede tekrar eden harf olup olmadığını söyler.",
  },
};
