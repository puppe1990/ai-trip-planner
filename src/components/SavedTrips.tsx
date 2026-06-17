import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Trash2, Search, Luggage, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TripPlan } from '../types';

interface SavedTripsProps {
  savedTrips: TripPlan[];
  onSelectTrip: (trip: TripPlan) => void;
  onDeleteTrip: (id: string, e: React.MouseEvent) => void;
}

export default function SavedTrips({ savedTrips, onSelectTrip, onDeleteTrip }: SavedTripsProps) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'pt-BR';

  const filteredTrips = savedTrips.filter((trip) => trip.destination.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-indigo-650" />
            {t('saved.title', { count: savedTrips.length })}
          </h2>
          <p className="text-xs text-slate-450 mt-1">{t('saved.subtitle')}</p>
        </div>

        {/* Search input if we have trips */}
        {savedTrips.length > 0 && (
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('saved.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all text-slate-700 bg-white"
            />
          </div>
        )}
      </div>

      {/* Empty States */}
      {savedTrips.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm">{t('saved.emptyTitle')}</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto text-center leading-relaxed">
              {t('saved.emptyDesc')}
            </p>
          </div>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-8 text-slate-450 text-xs">{t('saved.noResults', { term: searchTerm })}</div>
      ) : (
        /* Trips Cards list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            // Pick a beautiful color palette based on destination name hash
            const indexHash = trip.destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const gradients = [
              'from-sky-500 via-indigo-500 to-indigo-600',
              'from-emerald-400 via-teal-500 to-emerald-600',
              'from-rose-450 via-pink-500 to-rose-600',
              'from-amber-400 via-orange-500 to-amber-600',
              'from-purple-500 via-violet-500 to-indigo-600',
            ];
            const currentGradient = gradients[indexHash % gradients.length];

            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -3 }}
                className="group relative cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56"
                onClick={() => onSelectTrip(trip)}
              >
                {/* Visual Header Strip with background gradient */}
                <div
                  className={`p-4 bg-gradient-to-r ${currentGradient} text-white flex justify-between items-start h-24`}
                >
                  <div className="space-y-1 max-w-[80%]">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {trip.durationDays} {trip.durationDays === 1 ? t('common.day') : t('common.daysLabel')}
                    </span>
                    <h3 className="font-extrabold text-base leading-tight truncate drop-shadow-sm text-white">
                      {trip.destination}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => onDeleteTrip(trip.id, e)}
                    className="p-1.5 rounded-lg bg-black/10 text-white/80 hover:text-white hover:bg-rose-600/80 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card details body */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-500 italic line-clamp-2 leading-relaxed">
                      &quot;{tripPlanTagline(trip.tagline, t('saved.fallbackTagline'))}&quot;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-indigo-650">
                      <Sparkles className="w-3 h-3" />
                      {trip.stylePreference || t('saved.customPlan')}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      {t('saved.createdAt', {
                        date: new Date(trip.createdAt).toLocaleDateString(dateLocale),
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Fallback helper in case tagline is blank
function tripPlanTagline(tag: string, fallback: string) {
  if (tag && tag.trim().length > 0) return tag;
  return fallback;
}
