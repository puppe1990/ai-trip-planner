import { describe, expect, it } from 'vitest';
import { parseTransitSections } from '../lib/transit-parse';
import { extractGroundingSources } from './transit.server';

describe('transit.server', () => {
  it('parses ### sections from raw text', () => {
    const raw = `Intro ignored
### Ride Apps & Taxis
Uber and Bolt are available.
- Easy to get rides

### Metro, Train & Rail
There is a metro system.
Line 1 covers downtown`;

    const sections = parseTransitSections(raw);
    expect(sections).toHaveLength(2);
    expect(sections[0].icon).toBe('Car');
    expect(sections[1].icon).toBe('Train');
    expect(sections[0].content).toContain('Uber');
  });

  it('extracts unique grounding sources', () => {
    const sources = extractGroundingSources({
      candidates: [{
        groundingMetadata: {
          groundingChunks: [
            { web: { uri: 'https://example.com/a', title: 'Source A' } },
            { web: { uri: 'https://example.com/a', title: 'Duplicate' } },
            { web: { uri: 'https://example.com/b', title: 'Source B' } },
          ],
        },
      }],
    });
    expect(sources).toHaveLength(2);
    expect(sources[0].url).toBe('https://example.com/a');
  });
});