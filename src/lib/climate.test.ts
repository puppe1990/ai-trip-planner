import { describe, expect, it } from 'vitest';
import { getDestinationClimate } from './climate';

describe('getDestinationClimate', () => {
  it('returns tropical profile for Rio de Janeiro', () => {
    const profile = getDestinationClimate('Rio de Janeiro');

    expect(profile.climateType).toBe('Tropical Marítimo / Quente');
    expect(profile.months).toHaveLength(12);
    expect(profile.months[0].tempMax).toBeGreaterThan(28);
    expect(profile.months[6].tempMin).toBeLessThan(22);
  });

  it('returns alpine profile for Switzerland', () => {
    const profile = getDestinationClimate('Switzerland');

    expect(profile.climateType).toBe('Alpino / Frio de Montanha');
    expect(profile.months).toHaveLength(12);
    expect(profile.months[0].tempMin).toBeLessThan(0);
    expect(profile.months[6].tempMax).toBeGreaterThan(20);
  });

  it('returns southern hemisphere temperate profile for São Paulo', () => {
    const profile = getDestinationClimate('São Paulo');

    expect(profile.climateType).toBe('Temperado Subtropical / Sul');
    expect(profile.months).toHaveLength(12);
    // January = summer in the southern hemisphere
    expect(profile.months[0].tempMax).toBeGreaterThan(profile.months[6].tempMax);
    expect(profile.months[0].month).toBe('Jan');
    expect(profile.months[6].month).toBe('Jul');
  });
});