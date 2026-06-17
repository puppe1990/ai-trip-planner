import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY not found in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'trip-planner-tanstack' } },
    });
  }
  return aiClient;
}

export function resetGeminiClientForTests(): void {
  aiClient = null;
}