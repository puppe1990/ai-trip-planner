import { describe, expect, it, vi } from 'vitest';
import { parseTransitSections } from '../lib/transit-parse';
import { extractGroundingSources } from '../lib/llm/gemini-grounding';
import type { LlmProvider } from '../lib/llm/types';
import { buildTransitPrompt, searchTransit } from './transit.server';

describe('transit.server', () => {
  it('parses ### sections from raw text', () => {
    const raw = `Intro ignored
### Ride Apps & Taxis
Uber and Bolt are available.
- Easy to get rides

### Metro, Train & Rail
There is a metro system.
Line 1 covers downtown`;

    const sections = parseTransitSections(raw);
    expect(sections).toHaveLength(2);
    expect(sections[0].key).toBe('rideApps');
    expect(sections[0].icon).toBe('Car');
    expect(sections[1].key).toBe('metro');
    expect(sections[1].icon).toBe('Train');
    expect(sections[0].content).toContain('Uber');
  });

  it('extracts unique grounding sources', () => {
    const sources = extractGroundingSources({
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://example.com/a', title: 'Source A' } },
              { web: { uri: 'https://example.com/a', title: 'Duplicate' } },
              { web: { uri: 'https://example.com/b', title: 'Source B' } },
            ],
          },
        },
      ],
    });
    expect(sources).toHaveLength(2);
    expect(sources[0].url).toBe('https://example.com/a');
  });

  it('builds Portuguese section headers for pt-BR locale', () => {
    const prompt = buildTransitPrompt('São Paulo, Brasil', 'pt-BR');

    expect(prompt).toContain('### Apps de Corrida e Táxis');
    expect(prompt).toContain('### Metrô, Trem e Trens');
    expect(prompt).toContain('EXCLUSIVAMENTE em Português do Brasil');
  });

  it('builds English section headers for en locale', () => {
    const prompt = buildTransitPrompt('Paris, France', 'en');

    expect(prompt).toContain('### Ride Apps & Taxis');
    expect(prompt).toContain('EXCLUSIVELY in English');
  });

  it('uses generateGroundedText when provider supports web grounding', async () => {
    const generateGroundedText = vi.fn().mockResolvedValue({
      text: '### Metro\nLine 1',
      sources: [{ title: 'Metro', url: 'https://example.com/metro' }],
    });

    const provider: LlmProvider = {
      id: 'gemini',
      displayName: 'Google Gemini',
      model: 'gemini-3.5-flash',
      capabilities: { structuredJson: true, webGrounding: true },
      generateJson: vi.fn(),
      generateText: vi.fn(),
      generateGroundedText,
    };

    const result = await searchTransit(provider, 'Paris, France', 'en');

    expect(generateGroundedText).toHaveBeenCalledOnce();
    expect(result.rawText).toContain('Metro');
    expect(result.sources).toHaveLength(1);
  });

  it('falls back to generateText without sources when grounding is unavailable', async () => {
    const generateText = vi.fn().mockResolvedValue('### Buses\nUse the local bus network');

    const provider: LlmProvider = {
      id: 'nvidia-nim',
      displayName: 'NVIDIA NIM',
      model: 'meta/llama-3.3-70b-instruct',
      capabilities: { structuredJson: true, webGrounding: false },
      generateJson: vi.fn(),
      generateText,
    };

    const result = await searchTransit(provider, 'Lisbon, Portugal', 'en');

    expect(generateText).toHaveBeenCalledOnce();
    expect(result.rawText).toContain('Buses');
    expect(result.sources).toEqual([]);
  });
});
