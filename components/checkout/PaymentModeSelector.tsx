'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Banknote, Check, AlertTriangle, Info } from 'lucide-react';
import { PaymentMode } from '@/types/business/features/order';
import { cn } from '@/lib/utils';

/**
 * ================================================
 * PAYMENT MODE SELECTOR COMPONENT
 * ================================================
 * Allows users to choose between ESCROW_PROTECTED and MANUAL_IBAN payment modes
 * 
 * Features:
 * - Visual comparison of both payment modes
 * - Clear pricing breakdown
 * - Pros/cons display
 * - Seller IBAN validation for manual payments
 * - Responsive design
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint X - Dual Payment System
 */

export interface PaymentModeSelectorProps {
  /** Current selected payment mode */
  value: PaymentMode;
  /** Callback when payment mode changes */
  onChange: (mode: PaymentMode) => void;
  /** Order amount for fee calculation */
  orderAmount: number;
  /** Platform fee percentage */
  platformFeePercentage?: number;
  /** Whether seller has IBAN configured (for manual payments) */
  sellerHasIban?: boolean;
  /** Seller name (for manual payment display) */
  sellerName?: string;
  /** Whether component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PaymentModeSelector({
  value,
  onChange,
  orderAmount,
  platformFeePercentage = 10,
  sellerHasIban = true,
  sellerName,
  disabled = false,
  className,
}: PaymentModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<PaymentMode>(value);

  // Fee calculations
  const platformFee = (orderAmount * platformFeePercentage) / 100;
  const escrowGatewayFee = orderAmount * 0.029 + 0.25; // iyzico fees (example)
  const escrowTotalFees = platformFee + escrowGatewayFee;
  const escrowNetAmount = orderAmount - escrowTotalFees;
  
  const manualNetAmount = orderAmount; // No gateway fees, platform fee deducted on completion
  const savingsAmount = escrowTotalFees - platformFee;
  const savingsPercentage = ((savingsAmount / orderAmount) * 100).toFixed(1);

  const handleModeChange = (mode: string) => {
    const newMode = mode as PaymentMode;
    setSelectedMode(newMode);
    onChange(newMode);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Ödeme Yöntemi Seçin</h3>
        <p className="text-sm text-muted-foreground">
          Sipariş ödemenizi nasıl yapmak istersiniz?
        </p>
      </div>

      <RadioGroup value={selectedMode} onValueChange={handleModeChange} disabled={disabled}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* ESCROW PROTECTED OPTION */}
          <Card 
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedMode === PaymentMode.ESCROW_PROTECTED && 'ring-2 ring-primary'
            )}
            onClick={() => !disabled && handleModeChange(PaymentMode.ESCROW_PROTECTED)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={PaymentMode.ESCROW_PROTECTED} id="escrow" />
                  <Label htmlFor="escrow" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Güvenli Ödeme (Escrow)</span>
                  </Label>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Önerilen
                </Badge>
              </div>
              <CardDescription>
                Platform tarafından güvence altına alınan ödeme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pros */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Anında ödeme onayı</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Platform güvencesi</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Otomatik iade garantisi</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Kredi kartı ile ödeme</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sipariş Tutarı:</span>
                  <span className="font-medium">{orderAmount.toFixed(2)} TRY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Komisyonu:</span>
                  <span className="text-red-600">-{platformFee.toFixed(2)} TRY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ödeme Gateway Ücreti:</span>
                  <span className="text-red-600">-{escrowGatewayFee.toFixed(2)} TRY</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                  <span>Satıcıya Gidecek:</span>
                  <span className="text-green-600">{escrowNetAmount.toFixed(2)} TRY</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MANUAL IBAN OPTION */}
          <Card 
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedMode === PaymentMode.MANUAL_IBAN && 'ring-2 ring-primary',
              !sellerHasIban && 'opacity-60 cursor-not-allowed'
            )}
            onClick={() => !disabled && sellerHasIban && handleModeChange(PaymentMode.MANUAL_IBAN)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <RadioGroupItem 
                    value={PaymentMode.MANUAL_IBAN} 
                    id="manual"
                    disabled={!sellerHasIban}
                  />
                  <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
                    <Banknote className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Manuel IBAN Ödemesi</span>
                  </Label>
                </div>
                {savingsAmount > 0 && (
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    %{savingsPercentage} tasarruf
                  </Badge>
                )}
              </div>
              <CardDescription>
                Doğrudan satıcının IBAN'ına havale/EFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seller IBAN Check */}
              {!sellerHasIban && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {sellerName || 'Satıcı'} henüz IBAN bilgisi eklememiş. 
                    Manuel ödeme için lütfen satıcıyla iletişime geçin.
                  </AlertDescription>
                </Alert>
              )}

              {/* Pros */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Gateway ücreti yok</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Tanıdık ödeme yöntemi</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Maliyet avantajı</span>
                </div>
              </div>

              {/* Cons */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span>Her iki tarafın onayı gerekir</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span>Dekont yüklemeniz gerekir</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span>7 gün içinde onaylanmalı</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sipariş Tutarı:</span>
                  <span className="font-medium">{orderAmount.toFixed(2)} TRY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Komisyonu:</span>
                  <span className="text-muted-foreground text-xs">
                    (tamamlanınca kesilir)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gateway Ücreti:</span>
                  <span className="text-green-600">₺0.00</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                  <span>Satıcıya Gidecek:</span>
                  <span className="text-green-600">{manualNetAmount.toFixed(2)} TRY</span>
                </div>
              </div>

              {/* Savings Display */}
              {savingsAmount > 0 && sellerHasIban && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <Banknote className="h-4 w-4" />
                    <span className="font-medium">
                      {savingsAmount.toFixed(2)} TRY tasarruf edersiniz
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RadioGroup>

      {/* Important Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Önemli:</strong> Ödeme yöntemi seçimi sonradan değiştirilemez. 
          Lütfen dikkatli seçim yapın.
        </AlertDescription>
      </Alert>
    </div>
  );
}
