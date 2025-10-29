/**
 * ================================================
 * PAYOUT REQUEST FORM
 * ================================================
 * Form for requesting payout with payment method selection
 *
 * Sprint 14 - Payment & Payout System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input, Label, Card } from '@/components/ui';
import { usePaymentMethods } from '@/hooks/business/wallet/usePaymentMethods';
import { usePayout } from '@/hooks/business/wallet/usePayout';
import type { CreatePayoutRequest } from '@/lib/api/payout';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutRequestFormProps {
  availableBalance: number;
  onSuccess?: (payoutId: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_PAYOUT_AMOUNT = 10; // $10
const MAX_PAYOUT_AMOUNT = 10000; // $10,000

// ============================================================================
// COMPONENT
// ============================================================================

export function PayoutRequestForm({
  availableBalance,
  onSuccess,
  onError,
}: PayoutRequestFormProps) {
  // State
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const {
    paymentMethods,
    isLoading: isLoadingMethods,
    load: loadMethods,
  } = usePaymentMethods();
  const { request } = usePayout({ autoLoad: false });

  // Load payment methods on mount
  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // Filter to bank accounts only (for payouts)
  const bankAccounts = paymentMethods.filter(
    (pm) => pm.type === 'BANK_TRANSFER'
  );

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Validate amount
  const validateAmount = (): string | null => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      return 'Please enter a valid amount';
    }

    if (numAmount < MIN_PAYOUT_AMOUNT) {
      return `Minimum payout amount is ${formatCurrency(MIN_PAYOUT_AMOUNT)}`;
    }

    if (numAmount > MAX_PAYOUT_AMOUNT) {
      return `Maximum payout amount is ${formatCurrency(MAX_PAYOUT_AMOUNT)}`;
    }

    if (numAmount > availableBalance) {
      return 'Insufficient balance';
    }

    return null;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const amountError = validateAmount();
    if (amountError) {
      setError(amountError);
      onError?.(amountError);
      return;
    }

    if (!paymentMethodId) {
      setError('Please select a payment method');
      onError?.('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreatePayoutRequest = {
        amount: parseFloat(amount),
        paymentMethodId,
        description: description || undefined,
      };

      const payout = await request(requestData);

      onSuccess?.(payout.id);

      // Reset form
      setAmount('');
      setDescription('');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create payout request';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle max amount
  const handleMaxAmount = () => {
    const maxAllowed = Math.min(availableBalance, MAX_PAYOUT_AMOUNT);
    setAmount(maxAllowed.toFixed(2));
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <h3 className="text-2xl font-bold">Request Payout</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Withdraw your earnings to your bank account
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-6">
          {/* Available Balance */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Available Balance
              </span>
              <span className="text-2xl font-bold">
                {formatCurrency(availableBalance)}
              </span>
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              Limits: {formatCurrency(MIN_PAYOUT_AMOUNT)} -{' '}
              {formatCurrency(MAX_PAYOUT_AMOUNT)}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={MIN_PAYOUT_AMOUNT}
                max={Math.min(availableBalance, MAX_PAYOUT_AMOUNT)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxAmount}
                disabled={isSubmitting || availableBalance === 0}
                className="h-auto p-0 text-xs"
              >
                Use maximum amount
              </Button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Bank Account</Label>
            {isLoadingMethods ? (
              <div className="flex items-center gap-2 rounded-md border p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Loading payment methods...
                </span>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    No bank accounts found. Please add a bank account first.
                  </span>
                </div>
              </div>
            ) : (
              <select
                id="payment-method"
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select bank account</option>
                {bankAccounts.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.bankName} - ****{pm.accountLastFour}
                    {pm.isDefault ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            )}
            <p className="text-muted-foreground text-xs">
              Payout will be sent to the selected bank account
            </p>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Project earnings withdrawal"
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t p-6">
          <div className="text-muted-foreground text-sm">
            Processing time: 3-5 business days
          </div>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !amount ||
              !paymentMethodId ||
              bankAccounts.length === 0 ||
              availableBalance === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Request Payout'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
