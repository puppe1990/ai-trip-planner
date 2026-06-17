import { QUICK_DESTINATIONS_BY_REGION, type QuickDestination, type QuickDestinationRegion } from '@/src/data';

export const DEFAULT_QUICK_REGION: QuickDestinationRegion = 'brazil';
export const QUICK_SUGGESTIONS_PER_REGION = 4;

export function getQuickDestinationsForRegion(region: QuickDestinationRegion): readonly QuickDestination[] {
  return QUICK_DESTINATIONS_BY_REGION[region];
}

export function isDestinationInBrazil(destination: string): boolean {
  return /brasil/i.test(destination);
}
