import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Calendar, 
  CreditCard, 
  Trash2, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  DollarSign,
  Receipt,
  Layers,
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORY_COLORS } from '../data/initialData';
import { Expense } from '../types';

interface LocationsPageProps {
  onOpenNewLocationModal: () => void;
  onDeleteExpenseRequest: (id: string) => void;
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#6366F1'];

export const LocationsPage: React.FC<LocationsPageProps> = ({
  onOpenNewLocationModal,
  onDeleteExpenseRequest,
}) => {
  const { 
    locations, 
    expenses, 
    formatCurrency, 
    currency, 
    deleteLocation, 
    setFilters, 
    setActiveTab,
    setViewingExpense,
    setEditingExpense,
    setIsExpenseModalOpen
  } = useExpenses();

  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]?.name || 'Chennai');

  // Compute stats per location
  const locationStats = useMemo(() => {
    const totalCompanyExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    return locations.map(loc => {
      const cityExpenses = expenses.filter(e => e.location.toLowerCase() === loc.name.toLowerCase());
      const totalAmount = cityExpenses.reduce((sum, item) => sum + item.amount, 0);
      const count = cityExpenses.length;
      const averageAmount = count > 0 ? Math.round(totalAmount / count) : 0;
      const percentage = totalCompanyExpense > 0 ? Math.round((totalAmount / totalCompanyExpense) * 100) : 0;
      
      const budgetLimit = loc.budgetLimit || 100000;
      const budgetUsedPct = Math.min(Math.round((totalAmount / budgetLimit) * 100), 200);

      // Category breakdown for this city
      const catCounts: Record<string, number> = {};
      cityExpenses.forEach(e => {
        catCounts[e.category] = (catCounts[e.category] || 0) + e.amount;
      });

      const categoryData = Object.entries(catCounts)
        .map(([name, value]) => ({
          name,
          value,
          pct: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value);

      let topCategory = categoryData[0]?.name || 'None';
      let topCatAmt = categoryData[0]?.value || 0;

      // Monthly breakdown for this city
      const monthMap: Record<string, number> = {
        'Mar': 0,
        'Apr': 0,
        'May': 0,
        'Jun': 0,
        'Jul': 0,
        'Aug': 0,
      };

      cityExpenses.forEach(e => {
        const monthNum = e.date ? parseInt(e.date.split('-')[1], 10) : 8;
        const monthNames: Record<number, string> = {
          3: 'Mar',
          4: 'Apr',
          5: 'May',
          6: 'Jun',
          7: 'Jul',
          8: 'Aug',
        };
        const mName = monthNames[monthNum] || 'Aug';
        if (monthMap[mName] !== undefined) {
          monthMap[mName] += e.amount;
        }
      });

      const monthlyData = Object.entries(monthMap).map(([month, amount]) => ({
        month,
        amount,
      }));

      return {
        ...loc,
        totalAmount,
        count,
        averageAmount,
        percentage,
        budgetLimit,
        budgetUsedPct,
        topCategory,
        topCatAmt,
        categoryData,
        monthlyData,
        expenses: cityExpenses,
      };
    });
  }, [locations, expenses]);

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    return locationStats.map(loc => ({
      name: loc.name,
      amount: loc.totalAmount,
      budget: loc.budgetLimit,
      count: loc.count,
      color: loc.color,
    }));
  }, [locationStats]);

  // Active selected location details
  const activeLocationData = useMemo(() => {
    return locationStats.find(l => l.name.toLowerCase() === selectedLocation.toLowerCase()) || locationStats[0] || null;
  }, [locationStats, selectedLocation]);

  return (
    <div id="locations-hub-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Multi-Location Expense Management
            </span>
            <span className="text-xs text-slate-400">
              {locations.length} Active Hubs
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Regional Hubs & Branch Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage spending across Chennai, Coimbatore, Bangalore, Madurai, and custom enterprise locations.
          </p>
        </div>

        <button
          id="btn-add-new-location"
          onClick={onOpenNewLocationModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Location</span>
        </button>
      </div>

      {/* Location Selector Tabs */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Location for Deep-Dive:
          </span>
          <span className="text-xs text-slate-400">
            Click any city tab to inspect its category spending, monthly trend, and transactions
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {locationStats.map(loc => {
            const isSelected = selectedLocation.toLowerCase() === loc.name.toLowerCase();
            return (
              <button
                key={loc.id}
                id={`btn-select-location-${loc.id}`}
                onClick={() => setSelectedLocation(loc.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: loc.color }} 
                />
                <span>{loc.name}</span>
                <span className="text-[10px] font-mono opacity-80 bg-black/20 px-1.5 py-0.5 rounded">
                  {formatCurrency(loc.totalAmount)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Location Detailed View */}
      {activeLocationData && (
        <div className="space-y-6">
          {/* 1. Location Key Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Expense */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Expense ({activeLocationData.name})
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-white mt-2">
                {formatCurrency(activeLocationData.totalAmount)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{activeLocationData.percentage}% of company spend</span>
                <span className="text-blue-400 font-semibold">{activeLocationData.code} Branch</span>
              </p>
            </div>

            {/* Transactions Count */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Transactions
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-2">
                {activeLocationData.count} <span className="text-sm font-sans font-normal text-slate-400">records</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Average voucher: <strong className="font-mono text-slate-200">{formatCurrency(activeLocationData.averageAmount)}</strong>
              </p>
            </div>

            {/* Budget Utilization */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Budget Utilization
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeLocationData.budgetUsedPct > 90 ? 'bg-rose-500/10 text-rose-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-black font-mono mt-2 ${
                activeLocationData.budgetUsedPct > 90 ? 'text-rose-400' : 'text-purple-400'
              }`}>
                {activeLocationData.budgetUsedPct}%
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeLocationData.budgetUsedPct > 90 ? 'bg-rose-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(activeLocationData.budgetUsedPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Top Category */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Dominant Category
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-bold text-white mt-2 truncate">
                {activeLocationData.topCategory}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {formatCurrency(activeLocationData.topCatAmt)} allocated
              </p>
            </div>
          </div>

          {/* 2. Charts Row: Category-wise Spending & Monthly Spending for Selected Location */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Spending Trend for Location */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    Monthly Spending Trend — {activeLocationData.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly expense trajectory specifically for the {activeLocationData.name} hub
                </p>
              </div>

              <div className="h-60 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeLocationData.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLocMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeLocationData.color || '#3B82F6'} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={activeLocationData.color || '#3B82F6'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={val => `${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-xs font-sans">
                              <p className="text-slate-400 font-medium">{label} 2026</p>
                              <p className="text-sm font-bold font-mono text-blue-400 mt-1">
                                {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={activeLocationData.color || '#3B82F6'} 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorLocMonthly)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category-wise Spending for Location */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Category-Wise Spending — {activeLocationData.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cost allocation across operational categories
                </p>
              </div>

              <div className="h-44 flex items-center justify-center my-2">
                {activeLocationData.categoryData.length === 0 ? (
                  <p className="text-xs text-slate-400">No expenses recorded for this hub yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeLocationData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {activeLocationData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0];
                            return (
                              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-xs font-sans">
                                <p className="font-semibold text-white">{d.name}</p>
                                <p className="font-mono text-emerald-400 font-bold mt-0.5">
                                  {formatCurrency(d.value as number)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeLocationData.categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                      />
                      <span className="text-slate-300 truncate">{cat.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-white">{formatCurrency(cat.value)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({cat.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Recent Expenses for Selected Location Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Recent Expenses — {activeLocationData.name} Hub
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing all {activeLocationData.expenses.length} expense vouchers recorded for {activeLocationData.name}
                </p>
              </div>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, location: activeLocationData.name }));
                  setActiveTab('history');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeLocationData.expenses.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No transactions recorded for {activeLocationData.name} yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 pl-3 font-semibold">Expense Name</th>
                      <th className="py-3 font-semibold">Category</th>
                      <th className="py-3 font-semibold">Date</th>
                      <th className="py-3 font-semibold">Payment Mode</th>
                      <th className="py-3 text-right font-semibold">Amount</th>
                      <th className="py-3 pr-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeLocationData.expenses.map(exp => {
                      const catStyle = CATEGORY_COLORS[exp.category] || {
                        bg: 'bg-slate-500/10',
                        text: 'text-slate-400',
                        border: 'border-slate-500/20',
                      };

                      return (
                        <tr 
                          key={exp.id} 
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => setViewingExpense(exp)}
                        >
                          <td className="py-3 pl-3 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span>{exp.name}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${catStyle.bg} ${catStyle.text}`}>
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-slate-300 text-[11px]">{exp.date}</td>
                          <td className="py-3 text-slate-300 text-[11px]">{exp.paymentMethod}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">
                            {formatCurrency(exp.amount)}
                          </td>
                          <td className="py-3 pr-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewingExpense(exp)}
                                className="p-1 text-slate-400 hover:text-white rounded"
                                title="View Voucher"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingExpense(exp);
                                  setIsExpenseModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded"
                                title="Edit Expense"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteExpenseRequest(exp.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                                title="Delete Expense"
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
          </div>
        </div>
      )}

      {/* 4. Location Comparison Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Location Comparison</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare total expenditure, transaction frequency, and budget limits across all operational branches.
          </p>
        </div>

        {/* Side-by-Side Bar Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={val => `${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0];
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-xs font-sans">
                        <p className="font-bold text-white">{label} Branch</p>
                        <p className="text-sm font-bold font-mono text-indigo-400 mt-1">
                          Expenditure: {formatCurrency(d.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {comparisonChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Comparison Metrics Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Region / State</th>
                <th className="pb-3 font-semibold">Transactions</th>
                <th className="pb-3 font-semibold">Budget Limit</th>
                <th className="pb-3 font-semibold">Budget Used</th>
                <th className="pb-3 font-semibold">Top Category</th>
                <th className="pb-3 pr-2 text-right font-semibold">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {locationStats.map(loc => (
                <tr 
                  key={loc.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedLocation(loc.name)}
                >
                  <td className="py-3.5 pl-2 font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: loc.color }} />
                    <span>{loc.name}</span>
                  </td>
                  <td className="py-3.5 text-slate-400">{loc.state}</td>
                  <td className="py-3.5 font-mono text-slate-300">{loc.count} records</td>
                  <td className="py-3.5 font-mono text-slate-400">{formatCurrency(loc.budgetLimit)}</td>
                  <td className="py-3.5">
                    <span className={`font-mono font-bold ${
                      loc.budgetUsedPct > 90 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {loc.budgetUsedPct}%
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-300">{loc.topCategory}</td>
                  <td className="py-3.5 pr-2 text-right font-mono font-bold text-white">
                    {formatCurrency(loc.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
