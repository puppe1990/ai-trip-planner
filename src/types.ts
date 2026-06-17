export interface Activity {
  title: string;
  description: string;
  cost: string;
  duration: string;
}

export interface DiningSpot {
  name: string;
  type: string;
  priceLevel: string;
  description: string;
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  diningSpot: DiningSpot;
}

export interface BudgetEstimate {
  totalCostEstimate: string;
  hotelAverageNight: string;
  foodAverageDay: string;
  transportAverageDay: string;
}

export interface TravelTip {
  category: string;
  text: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  durationDays: number;
  tagline: string;
  summary: string;
  budgetEstimate: BudgetEstimate;
  packingEssentials: string[];
  weatherExpected: string;
  days: DayPlan[];
  tips: TravelTip[];
  createdAt: string;
  budgetPreference?: string;
  stylePreference?: string;
  companionPreference?: string;
}

export interface TripSearchParams {
  destination: string;
  duration: number;
  budget: string;
  style: string;
  companion: string;
  season: string;
  extraNotes: string;
}
