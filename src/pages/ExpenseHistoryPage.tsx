import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ArrowUpDown, 
  RotateCcw, 
  CheckSquare, 
  Square,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORY_COLORS } from '../data/initialData';
import { ExpenseCategory, PaymentMethod, Expense } from '../types';

const CATEGORIES: ExpenseCategory[] = [
  'Office & Equipment',
  'Travel & Commute',
  'Food & Dining',
  'Software & SaaS',
  'Utilities & Bills',
  'Marketing & Ads',
  'Team & Events',
  'Logistics & Fuel',
  'Health & Wellness',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Corporate Card',
  'UPI / GPay',
  'Bank Transfer',
  'Net Banking',
  'Company Debit Card',
  'Cash',
];

interface ExpenseHistoryPageProps {
  onDeleteExpenseRequest: (id: string) => void;
  onBulkDeleteRequest: (ids: string[]) => void;
}

export const ExpenseHistoryPage: React.FC<ExpenseHistoryPageProps> = ({
  onDeleteExpenseRequest,
  onBulkDeleteRequest,
}) => {
  const { 
    filteredExpenses, 
    expenses, 
    locations, 
    filters, 
    setFilters, 
    resetFilters, 
    formatCurrency, 
    setIsExpenseModalOpen, 
    setEditingExpense, 
    setViewingExpense,
    exportToCSV,
    currency
  } = useExpenses();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedExpenses.map(e => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      onBulkDeleteRequest(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div id="expense-history-view" className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Ledger & Reconciliations
            </span>
            <span className="text-xs text-slate-400">
              Showing {filteredExpenses.length} of {expenses.length} entries
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Expense Transaction History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter by location, category, date, and export audit-ready expense reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-history-export"
            onClick={() => exportToCSV(filteredExpenses)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-history-add-expense"
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search by title, receipt #, description..."
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
            />
          </div>

          {/* Location Filter */}
          <div className="lg:col-span-2">
            <select
              id="history-filter-location"
              value={filters.location}
              onChange={e => {
                setFilters(prev => ({ ...prev, location: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Locations (Chennai, BLR...)</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              id="history-filter-category"
              value={filters.category}
              onChange={e => {
                setFilters(prev => ({ ...prev, category: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="lg:col-span-2">
            <select
              id="history-filter-daterange"
              value={filters.dateRange}
              onChange={e => {
                setFilters(prev => ({ ...prev, dateRange: e.target.value as any }));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter (Q3)</option>
              <option value="this_year">This Year (2026)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              id="history-filter-sort"
              value={filters.sortBy}
              onChange={e => {
                setFilters(prev => ({ ...prev, sortBy: e.target.value as any }));
              }}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer font-medium"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Bar / Summary / Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400">
              Filtered Total: <strong className="font-mono text-emerald-400 font-bold">{formatCurrency(totalFilteredAmount)}</strong>
            </span>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl text-rose-300">
                <span>{selectedIds.length} items selected</span>
                <button
                  id="btn-bulk-delete"
                  onClick={handleBulkDelete}
                  className="font-bold underline hover:text-rose-200 cursor-pointer"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          <button
            id="btn-reset-filters"
            onClick={resetFilters}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl overflow-hidden">
        {paginatedExpenses.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Matching Transactions</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing applied location/category filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {selectedIds.length === paginatedExpenses.length && paginatedExpenses.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 font-semibold">Expense / Merchant</th>
                  <th className="py-3.5 font-semibold">Category</th>
                  <th className="py-3.5 font-semibold">Location</th>
                  <th className="py-3.5 font-semibold">Date</th>
                  <th className="py-3.5 font-semibold">Payment Mode</th>
                  <th className="py-3.5 font-semibold">Tax Status</th>
                  <th className="py-3.5 text-right font-semibold">Amount</th>
                  <th className="py-3.5 pr-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedExpenses.map(exp => {
                  const isSelected = selectedIds.includes(exp.id);
                  const catStyle = CATEGORY_COLORS[exp.category] || {
                    bg: 'bg-slate-500/10',
                    text: 'text-slate-400',
                    border: 'border-slate-500/20',
                  };

                  return (
                    <tr
                      key={exp.id}
                      onClick={() => setViewingExpense(exp)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-800/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSelect(exp.id)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Name & Receipt */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                            {exp.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{exp.name}</p>
                            <p className="text-[11px] font-mono text-slate-400">{exp.receiptNumber || exp.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {exp.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          {exp.location}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 font-mono text-slate-300 text-[11px]">
                        {exp.date}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 text-slate-300 text-[11px]">
                        {exp.paymentMethod}
                      </td>

                      {/* Tax Deductible */}
                      <td className="py-3.5">
                        {exp.isTaxDeductible ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Deductible</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 text-right font-mono font-bold text-white">
                        {formatCurrency(exp.amount)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            id={`btn-view-row-${exp.id}`}
                            onClick={() => setViewingExpense(exp)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-edit-row-${exp.id}`}
                            onClick={() => {
                              setEditingExpense(exp);
                              setIsExpenseModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-row-${exp.id}`}
                            onClick={() => onDeleteExpenseRequest(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
