import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { TRANSLATIONS } from '../constants/translations';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

const STORAGE_KEY_BASE_TX = 'expense_finder_tx_v2';
const STORAGE_KEY_LANG = 'expense_finder_lang';
const STORAGE_KEY_THEME = 'expense_finder_theme';

// Initial starter transactions for fresh accounts
const INITIAL_DEMO_TRANSACTIONS = [
  {
    id: 'demo-1',
    type: 'income',
    fundType: 'liquid',
    paymentMethod: 'cash',
    amount: 15000,
    category: 'freelance',
    description: 'കൈവശമുള്ള വരുമാനം (Cash in Hand)',
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'demo-2',
    type: 'expense',
    fundType: 'liquid',
    paymentMethod: 'cash',
    amount: 1200,
    category: 'food',
    description: 'പലചരക്ക് വാങ്ങിയത് (കയ്യിൽ നിന്ന്)',
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'demo-3',
    type: 'income',
    fundType: 'bank',
    paymentMethod: 'bank',
    amount: 45000,
    category: 'salary',
    description: 'പ്രതിമാസ ശമ്പളം ബാങ്കിൽ വന്നത്',
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'demo-4',
    type: 'expense',
    fundType: 'bank',
    paymentMethod: 'gpay',
    amount: 3200,
    category: 'bills',
    description: 'Google Pay വഴി കറന്റ് ബില്ലും വൈഫൈയും അടച്ചു',
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 3600000 * 6,
  },
];

export const ExpenseProvider = ({ children }) => {
  const { currentUser, syncTransactions, fetchServerTransactions } = useAuth();
  const userPhone = currentUser?.phone || 'guest';
  const storageKey = `${STORAGE_KEY_BASE_TX}_${userPhone}`;

  // 1. Language state
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'ml';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

  // 2. Theme state (dark / light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 3. Transactions state
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      // Check legacy key if migrating
      const legacy = localStorage.getItem('expense_finder_transactions_v1');
      if (legacy && userPhone !== 'guest') {
        return JSON.parse(legacy);
      }
      return INITIAL_DEMO_TRANSACTIONS;
    } catch (e) {
      console.error('Failed to parse transactions', e);
      return [];
    }
  });

  // Load from server when user changes or logs in
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (!currentUser || currentUser.phone === 'guest') {
      try {
        const stored = localStorage.getItem(storageKey);
        setTransactions(stored ? JSON.parse(stored) : INITIAL_DEMO_TRANSACTIONS);
      } catch {
        setTransactions(INITIAL_DEMO_TRANSACTIONS);
      }
      return;
    }

    let isMounted = true;
    const loadUserData = async () => {
      // 1. Try local storage for immediate render
      const local = localStorage.getItem(storageKey);
      if (local) {
        try {
          setTransactions(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Try fetching from server database
      const serverData = await fetchServerTransactions();
      if (isMounted && serverData && Array.isArray(serverData)) {
        if (serverData.length > 0) {
          setTransactions(serverData);
          localStorage.setItem(storageKey, JSON.stringify(serverData));
        } else if (local) {
          // If server is empty but local has data, sync local to server
          syncTransactions(JSON.parse(local));
        }
      }
    };

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchServerTransactions, storageKey, syncTransactions]);

  // Save transactions to localStorage and sync to server
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(transactions));
    if (currentUser && currentUser.phone !== 'guest') {
      syncTransactions(transactions);
    }
  }, [transactions, storageKey, currentUser, syncTransactions]);

  // 4. Navigation & Filter State
  const [activeFund, setActiveFund] = useState('liquid'); // 'liquid' | 'bank' | 'all'
  const [filterPeriod, setFilterPeriod] = useState('month'); // 'all' | 'month' | 'today'
  const [searchTerm, setSearchTerm] = useState('');

  // Translations helper
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ml;

  // 5. Calculations: Liquid and Bank completely separate + combined totals
  const calculations = useMemo(() => {
    let liquidIncome = 0;
    let liquidExpense = 0;
    let bankIncome = 0;
    let bankExpense = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

    transactions.forEach((tx) => {
      // Check filter period
      if (filterPeriod === 'today' && tx.date !== todayStr) return;
      if (filterPeriod === 'month' && !tx.date.startsWith(currentMonthStr)) return;

      const amt = Number(tx.amount) || 0;
      if (tx.fundType === 'liquid') {
        if (tx.type === 'income') liquidIncome += amt;
        else if (tx.type === 'expense') liquidExpense += amt;
      } else if (tx.fundType === 'bank') {
        if (tx.type === 'income') bankIncome += amt;
        else if (tx.type === 'expense') bankExpense += amt;
      }
    });

    const liquidBalance = liquidIncome - liquidExpense;
    const bankBalance = bankIncome - bankExpense;
    const totalIncome = liquidIncome + bankIncome;
    const totalExpense = liquidExpense + bankExpense;
    const totalNetBalance = liquidBalance + bankBalance;

    return {
      liquidIncome,
      liquidExpense,
      liquidBalance,
      bankIncome,
      bankExpense,
      bankBalance,
      totalIncome,
      totalExpense,
      totalNetBalance,
    };
  }, [transactions, filterPeriod]);

  // Filtered transactions for the current view
  const currentFundTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    return transactions
      .filter((tx) => {
        // Fund filter
        if (activeFund !== 'all' && tx.fundType !== activeFund) return false;

        // Period filter
        if (filterPeriod === 'today' && tx.date !== todayStr) return false;
        if (filterPeriod === 'month' && !tx.date.startsWith(currentMonthStr)) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDesc = (tx.description || '').toLowerCase().includes(term);
          const matchCat = (tx.category || '').toLowerCase().includes(term);
          const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(term);
          const matchAmt = tx.amount.toString().includes(term);
          return matchDesc || matchCat || matchMethod || matchAmt;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
  }, [transactions, activeFund, filterPeriod, searchTerm]);

  // Two columns separation for the active fund
  const incomeTransactions = useMemo(() => {
    return currentFundTransactions.filter((tx) => tx.type === 'income');
  }, [currentFundTransactions]);

  const expenseTransactions = useMemo(() => {
    return currentFundTransactions.filter((tx) => tx.type === 'expense');
  }, [currentFundTransactions]);

  // 6. Action Handlers with accurate fund determination
  const addTransaction = (newTx) => {
    // Determine accurate fund: Google Pay / UPI or Bank payment MUST go to 'bank'
    let determinedFund = newTx.fundType;
    const method = newTx.paymentMethod || '';

    if (method === 'gpay' || method === 'phonepe' || method === 'paytm' || method === 'bank' || method === 'card') {
      determinedFund = 'bank';
    } else if (method === 'cash') {
      determinedFund = 'liquid';
    } else if (!determinedFund) {
      determinedFund = activeFund === 'all' ? 'liquid' : activeFund;
    }

    const tx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      amount: Math.abs(Number(newTx.amount)),
      type: newTx.type || 'expense',
      fundType: determinedFund,
      paymentMethod: method || (determinedFund === 'bank' ? 'gpay' : 'cash'),
      category: newTx.category || (newTx.type === 'income' ? 'other_income' : 'other_expense'),
      description: newTx.description || '',
      date: newTx.date || new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };

    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  const updateTransaction = (id, updatedFields) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;

        let fundType = updatedFields.fundType || tx.fundType;
        const method = updatedFields.paymentMethod !== undefined ? updatedFields.paymentMethod : tx.paymentMethod;

        if (method === 'gpay' || method === 'phonepe' || method === 'paytm' || method === 'bank' || method === 'card') {
          fundType = 'bank';
        } else if (method === 'cash') {
          fundType = 'liquid';
        }

        return {
          ...tx,
          ...updatedFields,
          fundType,
          paymentMethod: method || (fundType === 'bank' ? 'gpay' : 'cash'),
          amount: Math.abs(Number(updatedFields.amount !== undefined ? updatedFields.amount : tx.amount)),
        };
      })
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Fund Transfer: Cash to Bank or Bank to Cash
  const transferFunds = ({ fromFund, toFund, amount, note, date }) => {
    const numAmount = Math.abs(Number(amount));
    if (!numAmount) return;

    const transferDate = date || new Date().toISOString().split('T')[0];
    const timestamp = Date.now();

    const isCashToBank = fromFund === 'liquid' && toFund === 'bank';
    const expenseDesc = note || (isCashToBank ? 'കയ്യിലെ കാശ് ബാങ്കിലേക്ക് അടച്ചു (Deposit to Bank)' : 'ബാങ്കിൽ നിന്ന് എടിഎം വഴി പിൻവലിച്ചു (ATM Withdrawal)');
    const incomeDesc = note || (isCashToBank ? 'കയ്യിലെ കാശ് അടച്ചത് ബാങ്കിൽ ക്രെഡിറ്റായി (Cash Deposit)' : 'ബാങ്കിൽ നിന്നും കയ്യിലേക്ക് എടുത്തത് (ATM Cash in Hand)');

    const expenseEntry = {
      id: 'tx_tr_out_' + timestamp,
      type: 'expense',
      fundType: fromFund,
      paymentMethod: fromFund === 'liquid' ? 'cash' : 'bank',
      amount: numAmount,
      category: 'transfer',
      description: expenseDesc,
      date: transferDate,
      createdAt: timestamp,
    };

    const incomeEntry = {
      id: 'tx_tr_in_' + (timestamp + 1),
      type: 'income',
      fundType: toFund,
      paymentMethod: toFund === 'bank' ? 'bank' : 'cash',
      amount: numAmount,
      category: 'transfer',
      description: incomeDesc,
      date: transferDate,
      createdAt: timestamp + 1,
    };

    setTransactions((prev) => [incomeEntry, expenseEntry, ...prev]);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Fund Type', 'Payment Method', 'Type', 'Amount (INR)', 'Category', 'Description'];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.date,
      tx.fundType === 'liquid' ? 'Liquid Cash' : 'Bank Account',
      tx.paymentMethod || (tx.fundType === 'bank' ? 'GPay/Bank' : 'Cash'),
      tx.type.toUpperCase(),
      tx.amount,
      tx.category,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_records_${userPhone}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Backup
  const exportBackupJSON = () => {
    const backupData = {
      version: 2,
      userPhone,
      exportedAt: new Date().toISOString(),
      transactions,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `expense_backup_${userPhone}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const importBackupJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      let list = parsed;
      if (parsed && Array.isArray(parsed.transactions)) {
        list = parsed.transactions;
      }
      if (Array.isArray(list)) {
        setTransactions(list);
        return { success: true, count: list.length };
      }
      return { success: false, error: 'Invalid file format. Expected a list of transactions.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Clear all data
  const clearAllData = () => {
    setTransactions([]);
  };

  // Load sample demo data
  const loadDemoData = () => {
    setTransactions(INITIAL_DEMO_TRANSACTIONS);
  };

  return (
    <ExpenseContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        t,
        activeFund,
        setActiveFund,
        filterPeriod,
        setFilterPeriod,
        searchTerm,
        setSearchTerm,
        transactions,
        currentFundTransactions,
        incomeTransactions,
        expenseTransactions,
        calculations,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        exportToCSV,
        exportBackupJSON,
        importBackupJSON,
        clearAllData,
        loadDemoData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
