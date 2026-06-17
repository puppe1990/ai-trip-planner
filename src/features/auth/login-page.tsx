import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signIn, useSession } from '@/src/lib/auth-client';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) navigate({ to: '/' });
  }, [session, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(t('auth.loginError'));
        return;
      }
      await navigate({ to: '/' });
    } catch {
      setError(t('auth.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-[120px] opacity-40" />

      <div className="max-w-md w-full relative z-10 space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/40 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('common.appName')}{' '}
              <span className="text-xs bg-indigo-500/25 border border-indigo-400/20 text-indigo-200 py-0.5 px-2 rounded-full font-bold">
                {t('common.aiBadge')}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-2">{t('common.tagline')}</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{t('auth.loginTitle')}</h2>
              <p className="text-xs text-slate-500">{t('auth.loginSubtitle')}</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('auth.email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('auth.password')}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              {t('auth.noAccount')}{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                {t('auth.signup')}
              </Link>
            </p>

            <p className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {t('auth.poweredBy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}