import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_ACTIVE_USER = 'expense_finder_active_user_v1';
const STORAGE_OFFLINE_USERS = 'expense_finder_offline_users_v1';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline' | 'error'

  // Persist active user session locally
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_ACTIVE_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_USER);
    }
  }, [currentUser]);

  // Offline helper
  const getOfflineUsers = () => {
    try {
      const data = localStorage.getItem(STORAGE_OFFLINE_USERS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveOfflineUser = (user, password) => {
    const offline = getOfflineUsers();
    offline[user.phone] = {
      phone: user.phone,
      name: user.name,
      password, // for offline validation if network fails
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_OFFLINE_USERS, JSON.stringify(offline));
  };

  // Register
  const register = async ({ phone, password, name }) => {
    setIsLoading(true);
    setAuthError('');
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setIsLoading(false);
      setAuthError('സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക (Enter a valid 10-digit phone number)');
      return { success: false };
    }
    if (!password || password.length < 4) {
      setIsLoading(false);
      setAuthError('പാസ്‌വേർഡിന് കുറഞ്ഞത് 4 അക്ഷരങ്ങൾ വേണം (Password must be at least 4 characters)');
      return { success: false };
    }

    try {
      // 1. Try server registration
      let serverUser = null;
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password, name }),
        });
        const data = await response.json();
        if (data.success && data.user) {
          serverUser = data.user;
        } else if (!data.success) {
          throw new Error(data.error || 'Registration failed');
        }
      } catch (err) {
        // If server is unavailable, check if error was user already exists
        if (err.message && err.message.includes('ഇതിനകം രജിസ്റ്റർ')) {
          throw err;
        }
        // Fallback to offline registration if server is down
        console.warn('Server registration unavailable, saving locally', err.message);
        serverUser = {
          phone: cleanPhone,
          name: (name || 'ഉപയോക്താവ് (User)').trim(),
          createdAt: Date.now(),
          transactions: [],
        };
      }

      saveOfflineUser(serverUser, password);
      setCurrentUser(serverUser);
      setIsGuest(false);
      setIsLoading(false);
      return { success: true, user: serverUser };
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു (Registration failed)');
      return { success: false, error: err.message };
    }
  };

  // Login
  const login = async (phone, password) => {
    setIsLoading(true);
    setAuthError('');
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setIsLoading(false);
      setAuthError('സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക (Enter a valid 10-digit phone number)');
      return { success: false };
    }

    try {
      let loggedInUser = null;

      // 1. Attempt Server Login
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password }),
        });
        const data = await response.json();
        if (data.success && data.user) {
          loggedInUser = data.user;
        } else if (!data.success) {
          throw new Error(data.error || 'ലോഗിൻ പരാജയപ്പെട്ടു');
        }
      } catch (err) {
        if (err.message.includes('പാസ്‌വേർഡ് തെറ്റാണ്') || err.message.includes('അക്കൗണ്ട് കണ്ടെത്തിയില്ല')) {
          throw err;
        }
        // If server unreachable, check offline registry
        const offline = getOfflineUsers();
        const local = offline[cleanPhone];
        if (local && local.password === password) {
          loggedInUser = {
            phone: local.phone,
            name: local.name,
            createdAt: local.updatedAt,
            transactions: null, // will load from localStorage
          };
        } else if (local && local.password !== password) {
          throw new Error('പാസ്‌വേർഡ് തെറ്റാണ് (Incorrect password)');
        } else {
          throw new Error(err.message || 'ലോഗിൻ ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക');
        }
      }

      saveOfflineUser(loggedInUser, password);
      setCurrentUser(loggedInUser);
      setIsGuest(false);
      setIsLoading(false);
      return { success: true, user: loggedInUser };
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || 'ലോഗിൻ ചെയ്യാൻ കഴിഞ്ഞില്ല (Login failed)');
      return { success: false, error: err.message };
    }
  };

  // Guest Mode
  const continueAsGuest = () => {
    setIsGuest(true);
    setCurrentUser({
      phone: 'guest',
      name: 'അതിഥി (Guest User)',
      createdAt: Date.now(),
    });
    setAuthError('');
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    setAuthError('');
    localStorage.removeItem(STORAGE_ACTIVE_USER);
  };

  // Cloud Sync Transactions to Server
  const syncTransactions = useCallback(async (transactions) => {
    if (!currentUser || currentUser.phone === 'guest') return;
    setSyncStatus('syncing');

    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentUser.phone,
          transactions,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, [currentUser]);

  // Fetch Latest Transactions from Server
  const fetchServerTransactions = useCallback(async () => {
    if (!currentUser || currentUser.phone === 'guest') return null;

    try {
      const response = await fetch(`/api/user/transactions?phone=${currentUser.phone}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.transactions)) {
        return data.transactions;
      }
    } catch {
      // offline
    }
    return null;
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isGuest,
        isLoading,
        authError,
        syncStatus,
        login,
        register,
        logout,
        continueAsGuest,
        syncTransactions,
        fetchServerTransactions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
