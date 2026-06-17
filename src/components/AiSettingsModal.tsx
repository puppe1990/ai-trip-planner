import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Settings, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AiConfig } from '@/src/lib/ai-config';
import { getAiConfigFn } from '@/src/server/ai.functions';

export default function AiSettingsModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    void getAiConfigFn()
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        aria-label={t('aiSettings.open')}
        title={t('aiSettings.open')}
      >
        <Settings className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-settings-title"
                className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/60 p-6 z-10"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 id="ai-settings-title" className="text-lg font-bold text-slate-900">
                        {t('aiSettings.title')}
                      </h2>
                      <p className="text-xs text-slate-500">{t('aiSettings.subtitle')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label={t('common.cancel')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {t('aiSettings.provider')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {loading ? t('aiSettings.loading') : (config?.provider ?? '—')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {t('aiSettings.model')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 font-mono">
                      {loading ? t('aiSettings.loading') : (config?.model ?? '—')}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-500">
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t('aiSettings.hint')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
