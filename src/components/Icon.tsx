import type { HTMLAttributes } from 'react';

export type IconName =
  | 'compass'
  | 'map-pin'
  | 'calendar'
  | 'calendar-days'
  | 'users'
  | 'sparkles'
  | 'pen-tool'
  | 'trash'
  | 'search'
  | 'luggage'
  | 'globe'
  | 'alert-circle'
  | 'x'
  | 'plane'
  | 'info'
  | 'logout'
  | 'sun'
  | 'cloud-sun'
  | 'moon'
  | 'utensils'
  | 'layers'
  | 'plus'
  | 'minus'
  | 'navigation'
  | 'arrow-left'
  | 'share'
  | 'printer'
  | 'save'
  | 'piggy-bank'
  | 'building'
  | 'coffee'
  | 'award'
  | 'clock'
  | 'check'
  | 'thermometer'
  | 'flame'
  | 'snowflake'
  | 'umbrella'
  | 'loader'
  | 'car'
  | 'smartphone'
  | 'train'
  | 'bus'
  | 'credit-card'
  | 'lightbulb'
  | 'external-link'
  | 'whatsapp'
  | 'mail';

const ICON_GLYPHS: Record<IconName, string> = {
  compass: '🧭',
  'map-pin': '📍',
  calendar: '📅',
  'calendar-days': '📆',
  users: '👥',
  sparkles: '✨',
  'pen-tool': '✏️',
  trash: '🗑️',
  search: '🔍',
  luggage: '🧳',
  globe: '🌐',
  'alert-circle': '⚠️',
  x: '✕',
  plane: '✈️',
  info: 'ℹ️',
  logout: '🚪',
  sun: '☀️',
  'cloud-sun': '⛅',
  moon: '🌙',
  utensils: '🍽️',
  layers: '📋',
  plus: '＋',
  minus: '−',
  navigation: '🧭',
  'arrow-left': '←',
  share: '↗',
  printer: '🖨',
  save: '💾',
  'piggy-bank': '🐷',
  building: '🏢',
  coffee: '☕',
  award: '🏆',
  clock: '🕐',
  check: '✓',
  thermometer: '🌡️',
  flame: '🔥',
  snowflake: '❄️',
  umbrella: '☂️',
  loader: '⟳',
  car: '🚗',
  smartphone: '📱',
  train: '🚆',
  bus: '🚌',
  'credit-card': '💳',
  lightbulb: '💡',
  'external-link': '↗',
  whatsapp: '💬',
  mail: '✉️',
};

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  name: IconName;
  spin?: boolean;
  pulse?: boolean;
};

export function Icon({ name, className = '', spin, pulse, ...props }: IconProps) {
  const animation = spin ? 'animate-spin' : pulse ? 'animate-pulse' : '';

  return (
    <span
      className={`inline-flex items-center justify-center leading-none select-none shrink-0 ${animation} ${className}`}
      aria-hidden
      {...props}
    >
      {ICON_GLYPHS[name]}
    </span>
  );
}

export function transitIconName(iconName: string): IconName {
  switch (iconName) {
    case 'Car':
      return 'car';
    case 'Smartphone':
      return 'smartphone';
    case 'Train':
      return 'train';
    case 'Bus':
      return 'bus';
    case 'CreditCard':
      return 'credit-card';
    case 'Lightbulb':
      return 'lightbulb';
    default:
      return 'navigation';
  }
}

export function TransitIcon({ icon, className = '' }: { icon: string; className?: string }) {
  return <Icon name={transitIconName(icon)} className={className} />;
}

export function timeSlotIcon(timeSlot: string): IconName {
  switch (timeSlot) {
    case 'Tarde':
      return 'cloud-sun';
    case 'Noite':
      return 'moon';
    case 'Gastronomia':
      return 'utensils';
    default:
      return 'sun';
  }
}
