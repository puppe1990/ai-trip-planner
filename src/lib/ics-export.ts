import type { TripPlan } from '../types';

function escapeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatTime(dateObj: Date, h: number, m: number): string {
  const y = dateObj.getFullYear();
  const mOffset = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const d = dateObj.getDate().toString().padStart(2, '0');
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${y}${mOffset}${d}T${hh}${mm}00`;
}

export function generateIcsContent(tripPlan: TripPlan, startDate: string): string | null {
  const baseDate = new Date(startDate);
  if (isNaN(baseDate.getTime())) return null;

  const icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Trip Planner//Roteiro de Viagem//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const nowString = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  tripPlan.days.forEach((day, index) => {
    const eventDate = new Date(baseDate);
    eventDate.setDate(baseDate.getDate() + index);
    const tripId = tripPlan.id || 'temp';

    const events = [
      { slot: 'morning', start: [9, 0] as const, end: [12, 0] as const, label: 'Manhã', activity: day.morning },
      { slot: 'dine', start: [13, 0] as const, end: [14, 30] as const, label: 'Almoço', activity: { title: day.diningSpot.name, description: day.diningSpot.description, duration: '', cost: day.diningSpot.priceLevel } },
      { slot: 'afternoon', start: [15, 0] as const, end: [18, 0] as const, label: 'Tarde', activity: day.afternoon },
      { slot: 'evening', start: [20, 0] as const, end: [23, 0] as const, label: 'Noite', activity: day.evening },
    ];

    for (const evt of events) {
      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:trip-${tripId}-day-${day.dayNumber}-${evt.slot}@trip-planner`);
      icsLines.push(`DTSTAMP:${nowString}`);
      icsLines.push(`DTSTART:${formatTime(eventDate, evt.start[0], evt.start[1])}`);
      icsLines.push(`DTEND:${formatTime(eventDate, evt.end[0], evt.end[1])}`);
      icsLines.push(`SUMMARY:${escapeText(`[Dia ${day.dayNumber}] ${day.theme} - ${evt.label}: ${evt.activity.title}`)}`);
      icsLines.push(`DESCRIPTION:${escapeText(evt.activity.description)}`);
      icsLines.push(`LOCATION:${escapeText(tripPlan.destination)}`);
      icsLines.push('END:VEVENT');
    }
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}