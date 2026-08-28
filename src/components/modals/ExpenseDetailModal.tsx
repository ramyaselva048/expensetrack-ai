import React from 'react';
import { 
  X, 
  Receipt, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Tag, 
  Building, 
  Edit3, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Copy,
  Check
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORY_COLORS } from '../../data/initialData';

interface ExpenseDetailModalProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ onEdit, onDelete }) => {
  const { viewingExpense, setViewingExpense, formatCurrency } = useExpenses();
  const [copied, setCopied] = React.useState(false);

  if (!viewingExpense) return null;

  const handleClose = () => {
    setViewingExpense(null);
  };

  const copyReceiptNumber = () => {
    if (viewingExpense.receiptNumber) {
      navigator.clipboard.writeText(viewingExpense.receiptNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryStyle = CATEGORY_COLORS[viewingExpense.category] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  };

  return (
    <div 
      id="expense-detail-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 print:bg-white print:p-0"
    >
      <div 
        id="expense-detail-dialog" 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between print:bg-transparent print:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {viewingExpense.receiptNumber || 'REC-2026'}
                </span>
                <button
                  onClick={copyReceiptNumber}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy Receipt #"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                Transaction Voucher
              </h3>
            </div>
          </div>
          <button
            id="btn-close-detail-modal"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5">
          {/* Main Amount Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                viewingExpense.status === 'Approved' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {viewingExpense.status || 'Approved'}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Expense</p>
            <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {formatCurrency(viewingExpense.amount)}
            </p>
            <h4 className="text-sm font-semibold text-white mt-1">{viewingExpense.name}</h4>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
              </span>
              <span className={`inline-block font-semibold px-2 py-0.5 rounded-md border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                {viewingExpense.category}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Location
              </span>
              <span className="font-bold text-white">{viewingExpense.location}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Transaction Date
              </span>
              <span className="font-mono font-medium text-slate-200">{viewingExpense.date}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Payment Mode
              </span>
              <span className="font-semibold text-slate-200">{viewingExpense.paymentMethod}</span>
            </div>
          </div>

          {/* Business Description */}
          {viewingExpense.description && (
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Business Purpose & Notes
              </span>
              <p className="text-slate-300 leading-relaxed">{viewingExpense.description}</p>
            </div>
          )}

          {/* Tax Compliance Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                {viewingExpense.isTaxDeductible 
                  ? 'Eligible for Corporate Tax Deduction' 
                  : 'Non-Deductible Operational Expense'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Reconciled</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 print:hidden">
            <div className="flex items-center gap-2">
              <button
                id="btn-print-voucher"
                onClick={handlePrint}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                id="btn-detail-delete"
                onClick={() => {
                  handleClose();
                  onDelete();
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-detail-edit"
                onClick={() => {
                  handleClose();
                  onEdit();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
