import { afterEach, describe, expect, it, vi } from 'vitest';
import { isTripPlannerMultiStepEnabled } from './trip-planner-config';

describe('isTripPlannerMultiStepEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to true when TRIP_PLANNER_MULTI_STEP is unset', () => {
    vi.stubEnv('TRIP_PLANNER_MULTI_STEP', '');
    expect(isTripPlannerMultiStepEnabled()).toBe(true);
  });

  it('returns true when TRIP_PLANNER_MULTI_STEP is "true"', () => {
    vi.stubEnv('TRIP_PLANNER_MULTI_STEP', 'true');
    expect(isTripPlannerMultiStepEnabled()).toBe(true);
  });

  it('returns false when TRIP_PLANNER_MULTI_STEP is "false"', () => {
    vi.stubEnv('TRIP_PLANNER_MULTI_STEP', 'false');
    expect(isTripPlannerMultiStepEnabled()).toBe(false);
  });
});
