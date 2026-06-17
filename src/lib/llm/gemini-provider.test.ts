import { describe, expect, it, vi } from 'vitest';
import { createGeminiProvider } from './gemini-provider';

const generateContentMock = vi.fn();

vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/genai')>();
  return {
    ...actual,
    GoogleGenAI: class MockGoogleGenAI {
      models = { generateContent: generateContentMock };
    },
  };
});

describe('createGeminiProvider', () => {
  it('calls generateContent with json schema for generateJson', async () => {
    generateContentMock.mockResolvedValue({ text: '{"destination":"Paris"}' });

    const provider = createGeminiProvider({
      apiKey: 'gemini-test-key',
      model: 'gemini-3.5-flash',
    });

    const json = await provider.generateJson({
      system: 'Return JSON',
      prompt: 'Plan a trip to Paris',
      temperature: 0.8,
    });

    expect(json).toBe('{"destination":"Paris"}');
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-3.5-flash',
        contents: 'Plan a trip to Paris',
        config: expect.objectContaining({
          systemInstruction: 'Return JSON',
          responseMimeType: 'application/json',
          temperature: 0.8,
        }),
      }),
    );
  });

  it('returns grounded text and sources for generateGroundedText', async () => {
    generateContentMock.mockResolvedValue({
      text: '### Metro\nLine 1 is available',
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://example.com/metro', title: 'Metro Guide' } },
              { web: { uri: 'https://example.com/metro', title: 'Duplicate' } },
            ],
          },
        },
      ],
    });

    const provider = createGeminiProvider({
      apiKey: 'gemini-test-key',
      model: 'gemini-3.5-flash',
    });

    const result = await provider.generateGroundedText?.({
      prompt: 'Transit in Tokyo',
      temperature: 0.5,
    });

    expect(result).toEqual({
      text: '### Metro\nLine 1 is available',
      sources: [{ title: 'Metro Guide', url: 'https://example.com/metro' }],
    });

    expect(generateContentMock).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash',
      contents: 'Transit in Tokyo',
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });
  });
});
