import { assertNvidiaModelHosted } from './nvidia-nim-catalog';
import type { GenerateJsonRequest, GenerateTextRequest, LlmProvider } from './types';

const NIM_CHAT_COMPLETIONS_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
/** Keep under Netlify's ~26s function limit; large models can exceed it before this cap. */
const NIM_REQUEST_TIMEOUT_MS = 22_000;
/** Enough for a full itinerary JSON without pushing slow 70B models past serverless limits. */
const NIM_JSON_MAX_TOKENS = 4096;

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function callNimChatCompletions(apiKey: string, model: string, body: Record<string, unknown>): Promise<string> {
  assertNvidiaModelHosted(model);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NIM_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(NIM_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `NVIDIA NIM request timed out after ${NIM_REQUEST_TIMEOUT_MS / 1000}s. Use Google Gemini or a smaller NVIDIA model (e.g. Nemotron Nano 9B).`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 404) {
      throw new Error(
        `NVIDIA NIM request failed (404): Model "${model}" is not available on the hosted API. Choose another model.`,
      );
    }
    throw new Error(`NVIDIA NIM request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('NVIDIA NIM returned an empty response.');
  }

  return content;
}

export function createNvidiaNimProvider(config: { apiKey: string; model: string }): LlmProvider {
  const { apiKey, model } = config;

  return {
    id: 'nvidia-nim',
    displayName: 'NVIDIA NIM',
    model,
    capabilities: { structuredJson: true, webGrounding: false },

    async generateJson(request: GenerateJsonRequest): Promise<string> {
      return callNimChatCompletions(apiKey, model, {
        model,
        max_tokens: NIM_JSON_MAX_TOKENS,
        temperature: request.temperature ?? 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
      });
    },

    async generateText(request: GenerateTextRequest): Promise<string> {
      return callNimChatCompletions(apiKey, model, {
        model,
        temperature: request.temperature ?? 0.5,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
      });
    },
  };
}
