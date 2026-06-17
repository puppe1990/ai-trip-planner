import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNvidiaNimProvider } from './nvidia-nim-provider';

const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

function mockNimResponse(content: string) {
  return {
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  };
}

describe('createNvidiaNimProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls NVIDIA NIM chat completions with bearer auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockNimResponse('Hello transit'));
    vi.stubGlobal('fetch', fetchMock);

    const provider = createNvidiaNimProvider({
      apiKey: 'nvapi-test-key',
      model: 'meta/llama-3.3-70b-instruct',
    });

    const text = await provider.generateText({
      system: 'You are helpful',
      prompt: 'Transit tips for Paris',
      temperature: 0.5,
    });

    expect(text).toBe('Hello transit');
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(NIM_URL);
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer nvapi-test-key',
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(options.body as string);
    expect(body.model).toBe('meta/llama-3.3-70b-instruct');
    expect(body.temperature).toBe(0.5);
    expect(body.messages).toEqual([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Transit tips for Paris' },
    ]);
  });

  it('requests json_object format for generateJson', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockNimResponse('{"destination":"Paris"}'));
    vi.stubGlobal('fetch', fetchMock);

    const provider = createNvidiaNimProvider({
      apiKey: 'nvapi-test-key',
      model: 'meta/llama-3.3-70b-instruct',
    });

    const json = await provider.generateJson({
      system: 'Return JSON only',
      prompt: 'Plan a trip',
      temperature: 0.8,
    });

    expect(json).toBe('{"destination":"Paris"}');

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.temperature).toBe(0.8);
  });

  it('rejects unhosted models before calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const provider = createNvidiaNimProvider({
      apiKey: 'nvapi-test-key',
      model: 'qwen/qwen2.5-72b-instruct',
    });

    await expect(provider.generateText({ system: 'sys', prompt: 'prompt' })).rejects.toThrow(
      'not available on the hosted NVIDIA NIM API',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a helpful error when the API fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = createNvidiaNimProvider({
      apiKey: 'bad-key',
      model: 'meta/llama-3.3-70b-instruct',
    });

    await expect(provider.generateText({ system: 'sys', prompt: 'prompt' })).rejects.toThrow(
      'NVIDIA NIM request failed (401): Unauthorized',
    );
  });

  it('throws a model-specific message for hosted-model 404 responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => '404 page not found',
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = createNvidiaNimProvider({
      apiKey: 'nvapi-test-key',
      model: 'meta/llama-3.3-70b-instruct',
    });

    await expect(provider.generateText({ system: 'sys', prompt: 'prompt' })).rejects.toThrow(
      'Model "meta/llama-3.3-70b-instruct" is not available on the hosted API',
    );
  });
});
