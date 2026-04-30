import { ImageSourcePropType } from "react-native";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface NameTag {
  id: string;
  name: string;
  image: ImageSourcePropType | null;
  rarity: Rarity;
  price: string | null;
  description: string;
  paddingHorizontal?: number;
  fontSizeMultiplier?: number;
  verticalOffset?: number;
  heightMultiplier?: number;
}

export const NAMETAGS: NameTag[] = [
  {
    id: "nametag_crimson",
    name: "Kızıl Parşömen",
    image: require("../assets/nametags/nameplate_crimson_scroll.png"),
    rarity: "epic",
    price: '₺29,99',
    description: "Antik rünlerle bezeli kızıl bir parşömen.",
    paddingHorizontal: 30,
    fontSizeMultiplier: 0.9,
    verticalOffset: 0,
    heightMultiplier: 3,
  },
  {
    id: "nametag_galaxy",
    name: "Kristal Galaksi",
    image: require("../assets/nametags/nameplate_crystal_galaxy.png"),
    rarity: "legendary",
    price: '₺89,99',
    description: "Yıldız tozları ve kristal yansımalar.",
    paddingHorizontal: 25,
    fontSizeMultiplier: 1.1,
    verticalOffset: 0,
    heightMultiplier: 1.2,
  },
  {
    id: "nametag_dark_thorn",
    name: "Karanlık Diken",
    image: require("../assets/nametags/nameplate_dark_thorn.png"),
    rarity: "rare",
    price: '₺19,99',
    description: "Gizemli ve tehlikeli bir görünüm.",
    paddingHorizontal: 20,
    fontSizeMultiplier: 1.0,
    verticalOffset: 1,
    heightMultiplier: 1.0,
  },
  {
    id: "nametag_dragon",
    name: "Ejderha Ateşi",
    image: require("../assets/nametags/nameplate_dragon_flame.png"),
    rarity: "legendary",
    price: '₺129,99',
    description: "Ejderhanın nefesiyle dövülmüş isimlik.",
    paddingHorizontal: 35,
    fontSizeMultiplier: 1.2,
    verticalOffset: -3,
    heightMultiplier: 1.3,
  },
  {
    id: "nametag_golden",
    name: "Altın Kanat",
    image: require("../assets/nametags/nameplate_golden_wing.png"),
    rarity: "epic",
    price: '₺49,99',
    description: "Zaferin ve asaletin simgesi.",
    paddingHorizontal: 28,
    fontSizeMultiplier: 1.0,
    verticalOffset: -1,
    heightMultiplier: 1.1,
  },
  {
    id: "nametag_neon",
    name: "Neon Diken",
    image: require("../assets/nametags/nameplate_neon_spike.png"),
    rarity: "rare",
    price: '₺29,99',
    description: "Gelecekten gelen enerjik tasarım.",
    paddingHorizontal: 22,
    fontSizeMultiplier: 1.0,
    verticalOffset: 0,
    heightMultiplier: 1.0,
  },
  {
    id: "nametag_thorns_violet",
    name: "Mor Dikenler",
    image: require("../assets/nametags/nameplate_thorns_violet.png"),
    rarity: "epic",
    price: '₺39,99',
    description: "Zarif ama keskin bir hava.",
    paddingHorizontal: 24,
    fontSizeMultiplier: 1.0,
    verticalOffset: 0,
    heightMultiplier: 1.0,
  },
];
