'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import type {
  ContextType,
  MessageContext,
} from '@/types/business/features/messaging';

interface ContextQuickActionsProps {
  /** Context information */
  context: MessageContext;
  /** Current user role in context (buyer, seller, employer, freelancer) */
  userRole?: 'buyer' | 'seller' | 'employer' | 'freelancer';
  /** Compact mode (fewer buttons) */
  compact?: boolean;
  /** Callback when accept action is triggered */
  onAccept?: (contextId: string) => Promise<void>;
  /** Callback when reject action is triggered */
  onReject?: (contextId: string, reason?: string) => Promise<void>;
}

/**
 * Get navigation path for context
 */
function getContextPath(contextType: ContextType, contextId: string): string {
  switch (contextType) {
    case 'ORDER':
      return `/orders/${contextId}`;
    case 'PROPOSAL':
      return `/proposals/${contextId}`;
    case 'JOB':
      return `/jobs/${contextId}`;
    case 'PACKAGE':
      return `/packages/${contextId}`;
  }
}

/**
 * Get quick actions based on context type and user role
 */
function getQuickActions(
  contextType: ContextType,
  userRole?: string,
  compact?: boolean
) {
  const actions: Array<{
    key: string;
    label: string;
    icon: React.ElementType;
    variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'destructive';
    action:
      | 'view'
      | 'edit'
      | 'accept'
      | 'reject'
      | 'complete'
      | 'review'
      | 'custom';
  }> = [];

  // Common actions
  actions.push({
    key: 'view',
    label: compact ? 'Görüntüle' : 'Detayları Görüntüle',
    icon: Eye,
    variant: 'outline',
    action: 'view',
  });

  // Context-specific actions
  switch (contextType) {
    case 'ORDER':
      if (userRole === 'buyer') {
        actions.push({
          key: 'mark-complete',
          label: compact ? 'Tamamla' : 'Tamamlandı Olarak İşaretle',
          icon: CheckCircle,
          variant: 'success',
          action: 'complete',
        });
        actions.push({
          key: 'review',
          label: compact ? 'Değerlendir' : 'Değerlendirme Yap',
          icon: Star,
          variant: 'primary',
          action: 'review',
        });
      } else if (userRole === 'seller') {
        actions.push({
          key: 'deliver',
          label: compact ? 'Teslim Et' : 'Teslimatı Tamamla',
          icon: Package,
          variant: 'primary',
          action: 'custom',
        });
      }
      break;

    case 'PROPOSAL':
      if (userRole === 'employer') {
        actions.push({
          key: 'accept',
          label: compact ? 'Kabul Et' : 'Teklifi Kabul Et',
          icon: CheckCircle,
          variant: 'success',
          action: 'accept',
        });
        actions.push({
          key: 'reject',
          label: compact ? 'Reddet' : 'Teklifi Reddet',
          icon: XCircle,
          variant: 'destructive',
          action: 'reject',
        });
      } else if (userRole === 'freelancer') {
        actions.push({
          key: 'edit',
          label: compact ? 'Düzenle' : 'Teklifi Düzenle',
          icon: Edit,
          variant: 'outline',
          action: 'edit',
        });
      }
      break;

    case 'JOB':
      if (userRole === 'freelancer') {
        actions.push({
          key: 'apply',
          label: compact ? 'Başvur' : 'Tekli f Gönder',
          icon: FileText,
          variant: 'primary',
          action: 'custom',
        });
      } else if (userRole === 'employer') {
        actions.push({
          key: 'edit',
          label: compact ? 'Düzenle' : 'İlanı Düzenle',
          icon: Edit,
          variant: 'outline',
          action: 'edit',
        });
      }
      break;

    case 'PACKAGE':
      actions.push({
        key: 'order',
        label: compact ? 'Sipariş Ver' : 'Paketi Sipariş Et',
        icon: Package,
        variant: 'primary',
        action: 'custom',
      });
      break;
  }

  return actions;
}

/**
 * ContextQuickActions Component
 *
 * Quick action buttons for context-aware messaging.
 * Provides context-specific actions based on context type and user role.
 *
 * Features:
 * - Smart action buttons based on context (Order, Proposal, Job, Package)
 * - Role-based actions (buyer vs seller, employer vs freelancer)
 * - Compact mode for limited space
 * - Direct navigation to context
 * - Action handlers
 *
 * @example
 * ```tsx
 * // In order context (buyer view)
 * <ContextQuickActions
 *   context={{
 *     type: 'ORDER',
 *     id: 'order-123',
 *     title: 'Web Development',
 *   }}
 *   userRole="buyer"
 * />
 *
 * // Renders: [View Details] [Mark Complete] [Review]
 *
 * // In proposal context (employer view)
 * <ContextQuickActions
 *   context={{
 *     type: 'PROPOSAL',
 *     id: 'proposal-456',
 *     title: 'Mobile App Development',
 *   }}
 *   userRole="employer"
 *   compact={true}
 * />
 *
 * // Renders: [View] [Accept] [Reject]
 * ```
 */
export const ContextQuickActions = memo(function ContextQuickActions({
  context,
  userRole,
  compact = false,
  onAccept,
  onReject,
}: ContextQuickActionsProps) {
  const router = useRouter();
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const actions = getQuickActions(context.type, userRole, compact);

  const handleAccept = async () => {
    if (!onAccept) {
      // Fallback to navigation if no callback
      router.push(`${getContextPath(context.type, context.id)}?action=accept`);
      return;
    }

    try {
      setIsProcessing(true);
      await onAccept(context.id);
      toast.success('İşlem başarıyla kabul edildi');
      setIsAcceptModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Kabul işlemi başarısız oldu'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) {
      // Fallback to navigation if no callback
      router.push(`${getContextPath(context.type, context.id)}?action=reject`);
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('Lütfen reddetme sebebini belirtin');
      return;
    }

    try {
      setIsProcessing(true);
      await onReject(context.id, rejectReason);
      toast.success('İşlem başarıyla reddedildi');
      setIsRejectModalOpen(false);
      setRejectReason('');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Reddetme işlemi başarısız oldu'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = (actionType: string) => {
    const contextPath = getContextPath(context.type, context.id);

    switch (actionType) {
      case 'view':
        router.push(contextPath);
        break;
      case 'edit':
        router.push(`${contextPath}/edit`);
        break;
      case 'accept':
        // Open accept modal
        setIsAcceptModalOpen(true);
        break;
      case 'reject':
        // Open reject modal
        setIsRejectModalOpen(true);
        break;
      case 'complete':
        router.push(`${contextPath}?action=complete`);
        break;
      case 'review':
        router.push(`${contextPath}/review`);
        break;
      case 'custom':
        // Handle custom actions per context
        router.push(contextPath);
        break;
      default:
        router.push(contextPath);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <UnifiedButton
              key={action.key}
              variant={action.variant || 'outline'}
              size={compact ? 'sm' : 'md'}
              onClick={() => handleAction(action.action)}
              leftIcon={<Icon className="h-4 w-4" />}
            >
              {action.label}
            </UnifiedButton>
          );
        })}

        {/* External link to context */}
        <UnifiedButton
          variant="ghost"
          size={compact ? 'sm' : 'md'}
          onClick={() => router.push(getContextPath(context.type, context.id))}
          leftIcon={<ExternalLink className="h-4 w-4" />}
          aria-label="Yeni sekmede aç"
        >
          {compact ? '' : 'Detaylar'}
        </UnifiedButton>
      </div>

      {/* Accept Modal */}
      <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlemi Onayla</DialogTitle>
            <DialogDescription>
              {context.type === 'ORDER' ? 'Siparişi' : 'Teklifi'} kabul etmek
              istediğinize emin misiniz?
              <br />
              <strong className="mt-2 block">{context.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() => setIsAcceptModalOpen(false)}
              disabled={isProcessing}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? 'İşleniyor...' : 'Onayla'}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlemi Reddet</DialogTitle>
            <DialogDescription>
              {context.type === 'ORDER' ? 'Siparişi' : 'Teklifi'} reddetmek
              istediğinize emin misiniz?
              <br />
              <strong className="mt-2 block">{context.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <label
              htmlFor="reject-reason"
              className="mb-2 block text-sm font-medium"
            >
              Reddetme Sebebi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              rows={4}
              placeholder="Lütfen reddetme sebebinizi açıklayın..."
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
              }}
              disabled={isProcessing}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? 'İşleniyor...' : 'Reddet'}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
