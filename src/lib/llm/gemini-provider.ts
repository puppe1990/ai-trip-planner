import { GoogleGenAI } from '@google/genai';
import { responseSchema } from '../planner-schema';
import { extractGroundingSources } from './gemini-grounding';
import type { GenerateGroundedTextRequest, GenerateJsonRequest, GenerateTextRequest, LlmProvider } from './types';

export function createGeminiProvider(config: { apiKey: string; model: string }): LlmProvider {
  const client = new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: { headers: { 'User-Agent': 'trip-planner-tanstack' } },
  });

  return {
    id: 'gemini',
    displayName: 'Google Gemini',
    model: config.model,
    capabilities: { structuredJson: true, webGrounding: true },

    async generateJson(request: GenerateJsonRequest): Promise<string> {
      const response = await client.models.generateContent({
        model: config.model,
        contents: request.prompt,
        config: {
          systemInstruction: request.system,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: request.temperature ?? 0.8,
        },
      });

      const text = response?.text;
      if (!text) throw new Error('No content returned by Gemini model.');
      return text;
    },

    async generateText(request: GenerateTextRequest): Promise<string> {
      const response = await client.models.generateContent({
        model: config.model,
        contents: request.prompt,
        config: {
          systemInstruction: request.system,
          temperature: request.temperature ?? 0.5,
        },
      });

      const text = response?.text;
      if (!text) throw new Error('No content returned by Gemini model.');
      return text;
    },

    async generateGroundedText(request: GenerateGroundedTextRequest) {
      const response = await client.models.generateContent({
        model: config.model,
        contents: request.prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: request.temperature ?? 0.5,
        },
      });

      const text = response?.text;
      if (!text) throw new Error('No response from Gemini grounded search.');

      return {
        text,
        sources: extractGroundingSources(response),
      };
    },
  };
}
