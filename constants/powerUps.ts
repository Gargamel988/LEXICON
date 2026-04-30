// İkon render yardımcısı — JSX olduğu için .tsx dosyasında
export { renderPowerUpIcon } from "../utils/renderPowerUpIcon";

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

export type IconSet = "Ionicons" | "MaterialCommunityIcons";

export interface PowerUpDefinition {
  key: PowerUpKey;
  icon: string;
  iconSet?: IconSet; // default: 'Ionicons'
  label: string;
  accentColor: string;
  description: string;
  alwaysEnabled?: boolean;
}

export const POWER_UP_DEFINITIONS: Record<PowerUpKey, PowerUpDefinition> = {
  hint: {
    key: "hint",
    icon: "bulb", // ✅ Dolu ampul — daha belirgin
    label: "İPUCU",
    accentColor: "#ffd54f",
    description: "Rastgele bir doğru harfi açar.",
  },
  bomb: {
    key: "bomb",
    icon: "bomb",
    iconSet: "MaterialCommunityIcons",
    label: "BOMBA",
    accentColor: "#ff8a65",
    description: "Yanlış harfleri eler.",
  },
  joker: {
    key: "joker",
    icon: "cards-playing-outline",
    iconSet: "MaterialCommunityIcons",
    label: "JOKER",
    accentColor: "#e040fb",
    description: "Son harfin yerini/varlığını söyler.",
  },
  veto: {
    key: "veto",
    icon: "arrow-undo",
    label: "VETO",
    accentColor: "#ff5252",
    description: "Son tahmini siler, hakkı iade eder.",
  },
  risk: {
    key: "risk",
    icon: "flame", // ✅ Risk = dolu alev
    label: "RİSK",
    accentColor: "#ff3d00",
    description: "🔥 Tam İsabet: 2 kat puan | Hata: -2 Hak.",
  },
  shield: {
    key: "shield", // ✅ Dolu kalkan — daha güçlü görünüm
    icon: "shield",
    label: "KALKAN",
    accentColor: "#4fc3f7",
    description: "Can kaybetmeni önler.",
  },
  extra: {
    key: "extra",
    icon: "heart-outline", // ✅ +1 hak = can
    label: "+1 HAK",
    accentColor: "#81c784",
    description: "Ekstra deneme hakkı verir.",
  },
  skip: {
    key: "skip",
    icon: "arrow-forward-circle-outline", // ✅ Atla = ileri ok
    label: "ATLA",
    accentColor: "#ba68c8",
    description: "Kelimeyi atlar.",
  },
  lightning: {
    key: "lightning",
    icon: "flash", // ✅ Dolu şimşek
    label: "ŞİMŞEK",
    accentColor: "#4fc3f7",
    description: "İlk ve son harfi klavyede işaretler.",
  },
  scan: {
    key: "scan",
    icon: "scan-outline", // ✅ Tarama = scan çerçevesi
    label: "TARAMA",
    accentColor: "#81c784",
    description: "Ortak bir harfi bulur.",
  },
  bridge: {
    key: "bridge",
    icon: "swap-horizontal-outline", // ✅ Köprü = iki yön arası
    label: "KÖPRÜ",
    accentColor: "#ba68c8",
    description: "İki ızgara arasındaki aynı yerdeki ortak harfi bulur.",
  },
  first_letter: {
    key: "first_letter",
    icon: "alpha-a-box-outline",
    iconSet: "MaterialCommunityIcons",
    label: "İLK HARF",
    accentColor: "#ffd54f",
    description: "Kelimenin ilk harfini açar.",
  },
  magnet: {
    key: "magnet",
    icon: "magnet", // ✅ Dolu mıknatıs
    label: "MIKNATIS",
    accentColor: "#ff5252",
    description: "Doğru bir harfi yerleştirir.",
  },
  radar: {
    key: "radar",
    icon: "radio-outline", // ✅ Radar = sinyal dalgası
    label: "RADAR",
    accentColor: "#ba68c8",
    description: "Klavyeyi 3 saniye renklendirir.",
  },
  freeze: {
    key: "freeze",
    icon: "snow", // ✅ Dolu kar tanesi — daha belirgin
    label: "DONDUR",
    accentColor: "#4fc3f7",
    description: "Zamanı 5 saniyeliğine durdurur.",
  },
  time: {
    key: "time",
    icon: "time-outline", // ✅ Saat — süre için daha doğru
    label: "SÜRE+",
    accentColor: "#4fc3f7",
    description: "+10 saniye ekler.",
  },
  analysis: {
    key: "analysis",
    icon: "magnify-scan",
    iconSet: "MaterialCommunityIcons",
    label: "ANALİZ",
    accentColor: "#81c784",
    description: "Yazdığın kelimeyi can gitmeden analiz eder.",
  },
  mirror: {
    key: "mirror",
    icon: "mirror",
    iconSet: "MaterialCommunityIcons",
    label: "AYNA",
    accentColor: "#ce93d8",
    description: "Kelimede tekrar eden harf olup olmadığını söyler.",
  },
};
