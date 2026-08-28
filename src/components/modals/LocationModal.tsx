import React, { useState } from 'react';
import { X, MapPin, Check, AlertCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCATION_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { addLocation, currency } = useExpenses();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(LOCATION_COLORS[0]);
  const [budgetLimit, setBudgetLimit] = useState('75000');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'City or location name is required';
    }
    if (!code.trim()) {
      newErrors.code = '3-letter branch code is required (e.g. HYD)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addLocation({
      name: name.trim(),
      code: code.trim().toUpperCase().substring(0, 4),
      state: state.trim() || 'Custom Territory',
      description: description.trim() || 'Regional branch operations and regional expenses',
      color,
      isDefault: false,
      budgetLimit: parseFloat(budgetLimit) || 50000,
    });

    // Reset
    setName('');
    setCode('');
    setState('');
    setDescription('');
    onClose();
  };

  return (
    <div 
      id="location-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div 
        id="location-modal-dialog" 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Custom Branch Location</h3>
              <p className="text-xs text-slate-400">Track and compare expenses by regional hub</p>
            </div>
          </div>
          <button
            id="btn-close-location-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City / Location Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-location-name"
                type="text"
                placeholder="e.g. Hyderabad, Kochi, Delhi"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-950/70 border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all ${
                  errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Code <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-location-code"
                type="text"
                maxLength={4}
                placeholder="HYD"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono uppercase text-white placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              State / Region
            </label>
            <input
              id="input-location-state"
              type="text"
              placeholder="e.g. Telangana, Kerala, NCR"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Monthly Branch Budget Limit ({currency})
            </label>
            <input
              id="input-location-budget"
              type="number"
              value={budgetLimit}
              onChange={e => setBudgetLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {LOCATION_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    color === c ? 'scale-110 border-white ring-2 ring-blue-500/50' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Branch Purpose
            </label>
            <textarea
              id="input-location-description"
              rows={2}
              placeholder="e.g. Regional distribution center and executive sales outpost..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              id="btn-cancel-location"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-location"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Create Location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
