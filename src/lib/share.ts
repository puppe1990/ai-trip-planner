import type { TripPlan } from '../types';

export function encodeTripPlanForShare(tripPlan: TripPlan): string {
  const jsonStr = JSON.stringify(tripPlan);
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binString);
}

export function decodeSharedTripPlan(base64Data: string): TripPlan | null {
  try {
    const binString = atob(base64Data);
    const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
    const decodedStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(decodedStr) as TripPlan;
    if (parsed?.destination && parsed?.days) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(tripPlan: TripPlan, origin: string, pathname: string): string {
  const b64 = encodeTripPlanForShare(tripPlan);
  return `${origin}${pathname}#share=${b64}`;
}

export function parseShareHash(hash: string): TripPlan | null {
  if (!hash.startsWith('#share=')) return null;
  const base64Data = hash.substring('#share='.length);
  if (!base64Data) return null;
  return decodeSharedTripPlan(base64Data);
}
