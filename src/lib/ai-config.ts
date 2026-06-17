export const AI_PROVIDER = 'Google Gemini';
export const DEFAULT_AI_MODEL = 'gemini-3.5-flash';

export type AiConfig = {
  provider: string;
  model: string;
};

function resolveEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function getAiConfig(): AiConfig {
  return {
    provider: resolveEnv(process.env.AI_PROVIDER, AI_PROVIDER),
    model: resolveEnv(process.env.AI_MODEL, DEFAULT_AI_MODEL),
  };
}
