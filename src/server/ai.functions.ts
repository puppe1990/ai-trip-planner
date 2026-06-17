import { createServerFn } from '@tanstack/react-start';
import { getAiConfig } from '../lib/ai-config';

export const getAiConfigFn = createServerFn({ method: 'GET' }).handler(async () => getAiConfig());
