export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPrice(amount: number): string {
  return `₺${amount.toLocaleString('tr-TR')}`;
}

export function formatBudgetRange(min: number, max: number): string {
  return `₺${min.toLocaleString('tr-TR')} - ₺${max.toLocaleString('tr-TR')}`;
}

export function calculateFee(
  amount: number,
  feePercentage: number = 0.05
): number {
  return Math.round(amount * feePercentage * 100) / 100;
}

export function calculateTotal(amount: number, fee: number = 0): number {
  return amount + fee;
}
