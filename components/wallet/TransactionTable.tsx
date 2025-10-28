import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { Transaction } from '@/lib/api/validators';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  emptyMessage?: string;
}

/**
 * Transaction Table Component
 * Displays transaction history with responsive design
 */
export function TransactionTable({
  transactions,
  onTransactionClick,
  emptyMessage = 'İşlem bulunamadı',
}: TransactionTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('CREDIT') || type.includes('RECEIVED')) {
      return (
        <div className="rounded-full bg-green-100 p-2">
          <ArrowDownRight className="h-4 w-4 text-green-600" />
        </div>
      );
    }
    if (type.includes('DEBIT') || type.includes('PAYOUT')) {
      return (
        <div className="rounded-full bg-red-100 p-2">
          <ArrowUpRight className="h-4 w-4 text-red-600" />
        </div>
      );
    }
    return (
      <div className="rounded-full bg-blue-100 p-2">
        <Clock className="h-4 w-4 text-blue-600" />
      </div>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CREDIT: 'Gelen',
      DEBIT: 'Giden',
      ESCROW_HOLD: 'Emanet Tutuldu',
      ESCROW_RELEASE: 'Emanet Serbest',
      PAYOUT: 'Çekim',
      REFUND: 'İade',
      FEE: 'Komisyon',
      PAYMENT_RECEIVED: 'Ödeme Alındı',
      PAYMENT_RELEASED: 'Ödeme Serbest',
      PAYOUT_REQUESTED: 'Çekim Talep',
      PAYOUT_COMPLETED: 'Çekim Tamamlandı',
    };
    return labels[type] || type;
  };

  const getTypeBadgeVariant = (
    type: string
  ): 'default' | 'success' | 'warning' | 'secondary' => {
    if (type.includes('CREDIT') || type.includes('RECEIVED')) return 'success';
    if (type.includes('DEBIT') || type.includes('PAYOUT')) return 'warning';
    if (type.includes('ESCROW')) return 'secondary';
    return 'default';
  };

  if (transactions.length === 0) {
    return (
      <Card className="text-muted-foreground p-12 text-center">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Tarih</th>
                  <th className="p-4 text-left font-medium">Açıklama</th>
                  <th className="p-4 text-left font-medium">Tip</th>
                  <th className="p-4 text-right font-medium">Tutar</th>
                  <th className="p-4 text-right font-medium">Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-muted/50 cursor-pointer border-b transition-colors"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div className="text-sm">{transaction.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-semibold ${
                          transaction.amount >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.amount >= 0 ? '+' : ''}
                        {formatCurrency(transaction.amount, 'TRY')}
                      </span>
                    </td>
                    <td className="text-muted-foreground p-4 text-right text-sm">
                      {formatCurrency(transaction.balanceAfter, 'TRY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className="hover:border-primary/50 cursor-pointer p-4 transition-colors"
            onClick={() => onTransactionClick?.(transaction)}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex flex-1 items-center gap-3">
                {getTransactionIcon(transaction.type)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {transaction.description}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-semibold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {formatCurrency(transaction.amount, 'TRY')}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={getTypeBadgeVariant(transaction.type)}>
                {getTypeLabel(transaction.type)}
              </Badge>
              <div className="text-muted-foreground text-xs">
                Bakiye: {formatCurrency(transaction.balanceAfter, 'TRY')}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
