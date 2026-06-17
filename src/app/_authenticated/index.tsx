import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/src/components/Icon';
import { useTranslation } from 'react-i18next';
import type { TripPlan, TripSearchParams } from '@/src/types';
import { DEFAULT_SEARCH } from '@/src/data';
import SearchForm from '@/src/components/SearchForm';
import TripView from '@/src/components/TripView';
import SavedTrips from '@/src/components/SavedTrips';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import { parseShareHash } from '@/src/lib/share';
import { generateTripPlanFn } from '@/src/server/planner.functions';
import { listTripsFn, saveTripFn, deleteTripFn } from '@/src/server/trips.functions';
import { signOut } from '@/src/lib/auth-client';

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useState<TripSearchParams>(DEFAULT_SEARCH);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  const loadingMessages = t('loading.messages', { returnObjects: true }) as string[];

  useEffect(() => {
    void loadSavedTrips();
    checkSharedTrip();
    window.addEventListener('hashchange', checkSharedTrip);
    return () => window.removeEventListener('hashchange', checkSharedTrip);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, loadingMessages.length]);

  const loadSavedTrips = async () => {
    try {
      const trips = await listTripsFn();
      setSavedTrips(trips);
    } catch (e) {
      console.error('Failed to load saved trips:', e);
    }
  };

  const checkSharedTrip = () => {
    const parsed = parseShareHash(window.location.hash);
    if (parsed) {
      setActivePlan(parsed);
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleTripSubmission = async (params: TripSearchParams) => {
    setIsLoading(true);
    setErrorText(null);
    setActivePlan(null);
    setSearchParams(params);

    try {
      const data = await generateTripPlanFn({
        data: { params, locale: i18n.language },
      });

      const parsedPlan: TripPlan = {
        ...(data as Omit<
          TripPlan,
          'id' | 'createdAt' | 'budgetPreference' | 'stylePreference' | 'companionPreference'
        >),
        id: `trip_${Date.now()}`,
        createdAt: new Date().toISOString(),
        budgetPreference: params.budget,
        stylePreference: params.style,
        companionPreference: params.companion,
      };

      setActivePlan(parsedPlan);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.genericError');
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!activePlan) return;
    if (
      savedTrips.some(
        (trip) => trip.destination === activePlan.destination && trip.durationDays === activePlan.durationDays,
      )
    ) {
      return;
    }
    const result = await saveTripFn({ data: { plan: activePlan, searchParams } });
    if (result.success) {
      await loadSavedTrips();
    }
  };

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTripFn({ data: { tripId: id } });
    await loadSavedTrips();
    if (activePlan?.id === id) setActivePlan(null);
  };

  const handleSelectTrip = (trip: TripPlan) => {
    setActivePlan(trip);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActivePlanSaved = activePlan
    ? savedTrips.some(
        (trip) =>
          trip.id === activePlan.id ||
          (trip.destination === activePlan.destination && trip.durationDays === activePlan.durationDays),
      )
    : false;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-indigo-50 selection:text-indigo-950 pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md/80 bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-650 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Icon name="compass" className="text-xl" />
            </div>
            <div>
              <h1 className="font-exbold text-lg md:text-xl text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                {t('common.appName')}{' '}
                <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full font-bold">
                  {t('common.aiBadge')}
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium">{t('common.tagline')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => {
                setActivePlan(null);
                setTimeout(() => {
                  document.getElementById('saved-trips')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-xs font-semibold text-slate-650 hover:text-indigo-650 flex items-center gap-1.5 transition-colors"
            >
              <Icon name="luggage" className="text-base" />
              {t('common.saves')}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              title="Sign out"
            >
              <Icon name="logout" className="text-base" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {errorText && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start gap-3 shadow-sm max-w-2xl mx-auto">
            <Icon name="alert-circle" className="text-lg shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-grow space-y-1">
              <h4 className="font-bold text-sm">{t('errors.generationFailed')}</h4>
              <p className="text-xs leading-relaxed text-rose-750">{errorText}</p>
            </div>
            <button onClick={() => setErrorText(null)} className="text-rose-450 hover:text-rose-750 transition-colors">
              <Icon name="x" className="text-base font-bold" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto text-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="plane" className="text-2xl text-indigo-650" pulse />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                    {t('loading.title')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 transition-all duration-300">
                  {loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">{t('loading.hint')}</p>
              </div>
              <div className="bg-indigo-50/40 border border-indigo-150 p-4 rounded-2xl space-y-1 text-left w-full">
                <h4 className="text-xs font-bold text-indigo-850 flex items-center gap-1.5">
                  <Icon name="info" className="text-sm text-indigo-500" />
                  {t('loading.didYouKnow')}
                </h4>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">{t('loading.tip')}</p>
              </div>
            </motion.div>
          ) : activePlan ? (
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TripView
                tripPlan={activePlan}
                onBack={() => setActivePlan(null)}
                onSave={handleSaveTrip}
                isSaved={isActivePlanSaved}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <SearchForm
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onSubmit={handleTripSubmission}
                isLoading={isLoading}
              />
              <div id="saved-trips" className="scroll-mt-24">
                <hr className="border-slate-100" />
                <div className="pt-8">
                  <SavedTrips savedTrips={savedTrips} onSelectTrip={handleSelectTrip} onDeleteTrip={handleDeleteTrip} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-slate-150 text-center py-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>{t('footer.copyright')}</p>
          <p className="text-[10px] text-slate-450">{t('footer.poweredBy')}</p>
        </div>
      </footer>
    </div>
  );
}
