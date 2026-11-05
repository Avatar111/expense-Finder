import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Banknote, Landmark, ArrowRightLeft, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const OverallStats = ({ onOpenTransfer }) => {
  const { t, lang, calculations, activeFund, setActiveFund } = useExpenses();

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/15 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute right-12 top-0 w-28 h-28 rounded-full bg-teal-400/10 pointer-events-none blur-xl" />

      {/* Top row: Total Net Balance & Transfer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-emerald-100 border border-white/10">
            <span>✨</span> {t.totalNetBalance}
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 text-white drop-shadow-sm">
            {formatCurrency(calculations.totalNetBalance)}
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-100/90 mt-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.totalIncome}: {formatCurrency(calculations.totalIncome)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-300" />
              <span>{t.totalExpense}: {formatCurrency(calculations.totalExpense)}</span>
            </span>
          </div>
        </div>

        {/* Transfer Button */}
        <button
          onClick={onOpenTransfer}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 shadow-sm border border-white/25"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{t.transfer}</span>
        </button>
      </div>

      {/* Two Fund Quick Cards: Completely Separated Liquid vs Bank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 relative z-10">
        {/* 1. Liquid Cash Card */}
        <div
          onClick={() => setActiveFund('liquid')}
          className={`cursor-pointer p-3.5 rounded-2xl transition-all duration-200 border ${
            activeFund === 'liquid'
              ? 'bg-white/25 border-emerald-300 shadow-lg ring-2 ring-emerald-300/40 backdrop-blur-md'
              : 'bg-white/10 hover:bg-white/15 border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-100 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-300" />
              <span>{t.liquidFund}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-semibold border border-emerald-400/20">
              {lang === 'ml' ? 'കൈവശമുള്ള കാഷ്' : 'Cash in Hand'}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {formatCurrency(calculations.liquidBalance)}
          </div>

          {/* Separate Income & Expense for Liquid */}
          <div className="flex items-center justify-between text-xs text-emerald-100/90 mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-emerald-300 font-bold">+</span>
              <span className="text-[11px]">{t.income}: {formatCurrency(calculations.liquidIncome)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-rose-300 font-bold">-</span>
              <span className="text-[11px]">{t.expense}: {formatCurrency(calculations.liquidExpense)}</span>
            </div>
          </div>
        </div>

        {/* 2. Bank Account & Google Pay Card */}
        <div
          onClick={() => setActiveFund('bank')}
          className={`cursor-pointer p-3.5 rounded-2xl transition-all duration-200 border ${
            activeFund === 'bank'
              ? 'bg-white/25 border-teal-300 shadow-lg ring-2 ring-teal-300/40 backdrop-blur-md'
              : 'bg-white/10 hover:bg-white/15 border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-teal-100 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-teal-300" />
              <span>{t.bankFund}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 font-semibold border border-blue-400/20 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              <span>GPay / UPI</span>
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {formatCurrency(calculations.bankBalance)}
          </div>

          {/* Separate Income & Expense for Bank */}
          <div className="flex items-center justify-between text-xs text-teal-100/90 mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-teal-300 font-bold">+</span>
              <span className="text-[11px]">{t.income}: {formatCurrency(calculations.bankIncome)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-rose-300 font-bold">-</span>
              <span className="text-[11px]">{t.expense}: {formatCurrency(calculations.bankExpense)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
