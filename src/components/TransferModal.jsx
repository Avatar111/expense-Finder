import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { ArrowRightLeft, X, Banknote, Landmark } from 'lucide-react';

export const TransferModal = ({ isOpen, onClose }) => {
  const { t, transferFunds, calculations } = useExpenses();

  const [fromFund, setFromFund] = useState('liquid');
  const [toFund, setToFund] = useState('bank');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSwap = () => {
    setFromFund(toFund);
    setToFund(fromFund);
  };

  const handlePresetChange = (preset) => {
    if (preset === 'cash_to_bank') {
      setFromFund('liquid');
      setToFund('bank');
    } else {
      setFromFund('bank');
      setToFund('liquid');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    transferFunds({
      fromFund,
      toFund,
      amount: num,
      note,
      date,
    });

    onClose();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fromBalance = fromFund === 'liquid' ? calculations.liquidBalance : calculations.bankBalance;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.transfer}
              </h3>
              <p className="text-[11px] text-slate-500">{t.transferDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('cash_to_bank')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                fromFund === 'liquid' && toFund === 'bank'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
              <span>ബാങ്കിലേക്ക് അടച്ചു</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('bank_to_cash')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                fromFund === 'bank' && toFund === 'liquid'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-teal-500" />
              <span>ATM വഴി എടുത്തു</span>
            </button>
          </div>

          {/* Visual From -> To Box with Swap */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                {t.from}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {fromFund === 'liquid' ? t.liquidFund : t.bankFund}
              </span>
              <span className="text-[11px] text-slate-500 block">
                ബാലൻസ്: {formatCurrency(fromBalance)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-xs hover:bg-slate-100 transition-transform active:rotate-180"
              title="Swap"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>

            <div className="flex-1 text-right">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                {t.to}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {toFund === 'liquid' ? t.liquidFund : t.bankFund}
              </span>
              <span className="text-[11px] text-slate-500 block">
                ലക്ഷ്യം
              </span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.description}
            </label>
            <input
              type="text"
              placeholder="ATM Withdrawal / Bank Deposit"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.date}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {t.transfer}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
