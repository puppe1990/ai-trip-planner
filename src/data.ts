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

export const QUICK_DESTINATIONS = [
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
] as const;

export const DEFAULT_SEARCH: TripSearchParams = {
  destination: '',
  duration: 4,
  budget: 'Médio',
  style: 'Equilibrado',
  companion: 'Solo',
  season: '',
  extraNotes: '',
};