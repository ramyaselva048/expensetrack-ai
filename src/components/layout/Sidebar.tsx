import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PlusCircle, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogoutConfirm: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenLogoutConfirm }) => {
  const { activeTab, setActiveTab, expenses, setIsExpenseModalOpen, setEditingExpense, stats } = useExpenses();
  const { currentUser } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Expense History', icon: ReceiptText, badge: expenses.length },
    { id: 'locations', label: 'Locations Hub', icon: MapPin },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Budget', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleQuickAdd = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Expense<span className="text-emerald-400">Track</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {currentUser?.companyName || 'Apex Technologies'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-5 pb-2">
          <button
            id="btn-sidebar-quick-add"
            onClick={handleQuickAdd}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Add New Expense</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Menu</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Budget Health Quick Widget */}
        <div className="p-4 mx-3 mb-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Monthly Budget</span>
            <span className={`font-mono font-semibold ${
              stats.budgetUtilizationPct > 90 ? 'text-rose-400' : stats.budgetUtilizationPct > 70 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {stats.budgetUtilizationPct}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                stats.budgetUtilizationPct > 90
                  ? 'bg-rose-500'
                  : stats.budgetUtilizationPct > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(stats.budgetUtilizationPct, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Burn status:</span>
            <span className="text-slate-300 font-medium">
              {stats.budgetUtilizationPct > 90 ? 'High Burn' : stats.budgetUtilizationPct > 70 ? 'Moderate' : 'Healthy'}
            </span>
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-300">
                    {currentUser?.name.substring(0, 2).toUpperCase() || 'US'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.role || 'Finance Manager'}</p>
              </div>
            </div>

            <button
              id="btn-sidebar-logout"
              onClick={onOpenLogoutConfirm}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
