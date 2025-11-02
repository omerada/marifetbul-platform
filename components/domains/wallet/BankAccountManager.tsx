/**
 * ============================================================================
 * BankAccountManager Component
 * ============================================================================
 * Purpose: Manage bank accounts for payout with CRUD operations
 * Features:
 * - List saved bank accounts
 * - Add new bank account with IBAN validation
 * - Edit existing bank account
 * - Delete bank account
 * - Set default bank account
 * - Bank selection from Turkish banks
 *
 * Part of: Sprint 1 Days 6-7 (Payout System UI)
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Building2,
  Trash2,
  Edit2,
  Check,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import type { BankAccountInfo } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface BankAccount extends BankAccountInfo {
  id: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface BankAccountManagerProps {
  /** List of bank accounts */
  accounts: BankAccount[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when add account */
  onAddAccount?: (
    account: Omit<BankAccount, 'id' | 'createdAt'>
  ) => Promise<void>;
  /** Callback when edit account */
  onEditAccount?: (id: string, account: Partial<BankAccount>) => Promise<void>;
  /** Callback when delete account */
  onDeleteAccount?: (id: string) => Promise<void>;
  /** Callback when set default account */
  onSetDefault?: (id: string) => Promise<void>;
}

interface BankAccountFormData {
  bankName: string;
  iban: string;
  accountHolder: string;
  branchCode?: string;
  accountNumber?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TURKISH_BANKS = [
  'Türkiye İş Bankası',
  'Garanti BBVA',
  'Yapı Kredi',
  'Ziraat Bankası',
  'Akbank',
  'Halkbank',
  'QNB Finansbank',
  'Vakıfbank',
  'TEB',
  'ING',
  'Denizbank',
  'Kuveyt Türk',
  'Albaraka Türk',
  'Türkiye Finans',
  'Vakıf Katılım',
  'Ziraat Katılım',
  'HSBC',
  'Fibabanka',
  'Odeabank',
  'Alternatifbank',
  'Burgan Bank',
  'Şekerbank',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate IBAN format (TR + 24 digits)
 */
function validateIBAN(iban: string): string | null {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  if (!cleaned.startsWith('TR')) {
    return 'IBAN TR ile başlamalıdır';
  }

  if (cleaned.length !== 26) {
    return 'IBAN 26 karakter olmalıdır (TR + 24 rakam)';
  }

  const digits = cleaned.slice(2);
  if (!/^\d+$/.test(digits)) {
    return 'IBAN sadece rakam içermelidir';
  }

  return null;
}

/**
 * Format IBAN for display (TR** **** **** **** **** **** **)
 */
function _formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Mask IBAN for security (TR** **** **** **** **** **** 1234)
 */
function maskIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const masked =
    cleaned.slice(0, 4) + ' **** **** **** **** **** ' + cleaned.slice(-4);
  return masked;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BankAccountManager({
  accounts,
  isLoading = false,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onSetDefault,
}: BankAccountManagerProps) {
  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null
  );
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<BankAccountFormData>({
    bankName: '',
    iban: '',
    accountHolder: '',
    branchCode: '',
    accountNumber: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof BankAccountFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BankAccountFormData, string>> = {};

    if (!formData.bankName) {
      newErrors.bankName = 'Banka adı gereklidir';
    }

    if (!formData.iban) {
      newErrors.iban = 'IBAN gereklidir';
    } else {
      const ibanError = validateIBAN(formData.iban);
      if (ibanError) {
        newErrors.iban = ibanError;
      }
    }

    if (!formData.accountHolder) {
      newErrors.accountHolder = 'Hesap sahibi adı gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add account
  const handleAddAccount = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onAddAccount?.({
        bankName: formData.bankName,
        iban: formData.iban.replace(/\s/g, '').toUpperCase(),
        accountHolder: formData.accountHolder,
        branchCode: formData.branchCode,
        accountNumber: formData.accountNumber,
        isDefault: accounts.length === 0, // First account is default
        isVerified: false,
      });

      // Reset form
      setFormData({
        bankName: '',
        iban: '',
        accountHolder: '',
        branchCode: '',
        accountNumber: '',
      });
      setErrors({});
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit account
  const handleEditAccount = async () => {
    if (!editingAccount || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await onEditAccount?.(editingAccount.id, {
        bankName: formData.bankName,
        iban: formData.iban.replace(/\s/g, '').toUpperCase(),
        accountHolder: formData.accountHolder,
        branchCode: formData.branchCode,
        accountNumber: formData.accountNumber,
      });

      setEditingAccount(null);
      setIsEditDialogOpen(false);
      setFormData({
        bankName: '',
        iban: '',
        accountHolder: '',
        branchCode: '',
        accountNumber: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to edit account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletingAccountId) return;

    setIsSubmitting(true);
    try {
      await onDeleteAccount?.(deletingAccountId);
      setDeletingAccountId(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle set default
  const handleSetDefault = async (id: string) => {
    try {
      await onSetDefault?.(id);
    } catch (error) {
      console.error('Failed to set default account:', error);
    }
  };

  // Open edit dialog
  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      iban: account.iban,
      accountHolder: account.accountHolder,
      branchCode: account.branchCode,
      accountNumber: account.accountNumber,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (id: string) => {
    setDeletingAccountId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Banka Hesapları</h3>
          <p className="text-muted-foreground text-sm">
            Çekim işlemleri için banka hesaplarınızı yönetin
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Hesap Ekle
        </Button>
      </div>

      {/* Account List */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border py-12">
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
            <span>Yükleniyor...</span>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="border-border rounded-lg border-2 border-dashed py-12 text-center">
          <Building2 className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <p className="mb-1 font-medium">Henüz banka hesabı eklenmemiş</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Çekim talebinde bulunmak için banka hesabı eklemelisiniz
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            İlk Hesabı Ekle
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Building2 className="text-muted-foreground h-5 w-5" />
                      <span className="font-semibold">{account.bankName}</span>
                      {account.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Varsayılan
                        </Badge>
                      )}
                      {account.isVerified && (
                        <Badge variant="success" className="gap-1">
                          <Check className="h-3 w-3" />
                          Doğrulanmış
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-mono text-sm">
                        {maskIBAN(account.iban)}
                      </p>
                      <p className="text-sm">{account.accountHolder}</p>
                      {account.branchCode && (
                        <p className="text-muted-foreground text-xs">
                          Şube Kodu: {account.branchCode}
                        </p>
                      )}
                      {account.accountNumber && (
                        <p className="text-muted-foreground text-xs">
                          Hesap No: {account.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!account.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(account.id)}
                        title="Varsayılan Yap"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(account)}
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(account.id)}
                      title="Sil"
                      disabled={account.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Banka Hesabı Ekle</DialogTitle>
            <DialogDescription>
              Çekim işlemleri için banka hesap bilgilerinizi ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <Label htmlFor="add-bank-name">
                Banka Adı <span className="text-red-500">*</span>
              </Label>
              <select
                id="add-bank-name"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="">Banka seçin</option>
                {TURKISH_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
              )}
            </div>

            {/* IBAN */}
            <div>
              <Label htmlFor="add-iban">
                IBAN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-iban"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                maxLength={32}
              />
              {errors.iban && (
                <p className="mt-1 text-sm text-red-500">{errors.iban}</p>
              )}
            </div>

            {/* Account Holder */}
            <div>
              <Label htmlFor="add-account-holder">
                Hesap Sahibi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-account-holder"
                placeholder="Ad Soyad"
                value={formData.accountHolder}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolder: e.target.value })
                }
              />
              {errors.accountHolder && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.accountHolder}
                </p>
              )}
            </div>

            {/* Branch Code (optional) */}
            <div>
              <Label htmlFor="add-branch-code">Şube Kodu (İsteğe Bağlı)</Label>
              <Input
                id="add-branch-code"
                placeholder="0001"
                value={formData.branchCode}
                onChange={(e) =>
                  setFormData({ ...formData, branchCode: e.target.value })
                }
              />
            </div>

            {/* Account Number (optional) */}
            <div>
              <Label htmlFor="add-account-number">
                Hesap Numarası (İsteğe Bağlı)
              </Label>
              <Input
                id="add-account-number"
                placeholder="1234567890"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleAddAccount} disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Hesap Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Banka Hesabı Düzenle</DialogTitle>
            <DialogDescription>
              Banka hesap bilgilerinizi güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <Label htmlFor="edit-bank-name">
                Banka Adı <span className="text-red-500">*</span>
              </Label>
              <select
                id="edit-bank-name"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="">Banka seçin</option>
                {TURKISH_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
              )}
            </div>

            {/* IBAN */}
            <div>
              <Label htmlFor="edit-iban">
                IBAN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-iban"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                maxLength={32}
              />
              {errors.iban && (
                <p className="mt-1 text-sm text-red-500">{errors.iban}</p>
              )}
            </div>

            {/* Account Holder */}
            <div>
              <Label htmlFor="edit-account-holder">
                Hesap Sahibi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-account-holder"
                placeholder="Ad Soyad"
                value={formData.accountHolder}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolder: e.target.value })
                }
              />
              {errors.accountHolder && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.accountHolder}
                </p>
              )}
            </div>

            {/* Branch Code (optional) */}
            <div>
              <Label htmlFor="edit-branch-code">Şube Kodu (İsteğe Bağlı)</Label>
              <Input
                id="edit-branch-code"
                placeholder="0001"
                value={formData.branchCode}
                onChange={(e) =>
                  setFormData({ ...formData, branchCode: e.target.value })
                }
              />
            </div>

            {/* Account Number (optional) */}
            <div>
              <Label htmlFor="edit-account-number">
                Hesap Numarası (İsteğe Bağlı)
              </Label>
              <Input
                id="edit-account-number"
                placeholder="1234567890"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleEditAccount} disabled={isSubmitting}>
              {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hesabı Sil</DialogTitle>
            <DialogDescription>
              Bu banka hesabını silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-800 dark:text-red-200">
              Bu işlem geri alınamaz. Silinen hesap bilgileri kurtarılamaz.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Siliniyor...' : 'Hesabı Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
