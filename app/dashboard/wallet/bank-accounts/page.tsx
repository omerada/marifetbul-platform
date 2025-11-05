/**
 * ================================================
 * BANK ACCOUNTS MANAGEMENT PAGE
 * ================================================
 * Main page for managing bank accounts
 *
 * Features:
 * - List all bank accounts
 * - Add new bank account
 * - Set default account
 * - Delete accounts
 * - View verification status
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1-2: Bank Account Management
 */

'use client';

import { useState } from 'react';
import { BankAccountList, BankAccountForm } from '@/components/wallet';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Building2 } from 'lucide-react';
import type { BankAccountResponse } from '@/lib/api/bank-accounts';

// ================================================
// PAGE COMPONENT
// ================================================

export default function BankAccountsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ==================== HANDLERS ====================

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleFormSuccess = (_bankAccount: BankAccountResponse) => {
    setShowAddForm(false);
    // Trigger list refresh
    setRefreshKey((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  const handleAccountDeleted = () => {
    // Trigger list refresh
    setRefreshKey((prev) => prev + 1);
  };

  const handleDefaultChanged = () => {
    // List component handles this internally
  };

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-3 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Banka Hesaplarım
            </h1>
            <p className="text-gray-600">
              Ödeme almak için banka hesaplarınızı yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account List */}
      <BankAccountList
        key={refreshKey}
        onAddNew={handleAddNew}
        onAccountDeleted={handleAccountDeleted}
        onDefaultChanged={handleDefaultChanged}
      />

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-3xl">
          <BankAccountForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
