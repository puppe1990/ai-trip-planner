import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/src/components/Icon';
import { useTranslation } from 'react-i18next';
import type { TripSearchParams } from '@/src/types';
import { BUDGET_OPTIONS, STYLE_OPTIONS, COMPANION_OPTIONS, QUICK_DESTINATIONS } from '@/src/data';

interface SearchFormProps {
  searchParams: TripSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<TripSearchParams>>;
  onSubmit: (params: TripSearchParams) => void;
  isLoading: boolean;
}

export default function SearchForm({ searchParams, setSearchParams, onSubmit, isLoading }: SearchFormProps) {
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setParamValue = (name: keyof TripSearchParams, value: TripSearchParams[keyof TripSearchParams]) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.destination.trim()) return;
    onSubmit(searchParams);
  };

  const selectQuickDestination = (quickParams: TripSearchParams) => {
    onSubmit(quickParams);
  };

  const budgetBadgeLabel =
    searchParams.budget === 'Baixo'
      ? t('search.budgetEconomic')
      : searchParams.budget === 'Médio'
        ? t('search.budgetModerate')
        : t('search.budgetPremium');

  return (
    <div className="space-y-8" id="search-section">
      {/* Quick Start Destinations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Icon name="sparkles" className="text-base text-amber-500" />
          {t('search.quickTitle')}
        </h3>
        <p className="text-xs text-slate-500">{t('search.quickSubtitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_DESTINATIONS.map((dest) => (
            <motion.button
              key={dest.key}
              type="button"
              onClick={() => selectQuickDestination(dest.params)}
              disabled={isLoading}
              className={`text-left p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer disabled:opacity-50`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Corner Accent Gradient overlay */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${dest.bgGradient} opacity-5 group-hover:opacity-10 rounded-full blur-xl transition-all duration-500`}
              />

              <div className="flex justify-between items-start">
                <span className="text-3xl filter drop-shadow-sm">{dest.emoji}</span>
                <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 bg-slate-50 py-1 px-2 rounded-full">
                  {dest.params.duration} {t('common.days')}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-200">
                  {t(`quickDest.${dest.key}.name`)}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t(`quickDest.${dest.key}.tagline`)}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Main Search Form */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6"
      >
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Icon name="compass" className="text-lg text-indigo-600" />
          {t('search.formTitle')}
        </h2>

        {/* Destination & Duration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="destination" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="map-pin" className="text-base text-rose-500" />
              {t('search.destination')}
            </label>
            <div className="relative">
              <input
                id="destination"
                name="destination"
                type="text"
                required
                value={searchParams.destination}
                onChange={handleInputChange}
                placeholder={t('search.destinationPlaceholder')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
            <p className="text-xs text-slate-400">{t('search.destinationHint')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="calendar-days" className="text-base text-emerald-500" />
              {t('search.duration', { count: searchParams.duration })}
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <input
                id="duration"
                name="duration"
                type="range"
                min="1"
                max="10"
                value={searchParams.duration}
                onChange={(e) => setParamValue('duration', parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700 bg-white shadow-sm border border-slate-100 px-3 py-1 rounded-lg min-w-[50px] text-center">
                {searchParams.duration}d
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('search.durationHint')}</p>
          </div>
        </div>

        {/* Budget Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <span className="font-semibold text-slate-800">{t('search.budget')}</span>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-100">
              {budgetBadgeLabel}
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setParamValue('budget', option.value)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  searchParams.budget === option.value
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-850 text-sm flex items-center justify-between w-full">
                  <span>{t(option.labelKey)}</span>
                  {searchParams.budget === option.value && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{t(option.descKey)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <span className="font-semibold text-slate-800">{t('search.travelStyle')}</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setParamValue('style', style.value)}
                className={`text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  searchParams.style === style.value
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 font-semibold'
                    : 'border-slate-100 bg-slate-50/50 text-slate-650 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{t(style.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Companions and Season */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Companion Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="users" className="text-base text-indigo-500" />
              {t('search.companion')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMPANION_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setParamValue('companion', item.value)}
                  className={`text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    searchParams.companion === item.value
                      ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-semibold'
                      : 'border-slate-100 bg-slate-50/35 hover:bg-slate-50'
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  {searchParams.companion === item.value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Season / Climate */}
          <div className="space-y-3">
            <label htmlFor="season" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="calendar" className="text-base text-sky-500" />
              {t('search.season')}
            </label>
            <input
              id="season"
              name="season"
              type="text"
              value={searchParams.season}
              onChange={handleInputChange}
              placeholder={t('search.seasonPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-450"
            />
            <p className="text-[11px] text-slate-400">{t('search.seasonHint')}</p>
          </div>
        </div>

        {/* Optional Traveler notes */}
        <div className="space-y-2">
          <label htmlFor="extraNotes" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <Icon name="pen-tool" className="text-base text-purple-500" />
            {t('search.notes')}
          </label>
          <textarea
            id="extraNotes"
            name="extraNotes"
            rows={3}
            value={searchParams.extraNotes}
            onChange={handleInputChange}
            placeholder={t('search.notesPlaceholder')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-450 text-sm"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !searchParams.destination.trim()}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="sparkles" className="text-lg" pulse />
            {isLoading ? t('search.submitting') : t('search.submit')}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
