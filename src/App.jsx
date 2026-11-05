import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { OverallStats } from './components/OverallStats';
import { FundTabs } from './components/FundTabs';
import { FundOverviewCard } from './components/FundOverviewCard';
import { TwoColumnView } from './components/TwoColumnView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { BackupModal } from './components/BackupModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginPage } from './components/LoginPage';

function MainContent() {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [modalFund, setModalFund] = useState('liquid');
  const [editingTx, setEditingTx] = useState(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleOpenAddModal = (type = 'expense', fund = 'liquid') => {
    setEditingTx(null);
    setModalType(type);
    setModalFund(fund);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTx(tx);
    setModalType(tx.type);
    setModalFund(tx.fundType);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar onOpenBackup={() => setIsBackupModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 pb-24 sm:pb-12">
        {/* 1. Overall Balance and Net Worth Card with separated stats */}
        <OverallStats onOpenTransfer={() => setIsTransferModalOpen(true)} />

        {/* 2. Fund Navigation Tabs & Search/Filter */}
        <FundTabs />

        {/* 3. Selected Fund Balance & Auto-Deduction Breakdown Card */}
        <FundOverviewCard onOpenAddModal={handleOpenAddModal} />

        {/* 4. Two Columns: Income Column & Expense Column */}
        <TwoColumnView
          onOpenAddModal={handleOpenAddModal}
          onEditTransaction={handleEditTransaction}
        />
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        initialType={modalType}
        initialFund={modalFund}
        editTx={editingTx}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav
        onOpenAddModal={handleOpenAddModal}
        onOpenTransfer={() => setIsTransferModalOpen(true)}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}
