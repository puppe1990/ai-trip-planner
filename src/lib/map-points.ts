import type { TripPlan } from '../types';

export type TimeSlot = 'Manhã' | 'Tarde' | 'Noite' | 'Gastronomia';

export interface MapPoint {
  id: string;
  dayNumber: number;
  timeSlot: TimeSlot;
  title: string;
  description: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  cost: string;
  duration: string;
}

export function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function buildMapPoints(tripPlan: TripPlan): MapPoint[] {
  const points: MapPoint[] = [];
  const destHash = getDeterministicHash(tripPlan.destination);
  const baseLat = -12.0 + (destHash % 30);
  const baseLng = -48.0 + ((destHash >> 3) % 40);

  tripPlan.days.forEach((day) => {
    const dNum = day.dayNumber;
    const slots: Array<{
      slot: TimeSlot;
      title: string;
      desc: string;
      cost: string;
      duration: string;
      hashSeed: string;
      latOff: number;
      lngOff: number;
    }> = [
      {
        slot: 'Manhã',
        title: day.morning.title,
        desc: day.morning.description,
        cost: day.morning.cost,
        duration: day.morning.duration,
        hashSeed: day.morning.title,
        latOff: 0,
        lngOff: 0,
      },
      {
        slot: 'Tarde',
        title: day.afternoon.title,
        desc: day.afternoon.description,
        cost: day.afternoon.cost,
        duration: day.afternoon.duration,
        hashSeed: day.afternoon.title,
        latOff: 0.015,
        lngOff: -0.012,
      },
      {
        slot: 'Noite',
        title: day.evening.title,
        desc: day.evening.description,
        cost: day.evening.cost,
        duration: day.evening.duration,
        hashSeed: day.evening.title,
        latOff: -0.018,
        lngOff: 0.022,
      },
      {
        slot: 'Gastronomia',
        title: day.diningSpot.name,
        desc: `${day.diningSpot.type} - ${day.diningSpot.description}`,
        cost: day.diningSpot.priceLevel,
        duration: '1-2 horas',
        hashSeed: day.diningSpot.name,
        latOff: 0.005,
        lngOff: 0.005,
      },
    ];

    for (const s of slots) {
      const h = getDeterministicHash(s.hashSeed);
      points.push({
        id: `day-${dNum}-${s.slot.toLowerCase()}`,
        dayNumber: dNum,
        timeSlot: s.slot,
        title: s.title,
        description: s.desc,
        lat: baseLat + 0.045 * (dNum - 1) + s.latOff + ((h % 100) - 50) / 1500,
        lng: baseLng + 0.055 * (dNum - 1) + s.lngOff + (((h >> 2) % 100) - 50) / 1500,
        x: 0,
        y: 0,
        cost: s.cost,
        duration: s.duration,
      });
    }
  });

  let minLat = Math.min(...points.map((p) => p.lat));
  let maxLat = Math.max(...points.map((p) => p.lat));
  let minLng = Math.min(...points.map((p) => p.lng));
  let maxLng = Math.max(...points.map((p) => p.lng));

  if (minLat === maxLat) {
    minLat -= 0.01;
    maxLat += 0.01;
  }
  if (minLng === maxLng) {
    minLng -= 0.01;
    maxLng += 0.01;
  }

  const width = 700;
  const height = 450;
  const padding = 60;

  return points.map((p) => {
    const xNorm = (p.lng - minLng) / (maxLng - minLng);
    const yNorm = (p.lat - minLat) / (maxLat - minLat);
    return {
      ...p,
      x: padding + xNorm * (width - 2 * padding),
      y: height - (padding + yNorm * (height - 2 * padding)),
    };
  });
}

const SLOT_ORDER: Record<TimeSlot, number> = {
  Manhã: 1,
  Tarde: 2,
  Gastronomia: 3,
  Noite: 4,
};

export function sortPointsChronologically(points: MapPoint[]): MapPoint[] {
  return [...points].sort((a, b) => {
    if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
    return SLOT_ORDER[a.timeSlot] - SLOT_ORDER[b.timeSlot];
  });
}

export function buildRoutesPath(points: MapPoint[]): string {
  if (points.length < 2) return '';
  const sorted = sortPointsChronologically(points);
  return sorted.reduce((path, p, index) => {
    if (index === 0) return `M ${p.x} ${p.y}`;
    const prev = sorted[index - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${path} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');
}

export function drawRoutesOnCanvas(ctx: CanvasRenderingContext2D, points: MapPoint[]): void {
  if (points.length < 2) return;

  const sorted = sortPointsChronologically(points);
  const gradient = ctx.createLinearGradient(0, 0, 700, 450);
  gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)');
  gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.8)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.8)');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(sorted[0].x, sorted[0].y);

  for (let index = 1; index < sorted.length; index++) {
    const p = sorted[index];
    const prev = sorted[index - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, p.x, p.y);
  }

  ctx.stroke();
}
