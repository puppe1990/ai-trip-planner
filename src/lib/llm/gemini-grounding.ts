import type { GroundingSource } from './types';

export function extractGroundingSources(response: {
  candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }>;
}): GroundingSource[] {
  const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = [];
  const seenUrls = new Set<string>();

  for (const chunk of rawChunks) {
    if (chunk.web?.uri && !seenUrls.has(chunk.web.uri)) {
      seenUrls.add(chunk.web.uri);
      sources.push({ title: chunk.web.title || 'Search Source', url: chunk.web.uri });
    }
  }

  return sources;
}
