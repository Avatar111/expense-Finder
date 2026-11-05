import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { Wallet, Moon, Sun, Globe, Database, LogOut, User } from 'lucide-react';

export const Navbar = ({ onOpenBackup }) => {
  const { lang, setLang, theme, setTheme, t } = useExpenses();
  const { currentUser, isGuest, logout, syncStatus } = useAuth();

  const toggleLang = () => {
    setLang(lang === 'ml' ? 'en' : 'ml');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {t.appTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Badge with Phone Number */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[120px]">
                  {currentUser.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isGuest ? 'Guest' : `+91 ${currentUser.phone}`}
                </span>
              </div>

              {/* Sync status */}
              <span
                className="ml-1"
                title={syncStatus === 'synced' ? t.synced : syncStatus === 'syncing' ? t.syncing : t.offlineMode}
              >
                {syncStatus === 'synced' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                ) : syncStatus === 'syncing' ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping block" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400 block" />
                )}
              </span>
            </div>
          )}

          {/* Backup / Export Button */}
          <button
            onClick={onOpenBackup}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.exportData}
            aria-label={t.exportData}
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            title="Switch Language (മലയാളം / English)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">{lang === 'ml' ? 'English' : 'മലയാളം'}</span>
            <span className="xs:hidden">{lang === 'ml' ? 'EN' : 'മല'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={() => {
                if (window.confirm(lang === 'ml' ? 'അക്കൗണ്ടിൽ നിന്ന് ലോഗ് ഔട്ട് ചെയ്യണമെന്നുണ്ടോ?' : 'Do you want to log out?')) {
                  logout();
                }
              }}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={t.logout}
              aria-label={t.logout}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
