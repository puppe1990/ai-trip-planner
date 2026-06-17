import type { GoogleGenAI } from '@google/genai';
import { getGeminiLanguage } from '../i18n/index';

export type { TransitSection } from '../lib/transit-parse';

export interface TransitSearchResult {
  rawText: string;
  sources: Array<{ title: string; url: string }>;
}

export function extractGroundingSources(response: {
  candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }>;
}): Array<{ title: string; url: string }> {
  const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: Array<{ title: string; url: string }> = [];
  const seenUrls = new Set<string>();

  for (const c of rawChunks) {
    if (c.web?.uri && !seenUrls.has(c.web.uri)) {
      seenUrls.add(c.web.uri);
      sources.push({ title: c.web.title || 'Search Source', url: c.web.uri });
    }
  }

  return sources;
}

export function buildTransitPrompt(destination: string, locale = 'pt-BR'): string {
  const lang = getGeminiLanguage(locale);
  const langInstruction =
    lang === 'en'
      ? 'Structure your response EXCLUSIVELY in English.'
      : 'Estruture sua resposta EXCLUSIVAMENTE em Português do Brasil (pt-BR).';

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
  client: GoogleGenAI,
  destination: string,
  locale = 'pt-BR',
): Promise<TransitSearchResult> {
  if (!destination?.trim()) {
    throw new Error('Destination is required for transit search.');
  }

  const response = await client.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: buildTransitPrompt(destination, locale),
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.5,
    },
  });

  const responseText = response?.text;
  if (!responseText) throw new Error('No response from transit search.');

  return {
    rawText: responseText,
    sources: extractGroundingSources(response),
  };
}
