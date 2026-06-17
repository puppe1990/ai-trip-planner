import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, RefreshCw, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getModelsForProvider } from '@/src/lib/ai-config';
import { parseAiGenerationError } from '@/src/lib/ai-error';
import type { LlmProviderId } from '@/src/lib/llm/types';
import type { AiConfigResponse } from '@/src/server/ai.functions';
import { getAiConfigFn, updateAiConfigFn } from '@/src/server/ai.functions';
import AiModelSelect from './AiModelSelect';

type AiGenerationRecoveryModalProps = {
  open: boolean;
  errorText: string | null;
  onClose: () => void;
  onRetry: () => Promise<void>;
};

export default function AiGenerationRecoveryModal({
  open,
  errorText,
  onClose,
  onRetry,
}: AiGenerationRecoveryModalProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AiConfigResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [providerId, setProviderId] = useState<LlmProviderId>('gemini');
  const [model, setModel] = useState('');

  const parsedError = useMemo(() => (errorText ? parseAiGenerationError(errorText) : null), [errorText]);

  const modelOptions = useMemo(() => {
    const models = getModelsForProvider(providerId, model);
    return models.map((option) => ({
      value: option.id,
      label: option.label,
    }));
  }, [providerId, model]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    void getAiConfigFn()
      .then((data) => {
        if (cancelled) return;
        setConfig(data);
        setProviderId(data.providerId);
        setModel(data.model);
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

  const handleProviderChange = (nextProviderId: LlmProviderId) => {
    setProviderId(nextProviderId);
    const nextProvider = config?.providers.find((provider) => provider.id === nextProviderId);
    if (nextProvider) setModel(nextProvider.defaultModel);
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await updateAiConfigFn({ data: { providerId, model } });
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && errorText && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-recovery-title"
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/60 p-6 z-10"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 id="ai-recovery-title" className="text-lg font-bold text-slate-900">
                      {t('generationRecovery.title')}
                    </h2>
                    <p className="text-xs text-slate-500">{t('generationRecovery.subtitle')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label={t('common.cancel')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 mb-4">
                <p className="text-sm leading-relaxed text-rose-800">{parsedError?.message}</p>
                {parsedError?.isRetryable && (
                  <p className="mt-2 text-[11px] text-rose-700/80">{t('generationRecovery.highDemand')}</p>
                )}
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 mb-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('generationRecovery.changeSettings')}</span>
                </div>

                <div>
                  <label
                    htmlFor="recovery-ai-provider"
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block"
                  >
                    {t('aiSettings.provider')}
                  </label>
                  <select
                    id="recovery-ai-provider"
                    value={providerId}
                    disabled={loading || !config || retrying}
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

                <AiModelSelect
                  id="recovery-ai-model"
                  label={t('aiSettings.model')}
                  options={modelOptions}
                  value={loading ? '' : model}
                  onChange={setModel}
                  disabled={loading || !config || retrying}
                  placeholder={loading ? t('aiSettings.loading') : undefined}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">{t('generationRecovery.retryHint')}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={retrying}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRetry()}
                    disabled={loading || retrying || !config}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                    {retrying ? t('generationRecovery.retrying') : t('generationRecovery.retry')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
