/**
 * ModerationActionDialog Component
 *
 * Dialog for confirming moderation actions
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import type { ModerationActionDialogProps } from '../types/moderationTypes';

export function ModerationActionDialog({
  open,
  actionType,
  actionNotes,
  onNotesChange,
  onConfirm,
  onCancel,
}: ModerationActionDialogProps) {
  const titles = {
    approve: 'İçeriği Onayla',
    reject: 'İçeriği Reddet',
    escalate: 'İçeriği Escalate Et',
  };

  const buttons = {
    approve: 'Onayla',
    reject: 'Reddet',
    escalate: 'Escalate Et',
  };

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType ? titles[actionType] : 'İşlem'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <label className="text-sm font-medium text-gray-700">
            Notlar (Opsiyonel)
          </label>
          <textarea
            value={actionNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            rows={3}
            placeholder="İşlem için not ekleyin..."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {actionType ? buttons[actionType] : 'Onayla'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
