import { getGeminiLanguage } from '../i18n/index';
import type { LlmProvider } from '../lib/llm/types';

export type { TransitSection } from '../lib/transit-parse';

export interface TransitSearchResult {
  rawText: string;
  sources: Array<{ title: string; url: string }>;
}

export function buildTransitPrompt(destination: string, locale = 'pt-BR'): string {
  const lang = getGeminiLanguage(locale);
  const langInstruction =
    lang === 'en'
      ? 'Structure your response EXCLUSIVELY in English.'
      : 'Estruture sua resposta EXCLUSIVELY em Português do Brasil (pt-BR).';

  return `You are a global urban mobility expert. Search in real time with Google Search for updated transport options in "${destination}".
${langInstruction}
Return topics exactly in the format below (with titles marked by '###'):

### Ride Apps & Taxis
### Routes & Local Navigation
### Metro, Train & Rail
### Buses & Local Transport
### Fares & Payment
### General Mobility Tips

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
