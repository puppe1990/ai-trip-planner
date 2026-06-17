export function buildPlannerJsonSchemaInstruction(): string {
  return `Return ONLY one raw JSON object (no markdown fences, no commentary) with EXACTLY these keys:
{
  "destination": "string",
  "durationDays": number,
  "tagline": "string",
  "summary": "string",
  "budgetEstimate": {
    "totalCostEstimate": "string",
    "hotelAverageNight": "string",
    "foodAverageDay": "string",
    "transportAverageDay": "string"
  },
  "packingEssentials": ["string"],
  "weatherExpected": "string",
  "days": [
    {
      "dayNumber": number,
      "theme": "string",
      "morning": { "title": "string", "description": "string", "cost": "string", "duration": "string" },
      "afternoon": { "title": "string", "description": "string", "cost": "string", "duration": "string" },
      "evening": { "title": "string", "description": "string", "cost": "string", "duration": "string" },
      "diningSpot": { "name": "string", "type": "string", "priceLevel": "string", "description": "string" }
    }
  ],
  "tips": [{ "category": "string", "text": "string" }]
}
All fields are required. Use the requested destination and durationDays values exactly.`;
}
