export type LlmProviderId = 'gemini' | 'nvidia-nim';

export type LlmCapabilities = {
  structuredJson: boolean;
  webGrounding: boolean;
};

export type GroundingSource = {
  title: string;
  url: string;
};

export type GenerateJsonRequest = {
  system: string;
  prompt: string;
  temperature?: number;
};

export type GenerateTextRequest = {
  system: string;
  prompt: string;
  temperature?: number;
};

export type GenerateGroundedTextRequest = {
  prompt: string;
  temperature?: number;
};

export type GroundedTextResult = {
  text: string;
  sources: GroundingSource[];
};

export interface LlmProvider {
  id: LlmProviderId;
  displayName: string;
  model: string;
  capabilities: LlmCapabilities;
  generateJson(request: GenerateJsonRequest): Promise<string>;
  generateText(request: GenerateTextRequest): Promise<string>;
  generateGroundedText?(request: GenerateGroundedTextRequest): Promise<GroundedTextResult>;
}
