import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Expense, LocationData, CurrencyCode, ExpenseCategory, ExpenseFilter, ActiveTab } from '../types';
import { INITIAL_EXPENSES, INITIAL_LOCATIONS, CURRENCY_CONFIGS } from '../data/initialData';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ExpenseStats {
  totalExpenses: number;
  thisMonthExpenses: number;
  todayExpenses: number;
  totalTransactions: number;
  averageTransaction: number;
  budgetUtilizationPct: number;
  topCategory: { name: string; amount: number; percentage: number } | null;
  topLocation: { name: string; amount: number; percentage: number } | null;
}

interface ExpenseContextType {
  expenses: Expense[];
  filteredExpenses: Expense[];
  locations: LocationData[];
  filters: ExpenseFilter;
  activeTab: ActiveTab;
  currency: CurrencyCode;
  stats: ExpenseStats;
  toasts: ToastMessage[];
  setActiveTab: (tab: ActiveTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilter>>;
  resetFilters: () => void;
  setCurrency: (curr: CurrencyCode) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Expense;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  bulkDeleteExpenses: (ids: string[]) => void;
  addLocation: (location: Omit<LocationData, 'id'>) => LocationData;
  updateLocation: (id: string, location: Partial<LocationData>) => void;
  deleteLocation: (id: string) => void;
  formatCurrency: (amount: number, overrideCurrency?: CurrencyCode) => string;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => void;
  exportToCSV: (customList?: Expense[]) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;
  viewingExpense: Expense | null;
  setViewingExpense: (expense: Expense | null) => void;
}

const DEFAULT_FILTERS: ExpenseFilter = {
  search: '',
  category: 'all',
  location: 'all',
  paymentMethod: 'all',
  dateRange: 'all',
  sortBy: 'date_desc',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, updateProfile } = useAuth();
  
  const userStoragePrefix = useMemo(() => {
    return currentUser ? `expensetrack_data_${currentUser.id}` : 'expensetrack_data_guest';
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [locations, setLocations] = useState<LocationData[]>(INITIAL_LOCATIONS);
  const [filters, setFilters] = useState<ExpenseFilter>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const currency = currentUser?.currency || 'INR';

  // Load user-specific expenses & locations from storage
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      return;
    }

    try {
      const expKey = `${userStoragePrefix}_expenses`;
      const locKey = `${userStoragePrefix}_locations`;

      const storedExp = localStorage.getItem(expKey);
      const storedLoc = localStorage.getItem(locKey);

      if (storedExp) {
        setExpenses(JSON.parse(storedExp));
      } else {
        // Initialize with default dataset for demo user or sample starter
        const seeded: Expense[] = INITIAL_EXPENSES.map(e => ({
          ...e,
          userId: currentUser.id,
        }));
        setExpenses(seeded);
        localStorage.setItem(expKey, JSON.stringify(seeded));
      }

      if (storedLoc) {
        setLocations(JSON.parse(storedLoc));
      } else {
        setLocations(INITIAL_LOCATIONS);
        localStorage.setItem(locKey, JSON.stringify(INITIAL_LOCATIONS));
      }
    } catch (e) {
      console.error('Failed to parse stored expenses:', e);
      setExpenses(INITIAL_EXPENSES);
      setLocations(INITIAL_LOCATIONS);
    }
  }, [currentUser, userStoragePrefix]);

  // Helper to persist expenses
  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    if (currentUser) {
      localStorage.setItem(`${userStoragePrefix}_expenses`, JSON.stringify(newExpenses));
    }
  };

  // Helper to persist locations
  const saveLocations = (newLocations: LocationData[]) => {
    setLocations(newLocations);
    if (currentUser) {
      localStorage.setItem(`${userStoragePrefix}_locations`, JSON.stringify(newLocations));
    }
  };

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const setCurrency = (curr: CurrencyCode) => {
    if (currentUser) {
      updateProfile({ currency: curr });
      showToast('Currency Updated', `Default display currency set to ${curr}`, 'info');
    }
  };

  // Currency Formatter
  const formatCurrency = (amount: number, overrideCurrency?: CurrencyCode): string => {
    const activeCurr = overrideCurrency || currency;
    const config = CURRENCY_CONFIGS[activeCurr] || CURRENCY_CONFIGS.INR;

    // Use Intl NumberFormat for high precision localized rendering
    try {
      return new Intl.NumberFormat(activeCurr === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: activeCurr,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${config.symbol} ${amount.toLocaleString()}`;
    }
  };

  // Add Expense
  const addExpense = (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      userId: currentUser?.id || 'usr-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receiptNumber: expenseData.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: expenseData.status || 'Approved',
    };

    const updated = [newExpense, ...expenses];
    saveExpenses(updated);
    showToast('Expense Recorded', `Added "${newExpense.name}" for ${formatCurrency(newExpense.amount)}`, 'success');
    return newExpense;
  };

  // Update Expense
  const updateExpense = (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
    const updated = expenses.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveExpenses(updated);
    showToast('Expense Updated', 'Transaction details were updated successfully.', 'success');
  };

  // Delete Expense
  const deleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    const updated = expenses.filter(item => item.id !== id);
    saveExpenses(updated);
    showToast('Expense Removed', target ? `Deleted "${target.name}"` : 'Expense was removed.', 'info');
  };

  // Bulk Delete
  const bulkDeleteExpenses = (ids: string[]) => {
    const count = ids.length;
    const updated = expenses.filter(item => !ids.includes(item.id));
    saveExpenses(updated);
    showToast('Batch Delete Completed', `Removed ${count} transactions.`, 'info');
  };

  // Add Location
  const addLocation = (locData: Omit<LocationData, 'id'>): LocationData => {
    const newLoc: LocationData = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    const updated = [...locations, newLoc];
    saveLocations(updated);
    showToast('Location Added', `Branch office "${newLoc.name}" has been registered.`, 'success');
    return newLoc;
  };

  // Update Location
  const updateLocation = (id: string, updatedFields: Partial<LocationData>) => {
    const updated = locations.map(l => (l.id === id ? { ...l, ...updatedFields } : l));
    saveLocations(updated);
    showToast('Location Updated', 'Branch settings updated.', 'success');
  };

  // Delete Location
  const deleteLocation = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc?.isDefault) {
      showToast('Action Disallowed', 'Default corporate hub locations cannot be deleted.', 'error');
      return;
    }
    const updated = locations.filter(l => l.id !== id);
    saveLocations(updated);
    showToast('Location Removed', `Branch removed.`, 'info');
  };

  // Reset to Sample Data
  const resetToSampleData = () => {
    if (!currentUser) return;
    const seeded: Expense[] = INITIAL_EXPENSES.map(e => ({
      ...e,
      userId: currentUser.id,
    }));
    saveExpenses(seeded);
    saveLocations(INITIAL_LOCATIONS);
    showToast('Reset Complete', 'Sample enterprise transactions have been restored.', 'info');
  };

  // Export to CSV
  const exportToCSV = (customList?: Expense[]) => {
    const listToExport = customList || filteredExpenses;
    if (listToExport.length === 0) {
      showToast('Export Failed', 'No transactions found to export.', 'error');
      return;
    }

    const headers = ['Receipt #', 'Date', 'Expense Name', 'Category', 'Location', 'Amount', 'Payment Method', 'Status', 'Tax Deductible', 'Description'];
    const rows = listToExport.map(e => [
      `"${e.receiptNumber || ''}"`,
      `"${e.date}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.location}"`,
      e.amount,
      `"${e.paymentMethod}"`,
      `"${e.status || 'Approved'}"`,
      e.isTaxDeductible ? 'Yes' : 'No',
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ExpenseTrack_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Downloaded', `Generated CSV report with ${listToExport.length} transactions.`, 'success');
  };

  // Filtered expenses calculation
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Start of this week (Monday)
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday)).toISOString().split('T')[0];
    
    // Reset now
    const nowRef = new Date();
    const currentMonthStr = `${nowRef.getFullYear()}-${String(nowRef.getMonth() + 1).padStart(2, '0')}`;
    const currentQuarter = Math.floor(nowRef.getMonth() / 3);
    const currentYearStr = `${nowRef.getFullYear()}`;

    return expenses.filter(exp => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = exp.name.toLowerCase().includes(query);
        const matchesDesc = (exp.description || '').toLowerCase().includes(query);
        const matchesReceipt = (exp.receiptNumber || '').toLowerCase().includes(query);
        const matchesLoc = exp.location.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesReceipt && !matchesLoc) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'all' && exp.category !== filters.category) {
        return false;
      }

      // Location
      if (filters.location !== 'all' && exp.location.toLowerCase() !== filters.location.toLowerCase()) {
        return false;
      }

      // Payment Method
      if (filters.paymentMethod !== 'all' && exp.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Date Range
      if (filters.dateRange === 'today' && exp.date !== todayStr) {
        return false;
      }
      if (filters.dateRange === 'this_week' && exp.date < startOfWeek) {
        return false;
      }
      if (filters.dateRange === 'this_month' && !exp.date.startsWith(currentMonthStr)) {
        return false;
      }
      if (filters.dateRange === 'this_quarter') {
        const expMonth = parseInt(exp.date.split('-')[1], 10) - 1;
        const expQuarter = Math.floor(expMonth / 3);
        if (expQuarter !== currentQuarter || !exp.date.startsWith(currentYearStr)) {
          return false;
        }
      }
      if (filters.dateRange === 'this_year' && !exp.date.startsWith(currentYearStr)) {
        return false;
      }
      if (filters.dateRange === 'custom') {
        if (filters.startDate && exp.date < filters.startDate) return false;
        if (filters.endDate && exp.date > filters.endDate) return false;
      }

      // Amount filter
      if (filters.minAmount !== undefined && exp.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && exp.amount > filters.maxAmount) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [expenses, filters]);

  // Overall Statistics Calculation
  const stats: ExpenseStats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalTransactions = expenses.length;
    const averageTransaction = totalTransactions > 0 ? Math.round(totalExpenses / totalTransactions) : 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthExpenses = expenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, item) => sum + item.amount, 0);

    const todayExpenses = expenses
      .filter(e => e.date === todayStr)
      .reduce((sum, item) => sum + item.amount, 0);

    const monthlyBudget = currentUser?.monthlyBudget || 250000;
    const budgetUtilizationPct = Math.min(Math.round((thisMonthExpenses / monthlyBudget) * 100), 200);

    // Top Category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    let topCat: { name: string; amount: number; percentage: number } | null = null;
    let maxCatAmt = 0;
    Object.entries(categoryTotals).forEach(([name, amt]) => {
      if (amt > maxCatAmt) {
        maxCatAmt = amt;
        topCat = {
          name,
          amount: amt,
          percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
        };
      }
    });

    // Top Location
    const locTotals: Record<string, number> = {};
    expenses.forEach(e => {
      locTotals[e.location] = (locTotals[e.location] || 0) + e.amount;
    });
    let topLoc: { name: string; amount: number; percentage: number } | null = null;
    let maxLocAmt = 0;
    Object.entries(locTotals).forEach(([name, amt]) => {
      if (amt > maxLocAmt) {
        maxLocAmt = amt;
        topLoc = {
          name,
          amount: amt,
          percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
        };
      }
    });

    return {
      totalExpenses,
      thisMonthExpenses,
      todayExpenses,
      totalTransactions,
      averageTransaction,
      budgetUtilizationPct,
      topCategory: topCat,
      topLocation: topLoc,
    };
  }, [expenses, currentUser]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        locations,
        filters,
        activeTab,
        currency,
        stats,
        toasts,
        setActiveTab,
        setFilters,
        resetFilters,
        setCurrency,
        addExpense,
        updateExpense,
        deleteExpense,
        bulkDeleteExpenses,
        addLocation,
        updateLocation,
        deleteLocation,
        formatCurrency,
        showToast,
        removeToast,
        resetToSampleData,
        exportToCSV,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        editingExpense,
        setEditingExpense,
        viewingExpense,
        setViewingExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
