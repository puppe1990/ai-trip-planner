import { describe, expect, it } from 'vitest';
import i18n from '@/src/i18n';
import { QUICK_DESTINATION_REGIONS, QUICK_DESTINATIONS_BY_REGION } from '@/src/data';
import {
  DEFAULT_QUICK_REGION,
  QUICK_SUGGESTIONS_PER_REGION,
  getQuickDestinationsForRegion,
  isDestinationInBrazil,
} from '@/src/lib/quick-destinations';

describe('quick-destinations', () => {
  it('defaults to brazil as the initial region', () => {
    expect(DEFAULT_QUICK_REGION).toBe('brazil');
  });

  it('exposes one filter button per region with brazil separated first', () => {
    expect(QUICK_DESTINATION_REGIONS).toHaveLength(6);
    expect(QUICK_DESTINATION_REGIONS[0]?.id).toBe('brazil');
    expect(QUICK_DESTINATION_REGIONS.map((region) => region.id)).toEqual([
      'brazil',
      'europe',
      'asia',
      'americas',
      'africa',
      'oceania',
    ]);
  });

  it('returns four pre-suggestions for every region', () => {
    for (const region of QUICK_DESTINATION_REGIONS) {
      const destinations = getQuickDestinationsForRegion(region.id);
      expect(destinations).toHaveLength(QUICK_SUGGESTIONS_PER_REGION);
    }
  });

  it('keeps brazil suggestions inside the brazil region only', () => {
    const brazilDestinations = getQuickDestinationsForRegion('brazil');

    expect(brazilDestinations.every((dest) => isDestinationInBrazil(dest.params.destination))).toBe(true);
  });

  it('keeps americas suggestions outside brazil', () => {
    const americasDestinations = getQuickDestinationsForRegion('americas');

    expect(americasDestinations.every((dest) => !isDestinationInBrazil(dest.params.destination))).toBe(true);
  });

  it('uses unique destination keys across the full catalog', () => {
    const keys = Object.values(QUICK_DESTINATIONS_BY_REGION)
      .flat()
      .map((dest) => dest.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('translates every quick destination in pt-BR and en', async () => {
    for (const destinations of Object.values(QUICK_DESTINATIONS_BY_REGION)) {
      for (const dest of destinations) {
        await i18n.changeLanguage('pt-BR');
        expect(i18n.t(`quickDest.${dest.key}.name`)).not.toBe(`quickDest.${dest.key}.name`);
        expect(i18n.t(`quickDest.${dest.key}.tagline`)).not.toBe(`quickDest.${dest.key}.tagline`);

        await i18n.changeLanguage('en');
        expect(i18n.t(`quickDest.${dest.key}.name`)).not.toBe(`quickDest.${dest.key}.name`);
        expect(i18n.t(`quickDest.${dest.key}.tagline`)).not.toBe(`quickDest.${dest.key}.tagline`);
      }
    }
  });
});
