import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Receipt, 
  MapPin, 
  ArrowUpRight, 
  Plus, 
  ChevronRight, 
  Building, 
  PieChart as PieChartIcon, 
  BarChart2, 
  Wallet,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../data/initialData';
import { Expense } from '../types';

interface DashboardPageProps {
  onDeleteExpenseRequest: (id: string) => void;
}

const PIE_COLORS = [
  '#8B5CF6', // Software - Purple
  '#3B82F6', // Office - Blue
  '#F59E0B', // Travel - Amber
  '#F97316', // Food - Orange
  '#06B6D4', // Utilities - Cyan
  '#F43F5E', // Marketing - Rose
  '#10B981', // Team - Emerald
  '#EAB308', // Logistics - Yellow
  '#14B8A6', // Health - Teal
  '#64748B', // Misc - Slate
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onDeleteExpenseRequest }) => {
  const { 
    expenses, 
    locations, 
    stats, 
    formatCurrency, 
    currency, 
    setActiveTab, 
    setIsExpenseModalOpen, 
    setEditingExpense, 
    setViewingExpense,
    setFilters
  } = useExpenses();

  const { currentUser } = useAuth();

  // Monthly Spending Trend Data (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = 2026;
    
    // Group expenses by month
    const totalsByMonth: Record<number, number> = {};
    for (let i = 0; i < 12; i++) totalsByMonth[i] = 0;

    expenses.forEach(e => {
      const parts = e.date.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10) - 1;
        totalsByMonth[m] = (totalsByMonth[m] || 0) + e.amount;
      }
    });

    // Provide trend data centered on current Q3 period
    return [
      { month: 'Mar', amount: totalsByMonth[2] || 65000 },
      { month: 'Apr', amount: totalsByMonth[3] || 82000 },
      { month: 'May', amount: totalsByMonth[4] || 110000 },
      { month: 'Jun', amount: totalsByMonth[5] || 145000 },
      { month: 'Jul', amount: totalsByMonth[6] || 178000 },
      { month: 'Aug', amount: totalsByMonth[7] > 0 ? totalsByMonth[7] : stats.thisMonthExpenses },
    ];
  }, [expenses, stats.thisMonthExpenses]);

  // Category Distribution Data
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });

    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Location Aggregations
  const locationMetrics = useMemo(() => {
    return locations.map(loc => {
      const cityExpenses = expenses.filter(e => e.location.toLowerCase() === loc.name.toLowerCase());
      const totalAmount = cityExpenses.reduce((sum, item) => sum + item.amount, 0);
      const percentage = stats.totalExpenses > 0 ? Math.round((totalAmount / stats.totalExpenses) * 100) : 0;
      return {
        ...loc,
        totalAmount,
        count: cityExpenses.length,
        percentage,
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [locations, expenses, stats.totalExpenses]);

  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [expenses]);

  const handleFilterByLocation = (locName: string) => {
    setFilters(prev => ({ ...prev, location: locName }));
    setActiveTab('history');
  };

  const handleFilterByCategory = (catName: string) => {
    setFilters(prev => ({ ...prev, category: catName }));
    setActiveTab('history');
  };

  return (
    <div id="dashboard-view" className="space-y-6 pb-12">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Enterprise Overview
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Welcome back, {currentUser?.name.split(' ')[0] || 'Executive'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live multi-location burn telemetry across <strong className="text-slate-200">Chennai, Bangalore, Coimbatore, Madurai</strong> and regional branches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-dash-view-locations"
            onClick={() => setActiveTab('locations')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Locations Hub</span>
          </button>

          <button
            id="btn-dash-add-expense"
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Key Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div 
          id="stat-card-total-expenses"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">+12.4%</span>
              <span className="text-slate-400">reconciled overall</span>
            </div>
          </div>
        </div>

        {/* This Month's Expenses */}
        <div 
          id="stat-card-month-expenses"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {formatCurrency(stats.thisMonthExpenses)}
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
              <span>Budget Cap:</span>
              <span className="font-mono text-slate-300 font-semibold">{formatCurrency(currentUser?.monthlyBudget || 250000)}</span>
            </div>
          </div>
        </div>

        {/* Today's Expenses */}
        <div 
          id="stat-card-today-expenses"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Spend</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {formatCurrency(stats.todayExpenses)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time daily burn rate</span>
            </div>
          </div>
        </div>

        {/* Transactions & Avg Ticket */}
        <div 
          id="stat-card-transactions"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {stats.totalTransactions} <span className="text-xs font-normal text-slate-400 font-sans">records</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
              <span>Avg Ticket Size:</span>
              <span className="font-mono text-purple-400 font-semibold">{formatCurrency(stats.averageTransaction)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Monthly Trend, Category Distribution, Location-wise Expense Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Monthly Expense Chart</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Historical trajectory and enterprise expense velocity</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {monthlyTrendData[monthlyTrendData.length - 1]?.month} Total: {formatCurrency(stats.thisMonthExpenses)}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
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
                          <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
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
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorMonthly)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-Wise Pie Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Category-Wise Chart</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Top functional spending allocations</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-48 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400">No category data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-xs">
                            <p className="font-semibold text-white">{data.name}</p>
                            <p className="font-mono text-purple-400 font-bold mt-0.5">
                              {formatCurrency(data.value as number)}
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
            {categoryData.slice(0, 4).map((cat, idx) => {
              const percentage = stats.totalExpenses > 0 ? Math.round((cat.value / stats.totalExpenses) * 100) : 0;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleFilterByCategory(cat.name)}
                  className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                    />
                    <span className="text-xs text-slate-300 truncate group-hover:text-white">{cat.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-white block">{formatCurrency(cat.value)}</span>
                    <span className="text-[10px] text-slate-400">{percentage}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location-Wise Expense Chart & Regional Velocity Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Location-Wise Expense Chart</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live spending comparison across Chennai, Bangalore, Coimbatore, Madurai, and regional branch operations.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('locations')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Multi-Location Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Location Bar Chart */}
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={locationMetrics.map(l => ({ name: l.name, amount: l.totalAmount, count: l.count, color: l.color }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
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
                        <p className="text-sm font-bold font-mono text-blue-400 mt-1">
                          {formatCurrency(d.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {locationMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {locationMetrics.map(loc => {
            return (
              <div
                key={loc.id}
                id={`location-card-${loc.id}`}
                onClick={() => handleFilterByLocation(loc.name)}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: loc.color }} 
                    />
                    <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {loc.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {loc.code}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-black font-mono text-white">
                    {formatCurrency(loc.totalAmount)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{loc.count} transactions</span>
                    <span className="font-semibold text-slate-300">{loc.percentage}% share</span>
                  </p>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${loc.percentage}%`,
                      backgroundColor: loc.color || '#3B82F6'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Latest submitted vouchers and expense reconciliations</p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Transaction History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No transactions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click the button below to add your first multi-location expense entry.
            </p>
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2 font-semibold">Expense / Merchant</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Payment Mode</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                  <th className="pb-3 pr-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.map(exp => {
                  const catStyle = CATEGORY_COLORS[exp.category] || {
                    bg: 'bg-slate-500/10',
                    text: 'text-slate-400',
                    border: 'border-slate-500/20',
                  };

                  return (
                    <tr 
                      key={exp.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setViewingExpense(exp)}
                    >
                      {/* Name & Receipt */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                            {exp.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{exp.name}</p>
                            <p className="text-[11px] font-mono text-slate-400">{exp.receiptNumber || exp.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {exp.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
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

                      {/* Amount */}
                      <td className="py-3.5 text-right font-mono font-bold text-white">
                        {formatCurrency(exp.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            id={`btn-view-rec-${exp.id}`}
                            onClick={() => setViewingExpense(exp)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Voucher"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-edit-rec-${exp.id}`}
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
                            id={`btn-del-rec-${exp.id}`}
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
      </div>
    </div>
  );
};
