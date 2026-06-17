export type ParsedAiError = {
  message: string;
  isRetryable: boolean;
  statusCode?: number;
  isServerlessTimeout?: boolean;
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

function isModelUnavailableMessage(message: string, statusCode?: number): boolean {
  return (
    statusCode === 404 ||
    /404 page not found|not available on the hosted api|function '.*' not found|not found/i.test(message)
  );
}

function isTransientMessage(message: string, statusCode?: number): boolean {
  return statusCode === 503 || statusCode === 429 || /high demand|try again|unavailable|rate limit/i.test(message);
}

function isInvalidPlannerJsonMessage(message: string): boolean {
  return /Invalid planner JSON|Planner response is not valid JSON/i.test(message);
}

function isServerlessTimeoutMessage(message: string): boolean {
  return (
    /unknown error has occurred/i.test(message) ||
    /errorType["']?\s*:\s*["']?Error/i.test(message) ||
    /timed out after \d+s/i.test(message) ||
    /function.*timed out|execution timed out/i.test(message)
  );
}

export function isPlannerJsonValidationError(message: string): boolean {
  return isInvalidPlannerJsonMessage(message);
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

      const isServerlessTimeout = isServerlessTimeoutMessage(message) || isServerlessTimeoutMessage(raw);
      return {
        message,
        statusCode,
        isServerlessTimeout,
        isRetryable:
          isServerlessTimeout ||
          isModelUnavailableMessage(message, statusCode) ||
          isTransientMessage(message, statusCode) ||
          isInvalidPlannerJsonMessage(message) ||
          nestedStatus === 'UNAVAILABLE',
      };
    } catch {
      // fall through to plain-text parsing
    }
  }

  const isServerlessTimeout = isServerlessTimeoutMessage(raw);
  return {
    message: raw,
    statusCode,
    isServerlessTimeout,
    isRetryable:
      isServerlessTimeout ||
      isModelUnavailableMessage(raw, statusCode) ||
      isTransientMessage(raw, statusCode) ||
      isInvalidPlannerJsonMessage(raw),
  };
}
