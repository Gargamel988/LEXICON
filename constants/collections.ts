export interface CollectionCard {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  categoryId: string;
}

export interface WordCollection {
  id: string;
  title: string;
  description: string;
  cards: CollectionCard[];
  rewardCoins: number;
}

export const WORD_COLLECTIONS: WordCollection[] = [
  {
    id: 'wild_nature',
    title: 'Vahşi Doğa',
    description: 'Doğanın en görkemli canlılarını keşfet.',
    rewardCoins: 500,
    cards: [
      { id: 'lion', name: 'Aslan', description: 'Ormanların Kralı', rarity: 'rare', categoryId: 'hayvanlar', imageUrl: 'https://placeholder.com/lion' },
      { id: 'eagle', name: 'Kartal', description: 'Göklerin Hakimi', rarity: 'common', categoryId: 'hayvanlar', imageUrl: 'https://placeholder.com/eagle' },
      { id: 'whale', name: 'Balina', description: 'Okyanusun Devi', rarity: 'epic', categoryId: 'hayvanlar', imageUrl: 'https://placeholder.com/whale' },
    ]
  },
  {
    id: 'space_odyssey',
    title: 'Uzay Yolculuğu',
    description: 'Evrenin derinliklerine bir yolculuk.',
    rewardCoins: 1000,
    cards: [
      { id: 'planet', name: 'Gezegen', description: 'Gökyüzü feneri', rarity: 'common', categoryId: 'bilim', imageUrl: 'https://placeholder.com/planet' },
      { id: 'galaxy', name: 'Galaksi', description: 'Yıldızlar kümesi', rarity: 'epic', categoryId: 'bilim', imageUrl: 'https://placeholder.com/galaxy' },
      { id: 'pulsar', name: 'Pulsar', description: 'Zamanın nabzı', rarity: 'legendary', categoryId: 'bilim', imageUrl: 'https://placeholder.com/pulsar' },
    ]
  }
];
