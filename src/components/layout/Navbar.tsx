import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Coins, 
  Bell, 
  RotateCcw, 
  Download, 
  User, 
  Settings, 
  LogOut, 
  Building,
  Check
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENCY_CONFIGS } from '../../data/initialData';
import { CurrencyCode } from '../../types';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenLogoutConfirm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onOpenLogoutConfirm }) => {
  const { 
    currency, 
    setCurrency, 
    filters, 
    setFilters, 
    setActiveTab, 
    setIsExpenseModalOpen, 
    setEditingExpense, 
    resetToSampleData,
    exportToCSV,
    expenses
  } = useExpenses();

  const { currentUser } = useAuth();
  
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCurrencySelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsCurrencyDropdownOpen(false);
  };

  return (
    <header 
      id="app-navbar" 
      className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4"
    >
      {/* Left section: mobile toggle & search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          id="btn-navbar-mobile-toggle"
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="navbar-global-search"
            type="text"
            placeholder="Search expenses, merchants, receipts..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9.5 pr-4 py-1.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right section: actions & profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Currency Switcher */}
        <div className="relative" ref={currencyRef}>
          <button
            id="btn-navbar-currency-toggle"
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">{currency} ({CURRENCY_CONFIGS[currency]?.symbol})</span>
          </button>

          {isCurrencyDropdownOpen && (
            <div 
              id="currency-dropdown-menu" 
              className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Display Currency
              </div>
              {Object.values(CURRENCY_CONFIGS).map((curr) => {
                const isSelected = curr.code === currency;
                return (
                  <button
                    key={curr.code}
                    id={`btn-curr-${curr.code}`}
                    onClick={() => handleCurrencySelect(curr.code as CurrencyCode)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span>{curr.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick CSV Export */}
        <button
          id="btn-navbar-export-csv"
          onClick={() => exportToCSV()}
          title="Export CSV"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export CSV</span>
        </button>

        {/* Reset Demo Data */}
        <button
          id="btn-navbar-reset-data"
          onClick={resetToSampleData}
          title="Reset Enterprise Sample Data"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample</span>
        </button>

        {/* Notifications Icon */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-navbar-notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div 
              id="notifications-dropdown-menu" 
              className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">System Alerts & Audits</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="font-medium text-slate-200">Chennai HQ Q3 Expense Audit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All 14 expense receipts verified & reconciled.</p>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Just now</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/30">
                  <p className="font-medium text-slate-300">Bangalore Budget Alert</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Software & SaaS category approaching 65% limit.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global + Add Expense Button */}
        <button
          id="btn-navbar-add-expense"
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden xs:inline sm:inline">Add Expense</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            id="btn-navbar-profile"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-bold text-slate-300">
                  {currentUser?.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </button>

          {isProfileDropdownOpen && (
            <div 
              id="profile-dropdown-menu" 
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50"
            >
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                  {currentUser?.role}
                </span>
              </div>

              <button
                id="btn-profile-to-settings"
                onClick={() => {
                  setActiveTab('settings');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & Budget Settings</span>
              </button>

              <button
                id="btn-profile-to-locations"
                onClick={() => {
                  setActiveTab('locations');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Manage Branch Locations</span>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                id="btn-profile-logout"
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  onOpenLogoutConfirm();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
