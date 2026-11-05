import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { DEFAULT_CATEGORIES } from '../constants/translations';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Trash2,
  Edit2,
  Calendar,
  Briefcase,
  Store,
  Laptop,
  Home,
  Gift,
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Film,
  CreditCard,
  Layers,
  Columns2,
  Zap,
  Banknote,
  Landmark,
} from 'lucide-react';

const CATEGORY_ICONS = {
  salary: Briefcase,
  business: Store,
  freelance: Laptop,
  rental: Home,
  gift: Gift,
  investment: TrendingUp,
  other_income: PlusCircle,
  food: Utensils,
  travel: Car,
  bills: Receipt,
  shopping: ShoppingBag,
  health: HeartPulse,
  education: GraduationCap,
  rent: Home,
  entertainment: Film,
  emi: CreditCard,
  other_expense: MinusCircle,
  transfer: Layers,
};

export const TwoColumnView = ({ onOpenAddModal, onEditTransaction }) => {
  const {
    t,
    lang,
    incomeTransactions,
    expenseTransactions,
    deleteTransaction,
    activeFund,
  } = useExpenses();

  // Column view mode on mobile: 'split' (side-by-side 2 columns) or 'income' | 'expense'
  const [mobileLayout, setMobileLayout] = useState('split');

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getCategoryLabel = (catId, type) => {
    const list = type === 'income' ? DEFAULT_CATEGORIES.income : DEFAULT_CATEGORIES.expense;
    const item = list.find((c) => c.id === catId);
    if (!item) return catId;
    return lang === 'ml' ? item.nameMl : item.nameEn;
  };

  const getCategoryIcon = (catId) => {
    const IconComponent = CATEGORY_ICONS[catId] || (catId === 'income' ? PlusCircle : MinusCircle);
    return <IconComponent className="w-3.5 h-3.5" />;
  };

  const getPaymentMethodBadge = (tx) => {
    const method = tx.paymentMethod;
    if (method === 'gpay') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
          <Zap className="w-2.5 h-2.5 text-amber-500" />
          <span>GPay (Bank)</span>
        </span>
      );
    }
    if (method === 'card') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/50">
          <CreditCard className="w-2.5 h-2.5" />
          <span>Card (Bank)</span>
        </span>
      );
    }
    if (tx.fundType === 'bank' || method === 'bank') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/50">
          <Landmark className="w-2.5 h-2.5" />
          <span>Bank</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
        <Banknote className="w-2.5 h-2.5" />
        <span>Cash</span>
      </span>
    );
  };

  const totalColIncome = incomeTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalColExpense = expenseTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Column titles based on active fund
  const incomeTitle = activeFund === 'liquid'
    ? (lang === 'ml' ? 'ലിക്വിഡ് വരവ് (Cash)' : 'Liquid Income (Cash)')
    : activeFund === 'bank'
    ? (lang === 'ml' ? 'ബാങ്ക് & GPay വരവ്' : 'Bank & GPay Income')
    : t.columnIncomeTitle;

  const expenseTitle = activeFund === 'liquid'
    ? (lang === 'ml' ? 'ലിക്വിഡ് ചിലവ് (Cash)' : 'Liquid Expense (Cash)')
    : activeFund === 'bank'
    ? (lang === 'ml' ? 'ബാങ്ക് & GPay ചിലവ്' : 'Bank & GPay Expense')
    : t.columnExpenseTitle;

  return (
    <div className="space-y-3">
      {/* View Switcher for Mobile */}
      <div className="flex sm:hidden items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setMobileLayout('split')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            mobileLayout === 'split' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : ''
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>{lang === 'ml' ? '2 കോളങ്ങൾ' : 'Split View'}</span>
        </button>
        <button
          onClick={() => setMobileLayout('income')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            mobileLayout === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t.income}</span>
        </button>
        <button
          onClick={() => setMobileLayout('expense')}
          className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            mobileLayout === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{t.expense}</span>
        </button>
      </div>

      {/* Two Column Grid */}
      <div className={`grid gap-3 sm:gap-4 ${
        mobileLayout === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {/* ================= COLUMN 1: INCOME (വരവ്) ================= */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col ${
            mobileLayout === 'expense' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Column Header */}
          <div className="p-3.5 sm:p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {incomeTitle}
                </div>
                <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(totalColIncome)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAddModal('income', activeFund === 'all' ? 'liquid' : activeFund)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
              title={t.addIncome}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addIncome}</span>
            </button>
          </div>

          {/* Income Transactions List */}
          <div className="p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto">
            {incomeTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <PlusCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-medium">{t.noIncomeYet}</p>
                <button
                  onClick={() => onOpenAddModal('income', activeFund === 'all' ? 'liquid' : activeFund)}
                  className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  +{t.addIncome}
                </button>
              </div>
            ) : (
              incomeTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-2.5 px-2 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {getCategoryLabel(tx.category, 'income')}
                        </span>
                        {getPaymentMethodBadge(tx)}
                      </div>
                      {tx.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {tx.description}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1 mt-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t.edit}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.confirmDelete)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t.delete}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: EXPENSE (ചെലവ്) ================= */}
        <div
          className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col ${
            mobileLayout === 'income' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Column Header */}
          <div className="p-3.5 sm:p-4 bg-rose-50/70 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                  {expenseTitle}
                </div>
                <div className="text-sm font-black text-rose-700 dark:text-rose-300">
                  {formatCurrency(totalColExpense)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAddModal('expense', activeFund === 'all' ? 'liquid' : activeFund)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
              title={t.addExpense}
            >
              <MinusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addExpense}</span>
            </button>
          </div>

          {/* Expense Transactions List */}
          <div className="p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[500px] overflow-y-auto">
            {expenseTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <MinusCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-rose-500" />
                <p className="text-xs font-medium">{t.noExpenseYet}</p>
                <button
                  onClick={() => onOpenAddModal('expense', activeFund === 'all' ? 'liquid' : activeFund)}
                  className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  +{t.addExpense}
                </button>
              </div>
            ) : (
              expenseTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-2.5 px-2 hover:bg-rose-50/40 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {getCategoryLabel(tx.category, 'expense')}
                        </span>
                        {getPaymentMethodBadge(tx)}
                      </div>
                      {tx.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {tx.description}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
                      -{formatCurrency(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1 mt-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t.edit}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.confirmDelete)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t.delete}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
