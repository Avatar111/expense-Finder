import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import {
  Wallet,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register, continueAsGuest, isLoading, authError } = useAuth();
  const { lang, setLang, theme, setTheme, t } = useExpenses();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (cleanPhone.length !== 10) {
      setLocalError(
        lang === 'ml'
          ? 'ദയവായി 10 അക്കമുള്ള സാധുവായ ഫോൺ നമ്പർ നൽകുക'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    if (!password || password.length < 4) {
      setLocalError(
        lang === 'ml'
          ? 'പാസ്‌വേർഡിന് കുറഞ്ഞത് 4 അക്ഷരങ്ങൾ വേണം'
          : 'Password must be at least 4 characters long'
      );
      return;
    }

    if (mode === 'register') {
      await register({
        phone: cleanPhone,
        password,
        name: name.trim() || (lang === 'ml' ? 'ഉപയോക്താവ്' : 'User'),
      });
    } else {
      await login(cleanPhone, password);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'ml' ? 'en' : 'ml');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {t.appTitle}
            </h1>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switch */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'ml' ? 'EN' : 'മല'}</span>
          </button>

          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xl shadow-slate-900/5">
        {/* Card Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200/60 dark:border-emerald-800/60 shadow-inner">
            {mode === 'login' ? <LogIn className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError('');
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.loginTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError('');
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.registerTitle}</span>
          </button>
        </div>

        {/* Error Alert */}
        {(authError || localError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-medium">{authError || localError}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fullName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.phoneNumber}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                <span>🇮🇳</span>
                <span>+91</span>
              </span>
              <input
                type="tel"
                required
                autoFocus
                maxLength={10}
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-20 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
              <span>{lang === 'ml' ? '10 അക്ക മൊബൈൽ നമ്പർ' : '10 digit mobile number'}</span>
              <span>{cleanPhone.length}/10</span>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.loginButton}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.registerButton}</span>
              </>
            )}
          </button>
        </form>

        {/* Reinstall Data Recovery Assurance Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-[11px] sm:text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{lang === 'ml' ? 'അൺഇൻസ്റ്റാൾ ചെയ്താലും സുരക്ഷിതം!' : 'Safe even if uninstalled!'}</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {t.uninstallHelp}
          </p>
        </div>

        {/* Guest Mode Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.guestMode}</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="max-w-md w-full mx-auto text-center py-2 text-[11px] text-slate-400 dark:text-slate-500">
        <span>Expense Finder • Liquid Cash & Bank Account Auto-Deduct</span>
      </footer>
    </div>
  );
};
