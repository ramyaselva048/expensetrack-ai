import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Coins, 
  DollarSign, 
  MapPin, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { CURRENCY_CONFIGS } from '../data/initialData';
import { CurrencyCode } from '../types';

interface SettingsPageProps {
  onOpenNewLocationModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenNewLocationModal }) => {
  const { currentUser, updateProfile } = useAuth();
  const { 
    currency, 
    setCurrency, 
    locations, 
    deleteLocation, 
    resetToSampleData, 
    showToast,
    expenses,
    formatCurrency
  } = useExpenses();

  const [name, setName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(currentUser?.role || 'Finance Manager');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || 'Apex Enterprise');
  const [monthlyBudget, setMonthlyBudget] = useState(currentUser?.monthlyBudget?.toString() || '250000');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(monthlyBudget) || 200000;
    
    updateProfile({
      name: name.trim(),
      role: role.trim(),
      companyName: companyName.trim(),
      monthlyBudget: parsedBudget,
    });

    setIsSaved(true);
    showToast('Settings Saved', 'Your organizational preferences have been updated.', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportJSON = () => {
    const backupData = {
      user: currentUser,
      expenses,
      locations,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ExpenseTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup Generated', 'Exported full JSON state backup successfully.', 'success');
  };

  return (
    <div id="settings-page-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
              Configuration
            </span>
            <span className="text-xs text-slate-400">
              Workspace ID: {currentUser?.id || 'usr-default'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Profile & Organizational Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage spending limits, base currencies, branch hubs, and state persistence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile & Budget Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Administrator Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="settings-input-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Verified)
                </label>
                <input
                  id="settings-input-email"
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Organization / Company
                </label>
                <input
                  id="settings-input-company"
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designation / Role
                </label>
                <input
                  id="settings-input-role"
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Monthly Budget Cap */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Company Budget Cap ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  id="settings-input-budget"
                  type="number"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(e.target.value)}
                  className="w-full pl-14 pr-4 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs font-mono text-white focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to compute the burn rate and warning indicators across dashboard widgets.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                id="btn-save-settings"
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* Currency Preferences */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Coins className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Default Display Currency</h3>
            </div>
            <p className="text-xs text-slate-400">
              Select your primary accounting currency. Real-time symbols and formatting will update across all charts, tables, and vouchers.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(CURRENCY_CONFIGS).map(curr => {
                const isSelected = curr.code === currency;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code as CurrencyCode)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-md font-bold'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="text-base font-mono font-extrabold block">{curr.symbol}</span>
                    <span className="text-xs font-semibold block mt-1">{curr.code}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{curr.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Locations Management & Data Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Branch Locations List */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Active Branches</h3>
              </div>
              <button
                onClick={onOpenNewLocationModal}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                + Add City
              </button>
            </div>

            <div className="space-y-2.5">
              {locations.map(loc => (
                <div
                  key={loc.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color }} />
                    <div>
                      <p className="text-xs font-bold text-white">{loc.name}</p>
                      <p className="text-[10px] text-slate-400">{loc.state || 'Regional'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {loc.code}
                    </span>
                    {!loc.isDefault && (
                      <button
                        onClick={() => deleteLocation(loc.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        title="Delete branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Maintenance & Backups */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Data Management & Seeders</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-white">Backup Workspace Data</p>
                  <p className="text-[11px] text-slate-400">Download encrypted JSON archive</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={resetToSampleData}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-amber-400">Reset Enterprise Sample Data</p>
                  <p className="text-[11px] text-slate-400">Re-seed multi-city Q3 transactions</p>
                </div>
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
