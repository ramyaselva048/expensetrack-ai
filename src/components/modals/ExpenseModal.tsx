import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Tag, 
  FileText, 
  Check, 
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExpenses } from '../../context/ExpenseContext';
import { ExpenseCategory, PaymentMethod } from '../../types';

const CATEGORIES: ExpenseCategory[] = [
  'Software & SaaS',
  'Office & Equipment',
  'Travel & Commute',
  'Food & Dining',
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

interface ExpenseModalProps {
  onOpenNewLocationModal: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ onOpenNewLocationModal }) => {
  const { 
    isExpenseModalOpen, 
    setIsExpenseModalOpen, 
    editingExpense, 
    setEditingExpense, 
    addExpense, 
    updateExpense, 
    locations, 
    currency,
    formatCurrency 
  } = useExpenses();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Software & SaaS');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<string>('Chennai');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Corporate Card');
  const [description, setDescription] = useState('');
  const [isTaxDeductible, setIsTaxDeductible] = useState(true);
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'Reimbursed'>('Approved');
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setLocation(editingExpense.location);
      setPaymentMethod(editingExpense.paymentMethod);
      setDescription(editingExpense.description || '');
      setIsTaxDeductible(editingExpense.isTaxDeductible ?? true);
      setStatus(editingExpense.status || 'Approved');
      setErrors({});
    } else {
      // Reset form
      setName('');
      setAmount('');
      setCategory('Software & SaaS');
      setDate(new Date().toISOString().split('T')[0]);
      setLocation(locations[0]?.name || 'Chennai');
      setPaymentMethod('Corporate Card');
      setDescription('');
      setIsTaxDeductible(true);
      setStatus('Approved');
      setErrors({});
    }
  }, [editingExpense, isExpenseModalOpen, locations]);

  if (!isExpenseModalOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Expense name or merchant title is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }

    if (!date) {
      newErrors.date = 'Transaction date is required';
    }

    if (!location) {
      newErrors.location = 'Please select a branch location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = Math.round(parseFloat(amount));

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        name: name.trim(),
        amount: parsedAmount,
        category,
        date,
        location,
        paymentMethod,
        description: description.trim(),
        isTaxDeductible,
        status,
      });
    } else {
      addExpense({
        name: name.trim(),
        amount: parsedAmount,
        category,
        date,
        location,
        paymentMethod,
        description: description.trim(),
        isTaxDeductible,
        status,
      });

      // Trigger celebratory micro-confetti on successful addition
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch (err) {
        // ignore confetti errors in headless test
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const setDateShortcut = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div 
      id="expense-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        id="expense-modal-dialog" 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingExpense 
                  ? `Modifying entry #${editingExpense.receiptNumber || editingExpense.id}`
                  : 'Enter transaction details to track spending and reconcile receipts.'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-expense-modal"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Row 1: Name & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expense Title / Merchant <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-expense-name"
                type="text"
                placeholder="e.g. AWS Cloud Hosting, Team Dinner"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-3.5 py-2 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  errors.name 
                    ? 'border-rose-500/80 focus:ring-rose-500/50' 
                    : 'border-slate-800 focus:border-emerald-500/60 focus:ring-emerald-500/30'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount ({currency}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  id="input-expense-amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={`w-full pl-14 pr-3.5 py-2 bg-slate-950/70 border rounded-xl text-sm font-mono font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${
                    errors.amount 
                      ? 'border-rose-500/80 focus:ring-rose-500/50' 
                      : 'border-slate-800 focus:border-emerald-500/60 focus:ring-emerald-500/30'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-expense-category"
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Branch / Location <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenNewLocationModal}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
                >
                  + Add Custom City
                </button>
              </div>
              <div className="relative">
                <select
                  id="select-expense-location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name} className="bg-slate-900 text-white">
                      {loc.name} {loc.state ? `(${loc.state})` : ''}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 3: Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Date <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setDateShortcut(0)}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Today
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setDateShortcut(1)}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="input-expense-date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Method <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-expense-payment-method"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method} className="bg-slate-900 text-white">
                      {method}
                    </option>
                  ))}
                </select>
                <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Business Justification
            </label>
            <textarea
              id="input-expense-description"
              rows={2.5}
              placeholder="e.g. Approved by department lead for Q3 infrastructure scaling..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
            />
          </div>

          {/* Row 5: Tax Deductible & Status Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
              <input
                id="checkbox-tax-deductible"
                type="checkbox"
                checked={isTaxDeductible}
                onChange={e => setIsTaxDeductible(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
              />
              <span>Tax Deductible Business Expense</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                id="select-expense-status"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending Review</option>
                <option value="Reimbursed">Reimbursed</option>
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              id="btn-cancel-expense"
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-expense"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? 'Save Changes' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
