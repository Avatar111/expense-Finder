import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Banknote, Landmark, Plus, ArrowRightLeft } from 'lucide-react';

export const MobileBottomNav = ({ onOpenAddModal, onOpenTransfer }) => {
  const { lang, activeFund, setActiveFund } = useExpenses();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: Liquid Cash */}
        <button
          onClick={() => setActiveFund('liquid')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeFund === 'liquid'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Banknote className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">{lang === 'ml' ? 'ലിക്വിഡ്' : 'Liquid'}</span>
        </button>

        {/* Center Quick Add (+) Button */}
        <div className="relative -top-4">
          <button
            onClick={() => onOpenAddModal('expense', activeFund === 'all' ? 'liquid' : activeFund)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 2: Bank Account / GPay */}
        <button
          onClick={() => setActiveFund('bank')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeFund === 'bank'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Landmark className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">{lang === 'ml' ? 'ബാങ്ക്/GPay' : 'Bank/GPay'}</span>
        </button>

        {/* Tab 3: Transfer Funds */}
        <button
          onClick={onOpenTransfer}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <ArrowRightLeft className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">{lang === 'ml' ? 'മാറ്റുക' : 'Transfer'}</span>
        </button>
      </div>
    </div>
  );
};
