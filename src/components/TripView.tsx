import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  DollarSign,
  Compass,
  MapPin,
  Luggage,
  Coffee,
  Sun,
  Info,
  ArrowLeft,
  CheckCircle,
  Save,
  Printer,
  Share2,
  Activity as ActivityIcon,
  Clock,
  PiggyBank,
  Lightbulb,
  Building,
  UtensilsCrossed,
  Sparkles,
  Award,
  Users,
  Thermometer,
  CloudRain,
  Snowflake,
  Umbrella,
  Droplets,
  Flame,
  Wind,
  Loader2,
  Car,
  Smartphone,
  Train,
  Bus,
  CreditCard,
  Search,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TripPlan } from '@/src/types';
import { getDestinationClimate } from '@/src/lib/climate';
import { calculateGroupBudget } from '@/src/lib/budget';
import { generateIcsContent } from '@/src/lib/ics-export';
import { buildShareUrl } from '@/src/lib/share';
import { parseTransitSections, type TransitSection } from '@/src/lib/transit-parse';
import { searchTransitFn } from '@/src/server/transit.functions';
import InteractiveTripMap from './InteractiveTripMap';

interface TripViewProps {
  tripPlan: TripPlan;
  onBack: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export default function TripView({ tripPlan, onBack, onSave, isSaved }: TripViewProps) {
  const { t, i18n } = useTranslation();
  const [activeDay, setActiveDay] = useState(1);
  const [checkedPackingItems, setCheckedPackingItems] = useState<Record<string, boolean>>({});
  const [travelersCount, setTravelersCount] = useState(1);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });

  // Fetch climate monthly statistics
  const climateProfile = useMemo(() => {
    return getDestinationClimate(tripPlan.destination);
  }, [tripPlan.destination]);

  // Set default selected month to the vacation starting date month
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    try {
      const d = new Date();
      d.setDate(d.getDate() + 1); // today + 1
      return d.getMonth(); // 0-based month index (Jan = 0, Feb = 1...)
    } catch (_) {
      return 5; // default to June
    }
  });

  // Keep selectedMonthIndex updated if the traveler updates their departure day
  React.useEffect(() => {
    try {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        setSelectedMonthIndex(d.getMonth());
      }
    } catch (_) {}
  }, [startDate]);

  // Google Search Urban Mobility States
  const [transitData, setTransitData] = useState<{
    rawText: string;
    sources: Array<{ title: string; url: string }>;
  } | null>(null);
  const [isTransitLoading, setIsTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState<string | null>(null);
  const [activeTransitTabIndex, setActiveTransitTabIndex] = useState(0);

  const transitSections = useMemo(() => {
    if (!transitData?.rawText) return [];
    return parseTransitSections(transitData.rawText);
  }, [transitData]);

  const fetchUrbanMobilityDetails = async () => {
    setIsTransitLoading(true);
    setTransitError(null);
    try {
      const data = await searchTransitFn({
        data: { destination: tripPlan.destination, locale: i18n.language },
      });
      setTransitData(data);
      setActiveTransitTabIndex(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.genericError');
      setTransitError(message);
    } finally {
      setIsTransitLoading(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return buildShareUrl(tripPlan, window.location.origin, window.location.pathname);
  }, [tripPlan]);

  const handleExportCalendar = () => {
    const icsContent = generateIcsContent(tripPlan, startDate);
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanDest = tripPlan.destination.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `roteiro_${cleanDest}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle checks in packing checklist
  const togglePackingItem = (item: string) => {
    setCheckedPackingItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const budget = useMemo(() => calculateGroupBudget(tripPlan, travelersCount), [tripPlan, travelersCount]);

  const getTransitSectionLabel = (section: TransitSection) => {
    if (section.key === 'other') return section.title;
    return t(`trip.transitSections.${section.key}`);
  };
  const localeStr = i18n.language?.startsWith('en') ? 'en-US' : 'pt-BR';

  const activeDayPlan = tripPlan.days.find((d) => d.dayNumber === activeDay) || tripPlan.days[0];

  return (
    <div className="space-y-8" id="trip-view-container">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer ml-auto sm:ml-0"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            {t('common.share')}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t('common.print')}
          </button>

          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            {t('common.calendar')}
          </button>

          <button
            onClick={onSave}
            disabled={isSaved}
            className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl border transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-slate-100/80 border-slate-200/50 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/10'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaved ? t('common.saved') : t('common.save')}
          </button>
        </div>
      </div>

      {/* Main Cover Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/30 text-white p-8 md:p-12 shadow-2xl">
        {/* Abstract decorative graphic elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute top-4 right-6 text-sm text-slate-400 font-mono hidden md:block">
          Planejamento IA • Realizado em {new Date(tripPlan.createdAt).toLocaleDateString('pt-BR')}
        </div>

        <div className="space-y-4 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/25 border border-indigo-400/20 text-indigo-350">
            <Sparkles className="w-3.5 h-3.5" />
            itinerário personalizado de {tripPlan.durationDays} dias
          </span>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-indigo-200 bg-clip-text text-transparent">
              {tripPlan.destination}
            </span>
          </h1>

          <p className="text-lg md:text-xl font-bold tracking-tight text-indigo-150 italic max-w-2xl font-sans">
            "{tripPlan.tagline}"
          </p>

          <p className="text-sm md:text-base text-slate-300 font-normal leading-relaxed">{tripPlan.summary}</p>
        </div>
      </div>

      {/* Bento Grid: Estimates & Travelers calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic group budget estimator calculator */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-indigo-650" />
                Simulador Financeiro Local
              </h3>
              <span className="text-[10px] bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-full font-semibold text-slate-400 font-mono">
                Conversão Estimada
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ajuste o número de pessoas para termos uma estimativa atualizada de custo total do grupo durante os{' '}
              {tripPlan.durationDays} dias:
            </p>

            {/* Travelers counter */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 ml-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Quantidade de Viajantes
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={travelersCount <= 1}
                  onClick={() => setTravelersCount((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm font-black flex items-center justify-center text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-slate-800 min-w-4 text-center">{travelersCount}</span>
                <button
                  type="button"
                  onClick={() => setTravelersCount((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-300 shadow-sm font-black flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('trip.hotelLine', { rooms: budget.doubleRooms })}</span>
                <span className="font-semibold text-slate-700">~R$ {budget.hotelGroup.toLocaleString(localeStr)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Alimentação ({travelersCount} pessoas):</span>
                <span className="font-semibold text-slate-700">~R$ {budget.foodGroup.toLocaleString(localeStr)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Transporte Local ({travelersCount} pessoas):</span>
                <span className="font-semibold text-slate-700">
                  ~R$ {budget.transportGroup.toLocaleString(localeStr)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-indigo-100/50 bg-indigo-50/20 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
              Custo Total de Referência
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-indigo-600 font-extrabold text-2xl">
                R$ {budget.total.toLocaleString(localeStr)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">médio total local</span>
            </div>
          </div>
        </div>

        {/* Detailed estimates bento block */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100/95 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospedagem por Noite</h4>
              <p className="text-lg font-black text-slate-850">{tripPlan.budgetEstimate.hotelAverageNight}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Valor médio padrão de hotelaria recomendada para este nível de perfil de orçamento.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100/95 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-2">
                <Coffee className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alimentação por Dia</h4>
              <p className="text-lg font-black text-slate-850">{tripPlan.budgetEstimate.foodAverageDay}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Custo diário individual estimado compreendendo café da manhã leve, almoço e jantar opcional.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100/95 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transporte por Dia</h4>
              <p className="text-lg font-black text-slate-850">{tripPlan.budgetEstimate.transportAverageDay}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Considera passes de metrô diários, passagens locais ou corridas compartilhadas por aplicativo.
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-400/10 to-indigo-400/10 p-6 rounded-2xl border border-amber-100/60 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/25 flex items-center justify-center text-amber-600 mb-2">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Orçamento de Referência Total
              </h4>
              <p className="text-lg font-black text-amber-900">{tripPlan.budgetEstimate.totalCostEstimate}</p>
            </div>
            <p className="text-xs text-amber-950/80 mt-2 leading-relaxed">
              Base geral calibrada recomendada pela IA para um único viajante aproveitar confortavelmente este roteiro.
            </p>
          </div>
        </div>
      </div>

      {/* Simplified Vector routing map */}
      <div className="print:hidden">
        <InteractiveTripMap tripPlan={tripPlan} activeDay={activeDay} />
      </div>

      {/* Main section: Days Tabs & Detailed Plan */}
      <h2 className="text-2xl font-black text-slate-855 flex items-center gap-2 pt-4 print:hidden">
        <Calendar className="w-6 h-6 text-indigo-650" />
        Cronograma Dia a Dia da Viagem
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        {/* Days Left sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-150 h-fit">
          <div className="p-2 mb-2 text-center bg-white border border-slate-100 rounded-xl">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block">Duração Total</span>
            <span className="text-xl font-extrabold text-slate-800">
              {tripPlan.durationDays} {tripPlan.durationDays === 1 ? 'Dia' : 'Dias'}
            </span>
          </div>

          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
            {tripPlan.days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveDay(day.dayNumber)}
                className={`flex-shrink-0 lg:w-full text-left p-3.5 rounded-xl border transition-all duration-250 cursor-pointer ${
                  activeDay === day.dayNumber
                    ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-600/15 text-white font-bold'
                    : 'bg-white border-slate-100 text-slate-650 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>Dia {day.dayNumber}</span>
                  {activeDay !== day.dayNumber && <span className="w-2 h-2 rounded-full bg-slate-200" />}
                </div>
                <div
                  className={`text-xs truncate ${activeDay === day.dayNumber ? 'text-indigo-200 font-medium' : 'text-slate-450'} mt-1`}
                >
                  {day.theme}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Day Details View Panel */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 md:p-8 space-y-6"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                    DIA {activeDayPlan.dayNumber} :
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{activeDayPlan.theme}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full">
                  Foco do Dia
                </span>
              </div>

              {/* Day timeline (Morning, Afternoon, Evening) */}
              <div className="relative border-l-2 border-indigo-100 pl-6 md:pl-8 ml-3 space-y-8">
                {/* Morning Activity */}
                <div className="relative">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white ring-4 ring-indigo-50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 py-0.5 px-2 rounded-md">
                        Manhã
                      </span>
                      <span className="text-slate-450 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeDayPlan.morning.duration}
                      </span>
                      <span className="text-slate-450 font-medium">• Custos: {activeDayPlan.morning.cost}</span>
                    </div>
                    <h4 className="font-bold text-slate-850 text-base">{activeDayPlan.morning.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{activeDayPlan.morning.description}</p>
                  </div>
                </div>

                {/* Afternoon Activity */}
                <div className="relative">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-sky-500 bg-white ring-4 ring-sky-50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-sky-600 bg-sky-50 border border-sky-100 py-0.5 px-2 rounded-md">
                        Tarde
                      </span>
                      <span className="text-slate-450 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeDayPlan.afternoon.duration}
                      </span>
                      <span className="text-slate-450 font-medium">• Custos: {activeDayPlan.afternoon.cost}</span>
                    </div>
                    <h4 className="font-bold text-slate-850 text-base">{activeDayPlan.afternoon.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{activeDayPlan.afternoon.description}</p>
                  </div>
                </div>

                {/* Evening Activity */}
                <div className="relative">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[33px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-700 bg-white ring-4 ring-slate-100 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-slate-700 bg-slate-100 border border-slate-200 py-0.5 px-2 rounded-md">
                        Noite
                      </span>
                      <span className="text-slate-450 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeDayPlan.evening.duration}
                      </span>
                      <span className="text-slate-450 font-medium">• Custos: {activeDayPlan.evening.cost}</span>
                    </div>
                    <h4 className="font-bold text-slate-850 text-base">{activeDayPlan.evening.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{activeDayPlan.evening.description}</p>
                  </div>
                </div>
              </div>

              {/* Dining/Restaurant suggestion card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="font-bold text-sm text-slate-800">Recomendação Gastronômica do Dia</h5>
                  </div>
                  <span className="text-xs bg-orange-50 border border-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-md">
                    {activeDayPlan.diningSpot.priceLevel}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-extrabold text-slate-800 text-base">{activeDayPlan.diningSpot.name}</span>
                    <span className="text-xs text-slate-500">• {activeDayPlan.diningSpot.type}</span>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed mt-1.5">
                    {activeDayPlan.diningSpot.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Printable Sequential Itinerary (Exclusive to Paper PDF/Printed Documents) */}
      <div className="hidden print:block space-y-8 pt-4">
        <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-700" />
          Roteiro Completo Detalhado ({tripPlan.durationDays} {tripPlan.durationDays === 1 ? 'Dia' : 'Dias'})
        </h2>

        {tripPlan.days.map((day) => (
          <div
            key={day.dayNumber}
            className="border border-slate-200 rounded-2xl p-6 bg-white space-y-4 page-break-inside-avoid"
          >
            <div className="border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-indigo-700 tracking-wide uppercase">DIA {day.dayNumber}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{day.theme}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="inline-block text-[9px] font-black tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">
                  Manhã
                </span>
                <h4 className="font-bold text-slate-800 text-xs mt-1">{day.morning.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{day.morning.description}</p>
                <div className="text-[10px] text-slate-450 font-mono mt-1">
                  Duração: {day.morning.duration} | Custo estimado: {day.morning.cost}
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-block text-[9px] font-black tracking-wide text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded uppercase font-sans">
                  Tarde
                </span>
                <h4 className="font-bold text-slate-800 text-xs mt-1">{day.afternoon.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{day.afternoon.description}</p>
                <div className="text-[10px] text-slate-450 font-mono mt-1">
                  Duração: {day.afternoon.duration} | Custo estimado: {day.afternoon.cost}
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-block text-[9px] font-black tracking-wide text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase">
                  Noite
                </span>
                <h4 className="font-bold text-slate-800 text-xs mt-1">{day.evening.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{day.evening.description}</p>
                <div className="text-[10px] text-slate-450 font-mono mt-1">
                  Duração: {day.evening.duration} | Custo estimado: {day.evening.cost}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
              <span className="text-[9px] font-black uppercase text-orange-600 block tracking-wider mb-1">
                Recomendação Gastronômica
              </span>
              <div className="flex justify-between items-baseline flex-wrap">
                <span className="font-bold text-slate-800 text-xs">{day.diningSpot.name}</span>
                <span className="text-[11px] text-slate-500">
                  {day.diningSpot.type} ({day.diningSpot.priceLevel})
                </span>
              </div>
              <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">{day.diningSpot.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section: Packing lists, weather forecast and general travel tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Checklist of suggested items */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-850 text-base flex items-center gap-2">
              <Luggage className="w-5 h-5 text-indigo-600" />
              Checklist de Bagagem
            </h3>

            <p className="text-xs text-slate-500">
              Itens essenciais sugeridos pela nossa IA baseados na época e clima esperado:
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {tripPlan.packingEssentials.map((item, index) => {
                const isChecked = !!checkedPackingItems[item];
                return (
                  <button
                    type="button"
                    key={`${item}-${index}`}
                    onClick={() => togglePackingItem(item)}
                    className="flex items-center gap-2.5 w-full text-left p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100/40 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-5" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Progressão da mala:</span>
            <span className="font-bold text-slate-700">
              {Object.values(checkedPackingItems).filter(Boolean).length} de {tripPlan.packingEssentials.length}
            </span>
          </div>
        </div>

        {/* Weather Expected and general tips */}
        <div className="md:col-span-2 space-y-6">
          {/* Weather Expectancy & Seasonal Climate Dashboard */}
          <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/60 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 border border-sky-100 shadow-sm shadow-sky-50">
                  <Sun className="w-6 h-6 text-sky-500 animate-[spin_8s_linear_infinite]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 text-base">Previsão Climática Sazonal</h3>
                  <p className="text-xs text-slate-500">
                    Clima médio e histórico mensal para planejar sua mala com precisão
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
                  {climateProfile.climateType}
                </span>
                <span className="text-[10px] text-slate-405 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Melhor época: {climateProfile.bestMonths}
                </span>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed flex gap-3 items-start">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-750 block mb-0.5">Resumo de Clima Informado</span>
                {tripPlan.weatherExpected}
              </div>
            </div>

            {/* Month Tabs Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Selecione o mês para ver os detalhes históricos:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-150/60">
                {climateProfile.months.map((m, idx) => {
                  const isSelected = idx === selectedMonthIndex;
                  const isTripMonth = (() => {
                    try {
                      return new Date(startDate).getMonth() === idx;
                    } catch (_) {
                      return false;
                    }
                  })();
                  return (
                    <button
                      key={m.month}
                      type="button"
                      onClick={() => setSelectedMonthIndex(idx)}
                      className={`relative py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-100/80'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <span>{m.month}</span>
                      {isTripMonth && (
                        <span
                          className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600"
                          title="Mês da viagem"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Month Weather Card Details */}
            {(() => {
              const activeMonth = climateProfile.months[selectedMonthIndex] || climateProfile.months[0];
              const isTripMonth = (() => {
                try {
                  return new Date(startDate).getMonth() === selectedMonthIndex;
                } catch (_) {
                  return false;
                }
              })();

              // Calculate range percentages relative to standard bar from -15C to 45C (60 degrees total range)
              const totalSpan = 60;
              const minVal = -15;
              const minPercent = Math.max(0, Math.min(100, ((activeMonth.tempMin - minVal) / totalSpan) * 100));
              const maxPercent = Math.max(0, Math.min(100, ((activeMonth.tempMax - minVal) / totalSpan) * 100));
              const widthPercent = Math.max(2, maxPercent - minPercent);

              // Temperature indicators
              const isVeryHot = activeMonth.tempMax >= 30;
              const isCold = activeMonth.tempMax < 12;

              let TempIcon = Thermometer;
              if (isVeryHot) TempIcon = Flame;
              else if (isCold) TempIcon = Snowflake;

              return (
                <div className="bg-gradient-to-b from-slate-50/50 to-slate-50/10 border border-slate-150/50 rounded-2xl p-4 md:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Médias de{' '}
                        <span className="text-indigo-600 font-extrabold">
                          {activeMonth.month === 'Jan'
                            ? 'Janeiro'
                            : activeMonth.month === 'Fev'
                              ? 'Fevereiro'
                              : activeMonth.month === 'Mar'
                                ? 'Março'
                                : activeMonth.month === 'Abr'
                                  ? 'Abril'
                                  : activeMonth.month === 'Mai'
                                    ? 'Maio'
                                    : activeMonth.month === 'Jun'
                                      ? 'Junho'
                                      : activeMonth.month === 'Jul'
                                        ? 'Julho'
                                        : activeMonth.month === 'Ago'
                                          ? 'Agosto'
                                          : activeMonth.month === 'Set'
                                            ? 'Setembro'
                                            : activeMonth.month === 'Out'
                                              ? 'Outubro'
                                              : activeMonth.month === 'Nov'
                                                ? 'Novembro'
                                                : 'Dezembro'}
                        </span>
                      </h4>
                      {isTripMonth && (
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Mês Selecionado para Viagem
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wide">
                      Padrão Histórico
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Temperature Column */}
                    <div className="space-y-3.5 col-span-1 md:border-r md:border-slate-100 md:pr-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <TempIcon
                          className={`w-4 h-4 ${isVeryHot ? 'text-orange-500' : isCold ? 'text-sky-500' : 'text-amber-500'}`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider">Metas de Temperatura</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                          {activeMonth.tempMax}°C
                        </span>
                        <span className="text-slate-400 font-medium">/</span>
                        <span className="text-sm font-semibold text-slate-500">{activeMonth.tempMin}°C</span>
                      </div>

                      {/* Visual temperature range slider */}
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-200 rounded-full relative overflow-hidden">
                          <div
                            style={{ left: `${minPercent}%`, width: `${widthPercent}%` }}
                            className={`absolute top-0 h-full rounded-full bg-gradient-to-r ${
                              isVeryHot
                                ? 'from-orange-400 to-rose-500'
                                : isCold
                                  ? 'from-sky-400 to-blue-500'
                                  : 'from-sky-400 via-amber-405 to-orange-400'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>-15°C</span>
                          <span>45°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Rain / Sun metrics */}
                    <div className="space-y-4 col-span-1 md:border-r md:border-slate-100 md:pr-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Umbrella className="w-4 h-4 text-sky-500" />
                            Probabilidade de Chuva:
                          </span>
                          <span className="font-bold text-slate-800">{activeMonth.precip}%</span>
                        </div>
                        {/* Custom precip progress */}
                        <div className="h-1.5 w-full bg-slate-150 rounded-full overflow-hidden">
                          <div style={{ width: `${activeMonth.precip}%` }} className="h-full bg-sky-400 rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Sun className="w-4 h-4 text-amber-500" />
                            Insolação Diária Média:
                          </span>
                          <span className="font-bold text-slate-800">{activeMonth.sunHours} horas</span>
                        </div>
                        {/* Custom sun progress */}
                        <div className="h-1.5 w-full bg-slate-150 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${(activeMonth.sunHours / 12) * 100}%` }}
                            className="h-full bg-amber-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Smart Packing Recommendation column */}
                    <div className="col-span-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Luggage className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-bold uppercase tracking-wider">Guia de Vestuário & Mala</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                          {activeMonth.recommendation}
                        </p>
                      </div>

                      <div className="text-[10px] bg-indigo-50/50 border border-indigo-100/40 rounded-xl p-2.5 text-indigo-800 leading-snug">
                        💡 <span className="font-bold">Dica de Viagem:</span> Adapte os itens sugeridos na mala ao lado
                        baseado nestas temperaturas médias descritas.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Real-time Google Search Mobility Card */}
          <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/60 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-sm shadow-indigo-50">
                  <Search className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                    {t('trip.transitTitle')}{' '}
                    <span className="text-[10px] font-black tracking-widest text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded uppercase border border-indigo-100">
                      {t('trip.liveSearch')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{t('trip.transitSubtitle')}</p>
                </div>
              </div>
            </div>

            {!transitData && !isTransitLoading && (
              <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-100/60 rounded-2xl p-6 text-center space-y-4">
                <div className="max-w-md mx-auto space-y-2">
                  <span className="text-2xl">🚕</span>
                  <h4 className="font-bold text-sm text-slate-800">
                    {t('trip.transitCtaTitle', { destination: tripPlan.destination })}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{t('trip.transitCtaDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={fetchUrbanMobilityDetails}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  {t('trip.transitSearch')}
                </button>
              </div>
            )}

            {isTransitLoading && (
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-755">{t('trip.transitLoading')}</p>
                  <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">{t('trip.transitLoadingDesc')}</p>
                </div>
              </div>
            )}

            {transitError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-700 flex gap-2 w-full justify-between items-center">
                <p className="font-semibold">⚠️ {transitError}</p>
                <button
                  type="button"
                  onClick={fetchUrbanMobilityDetails}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {transitData && !isTransitLoading && (
              <div className="space-y-5">
                {/* Responsive Tabs bar */}
                <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
                  {transitSections.map((sect, idx) => {
                    const isSelected = idx === activeTransitTabIndex;
                    const getIconComponent = (iconName: string) => {
                      switch (iconName) {
                        case 'Car':
                          return <Car className="w-4 h-4" />;
                        case 'Smartphone':
                          return <Smartphone className="w-4 h-4" />;
                        case 'Train':
                          return <Train className="w-4 h-4 text-emerald-650" />;
                        case 'Bus':
                          return <Bus className="w-4 h-4" />;
                        case 'CreditCard':
                          return <CreditCard className="w-4 h-4 text-violet-650" />;
                        case 'Lightbulb':
                          return <Lightbulb className="w-4 h-4 text-amber-500" />;
                        default:
                          return <Navigation className="w-4 h-4" />;
                      }
                    };
                    return (
                      <button
                        key={sect.title}
                        type="button"
                        onClick={() => setActiveTransitTabIndex(idx)}
                        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        {getIconComponent(sect.icon)}
                        <span>{getTransitSectionLabel(sect)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected tab content box */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-50/60 rounded-2xl p-4 md:p-5 border border-slate-150/40 space-y-4">
                    {(() => {
                      const activeSect = transitSections[activeTransitTabIndex];
                      if (!activeSect) return null;

                      const lines = activeSect.content.split('\n').filter((l) => l.trim().length > 0);
                      const getIconComponent = (iconName: string) => {
                        switch (iconName) {
                          case 'Car':
                            return <Car className="w-4.5 h-4.5" />;
                          case 'Smartphone':
                            return <Smartphone className="w-4.5 h-4.5" />;
                          case 'Train':
                            return <Train className="w-4.5 h-4.5 text-emerald-650" />;
                          case 'Bus':
                            return <Bus className="w-4.5 h-4.5" />;
                          case 'CreditCard':
                            return <CreditCard className="w-4.5 h-4.5 text-violet-650" />;
                          case 'Lightbulb':
                            return <Lightbulb className="w-4.5 h-4.5 text-amber-500" />;
                          default:
                            return <Navigation className="w-4.5 h-4.5" />;
                        }
                      };

                      return (
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-850 text-sm flex items-center gap-2">
                            {getIconComponent(activeSect.icon)}
                            {getTransitSectionLabel(activeSect)}
                          </h4>

                          <div className="space-y-2.5">
                            {lines.map((ln, lIdx) => {
                              const cleanLine = ln.trim();
                              // Check if line looks like a list item or note
                              const isBullet =
                                cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\./.test(cleanLine);
                              const text = isBullet ? cleanLine.replace(/^[-*\d.]\s*/, '') : cleanLine;

                              return (
                                <div key={lIdx} className="flex items-start gap-2.5">
                                  <span className="text-[10px] text-indigo-500 mt-1">✦</span>
                                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">{text}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Grounded references side box */}
                  <div className="col-span-1 bg-gradient-to-b from-indigo-50/20 to-slate-50/40 rounded-2xl p-4 border border-indigo-100/40 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-slate-650 font-bold text-xs uppercase tracking-wider">
                        <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                        {t('trip.sourcesTitle')}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{t('trip.sourcesDesc')}</p>

                      {transitData.sources && transitData.sources.length > 0 ? (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {transitData.sources.slice(0, 4).map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-start gap-1.5 p-2 bg-white rounded-xl border border-slate-100 hover:border-indigo-150 transition-all text-left block cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              <div className="space-y-0.5 overflow-hidden">
                                <span className="text-[10px] text-slate-700 font-bold truncate block group-hover:text-indigo-650">
                                  {src.title}
                                </span>
                                <span className="text-[9px] text-emerald-600 font-medium truncate block">
                                  {src.url}
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">{t('trip.searchSource')}</p>
                      )}
                    </div>

                    <div className="text-[10px] italic font-medium text-slate-400/90 text-right">
                      {t('trip.groundingEngine')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] text-slate-400 font-mono border-t border-slate-100/60 pt-2.5">
                  <span>Atualizado de acordo com o Google Search em tempo real</span>
                  <button
                    type="button"
                    onClick={fetchUrbanMobilityDetails}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    🔄 Recarregar Pesquisa
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Core Tips Lists */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 space-y-4">
            <h3 className="font-bold text-slate-850 text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-50" />
              Conselhos & Dicas Práticas Locais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tripPlan.tips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-1.5">
                  <span className="inline-block text-[10px] tracking-wider uppercase font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 py-0.5 px-2.5 rounded-full">
                    {tip.category}
                  </span>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Backdrop */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="share-modal">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal content container */}
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 space-y-6"
              >
                {/* Header visual info */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-500/15 py-0.5 px-2 rounded-full font-extrabold text-indigo-400 uppercase tracking-widest">
                      Compartilhar Viagem
                    </span>
                    <h3 className="text-lg font-black text-slate-100 mt-1">Conectar Acompanhantes</h3>
                    <p className="text-xs text-slate-400">
                      Envie o itinerário completo e o mapa interativo para seus parceiros de jornada
                    </p>
                  </div>
                  <button
                    onClick={() => setIsShareOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* QR Code and Quick instructions */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-2 flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-slate-850 shadow-inner">
                    {/* Publicly available secure quick qr server */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR Code do Roteiro"
                      className="w-32 h-32 border border-slate-100 bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
                      📱 Escaneie para abrir
                    </span>
                  </div>

                  <div className="md:col-span-3 space-y-3.5">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Código QR Dinâmico
                      </h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed">
                        Aponte a câmera do celular de seus acompanhantes para que eles importem instantaneamente este
                        roteiro em suas telas.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Acesso Sem Internet
                      </h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed">
                        Este link contém todo o planejamento compactado de forma offline-safe pelo Service Worker da
                        nossa plataforma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action controls panel */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">
                    Link de Compartilhamento Direto
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                      }}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 flex-grow focus:outline-none focus:border-indigo-500 w-10 truncate"
                    />

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                        copied ? 'bg-emerald-600 text-white' : 'bg-indigo-650 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        'Copiar'
                      )}
                    </button>
                  </div>
                </div>

                {/* Third party share buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Olha só o nosso roteiro de viagem completo para ${tripPlan.destination} (${tripPlan.durationDays} dias). Acesse por este link para ver os detalhes, horários, restaurantes e o mapa interativo: ` +
                        shareUrl,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.022-.008-1.243-.614-1.437-.682-.194-.069-.336-.102-.477.1-.14.2-.543.682-.665.821-.122.14-.243.156-.463.047-.223-.11-1.07-.394-2.03-1.25-.747-.665-1.247-1.488-1.39-1.73-.14-.243-.015-.373.107-.493.11-.11.243-.284.365-.426.12-.14.16-.24.24-.4.08-.162.04-.303-.02-.423-.06-.12-.478-1.153-.654-1.577-.17-.411-.341-.354-.478-.361-.123-.006-.264-.006-.405-.006-.14 0-.366.052-.558.26-.192.208-.734.717-.734 1.748 0 1.03.75 2.023.855 2.164.104.14 1.472 2.25 3.566 3.155.498.215.887.343 1.196.44.5.16 1.062.137 1.465.077.45-.067 1.383-.564 1.58-.108.197-.457.197-.85 0-.918-.02-.008-.108-.046-.242-.113" />
                      <path d="M12.003 21c-1.623 0-3.213-.42-4.62-1.214L3.5 21l1.248-3.921A8.96 8.96 0 0 1 3 12c0-4.963 4.04-9 9.003-9 4.961 0 8.997 4.037 8.997 9 0 4.963-4.036 9-8.997 9m0-16.71c-4.245 0-7.7 3.456-7.7 7.7 0 1.396.375 2.76 1.085 3.953l-.756 2.378 2.434-.638A7.665 7.665 0 0 0 12.003 18.7c4.245 0 7.7-3.457 7.7-7.7 0-4.244-3.455-7.7-7.7-7.7" />
                    </svg>
                    WhatsApp
                  </a>

                  <a
                    href={`mailto:?subject=Roteiro%20de%20Viagem%20para%20${encodeURIComponent(tripPlan.destination)}&body=Ol%C3%A1!%20Planejei%20um%20roteiro%20de%20viagem%20incr%C3%ADvel%20para%20${encodeURIComponent(tripPlan.destination)}%20com%20IA.%20Acesse%20as%20paradas%20e%20o%20mapa%20por%20este%20link:%0A%0A${encodeURIComponent(shareUrl)}`}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    E-mail
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Modal Backdrop */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="calendar-modal">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal content container */}
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-lg bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 space-y-6"
              >
                {/* Header visual info */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-rose-500/15 py-0.5 px-2 rounded-full font-extrabold text-rose-450 uppercase tracking-widest">
                      Calendário iCal
                    </span>
                    <h3 className="text-lg font-black text-slate-100 mt-1">Exportar para Agenda</h3>
                    <p className="text-xs text-slate-400">
                      Gere um arquivo universal e adicione as paradas e horários em sua agenda.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCalendarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Configuration form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Qual é a data de embarque/início da viagem?
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      As atividades serão agendadas cronologicamente a partir deste dia.
                    </p>
                  </div>

                  {/* Trip preview dates */}
                  <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-850 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Cronograma Estimado ({tripPlan.durationDays} Dias)
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {tripPlan.days.map((day, ix) => {
                        const d = new Date(startDate);
                        d.setDate(d.getDate() + ix);
                        const formatted = isNaN(d.getTime())
                          ? `Dia ${day.dayNumber}`
                          : d.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              weekday: 'short',
                            });
                        return (
                          <div
                            key={day.dayNumber}
                            className="flex justify-between items-center text-xs border-b border-slate-850 pb-2 last:border-none last:pb-0"
                          >
                            <span className="font-bold text-slate-300">Dia {day.dayNumber}</span>
                            <span className="text-slate-400 text-[11px] font-mono">{formatted}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Confirm Export & Download Button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleExportCalendar}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-550 hover:from-rose-550 hover:to-rose-500 text-white text-xs font-black transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Baixar Arquivo de Calendário (.ics)
                  </button>

                  {/* Help tips toggler */}
                  <div className="border-t border-slate-850 pt-3 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Como importar o arquivo gerado?
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-400 leading-relaxed">
                      <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60">
                        <strong className="text-slate-350 block mb-0.5">📅 Google Agenda</strong>
                        No computador, acesse <span className="text-indigo-400 font-medium">calendar.google.com</span>.
                        Clique em <strong>Configurações (engrenagem) &gt; Importar e Exportar</strong>, envie esse
                        arquivo .ics e selecione sua agenda.
                      </div>
                      <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60">
                        <strong className="text-slate-350 block mb-0.5">🍎 Apple Calendar / Outlook</strong>
                        Dê dois cliques no arquivo no Mac ou abra-o direto pelas opções de compartilhamento do seu
                        iPhone/PC para adicionar instantaneamente.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
