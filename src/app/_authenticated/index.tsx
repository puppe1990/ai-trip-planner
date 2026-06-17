import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Luggage, Plane, Info, LogOut } from 'lucide-react';
import { AppLogo } from '@/src/components/AppLogo';
import { useTranslation } from 'react-i18next';
import type { TripPlan, TripSearchParams } from '@/src/types';
import { DEFAULT_SEARCH } from '@/src/data';
import SearchForm from '@/src/components/SearchForm';
import TripView from '@/src/components/TripView';
import SavedTrips from '@/src/components/SavedTrips';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import AiSettingsModal from '@/src/components/AiSettingsModal';
import AiGenerationRecoveryModal from '@/src/components/AiGenerationRecoveryModal';
import { parseShareHash } from '@/src/lib/share';
import { generateTripPlanForUser } from '@/src/lib/trip-generation-client';
import type { TripGenerationProgress } from '@/src/lib/trip-generation';
import { getTripPlannerConfigFn } from '@/src/server/planner.functions';
import { listTripsFn, deleteTripFn } from '@/src/server/trips.functions';
import { signOutAndRedirect } from '@/src/lib/auth-actions';

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<TripSearchParams>(DEFAULT_SEARCH);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generationProgress, setGenerationProgress] = useState<TripGenerationProgress | null>(null);
  const [multiStepEnabled, setMultiStepEnabled] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);

  const loadingMessages = t('loading.messages', { returnObjects: true }) as string[];

  useEffect(() => {
    void loadSavedTrips();
    checkSharedTrip();
    void getTripPlannerConfigFn()
      .then((config) => setMultiStepEnabled(config.multiStep))
      .catch(() => setMultiStepEnabled(true));
    window.addEventListener('hashchange', checkSharedTrip);
    return () => window.removeEventListener('hashchange', checkSharedTrip);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading && !generationProgress) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, generationProgress, loadingMessages.length]);

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
    setGenerationError(null);
    setRecoveryModalOpen(false);
    setGenerationProgress(multiStepEnabled ? { phase: 'outline' } : null);
    setActivePlan(null);
    setSearchParams(params);

    try {
      const parsedPlan = await generateTripPlanForUser(params, i18n.language, (progress) => {
        setGenerationProgress(progress);
      });

      setActivePlan(parsedPlan);
      await loadSavedTrips();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.genericError');
      setGenerationError(message);
      setRecoveryModalOpen(true);
    } finally {
      setIsLoading(false);
      setGenerationProgress(null);
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

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-indigo-50 selection:text-indigo-950 pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md/80 bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo />
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
            <AiSettingsModal />
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
              <Luggage className="w-4 h-4" />
              {t('common.saves')}
            </button>
            <button
              type="button"
              onClick={() => {
                void signOutAndRedirect({
                  navigate,
                  invalidate: () => router.invalidate(),
                });
              }}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
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
                  <Plane className="w-7 h-7 text-indigo-650 animate-pulse" />
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
                  {generationProgress
                    ? t(`loading.steps.${generationProgress.phase}`, {
                        day: generationProgress.dayNumber,
                        total: generationProgress.totalDays,
                      })
                    : loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
                  {generationProgress ? t('loading.multiStepHint') : t('loading.hint')}
                </p>
              </div>
              <div className="bg-indigo-50/40 border border-indigo-150 p-4 rounded-2xl space-y-1 text-left w-full">
                <h4 className="text-xs font-bold text-indigo-850 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
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
              <TripView tripPlan={activePlan} onBack={() => setActivePlan(null)} />
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

      <AiGenerationRecoveryModal
        open={recoveryModalOpen}
        errorText={generationError}
        onClose={() => {
          setRecoveryModalOpen(false);
          setGenerationError(null);
        }}
        onRetry={async () => {
          setRecoveryModalOpen(false);
          setGenerationError(null);
          await handleTripSubmission(searchParams);
        }}
      />

      <footer className="mt-24 border-t border-slate-150 text-center py-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
