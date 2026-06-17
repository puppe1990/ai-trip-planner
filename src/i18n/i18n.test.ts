import { describe, expect, it } from 'vitest';
import i18n, { SUPPORTED_LANGUAGES } from './index';

describe('i18n', () => {
  it('supports pt-BR and en', () => {
    expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
    expect(SUPPORTED_LANGUAGES).toContain('en');
  });

  it('translates app name in both languages', async () => {
    await i18n.changeLanguage('pt-BR');
    expect(i18n.t('common.appName')).toBe('TripPlanner');

    await i18n.changeLanguage('en');
    expect(i18n.t('common.tagline')).toContain('virtual assistant');
  });
});