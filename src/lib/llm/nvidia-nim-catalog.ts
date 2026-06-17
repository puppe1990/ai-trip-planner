type CatalogModel = {
  id: string;
  label: string;
};

/** Models verified against integrate.api.nvidia.com/v1/chat/completions. */
export const NVIDIA_NIM_HOSTED_MODEL_IDS = [
  'meta/llama-3.3-70b-instruct',
  'meta/llama-3.1-70b-instruct',
  'mistralai/mixtral-8x7b-instruct-v0.1',
  'nvidia/nvidia-nemotron-nano-9b-v2',
  'meta/llama-3.1-8b-instruct',
  'nvidia/nemotron-mini-4b-instruct',
] as const;

export type NvidiaNimHostedModelId = (typeof NVIDIA_NIM_HOSTED_MODEL_IDS)[number];

const HOSTED_MODEL_ID_SET = new Set<string>(NVIDIA_NIM_HOSTED_MODEL_IDS);

export function isNvidiaModelHosted(modelId: string): modelId is NvidiaNimHostedModelId {
  return HOSTED_MODEL_ID_SET.has(modelId);
}

export function filterHostedNvidiaModels(catalog: CatalogModel[]): CatalogModel[] {
  return catalog.filter((model) => isNvidiaModelHosted(model.id));
}

export class NvidiaModelNotHostedError extends Error {
  constructor(modelId: string) {
    super(`Model "${modelId}" is not available on the hosted NVIDIA NIM API. Choose a supported model from the list.`);
    this.name = 'NvidiaModelNotHostedError';
  }
}

export function assertNvidiaModelHosted(modelId: string): void {
  if (!isNvidiaModelHosted(modelId)) {
    throw new NvidiaModelNotHostedError(modelId);
  }
}
