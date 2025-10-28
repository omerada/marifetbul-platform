/**
 * ================================================
 * REVIEW MODERATION ACTIONS COMPONENT
 * ================================================
 * Enhanced moderation action buttons with email notification option
 * Used in moderation dialogs to confirm actions and send notifications
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 2.2: Admin Review Actions
 */

'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Mail, MailCheck } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

export interface ReviewModerationActionsProps {
  action: 'approve' | 'reject';
  onConfirm: (sendEmail: boolean) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showEmailOption?: boolean;
  className?: string;
}

export function ReviewModerationActions({
  action,
  onConfirm,
  onCancel,
  isLoading = false,
  showEmailOption = true,
  className,
}: ReviewModerationActionsProps) {
  const [sendEmail, setSendEmail] = useState(true);

  const actionConfig = {
    approve: {
      icon: CheckCircle,
      label: 'Onayla',
      variant: 'success' as const,
      emailLabel: 'Kullanıcıya onay bildirimi gönder',
    },
    reject: {
      icon: XCircle,
      label: 'Reddet',
      variant: 'destructive' as const,
      emailLabel: 'Kullanıcıya red bildirimi gönder',
    },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Email Notification Option */}
      {showEmailOption && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="send-email"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="send-email"
                className="flex cursor-pointer items-center gap-2 font-medium text-blue-900"
              >
                {sendEmail ? (
                  <MailCheck className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {config.emailLabel}
              </label>
              <p className="mt-1 text-sm text-blue-700">
                {action === 'approve'
                  ? 'Değerlendirmenin onaylandığı bilgisi email ile iletilecektir.'
                  : 'Değerlendirmenin reddedilme sebebi email ile iletilecektir.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          İptal
        </Button>
        <Button
          variant={config.variant}
          onClick={() => onConfirm(sendEmail)}
          disabled={isLoading}
          className="flex-1 gap-2"
        >
          <Icon className="h-4 w-4" />
          {config.label}
        </Button>
      </div>
    </div>
  );
}
