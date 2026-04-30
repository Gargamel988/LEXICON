export type TitleTier = 'common' | 'rare' | 'epic' | 'legendary';

export interface Title {
  id: string;
  label: string;
  color: string;
  glowColor?: string;
  glow: boolean;
  tier: TitleTier;
}

export const TITLES: Title[] = [
  // ─── COMMON ─────────────────────────────────────────────────────
  { id: 'title_rookie',        label: 'Acemi Avcı',          color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_hunter',        label: 'Kelime Avcısı',       color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_sprinter',      label: 'Sprinter',            color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_brave',         label: 'Cesur',               color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_climber',       label: 'Tırmanıcı',           color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_survivor',      label: 'Hayatta Kalan',       color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_multitasker',   label: 'Çok Görevli',         color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_duelist',       label: 'Düellocu',            color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_bomber',        label: 'Bombacı',             color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_devoted',       label: 'Adanmış',             color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_veteran',       label: 'Deneyimli',           color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_daily_first',   label: 'Erken Kuş',           color: '#A0A0A0', glow: false, tier: 'common' },
  { id: 'title_colorblind',    label: 'Renge Gerek Yok',     color: '#A0A0A0', glow: false, tier: 'common' },

  // ─── RARE ───────────────────────────────────────────────────────
  { id: 'title_champion',      label: 'Şampiyon',            color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_lexicon',       label: 'Leksikograf',         color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_endurance',     label: 'Dayanıklı',           color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_obsessed',      label: 'Saplantılı',          color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_daily_hero',    label: 'Günün Kahramanı',     color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_defuser',       label: 'Bomba İmha Uzmanı',   color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_multitasker2',  label: 'Paralel Beyin',       color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_soloking',      label: 'Solo Oyuncu',         color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_nightowl',      label: 'Gece Kuşu',           color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_speedreader',   label: 'Hızlı Okuyucu',       color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_tactician',     label: 'Taktisyen',           color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_analyst',       label: 'Analist',             color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_relentless',    label: 'Amansız',             color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_grinder',       label: 'Azimli',              color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_summit',        label: 'Zirve Fatihi',        color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_streak',        label: 'Seri Katili',         color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_explorer',      label: 'Kaşif',               color: '#60A5FA', glow: false, tier: 'rare' },
  { id: 'title_fireproof',     label: 'Ateş Geçirmez',       color: '#60A5FA', glow: false, tier: 'rare' },

  // ─── EPIC ───────────────────────────────────────────────────────
  { id: 'title_perfect',       label: 'Kusursuz',            color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_lightning',     label: 'Şimşek',              color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_sixthsense',    label: 'Altıncı His',         color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_sync',          label: 'Mükemmel Uyum',       color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_unbeaten',      label: 'Rakipsiz',            color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_shadow',        label: 'Gölge',               color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_phantom',       label: 'Hayalet',             color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_wordsmith',     label: 'Kelime Ustası',       color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_ironmind',      label: 'Demir İrade',         color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_coldblood',     label: 'Soğukkanlı',          color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_architect',     label: 'Mimar',               color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_oracle',        label: 'Kahin',               color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_telekinesis',   label: 'Telekinetik',         color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_berserker',     label: 'Berserker',           color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_warlord',       label: 'Savaş Lordu',         color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_bombmaster',    label: 'Bomba Ustası',        color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_onetap',        label: 'Tek Atış',            color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_blitzking',     label: 'Yıldırım Kralı',      color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_mountaineer',   label: 'Dağcı',               color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_survivor_elite',label: 'Elit Hayatta Kalan',  color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_dedicated',     label: 'Mürit',               color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_allrounder',    label: 'Çok Yönlü',           color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_parallel',      label: 'Paralel Evren',       color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },
  { id: 'title_seer',          label: 'Gören Göz',           color: '#C084FC', glow: true,  glowColor: '#9333EA', tier: 'epic' },

  // ─── LEGENDARY ──────────────────────────────────────────────────
  { id: 'title_legend',        label: 'Efsane',              color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_immortal',      label: 'Ölümsüz',             color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_obsessed2',     label: 'Aşkın',               color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_godofwords',    label: 'Kelime Tanrısı',      color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_apex',          label: 'Zirve',               color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_transcendent',  label: 'Aşkın Varlık',        color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_eternal',       label: 'Ebedi',               color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_void',          label: 'Boşluğun Efendisi',   color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_chosen',        label: 'Seçilmiş',            color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_mythic',        label: 'Mitik',               color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_sovereign',     label: 'Hükümdar',            color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_absolute',      label: 'Mutlak',              color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_invincible',    label: 'Yenilmez Armada',     color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_immortal_champion', label: 'Ölümsüz Şampiyon',color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_veteran_elite', label: 'Elit Gazi',           color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_wordgod',       label: 'Kelime İlahı',        color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_godmode',       label: 'Tanrı Modu',          color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_pointgod',      label: 'Puan Trilyoneri',     color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_prophet',       label: 'Peygamber',           color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_blindlegend',   label: 'Kör Şövalye',         color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_everest',       label: 'Everest',             color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_infinite',      label: 'Sonsuzluk',           color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
  { id: 'title_yearlong',      label: 'Devri Alem',          color: '#FBBF24', glow: true,  glowColor: '#F59E0B', tier: 'legendary' },
];

/**
 * Aktif unvanı renkli + glow ile gösteren stil objesini döner
 */
export function getTitleStyle(titleId?: string) {
  if (!titleId) return {};
  const title = TITLES.find(t => t.id === titleId);
  if (!title) return {};

  return {
    color: title.color,
    ...(title.glow && {
      textShadowColor: title.glowColor,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }),
  };
}
