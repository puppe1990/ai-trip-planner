const activityFields = `{ "title": "string", "description": "string", "cost": "string", "duration": "string" }`;
const diningFields = `{ "name": "string", "type": "string", "priceLevel": "string", "description": "string" }`;

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
      "morning": ${activityFields},
      "afternoon": ${activityFields},
      "evening": ${activityFields},
      "diningSpot": ${diningFields}
    }
  ],
  "tips": [{ "category": "string", "text": "string" }]
}
All fields are required. Use the requested destination and durationDays values exactly.`;
}

export function buildPlannerOutlineSchemaInstruction(): string {
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
  "weatherExpected": "string"
}
All fields are required. Use the requested destination and durationDays values exactly.`;
}

export function buildPlannerDaySchemaInstruction(): string {
  return `Return ONLY one raw JSON object (no markdown fences, no commentary) with EXACTLY these keys:
{
  "dayNumber": number,
  "theme": "string",
  "morning": ${activityFields},
  "afternoon": ${activityFields},
  "evening": ${activityFields},
  "diningSpot": ${diningFields}
}
All fields are required. Use the requested dayNumber exactly.`;
}

export function buildPlannerTipsSchemaInstruction(): string {
  return `Return ONLY one raw JSON object (no markdown fences, no commentary) with EXACTLY this key:
{
  "tips": [{ "category": "string", "text": "string" }]
}
Provide at least 4 practical tips.`;
}
