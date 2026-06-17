import { Type } from '@google/genai';

export const responseSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING, description: 'Formatted destination name' },
    durationDays: { type: Type.INTEGER, description: 'Exact duration in days' },
    tagline: { type: Type.STRING, description: 'Poetic tagline for the trip' },
    summary: { type: Type.STRING, description: 'Friendly overview and general advice' },
    budgetEstimate: {
      type: Type.OBJECT,
      properties: {
        totalCostEstimate: { type: Type.STRING },
        hotelAverageNight: { type: Type.STRING },
        foodAverageDay: { type: Type.STRING },
        transportAverageDay: { type: Type.STRING },
      },
      required: ['totalCostEstimate', 'hotelAverageNight', 'foodAverageDay', 'transportAverageDay'],
    },
    packingEssentials: { type: Type.ARRAY, items: { type: Type.STRING } },
    weatherExpected: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          morning: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cost: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ['title', 'description', 'cost', 'duration'],
          },
          afternoon: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cost: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ['title', 'description', 'cost', 'duration'],
          },
          evening: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cost: { type: Type.STRING },
              duration: { type: Type.STRING },
            },
            required: ['title', 'description', 'cost', 'duration'],
          },
          diningSpot: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              priceLevel: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['name', 'type', 'priceLevel', 'description'],
          },
        },
        required: ['dayNumber', 'theme', 'morning', 'afternoon', 'evening', 'diningSpot'],
      },
    },
    tips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          text: { type: Type.STRING },
        },
        required: ['category', 'text'],
      },
    },
  },
  required: [
    'destination',
    'durationDays',
    'tagline',
    'summary',
    'budgetEstimate',
    'packingEssentials',
    'weatherExpected',
    'days',
    'tips',
  ],
};
