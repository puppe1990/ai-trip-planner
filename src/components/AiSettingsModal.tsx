import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Settings, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LlmProviderId } from '@/src/lib/llm/types';
import type { AiConfigResponse } from '@/src/server/ai.functions';
import { getAiConfigFn, updateAiConfigFn } from '@/src/server/ai.functions';

export default function AiSettingsModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AiConfigResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<LlmProviderId>('gemini');
  const [model, setModel] = useState('');

  const selectedProvider = useMemo(
    () => config?.providers.find((provider) => provider.id === providerId),
    [config?.providers, providerId],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getAiConfigFn()
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
        setProviderId(data.providerId);
        setModel(data.model);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(null);
          setError(t('aiSettings.loadError'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, t]);

  const handleProviderChange = (nextProviderId: LlmProviderId) => {
    setProviderId(nextProviderId);
    const nextProvider = config?.providers.find((provider) => provider.id === nextProviderId);
    if (nextProvider) setModel(nextProvider.defaultModel);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateAiConfigFn({ data: { providerId, model } });
      setConfig((current) =>
        current
          ? {
              ...current,
              ...updated,
            }
          : null,
      );
      setProviderId(updated.providerId);
      setModel(updated.model);
    } catch {
      setError(t('aiSettings.saveError'));
    } finally {
      setSaving(false);
    }
  };

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

                {error && (
                  <p className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {error}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <label
                      htmlFor="ai-provider"
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block"
                    >
                      {t('aiSettings.provider')}
                    </label>
                    <select
                      id="ai-provider"
                      value={providerId}
                      disabled={loading || !config}
                      onChange={(event) => handleProviderChange(event.target.value as LlmProviderId)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                    >
                      {(config?.providers ?? []).map((provider) => (
                        <option key={provider.id} value={provider.id} disabled={!provider.configured}>
                          {provider.displayName}
                          {!provider.configured ? ` (${t('aiSettings.unavailable')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <label
                      htmlFor="ai-model"
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block"
                    >
                      {t('aiSettings.model')}
                    </label>
                    <input
                      id="ai-model"
                      type="text"
                      value={loading ? '' : model}
                      disabled={loading || !config}
                      onChange={(event) => setModel(event.target.value)}
                      placeholder={loading ? t('aiSettings.loading') : undefined}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {t('aiSettings.capabilities')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          selectedProvider?.capabilities.structuredJson
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {t('aiSettings.structuredJson')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          selectedProvider?.capabilities.webGrounding
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {selectedProvider?.capabilities.webGrounding
                          ? t('aiSettings.webGrounding')
                          : t('aiSettings.webGroundingUnavailable')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t('aiSettings.hint')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={loading || saving || !config}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? t('aiSettings.saving') : t('aiSettings.save')}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
