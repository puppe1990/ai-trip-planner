import { assertNvidiaModelHosted } from './nvidia-nim-catalog';
import type { GenerateJsonRequest, GenerateTextRequest, LlmProvider } from './types';

const NIM_CHAT_COMPLETIONS_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
/** Trip-plan JSON often exceeds the API default (4096); raise to avoid truncated responses. */
const NIM_JSON_MAX_TOKENS = 8192;

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function callNimChatCompletions(apiKey: string, model: string, body: Record<string, unknown>): Promise<string> {
  assertNvidiaModelHosted(model);

  const response = await fetch(NIM_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

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
