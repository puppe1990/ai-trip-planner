export type ParsedAiError = {
  message: string;
  isRetryable: boolean;
  statusCode?: number;
};

function extractJsonMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const nestedError = record.error;
  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = (nestedError as Record<string, unknown>).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage.trim();
  }

  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  return null;
}

export function parseAiGenerationError(raw: string): ParsedAiError {
  const statusMatch = raw.match(/\((\d{3})\)/);
  const statusCode = statusMatch ? Number(statusMatch[1]) : undefined;
  const jsonStart = raw.indexOf('{');

  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart)) as unknown;
      const message = extractJsonMessage(parsed) ?? raw;
      const nestedStatus =
        parsed && typeof parsed === 'object'
          ? ((parsed as Record<string, unknown>).error as Record<string, unknown> | undefined)?.status
          : undefined;

      return {
        message,
        statusCode,
        isRetryable:
          statusCode === 503 ||
          statusCode === 429 ||
          nestedStatus === 'UNAVAILABLE' ||
          /high demand|try again|unavailable|rate limit/i.test(message),
      };
    } catch {
      // fall through to plain-text parsing
    }
  }

  return {
    message: raw,
    statusCode,
    isRetryable: statusCode === 503 || statusCode === 429 || /high demand|try again|unavailable|rate limit/i.test(raw),
  };
}
