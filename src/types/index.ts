export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateToINR: number; // For multi-currency preview if needed
}

export type ExpenseCategory = 
  | 'Office & Equipment'
  | 'Travel & Commute'
  | 'Food & Dining'
  | 'Software & SaaS'
  | 'Utilities & Bills'
  | 'Marketing & Ads'
  | 'Team & Events'
  | 'Logistics & Fuel'
  | 'Health & Wellness'
  | 'Miscellaneous';

export type PaymentMethod = 
  | 'Corporate Card'
  | 'UPI / GPay'
  | 'Bank Transfer'
  | 'Net Banking'
  | 'Company Debit Card'
  | 'Cash';

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  location: string; // e.g. Chennai, Bangalore, Coimbatore, Madurai, etc.
  paymentMethod: PaymentMethod;
  description: string;
  receiptNumber?: string;
  isTaxDeductible?: boolean;
  status?: 'Approved' | 'Pending' | 'Reimbursed';
  createdAt: string;
  updatedAt: string;
}

export interface LocationData {
  id: string;
  userId?: string;
  name: string;
  code: string;
  state: string;
  description: string;
  color: string;
  isDefault?: boolean;
  budgetLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type Location = LocationData;

export interface Category {
  id: string;
  userId?: string;
  name: string;
  budgetLimit: number;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // stored hashed or plain for local demo
  role: string;
  companyName: string;
  avatarUrl?: string;
  currency: CurrencyCode;
  monthlyBudget: number;
  joinedDate: string;
}

export interface ExpenseFilter {
  search: string;
  category: string;
  location: string;
  paymentMethod: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'name_asc';
}

export type ActiveTab = 'dashboard' | 'history' | 'add' | 'locations' | 'analytics' | 'settings';
