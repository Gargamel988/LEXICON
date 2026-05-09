/**
 * Frame (avatar çerçevesi) sabit listesi
 * Görseller assets/frames/ altında PNG (transparan arka plan, 512×512px)
 *
 * Gerçek para ödemeli olanlar price: '₺X,XX'
 * Elmasla alınanlar     coinPrice: N
 * Ücretsiz olanlar      price: null, coinPrice: null
 */

export interface FrameDef {
  id: string;
  name: string;
  description: string;
  /** Gerçek para fiyatı (IAP) */
  price: string | null;
  /** Elmas fiyatı (coin) */
  coinPrice: number | null;
  /** Aksan rengi (buton, glow vs.) */
  color: string;
  /** Rozet etiketi */
  badge?: string;
  /** Görsel yolu — assets/frames/ veya assets/animations/ */
  source: any;
  /** Çerçeve tipi: statik resim mi yoksa animasyon mu? */
  type: "image" | "lottie";
  /** Opsiyonel: Profil fotoğrafının çerçevenin içindeki büyüklük oranı (varsayılan 0.78) */
  innerScale?: number;
  /** Opsiyonel: Çerçevenin kendisinin büyüklük oranı (varsayılan: resim için 1.25, lottie için 1.35) */
  frameScale?: number;
  /** Opsiyonel: Arka planı silinmemiş çerçeveler için fotoğrafı çerçevenin ÜSTÜNDE gösterme (z-index) ayarı */
  avatarOnTop?: boolean;
}

export const FRAMES: FrameDef[] = [
  {
    id: "frame_default",
    name: "Varsayılan",
    description: "Klasik sade çerçeve",
    price: null,
    coinPrice: null,
    color: "#888",
    source: require("../assets/frames/default.png"),
    type: "image",
    innerScale: 0.85,
    frameScale: 1.05,
  },
  {
    id: "frame_silver",
    name: "Gümüş",
    description: "Zarif gümüş çerçeve",
    price: null,
    coinPrice: 150,
    color: "#b0bec5",
    source: require("../assets/frames/silver.png"),
    type: "image",
    innerScale: 0.85,
    frameScale: 1.15,
  },
  {
    id: "frame_gold",
    name: "Altın",
    description: "Prestijli altın çerçeve",
    price: null,
    coinPrice: 400,
    color: "#ffd54f",
    badge: "POPÜLER",
    source: require("../assets/frames/gold.png"),
    type: "image",
    innerScale: 0.7,
  },
  {
    id: "frame_pink_crown",
    name: "Pembe Taç",
    description: "Zarif bir kraliyet tacı",
    price: null,
    coinPrice: 950,
    color: "#ff4081",
    badge: "YENİ",
    source: require("../assets/frames/frame_pink_crown.png"),
    type: "image",
    innerScale: 0.7,
    frameScale: 1.2, // Ölçekleme dengelendi
  },
  {
    id: "frame_diamond",
    name: "Elmas",
    description: "Efsanevi elmas çerçeve",
    price: null,
    coinPrice: null, // Başarım ödülü
    color: "#82cfff",
    badge: "NADİR",
    source: require("../assets/frames/diamond.png"),
    type: "image",
  },
  {
    id: "frame_fire",
    name: "Alev",
    description: "Ateşli çerçeve — ruhunu yansıt",
    price: null,
    coinPrice: 600,
    color: "#ff6d3a",
    source: require("../assets/frames/fire.png"),
    type: "image",
  },
  {
    id: "frame_galaxy",
    name: "Galaksi",
    description: "Evrenin derinliklerinden",
    price: null,
    coinPrice: null, // Başarım ödülü
    color: "#c084fc",
    badge: "PREMIUM",
    source: require("../assets/frames/galaxy.png"),
    type: "image",
  },
  {
    id: "frame_neon",
    name: "Neon",
    description: "Gece şehrine ait",
    price: null,
    coinPrice: 500,
    color: "#00e5ff",
    source: require("../assets/frames/neon.png"),
    type: "image",
  },
  {
    id: "frame_champion",
    name: "Şampiyon",
    description: "Sadece en iyiler için",
    price: null,
    coinPrice: null, // Başarım ödülü
    color: "#ffc400",
    badge: "ÖZEL",
    source: require("../assets/frames/champion.png"),
    type: "image",
  },
  {
    id: "frame_animated",
    name: "Animasyonlu Çerçeve",
    description: "Enerji dolu 3D animasyonlu çerçeve",
    price: "₺149,99",
    coinPrice: null,
    color: "#00f2ff",
    badge: "YENİ",
    source: require("../assets/animations/Avatar Frame.json"),
    type: "lottie",
  },
  {
    id: "frame_enemy_alliance",
    name: "Ortak Hedef",
    description: "Düşman olsak da hedefimiz bir!",
    price: null,
    coinPrice: 750,
    color: "#9c27b0",
    source: require("../assets/frames/enemy_alliance.png"),
    type: "image",
    innerScale: 0.75,
  },
  {
    id: "frame_crystal_ice",
    name: "Kristal Buz",
    description: "Dondurucu soğuğun zarafeti",
    price: null,
    coinPrice: 900,
    color: "#00d4ff",
    source: require("../assets/frames/frame_crystal_ice.png"),
    type: "image",
    innerScale: 0.95,
  },
  {
    id: "frame_dark_void",
    name: "Karanlık Hiçlik",
    description: "Sonsuz boşluk",
    price: null,
    coinPrice: 1200,
    color: "#212121",
    source: require("../assets/frames/frame_dark_void.png"),
    type: "image",
    innerScale: 0.75,
  },
  {
    id: "frame_dragon_gold",
    name: "Altın Ejderha",
    description: "Efsanevi ejderhanın gücü",
    price: "₺99,99",
    coinPrice: null,
    color: "#ffca28",
    source: require("../assets/frames/frame_dragon_gold.png"),
    type: "image",
    innerScale: 0.85,
  },
  {
    id: "frame_fantasy_bloom",
    name: "Fantastik Çiçek",
    description: "Büyülü baharın habercisi",
    price: null,
    coinPrice: 850,
    color: "#f48fb1",
    source: require("../assets/frames/frame_fantasy_bloom.png"),
    type: "image",
    innerScale: 0.85,
  },
  {
    id: "frame_gold_champion",
    name: "Altın Şampiyon",
    description: "Zirvedekiler için",
    price: "₺129,99",
    coinPrice: null,
    color: "#ffd700",
    source: require("../assets/frames/frame_gold_champion.png"),
    type: "image",
    innerScale: 0.75,
  },
  {
    id: "frame_emerald_glow",
    name: "Zümrüt Işıltısı",
    description: "Doğanın yeşil enerjisi",
    price: null,
    coinPrice: 350,
    color: "#4ade80",
    source: require("../assets/frames/frame_emerald_glow.png"),
    type: "image",
    innerScale: 0.7,
  },
  {
    id: "frame_ice_star",
    name: "Buz Yıldızı",
    description: "Buz gibi parlayan bir yıldız",
    price: null,
    coinPrice: 850,
    color: "#80d8ff",
    source: require("../assets/frames/frame_ice_star.png"),
    type: "image",
    innerScale: 0.88,
  },
  {
    id: "frame_purple_phoenix",
    name: "Mor Anka",
    description: "Küllerinden mor alevlerle doğ",
    price: "₺89,99",
    coinPrice: null,
    color: "#8e24aa",
    source: require("../assets/frames/frame_purple_phoenix.png"),
    type: "image",
    frameScale: 2.1,
    innerScale: 0.8,
  },
  {
    id: "frame_purple_wings",
    name: "Mor Kanatlar",
    description: "Gökyüzünün hakimi",
    price: null,
    coinPrice: 1500,
    color: "#ab47bc",
    source: require("../assets/frames/frame_purple_wings.png"),
    type: "image",
    innerScale: 0.65,
  },
  {
    id: "frame_black_paladin",
    name: "Siyah Paladin",
    description: "Karanlık şövalyenin zırhı",
    price: null,
    coinPrice: 1800,
    color: "#424242",
    source: require("../assets/frames/frame_black_paladin.png"),
    type: "image",
    innerScale: 0.8,
  },
  {
    id: "frame_thorns_of_shadows",
    name: "Gölge Dikenleri",
    description: "Gölgelerin arasından yükselen dikenler",
    price: null,
    coinPrice: 1100,
    color: "#7b1fa2",
    source: require("../assets/frames/frame_thorns_of_shadows.png"),
    type: "image",
    innerScale: 0.78,
  },
];

export const FREE_FRAME_ID = "frame_default";
