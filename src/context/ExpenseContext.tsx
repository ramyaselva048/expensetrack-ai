import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Expense, LocationData, CurrencyCode, ExpenseCategory, ExpenseFilter, ActiveTab } from '../types';
import { CURRENCY_CONFIGS } from '../data/initialData';
import { useAuth } from './AuthContext';
import { expensesAPI, locationsAPI } from '../services/api';

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
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilter>>;
  resetFilters: () => void;
  setCurrency: (curr: CurrencyCode) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Expense | null>;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  bulkDeleteExpenses: (ids: string[]) => Promise<void>;
  addLocation: (location: Omit<LocationData, 'id'>) => Promise<LocationData | null>;
  updateLocation: (id: string, location: Partial<LocationData>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  formatCurrency: (amount: number, overrideCurrency?: CurrencyCode) => string;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => Promise<void>;
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
  const { currentUser, updateProfile, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filters, setFilters] = useState<ExpenseFilter>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  
  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const currency = currentUser?.currency || 'INR';

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load user data directly from MySQL API
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([]);
      setLocations([]);
      return;
    }

    try {
      setIsLoadingData(true);
      const [locationsRes, expensesRes] = await Promise.all([
        locationsAPI.getAll(),
        expensesAPI.getAll({ limit: 200 })
      ]);

      setLocations(locationsRes || []);
      setExpenses(expensesRes.data || []);
    } catch (err: any) {
      console.error('Failed to fetch data from backend API:', err);
      showToast('Data Synchronization Error', err.message, 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setExpenses([]);
      setLocations([]);
    }
  }, [isAuthenticated, refreshData]);

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

  // Add Expense - Connected to POST /api/expenses
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Expense | null> => {
    try {
      const created = await expensesAPI.create(expenseData);
      setExpenses(prev => [created, ...prev]);
      showToast('Expense Recorded', `Added "${created.name}" for ${formatCurrency(created.amount)}`, 'success');
      return created;
    } catch (err: any) {
      showToast('Error Adding Expense', err.message || 'Server error', 'error');
      return null;
    }
  };

  // Update Expense - Connected to PUT /api/expenses/:id
  const updateExpense = async (id: string, updatedFields: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      const updated = await expensesAPI.update(id, updatedFields);
      setExpenses(prev => prev.map(item => (item.id === id ? updated : item)));
      showToast('Expense Updated', 'Transaction details updated in database.', 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  // Delete Expense - Connected to DELETE /api/expenses/:id
  const deleteExpense = async (id: string) => {
    try {
      await expensesAPI.delete(id);
      setExpenses(prev => prev.filter(item => item.id !== id));
      showToast('Expense Removed', 'Expense was permanently deleted.', 'info');
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  // Bulk Delete - Connected to POST /api/expenses/bulk-delete
  const bulkDeleteExpenses = async (ids: string[]) => {
    try {
      await expensesAPI.bulkDelete(ids);
      setExpenses(prev => prev.filter(item => !ids.includes(item.id)));
      showToast('Batch Delete Completed', `Removed ${ids.length} transactions.`, 'info');
    } catch (err: any) {
      showToast('Bulk Delete Failed', err.message, 'error');
    }
  };

  // Add Location - Connected to POST /api/locations
  const addLocation = async (locData: Omit<LocationData, 'id'>): Promise<LocationData | null> => {
    try {
      const created = await locationsAPI.create(locData);
      setLocations(prev => [...prev, created]);
      showToast('Location Added', `Branch office "${created.name}" has been registered in database.`, 'success');
      return created;
    } catch (err: any) {
      showToast('Error Adding Location', err.message, 'error');
      return null;
    }
  };

  // Update Location - Connected to PUT /api/locations/:id
  const updateLocation = async (id: string, updatedFields: Partial<LocationData>) => {
    try {
      const updated = await locationsAPI.update(id, updatedFields);
      setLocations(prev => prev.map(l => (l.id === id ? updated : l)));
      showToast('Location Updated', 'Branch settings updated.', 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message, 'error');
    }
  };

  // Delete Location - Connected to DELETE /api/locations/:id
  const deleteLocation = async (id: string) => {
    try {
      await locationsAPI.delete(id);
      setLocations(prev => prev.filter(l => l.id !== id));
      showToast('Location Removed', 'Branch office removed from database.', 'info');
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  // Reset data
  const resetToSampleData = async () => {
    await refreshData();
    showToast('Data Refreshed', 'Latest data loaded from database.', 'info');
  };

  // Export to CSV
  const exportToCSV = (customList?: Expense[]) => {
    const listToExport = customList || filteredExpenses;
    if (listToExport.length === 0) {
      showToast('Export Failed', 'No transactions found to export.', 'error');
      return;
    }

    const headers = ['Date', 'Expense Name', 'Category', 'Location', 'Amount', 'Payment Method', 'Status', 'Tax Deductible', 'Description'];
    const rows = listToExport.map(e => [
      `"${e.date}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.location}"`,
      e.amount,
      `"${e.paymentMethod}"`,
      `"${e.status || 'approved'}"`,
      (e.isTaxDeductible ?? (e as any).taxDeductible) ? 'Yes' : 'No',
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
    
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday)).toISOString().split('T')[0];
    
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
        const matchesLoc = exp.location.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesLoc) {
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
        isLoadingData,
        refreshData,
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
