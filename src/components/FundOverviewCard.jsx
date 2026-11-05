import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PlusCircle, MinusCircle, Sparkles, Zap, Banknote, Landmark } from 'lucide-react';

export const FundOverviewCard = ({ onOpenAddModal }) => {
  const { t, lang, activeFund, calculations } = useExpenses();

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Determine amounts for the selected fund
  let income = 0;
  let expense = 0;
  let balance = 0;
  let fundName = t.bothFunds;

  if (activeFund === 'liquid') {
    income = calculations.liquidIncome;
    expense = calculations.liquidExpense;
    balance = calculations.liquidBalance;
    fundName = t.liquidFund;
  } else if (activeFund === 'bank') {
    income = calculations.bankIncome;
    expense = calculations.bankExpense;
    balance = calculations.bankBalance;
    fundName = t.bankFund;
  } else {
    income = calculations.totalIncome;
    expense = calculations.totalExpense;
    balance = calculations.totalNetBalance;
    fundName = t.bothFunds;
  }

  // Calculate spent percentage
  const spentPercent = income > 0 ? Math.min(Math.round((expense / income) * 100), 100) : expense > 0 ? 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            {activeFund === 'liquid' ? (
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : activeFund === 'bank' ? (
              <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 block leading-tight">
              {fundName}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {activeFund === 'liquid'
                ? (lang === 'ml' ? 'കൈവശമുള്ള ലിക്വിഡ് കാഷ്' : 'Cash on Hand')
                : activeFund === 'bank'
                ? (lang === 'ml' ? 'ബാങ്ക് & Google Pay / UPI ബാലൻസ്' : 'Bank & Google Pay Balance')
                : (lang === 'ml' ? 'ആകെ ഫണ്ടുകൾ ഒരുമിച്ച്' : 'All Funds Combined')}
            </span>
          </div>
        </div>

        {/* Dynamic Mode Badge */}
        <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          {activeFund === 'liquid' && <span>💵 Cash Only</span>}
          {activeFund === 'bank' && (
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
              <Zap className="w-3 h-3 text-amber-500" /> GPay & Bank
            </span>
          )}
          {activeFund === 'all' && <span>🌐 All Records</span>}
        </span>
      </div>

      {/* Primary Balance Display */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/60 dark:from-slate-800/40 dark:to-slate-800/20 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.availableBalance} ({t.remainingFromIncome})
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Auto-Deduct</span>
          </span>
        </div>

        <div className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${
          balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {formatCurrency(balance)}
        </div>

        {/* Real-time Math Formula Pill */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {t.income}: {formatCurrency(income)}
          </span>
          <span>➖</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {t.expense}: {formatCurrency(expense)}
          </span>
          <span>🟰</span>
          <span className={`font-black ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {t.balance}: {formatCurrency(balance)}
          </span>
        </div>

        {/* Percentage Spent Progress Bar */}
        {income > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>{t.spentPercent}: {spentPercent}%</span>
              <span>{100 - spentPercent}% {t.remainingFromIncome}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  spentPercent > 80
                    ? 'bg-rose-500'
                    : spentPercent > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons: Add Income & Add Expense */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpenAddModal('income', activeFund === 'all' ? 'liquid' : activeFund)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 active:scale-95 transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.addIncome}</span>
        </button>

        <button
          onClick={() => onOpenAddModal('expense', activeFund === 'all' ? 'liquid' : activeFund)}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 active:scale-95 transition-all shadow-xs"
        >
          <MinusCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{t.addExpense}</span>
        </button>
      </div>
    </div>
  );
};
