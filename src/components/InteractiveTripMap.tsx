import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { buildMapPoints, drawRoutesOnCanvas, type MapPoint, type TimeSlot } from '@/src/lib/map-points';
import type { TripPlan } from '@/src/types';
import { Icon, timeSlotIcon } from './Icon';

interface InteractiveTripMapProps {
  tripPlan: TripPlan;
  activeDay: number;
}

function getTimeSlotLabel(timeSlot: TimeSlot, t: TFunction): string {
  switch (timeSlot) {
    case 'Manhã':
      return t('trip.morning');
    case 'Tarde':
      return t('trip.afternoon');
    case 'Noite':
      return t('trip.evening');
    case 'Gastronomia':
      return t('trip.gastronomy');
    default:
      return timeSlot;
  }
}

export default function InteractiveTripMap({ tripPlan, activeDay }: InteractiveTripMapProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [filterDay, setFilterDay] = useState<number | 'all'>(activeDay);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setFilterDay(activeDay);
  }, [activeDay]);

  const mapPoints = useMemo(() => buildMapPoints(tripPlan), [tripPlan]);

  const filteredPoints = useMemo(() => {
    if (filterDay === 'all') return mapPoints;
    return mapPoints.filter((p) => p.dayNumber === filterDay);
  }, [mapPoints, filterDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoutesOnCanvas(ctx, filteredPoints);
  }, [filteredPoints]);

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, z - 0.2));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const mapTransform = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center-left',
    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative text-white"
      id="trip-map-block"
    >
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Icon name="compass" className="text-sm" spin />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              {t('trip.mapTitle')}
              <span className="text-[10px] bg-slate-800 text-slate-350 py-0.5 px-2 rounded-full font-mono">
                {t('trip.mapSimulation')}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">{t('trip.mapSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterDay === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('trip.viewAll')}
          </button>

          {tripPlan.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setFilterDay(day.dayNumber)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDay === day.dayNumber
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              D{day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[450px]">
        <div
          className="lg:col-span-3 h-[450px] relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #312e81 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          />

          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800/80 p-2.5 rounded-xl z-25 text-[10px] text-slate-400 space-y-1 backdrop-blur font-mono pointer-events-none">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Icon name="navigation" className="text-xs" />
              {t('map.cartographicAxis')}
            </div>
            <div>Min Lng: {Math.min(...mapPoints.map((p) => p.lng)).toFixed(4)}°</div>
            <div>Max Lat: {Math.max(...mapPoints.map((p) => p.lat)).toFixed(4)}°</div>
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-25">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer transition-colors shadow"
              title={t('map.zoomIn')}
            >
              <Icon name="plus" className="text-xs" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center cursor-pointer transition-colors shadow"
              title={t('map.zoomOut')}
            >
              <Icon name="minus" className="text-xs" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
            >
              {t('map.reset')}
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={700}
            height={450}
            className="w-full h-full absolute inset-0 pointer-events-none"
            style={mapTransform}
          />

          <div className="w-full h-full absolute inset-0" style={mapTransform}>
            {filteredPoints.map((point) => {
              const isSelected = selectedPoint?.id === point.id;

              let colorClasses = 'bg-indigo-600 border-indigo-400 text-indigo-100 shadow-indigo-600/30';
              if (point.timeSlot === 'Tarde') {
                colorClasses = 'bg-sky-500 border-sky-300 text-sky-100 shadow-sky-500/30';
              } else if (point.timeSlot === 'Noite') {
                colorClasses = 'bg-slate-700 border-slate-500 text-slate-100 shadow-slate-700/30';
              } else if (point.timeSlot === 'Gastronomia') {
                colorClasses = 'bg-orange-600 border-orange-400 text-orange-100 shadow-orange-600/30';
              }

              return (
                <button
                  key={point.id}
                  style={{ left: `${point.x}px`, top: `${point.y}px` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-130 active:scale-95 group z-20 ${colorClasses} ${
                    isSelected ? 'ring-4 ring-amber-500 scale-125 z-30' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint(point);
                  }}
                >
                  <span className="hidden group-hover:block absolute -top-8 px-2 py-1 bg-slate-900 border border-slate-700 text-white rounded text-[10px] whitespace-nowrap opacity-90 font-bold z-30">
                    {point.title}
                  </span>

                  <Icon name={timeSlotIcon(point.timeSlot)} className="text-[10px]" />
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedPoint && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-2xl z-30 backdrop-blur"
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-2.5">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {t('common.day')} {selectedPoint.dayNumber} • {getTimeSlotLabel(selectedPoint.timeSlot, t)}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-100 mt-1">{selectedPoint.title}</h4>
                  </div>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="p-1 text-slate-400 hover:text-slate-100"
                    aria-label={t('common.close', { defaultValue: 'Fechar' })}
                  >
                    <Icon name="x" className="text-xs font-bold" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">{selectedPoint.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between items-center font-mono">
                  <span>
                    {t('trip.costs')}: {selectedPoint.cost}
                  </span>
                  <span>⏱️ {selectedPoint.duration}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between max-h-[450px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Icon name="layers" className="text-xs" />
              {t('trip.stopsDirectory')}
            </span>
            <span className="text-[9px] bg-indigo-500/15 py-0.5 px-2 rounded-full font-bold text-indigo-400">
              {t('trip.stopsCount', { count: filteredPoints.length })}
            </span>
          </div>

          <div className="overflow-y-auto p-3 space-y-2 flex-grow scrollbar-none">
            {filteredPoints.map((point) => {
              const isSelected = selectedPoint?.id === point.id;

              let slotBadge = 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30';
              if (point.timeSlot === 'Tarde') slotBadge = 'text-sky-400 bg-sky-950/40 border-sky-900/30';
              if (point.timeSlot === 'Noite') slotBadge = 'text-slate-400 bg-slate-900/40 border-slate-850';
              if (point.timeSlot === 'Gastronomia') slotBadge = 'text-orange-405 bg-orange-950/20 border-orange-900/30';

              return (
                <button
                  key={point.id}
                  onClick={() => setSelectedPoint(point)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-650/40 border-indigo-600 text-indigo-200 shadow'
                      : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-350'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-[9px] text-slate-500">
                      {t('common.day')} {point.dayNumber}
                    </span>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-wider py-0.5 px-1.5 border rounded ${slotBadge}`}
                    >
                      {getTimeSlotLabel(point.timeSlot, t)}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-100 truncate w-full">{point.title}</h5>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[10px] text-slate-500 flex items-center gap-1.5">
            <Icon name="info" className="text-xs shrink-0" />
            <span className="leading-tight">{t('trip.coordsDisclaimer')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
