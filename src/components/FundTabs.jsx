import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Banknote, Landmark, Layers, Search, Zap } from 'lucide-react';

export const FundTabs = () => {
  const {
    t,
    activeFund,
    setActiveFund,
    filterPeriod,
    setFilterPeriod,
    searchTerm,
    setSearchTerm,
  } = useExpenses();

  return (
    <div className="space-y-3">
      {/* Two Page Tabs (Liquid Cash vs Bank Account) */}
      <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center shadow-inner">
        {/* Liquid Cash Tab */}
        <button
          onClick={() => setActiveFund('liquid')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeFund === 'liquid'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>{t.liquidFund}</span>
        </button>

        {/* Bank & Google Pay Tab */}
        <button
          onClick={() => setActiveFund('bank')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeFund === 'bank'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{t.bankFund}</span>
          <span className="hidden xs:inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
            <Zap className="w-2.5 h-2.5 text-amber-500 mr-0.5" /> GPay
          </span>
        </button>

        {/* Combined Both Funds Tab */}
        <button
          onClick={() => setActiveFund('all')}
          className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeFund === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title={t.bothFunds}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">{t.bothFunds}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Period Filter Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterPeriod === 'month'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.filterThisMonth}
          </button>
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterPeriod === 'today'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.filterToday}
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterPeriod === 'all'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.filterAll}
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="തിരയുക (Search GPay, bills, food...)"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
