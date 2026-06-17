export function isTripPlannerMultiStepEnabled(): boolean {
  const raw = process.env.TRIP_PLANNER_MULTI_STEP?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== 'false';
}
