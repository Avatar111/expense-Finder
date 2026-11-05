import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { DEFAULT_CATEGORIES } from '../constants/translations';
import confetti from 'canvas-confetti';
import {
  X,
  PlusCircle,
  MinusCircle,
  Banknote,
  Landmark,
  Calendar,
  Sparkles,
  Check,
  Zap,
  CreditCard,
  Building,
} from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose, initialType, initialFund, editTx }) => {
  const {
    t,
    lang,
    addTransaction,
    updateTransaction,
    calculations,
    activeFund,
  } = useExpenses();

  const [type, setType] = useState('expense');
  const [fundType, setFundType] = useState('liquid');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // When editTx is provided, populate fields
  useEffect(() => {
    if (!isOpen) return;

    if (editTx) {
      setType(editTx.type);
      setFundType(editTx.fundType || 'liquid');
      setPaymentMethod(editTx.paymentMethod || (editTx.fundType === 'bank' ? 'gpay' : 'cash'));
      setAmount(editTx.amount.toString());
      setCategory(editTx.category);
      setDescription(editTx.description || '');
      setDate(editTx.date || new Date().toISOString().split('T')[0]);
    } else {
      const defaultType = initialType || 'expense';
      const defaultFund = initialFund === 'bank' ? 'bank' : (initialFund === 'liquid' ? 'liquid' : (activeFund === 'bank' ? 'bank' : 'liquid'));
      setType(defaultType);
      setFundType(defaultFund);
      setPaymentMethod(defaultFund === 'bank' ? 'gpay' : 'cash');
      setAmount('');
      setCategory(defaultType === 'income' ? 'salary' : 'food');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, editTx, initialType, initialFund, activeFund]);

  if (!isOpen) return null;

  // Real-time calculation preview
  const currentFundBalance = fundType === 'liquid' ? calculations.liquidBalance : calculations.bankBalance;
  const numAmount = parseFloat(amount) || 0;
  const resultingBalance = type === 'expense' ? currentFundBalance - numAmount : currentFundBalance + numAmount;

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleFundChange = (newFund) => {
    setFundType(newFund);
    if (newFund === 'bank') {
      if (paymentMethod === 'cash') setPaymentMethod('gpay');
    } else {
      setPaymentMethod('cash');
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'gpay' || method === 'bank' || method === 'card' || method === 'phonepe' || method === 'paytm') {
      setFundType('bank');
    } else if (method === 'cash') {
      setFundType('liquid');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;

    // Google Pay / UPI or Bank payment MUST strictly go to 'bank' fund
    const finalFundType = (paymentMethod === 'gpay' || paymentMethod === 'phonepe' || paymentMethod === 'paytm' || paymentMethod === 'bank' || paymentMethod === 'card')
      ? 'bank'
      : (paymentMethod === 'cash' ? 'liquid' : fundType);

    const txPayload = {
      type,
      fundType: finalFundType,
      paymentMethod,
      amount: numAmount,
      category: category || (type === 'income' ? 'other_income' : 'other_expense'),
      description: description.trim(),
      date,
    };

    if (editTx) {
      updateTransaction(editTx.id, txPayload);
    } else {
      addTransaction(txPayload);

      // Joyful celebratory confetti when adding an income
      if (type === 'income') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }

    onClose();
  };

  const categories = type === 'income' ? DEFAULT_CATEGORIES.income : DEFAULT_CATEGORIES.expense;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {type === 'income' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editTx ? t.edit : type === 'income' ? t.addIncome : t.addExpense}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* 1. Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('salary');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.income}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('food');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>{t.expense}</span>
            </button>
          </div>

          {/* 2. Fund Type Toggle (Liquid Cash vs Bank Account) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'ml' ? 'പണം എവിടെ നിന്നാണ് പോകുന്നത്?' : 'Which account/fund?'}
              </label>
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                {fundType === 'bank' ? '🏦 നേരിട്ട് ബാങ്കിൽ നിന്ന്' : '💵 ലിക്വിഡ് പണത്തിൽ നിന്ന്'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Bank Account / GPay Card */}
              <button
                type="button"
                onClick={() => handleFundChange('bank')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  fundType === 'bank'
                    ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t.bankFund}</span>
                  </div>
                  {fundType === 'bank' && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                  {lang === 'ml' ? 'Google Pay / PhonePe / Card' : 'Google Pay, UPI, Card'}
                </div>
              </button>

              {/* Liquid Cash Card */}
              <button
                type="button"
                onClick={() => handleFundChange('liquid')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  fundType === 'liquid'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.liquidFund}</span>
                  </div>
                  {fundType === 'liquid' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  {lang === 'ml' ? 'കൈവശമുള്ള കാഷ്' : 'Cash in Hand'}
                </div>
              </button>
            </div>

            {/* Quick Payment Method Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                {lang === 'ml' ? 'വഴി:' : 'Via:'}
              </span>

              {/* Google Pay / UPI */}
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('gpay')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  paymentMethod === 'gpay'
                    ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Google Pay / UPI</span>
              </button>

              {/* Cash in Hand */}
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Banknote className="w-3 h-3" />
                <span>{lang === 'ml' ? 'ലിക്വിഡ് കാഷ്' : 'Cash'}</span>
              </button>

              {/* Card / ATM */}
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('card')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  paymentMethod === 'card'
                    ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>{lang === 'ml' ? 'കാർഡ് / ATM' : 'Card'}</span>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('bank')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  paymentMethod === 'bank'
                    ? 'bg-slate-700 text-white shadow-xs ring-1 ring-slate-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Building className="w-3 h-3" />
                <span>{lang === 'ml' ? 'ബാങ്ക് ട്രാൻസ്ഫർ' : 'Net Banking'}</span>
              </button>
            </div>
          </div>

          {/* 3. Amount Input & Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t.amount} (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Adder Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(amount) || 0;
                    setAmount((current + q).toString());
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +{q}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 4. Auto-Deduction Live Preview Banner with Reassurance */}
          {numAmount > 0 && (
            <div
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                type === 'expense'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    {fundType === 'bank'
                      ? (lang === 'ml' ? 'ബാങ്ക് ബാലൻസിലെ ഡിഡക്ഷൻ:' : 'Bank Account Balance:')
                      : (lang === 'ml' ? 'ലിക്വിഡ് കാഷിലെ ഡിഡക്ഷൻ:' : 'Liquid Cash Balance:')}
                  </span>
                </div>
                <span className="font-black text-sm">
                  {formatCurrency(resultingBalance)}
                </span>
              </div>

              {/* Exact Reassurance text answering the user's specific concern! */}
              <div className="text-[11px] opacity-85 font-medium flex items-center justify-between pt-1 border-t border-rose-200/50 dark:border-rose-900/50">
                <span>
                  {fundType === 'bank'
                    ? (lang === 'ml' ? '✓ Google Pay/ബാങ്കിൽ നിന്നാണ് കുറയുന്നത് (ലിക്വിഡ് മാറ്റമില്ല)' : '✓ Deducts from Bank Account only (Liquid cash untouched)')
                    : (lang === 'ml' ? '✓ കയ്യിലുള്ള കാഷിൽ നിന്നാണ് കുറയുന്നത് (ബാങ്കിൽ മാറ്റമില്ല)' : '✓ Deducts from Liquid cash only (Bank balance untouched)')}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/60 dark:bg-slate-900/60">
                  {fundType === 'bank' ? 'Bank Account' : 'Liquid Cash'}
                </span>
              </div>
            </div>
          )}

          {/* 5. Category Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    category === c.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{lang === 'ml' ? c.nameMl : c.nameEn}</span>
                  {category === c.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t.description}
            </label>
            <input
              type="text"
              placeholder={lang === 'ml' ? 'ഉദാ: Google Pay വഴി കടയിൽ നൽകിയത്, ചായ...' : 'e.g. Paid via Google Pay, Tea, Petrol...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 7. Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t.date}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!numAmount || numAmount <= 0}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
