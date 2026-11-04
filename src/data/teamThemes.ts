export type TeamThemeId = 'furia' | 'phantom' | 'navi' | 'spirit' | 'g2';

export interface TeamTheme {
  id: TeamThemeId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  country: string;
  logoUrl: string;
  backgroundUrl: string;
  pantherLogoUrl?: string;
  primaryColorHex: string;
  accentColorHex: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowGradient: string;
  roster: string[];
  trophyTitle: string;
}

export const TEAM_THEMES: Record<TeamThemeId, TeamTheme> = {
  furia: {
    id: 'furia',
    name: 'FURIA Esports',
    shortName: 'FURIA',
    tagline: '#DIADEFURIA · Black & White Edition',
    description: 'Чёрно-белая чемпионская тема FURIA с фото состава на арене и культовой чёрной пантерой.',
    country: 'Бразилия / Казахстан',
    logoUrl: '/assets/aistudio/37107df72e0efc5d9bf6b2ed049d6fdd_d05d051c.jpg',
    backgroundUrl: '/assets/aistudio/IMG_f8d39710-9afc-4f2d-8bc1-c920e2cf9025_1ab1208c.jpg',
    pantherLogoUrl: '/assets/aistudio/37107df72e0efc5d9bf6b2ed049d6fdd_d05d051c.jpg',
    primaryColorHex: '#ffffff',
    accentColorHex: '#e2e8f0',
    badgeBg: 'bg-white/15 text-white',
    badgeBorder: 'border-white/40',
    badgeText: 'text-white',
    glowGradient: 'from-white/25 via-slate-300/10 to-transparent',
    roster: ['FalleN', 'KSCERATO', 'yuurih', 'chelo', 'skullz'],
    trophyTitle: 'IEM Champions · Кубок на сцене'
  },
  phantom: {
    id: 'phantom',
    name: 'PHANTOM Classic',
    shortName: 'PHANTOM',
    tagline: 'Cyber Stealth · Official Marketplace',
    description: 'Оригинальная тёмная тема PHANTOM SKINS с неоновыми фиолетовыми и кибер-синими акцентами.',
    country: 'Global CS2',
    logoUrl: '/src/assets/images/hero_cs2_phantom_1793626929611.jpg',
    backgroundUrl: '/src/assets/images/hero_cs2_phantom_1793626929611.jpg',
    primaryColorHex: '#8b5cf6',
    accentColorHex: '#00f0ff',
    badgeBg: 'bg-violet-600/20 text-violet-300',
    badgeBorder: 'border-violet-500/30',
    badgeText: 'text-violet-400',
    glowGradient: 'from-violet-600/20 via-indigo-600/10 to-transparent',
    roster: ['Marketplace Bot #01', 'Trade Bot #02', 'Phantom Bot #03'],
    trophyTitle: '12 450+ Успешных обменов в Steam'
  },
  navi: {
    id: 'navi',
    name: 'Natus Vincere',
    shortName: 'NAVI',
    tagline: 'Born to Win · PGL Major Champions',
    description: 'Культовая желто-черная тема одной из самых титулованных организаций в истории CS.',
    country: 'Украина / Global',
    logoUrl: '/src/assets/images/theme_navi_arena_1793627948011.jpg',
    backgroundUrl: '/src/assets/images/theme_navi_arena_1793627948011.jpg',
    primaryColorHex: '#fff200',
    accentColorHex: '#eab308',
    badgeBg: 'bg-amber-400/20 text-amber-300',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-400',
    glowGradient: 'from-amber-400/20 via-yellow-500/10 to-transparent',
    roster: ['Aleksib', 'b1t', 'iM', 'jL', 'w0nderful'],
    trophyTitle: 'PGL CS2 Major Champions'
  },
  spirit: {
    id: 'spirit',
    name: 'Team Spirit',
    shortName: 'SPIRIT',
    tagline: 'The Green Dragons · IEM Katowice Winners',
    description: 'Изумрудно-серебряная тема драконов и триумфаторов IEM Katowice.',
    country: 'Global CS2',
    logoUrl: '/src/assets/images/theme_spirit_arena_1793627949478.jpg',
    backgroundUrl: '/src/assets/images/theme_spirit_arena_1793627949478.jpg',
    primaryColorHex: '#10b981',
    accentColorHex: '#34d399',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-400',
    glowGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    roster: ['chopper', 'donk', 'sh1ro', 'magixx', 'zont1x'],
    trophyTitle: 'IEM Katowice Champions'
  },
  g2: {
    id: 'g2',
    name: 'G2 Esports',
    shortName: 'G2',
    tagline: 'Samurai Spirit · IEM Dallas Champions',
    description: 'Агрессивная самурайская эстетика в глубоких рубиново-красных и угольных тонах.',
    country: 'Global CS2',
    logoUrl: '/src/assets/images/theme_g2_arena_1793627948529.jpg',
    backgroundUrl: '/src/assets/images/theme_g2_arena_1793627948529.jpg',
    primaryColorHex: '#ef4444',
    accentColorHex: '#f87171',
    badgeBg: 'bg-rose-500/20 text-rose-300',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-400',
    glowGradient: 'from-rose-500/20 via-red-600/10 to-transparent',
    roster: ['Snax', 'NiKo', 'm0NESY', 'malbsMd', 'huNter-'],
    trophyTitle: 'IEM Dallas Champions'
  }
};
