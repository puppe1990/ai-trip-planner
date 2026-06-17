import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '../i18n/index';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = (i18n.language?.startsWith('en') ? 'en' : 'pt-BR') as AppLanguage;

  const switchLanguage = (lang: AppLanguage) => {
    void i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" aria-hidden />
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLanguage(lang)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            current === lang
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white'
          }`}
          aria-label={t('common.language')}
        >
          {lang === 'pt-BR' ? 'PT' : 'EN'}
        </button>
      ))}
    </div>
  );
}
