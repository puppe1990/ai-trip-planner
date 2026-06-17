import type { TripSearchParams } from './types';

export const BUDGET_VALUES = ['Baixo', 'Médio', 'Alto'] as const;
export const STYLE_VALUES = ['Equilibrado', 'Aventura', 'Cultural', 'Relaxante', 'Gastronômico', 'Familiar'] as const;
export const COMPANION_VALUES = ['Solo', 'Casal', 'Amigos', 'Família'] as const;

export const BUDGET_OPTIONS = [
  { value: 'Baixo', labelKey: 'budget.economic', descKey: 'budget.economicDesc' },
  { value: 'Médio', labelKey: 'budget.moderate', descKey: 'budget.moderateDesc' },
  { value: 'Alto', labelKey: 'budget.premium', descKey: 'budget.premiumDesc' },
] as const;

export const STYLE_OPTIONS = [
  { value: 'Equilibrado', labelKey: 'style.balanced' },
  { value: 'Aventura', labelKey: 'style.adventure' },
  { value: 'Cultural', labelKey: 'style.cultural' },
  { value: 'Relaxante', labelKey: 'style.relaxing' },
  { value: 'Gastronômico', labelKey: 'style.foodie' },
  { value: 'Familiar', labelKey: 'style.family' },
] as const;

export const COMPANION_OPTIONS = [
  { value: 'Solo', labelKey: 'companion.solo' },
  { value: 'Casal', labelKey: 'companion.couple' },
  { value: 'Amigos', labelKey: 'companion.friends' },
  { value: 'Família', labelKey: 'companion.family' },
] as const;

export type QuickDestinationRegion = 'brazil' | 'europe' | 'asia' | 'americas' | 'africa' | 'oceania';

export interface QuickDestination {
  key: string;
  emoji: string;
  bgGradient: string;
  params: TripSearchParams;
}

export const QUICK_DESTINATION_REGIONS = [
  { id: 'brazil', emoji: '🇧🇷', labelKey: 'quickRegions.brazil' },
  { id: 'europe', emoji: '🇪🇺', labelKey: 'quickRegions.europe' },
  { id: 'asia', emoji: '🌏', labelKey: 'quickRegions.asia' },
  { id: 'americas', emoji: '🌎', labelKey: 'quickRegions.americas' },
  { id: 'africa', emoji: '🌍', labelKey: 'quickRegions.africa' },
  { id: 'oceania', emoji: '🏝️', labelKey: 'quickRegions.oceania' },
] as const satisfies ReadonlyArray<{ id: QuickDestinationRegion; emoji: string; labelKey: string }>;

export const QUICK_DESTINATIONS_BY_REGION: Record<QuickDestinationRegion, readonly QuickDestination[]> = {
  brazil: [
    {
      key: 'rio',
      emoji: '🇧🇷',
      bgGradient: 'from-emerald-500 to-teal-600',
      params: {
        destination: 'Rio de Janeiro, Brasil',
        duration: 3,
        budget: 'Baixo',
        style: 'Aventura',
        companion: 'Amigos',
        season: 'Verão',
        extraNotes: 'Visitas ao Cristo, Pão de Açúcar e praias locais.',
      } satisfies TripSearchParams,
    },
    {
      key: 'saoPaulo',
      emoji: '🇧🇷',
      bgGradient: 'from-slate-600 to-zinc-700',
      params: {
        destination: 'São Paulo, Brasil',
        duration: 4,
        budget: 'Médio',
        style: 'Gastronômico',
        companion: 'Casal',
        season: 'Outono',
        extraNotes: 'Gastronomia diversa, museus e vida noturna em bairros como Vila Madalena.',
      } satisfies TripSearchParams,
    },
    {
      key: 'salvador',
      emoji: '🇧🇷',
      bgGradient: 'from-amber-500 to-orange-600',
      params: {
        destination: 'Salvador, Bahia, Brasil',
        duration: 4,
        budget: 'Baixo',
        style: 'Cultural',
        companion: 'Família',
        season: 'Verão',
        extraNotes: 'Pelourinho, culinária baiana e praias do litoral norte.',
      } satisfies TripSearchParams,
    },
    {
      key: 'florianopolis',
      emoji: '🇧🇷',
      bgGradient: 'from-cyan-500 to-blue-600',
      params: {
        destination: 'Florianópolis, Brasil',
        duration: 3,
        budget: 'Médio',
        style: 'Relaxante',
        companion: 'Amigos',
        season: 'Verão',
        extraNotes: 'Praias paradisíacas, trilhas e gastronomia frutos do mar.',
      } satisfies TripSearchParams,
    },
  ],
  europe: [
    {
      key: 'paris',
      emoji: '🇫🇷',
      bgGradient: 'from-blue-500 to-indigo-600',
      params: {
        destination: 'Paris, França',
        duration: 4,
        budget: 'Alto',
        style: 'Gastronômico',
        companion: 'Casal',
        season: 'Outono',
        extraNotes: "Cafés fofos e museus de arte clássicos (Louvre e d'Orsay).",
      } satisfies TripSearchParams,
    },
    {
      key: 'rome',
      emoji: '🇮🇹',
      bgGradient: 'from-amber-500 to-orange-600',
      params: {
        destination: 'Roma, Itália',
        duration: 5,
        budget: 'Médio',
        style: 'Cultural',
        companion: 'Família',
        season: 'Primavera',
        extraNotes: 'Muita culinária Italiana autêntica e passeios de baixo caminhar.',
      } satisfies TripSearchParams,
    },
    {
      key: 'barcelona',
      emoji: '🇪🇸',
      bgGradient: 'from-rose-500 to-red-600',
      params: {
        destination: 'Barcelona, Espanha',
        duration: 4,
        budget: 'Médio',
        style: 'Cultural',
        companion: 'Amigos',
        season: 'Primavera',
        extraNotes: 'Gaudí, Ramblas, tapas e praias urbanas.',
      } satisfies TripSearchParams,
    },
    {
      key: 'lisbon',
      emoji: '🇵🇹',
      bgGradient: 'from-yellow-500 to-amber-600',
      params: {
        destination: 'Lisboa, Portugal',
        duration: 3,
        budget: 'Médio',
        style: 'Gastronômico',
        companion: 'Casal',
        season: 'Outono',
        extraNotes: 'Alfama, elétricos, pastéis de nata e miradouros.',
      } satisfies TripSearchParams,
    },
  ],
  asia: [
    {
      key: 'tokyo',
      emoji: '🇯🇵',
      bgGradient: 'from-pink-500 to-rose-600',
      params: {
        destination: 'Tóquio, Japão',
        duration: 5,
        budget: 'Médio',
        style: 'Cultural',
        companion: 'Solo',
        season: 'Primavera (Cerejeiras)',
        extraNotes: 'Quero ver templos históricos e tecnologia em Akihabara.',
      } satisfies TripSearchParams,
    },
    {
      key: 'bangkok',
      emoji: '🇹🇭',
      bgGradient: 'from-violet-500 to-purple-600',
      params: {
        destination: 'Bangkok, Tailândia',
        duration: 4,
        budget: 'Baixo',
        style: 'Gastronômico',
        companion: 'Amigos',
        season: 'Inverno',
        extraNotes: 'Templos, mercados de rua e vida noturna em rooftop bars.',
      } satisfies TripSearchParams,
    },
    {
      key: 'bali',
      emoji: '🇮🇩',
      bgGradient: 'from-green-500 to-emerald-600',
      params: {
        destination: 'Bali, Indonésia',
        duration: 5,
        budget: 'Médio',
        style: 'Relaxante',
        companion: 'Casal',
        season: 'Verão',
        extraNotes: 'Templos, arrozais em Ubud e praias em Uluwatu.',
      } satisfies TripSearchParams,
    },
    {
      key: 'seoul',
      emoji: '🇰🇷',
      bgGradient: 'from-indigo-500 to-blue-600',
      params: {
        destination: 'Seul, Coreia do Sul',
        duration: 4,
        budget: 'Médio',
        style: 'Cultural',
        companion: 'Solo',
        season: 'Outono',
        extraNotes: 'Palácios, K-pop, street food e bairros tradicionais.',
      } satisfies TripSearchParams,
    },
  ],
  americas: [
    {
      key: 'newYork',
      emoji: '🇺🇸',
      bgGradient: 'from-slate-700 to-slate-900',
      params: {
        destination: 'Nova York, EUA',
        duration: 5,
        budget: 'Alto',
        style: 'Equilibrado',
        companion: 'Amigos',
        season: 'Outono',
        extraNotes: 'Broadway, Central Park, museus e diversidade gastronômica.',
      } satisfies TripSearchParams,
    },
    {
      key: 'buenosAires',
      emoji: '🇦🇷',
      bgGradient: 'from-sky-500 to-blue-600',
      params: {
        destination: 'Buenos Aires, Argentina',
        duration: 4,
        budget: 'Médio',
        style: 'Gastronômico',
        companion: 'Casal',
        season: 'Primavera',
        extraNotes: 'Tango, bife de chorizo, San Telmo e La Boca.',
      } satisfies TripSearchParams,
    },
    {
      key: 'cancun',
      emoji: '🇲🇽',
      bgGradient: 'from-teal-500 to-cyan-600',
      params: {
        destination: 'Cancún, México',
        duration: 4,
        budget: 'Médio',
        style: 'Relaxante',
        companion: 'Família',
        season: 'Inverno',
        extraNotes: 'Praias do Caribe, Chichén Itzá e cenotes.',
      } satisfies TripSearchParams,
    },
    {
      key: 'lima',
      emoji: '🇵🇪',
      bgGradient: 'from-orange-500 to-red-600',
      params: {
        destination: 'Lima, Peru',
        duration: 3,
        budget: 'Baixo',
        style: 'Gastronômico',
        companion: 'Solo',
        season: 'Verão',
        extraNotes: 'Ceviche, Miraflores, centro histórico e culinária peruana.',
      } satisfies TripSearchParams,
    },
  ],
  africa: [
    {
      key: 'marrakech',
      emoji: '🇲🇦',
      bgGradient: 'from-red-600 to-orange-700',
      params: {
        destination: 'Marrakech, Marrocos',
        duration: 4,
        budget: 'Médio',
        style: 'Cultural',
        companion: 'Casal',
        season: 'Primavera',
        extraNotes: 'Medina, souks, riads e excursão ao deserto do Saara.',
      } satisfies TripSearchParams,
    },
    {
      key: 'capeTown',
      emoji: '🇿🇦',
      bgGradient: 'from-blue-600 to-indigo-700',
      params: {
        destination: 'Cidade do Cabo, África do Sul',
        duration: 5,
        budget: 'Médio',
        style: 'Aventura',
        companion: 'Amigos',
        season: 'Verão',
        extraNotes: 'Table Mountain, vinícolas de Stellenbosch e Chapmans Peak.',
      } satisfies TripSearchParams,
    },
    {
      key: 'cairo',
      emoji: '🇪🇬',
      bgGradient: 'from-amber-600 to-yellow-700',
      params: {
        destination: 'Cairo, Egito',
        duration: 4,
        budget: 'Baixo',
        style: 'Cultural',
        companion: 'Família',
        season: 'Inverno',
        extraNotes: 'Pirâmides de Gizé, Museu Egípcio e cruzeiro no Nilo.',
      } satisfies TripSearchParams,
    },
    {
      key: 'zanzibar',
      emoji: '🇹🇿',
      bgGradient: 'from-emerald-600 to-teal-700',
      params: {
        destination: 'Zanzibar, Tanzânia',
        duration: 5,
        budget: 'Médio',
        style: 'Relaxante',
        companion: 'Casal',
        season: 'Verão',
        extraNotes: 'Praias de águas cristalinas, Stone Town e mergulho.',
      } satisfies TripSearchParams,
    },
  ],
  oceania: [
    {
      key: 'sydney',
      emoji: '🇦🇺',
      bgGradient: 'from-blue-500 to-sky-600',
      params: {
        destination: 'Sydney, Austrália',
        duration: 5,
        budget: 'Alto',
        style: 'Equilibrado',
        companion: 'Amigos',
        season: 'Verão',
        extraNotes: 'Opera House, Bondi Beach, Blue Mountains e cafés.',
      } satisfies TripSearchParams,
    },
    {
      key: 'queenstown',
      emoji: '🇳🇿',
      bgGradient: 'from-green-600 to-emerald-700',
      params: {
        destination: 'Queenstown, Nova Zelândia',
        duration: 4,
        budget: 'Alto',
        style: 'Aventura',
        companion: 'Amigos',
        season: 'Inverno',
        extraNotes: 'Esportes radicais, Milford Sound e paisagens de tirar o fôlego.',
      } satisfies TripSearchParams,
    },
    {
      key: 'fiji',
      emoji: '🇫🇯',
      bgGradient: 'from-cyan-500 to-teal-600',
      params: {
        destination: 'Fiji',
        duration: 5,
        budget: 'Alto',
        style: 'Relaxante',
        companion: 'Casal',
        season: 'Verão',
        extraNotes: 'Resorts em ilhas paradisíacas, snorkeling e cultura local.',
      } satisfies TripSearchParams,
    },
    {
      key: 'melbourne',
      emoji: '🇦🇺',
      bgGradient: 'from-violet-600 to-purple-700',
      params: {
        destination: 'Melbourne, Austrália',
        duration: 4,
        budget: 'Médio',
        style: 'Gastronômico',
        companion: 'Solo',
        season: 'Primavera',
        extraNotes: 'Cafés de especialidade, street art e Great Ocean Road.',
      } satisfies TripSearchParams,
    },
  ],
};

export const QUICK_DESTINATIONS = Object.values(QUICK_DESTINATIONS_BY_REGION).flat();

export const DEFAULT_SEARCH: TripSearchParams = {
  destination: '',
  duration: 4,
  budget: 'Médio',
  style: 'Equilibrado',
  companion: 'Solo',
  season: '',
  extraNotes: '',
};
