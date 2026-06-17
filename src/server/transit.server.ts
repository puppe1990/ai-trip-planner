import { getGeminiLanguage } from '../i18n/index';
import type { LlmProvider } from '../lib/llm/types';

export type { TransitSection } from '../lib/transit-parse';

export interface TransitSearchResult {
  rawText: string;
  sources: Array<{ title: string; url: string }>;
}

const TRANSIT_SECTION_HEADERS = {
  en: [
    '### Ride Apps & Taxis',
    '### Routes & Local Navigation',
    '### Metro, Train & Rail',
    '### Buses & Local Transport',
    '### Fares & Payment',
    '### General Mobility Tips',
  ],
  'pt-BR': [
    '### Apps de Corrida e Táxis',
    '### Rotas e Navegação Local',
    '### Metrô, Trem e Trens',
    '### Ônibus e Transporte Local',
    '### Tarifas e Pagamento',
    '### Dicas Gerais de Mobilidade',
  ],
} as const;

export function buildTransitPrompt(destination: string, locale = 'pt-BR'): string {
  const lang = getGeminiLanguage(locale);
  const langInstruction =
    lang === 'en'
      ? 'Structure your response EXCLUSIVELY in English.'
      : 'Estruture sua resposta EXCLUSIVAMENTE em Português do Brasil (pt-BR).';

  const sectionHeaders = TRANSIT_SECTION_HEADERS[lang].join('\n');

  return `You are a global urban mobility expert. Search in real time with Google Search for updated transport options in "${destination}".
${langInstruction}
Return topics exactly in the format below (with titles marked by '###'):

${sectionHeaders}

Be direct and friendly. No generic introductions.`;
}

export async function searchTransit(
  provider: LlmProvider,
  destination: string,
  locale = 'pt-BR',
): Promise<TransitSearchResult> {
  if (!destination?.trim()) {
    throw new Error('Destination is required for transit search.');
  }

  const prompt = buildTransitPrompt(destination, locale);

  if (provider.generateGroundedText) {
    const grounded = await provider.generateGroundedText({ prompt, temperature: 0.5 });
    return {
      rawText: grounded.text,
      sources: grounded.sources,
    };
  }

  const text = await provider.generateText({
    system: 'You are a global urban mobility expert.',
    prompt,
    temperature: 0.5,
  });

  return {
    rawText: text,
    sources: [],
  };
}
