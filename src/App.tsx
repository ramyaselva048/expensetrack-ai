import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { LocationModal } from './components/modals/LocationModal';
import { ExpenseDetailModal } from './components/modals/ExpenseDetailModal';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpenseHistoryPage } from './pages/ExpenseHistoryPage';
import { LocationsPage } from './pages/LocationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { 
    activeTab, 
    deleteExpense, 
    bulkDeleteExpenses, 
    viewingExpense, 
    setViewingExpense, 
    setEditingExpense, 
    setIsExpenseModalOpen 
  } = useExpenses();

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<string[] | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  const handleDeleteExpenseConfirm = () => {
    if (deleteTargetId) {
      deleteExpense(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (bulkDeleteTargetIds && bulkDeleteTargetIds.length > 0) {
      bulkDeleteExpenses(bulkDeleteTargetIds);
      setBulkDeleteTargetIds(null);
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutConfirmOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenLogoutConfirm={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenLogoutConfirm={() => setIsLogoutConfirmOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onDeleteExpenseRequest={(id) => setDeleteTargetId(id)}
            />
          )}

          {activeTab === 'history' && (
            <ExpenseHistoryPage
              onDeleteExpenseRequest={(id) => setDeleteTargetId(id)}
              onBulkDeleteRequest={(ids) => setBulkDeleteTargetIds(ids)}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsPage
              onOpenNewLocationModal={() => setIsLocationModalOpen(true)}
              onDeleteExpenseRequest={(id) => setDeleteTargetId(id)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onOpenNewLocationModal={() => setIsLocationModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ExpenseModal
        onOpenNewLocationModal={() => setIsLocationModalOpen(true)}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <ExpenseDetailModal
        onEdit={() => {
          if (viewingExpense) {
            setEditingExpense(viewingExpense);
            setIsExpenseModalOpen(true);
          }
        }}
        onDelete={() => {
          if (viewingExpense) {
            setDeleteTargetId(viewingExpense.id);
          }
        }}
      />

      {/* Single Expense Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Expense Record"
        message="Are you sure you want to permanently delete this expense voucher? This action will adjust all budget and location calculations immediately."
        confirmText="Delete Record"
        onConfirm={handleDeleteExpenseConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={bulkDeleteTargetIds !== null && bulkDeleteTargetIds.length > 0}
        title="Batch Delete Transactions"
        message={`Are you sure you want to delete ${bulkDeleteTargetIds?.length || 0} selected expense records? This cannot be undone.`}
        confirmText="Delete Selected"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteTargetIds(null)}
      />

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Sign Out of ExpenseTrack"
        message="Are you sure you want to sign out? Your session data and expense history remain securely saved on this device."
        confirmText="Sign Out"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <MainAppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}
