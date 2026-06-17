import type { TripPlan } from '../types';

export function parseCost(costStr: string): number {
  if (!costStr) return 0;
  const match = costStr.replace(/\./g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export interface GroupBudgetEstimate {
  hotelGroup: number;
  foodGroup: number;
  transportGroup: number;
  total: number;
  doubleRooms: number;
}

export function calculateGroupBudget(tripPlan: TripPlan, travelersCount: number): GroupBudgetEstimate {
  const hotelBase = parseCost(tripPlan.budgetEstimate.hotelAverageNight);
  const foodBase = parseCost(tripPlan.budgetEstimate.foodAverageDay);
  const transportBase = parseCost(tripPlan.budgetEstimate.transportAverageDay);
  const doubleRooms = Math.ceil(travelersCount / 2);

  const hotelGroup = hotelBase * doubleRooms * tripPlan.durationDays;
  const foodGroup = foodBase * travelersCount * tripPlan.durationDays;
  const transportGroup = transportBase * travelersCount * tripPlan.durationDays;

  return {
    hotelGroup,
    foodGroup,
    transportGroup,
    total: hotelGroup + foodGroup + transportGroup,
    doubleRooms,
  };
}
