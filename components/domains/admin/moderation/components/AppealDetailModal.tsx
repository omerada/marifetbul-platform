/**
 * Appeal Detail Modal Component
 *
 * Displays detailed information about a content appeal with action buttons.
 */

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { ContentAppeal, AppealAction } from '../types/appeal';
import {
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
  getReasonText,
  formatAppealDate,
  formatRelativeTime,
} from '../utils/appealHelpers';

interface AppealDetailModalProps {
  appeal: ContentAppeal | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (appealId: string, action: AppealAction) => Promise<boolean>;
  isSaving?: boolean;
}

export function AppealDetailModal({
  appeal,
  isOpen,
  onClose,
  onAction,
  isSaving = false,
}: AppealDetailModalProps) {
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'escalate' | null
  >(null);
  const [actionNotes, setActionNotes] = useState('');

  if (!appeal) return null;

  const StatusIcon = getStatusIcon(appeal.status);

  const handleAction = async () => {
    if (!actionType) return;

    const actionPayload: AppealAction = {
      action: actionType,
      adminNotes: actionNotes,
      reviewedBy: 'current-admin-id', // Gerçek uygulamada auth'tan gelecek
      reviewedAt: new Date().toISOString(),
    };

    const success = await onAction(appeal.id, actionPayload);
    if (success) {
      setActionType(null);
      setActionNotes('');
      onClose();
    }
  };

  const handleClose = () => {
    setActionType(null);
    setActionNotes('');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                İtiraz Detayları
              </h2>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Header Section */}
              <div className="border-b pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    #{appeal.appealNumber}
                  </span>
                  <div className="flex gap-2">
                    <Badge
                      className={`border ${getStatusColor(appeal.status)} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {appeal.status}
                    </Badge>
                    <Badge
                      className={`border ${getPriorityColor(appeal.priority)}`}
                    >
                      {appeal.priority}
                    </Badge>
                  </div>
                </div>

                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  {appeal.originalContent.title}
                </h2>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {appeal.userInfo.firstName} {appeal.userInfo.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatAppealDate(appeal.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(appeal.createdAt)}
                  </span>
                </div>
              </div>

              {/* Original Content Section */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5" />
                  Orijinal İçerik
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm text-gray-600">
                    <strong>Tür:</strong> {appeal.originalContent.type}
                  </p>
                  <p className="mb-2 text-sm text-gray-700">
                    {appeal.originalContent.description}
                  </p>
                  {appeal.originalContent.url && (
                    <a
                      href={appeal.originalContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      İçeriği Görüntüle <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Appeal Reason Section */}
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  İtiraz Nedeni
                </h3>
                <Badge className="mb-2">
                  {getReasonText(appeal.appealReason)}
                </Badge>
                <p className="text-sm text-gray-700">
                  {appeal.appealDescription}
                </p>
              </div>

              {/* User Justification */}
              {appeal.userJustification && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Kullanıcı Açıklaması
                  </h3>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-gray-700">
                      {appeal.userJustification}
                    </p>
                  </div>
                </div>
              )}

              {/* Supporting Evidence */}
              {appeal.supportingEvidence &&
                appeal.supportingEvidence.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Destekleyici Belgeler
                    </h3>
                    <div className="space-y-2">
                      {appeal.supportingEvidence.map((evidence) => (
                        <div key={evidence.id} className="rounded border p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {evidence.description}
                            </span>
                            <Badge>{evidence.type}</Badge>
                          </div>
                          <a
                            href={evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            Belgeyi İncele <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Review History */}
              {appeal.reviewHistory && appeal.reviewHistory.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    İnceleme Geçmişi
                  </h3>
                  <div className="space-y-2">
                    {appeal.reviewHistory.map((history) => (
                      <div key={history.id} className="rounded border p-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {history.reviewerName}
                          </span>
                          <span className="text-gray-500">
                            {formatAppealDate(history.reviewedAt)}
                          </span>
                        </div>
                        <Badge className="mb-2">{history.action}</Badge>
                        {history.notes && (
                          <p className="text-sm text-gray-700">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Section */}
              {appeal.status === 'pending' && (
                <div className="border-t pt-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    İşlem Yap
                  </h3>

                  {!actionType ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setActionType('approve')}
                        className="flex-1"
                        variant="success"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                      <Button
                        onClick={() => setActionType('reject')}
                        className="flex-1"
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                      <Button
                        onClick={() => setActionType('escalate')}
                        className="flex-1"
                        variant="warning"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Yükselt
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="action-notes">İşlem Notu</Label>
                        <Textarea
                          id="action-notes"
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder={`${actionType === 'approve' ? 'Onay' : actionType === 'reject' ? 'Red' : 'Yükseltme'} nedeninizi yazın...`}
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAction}
                          disabled={isSaving || !actionNotes.trim()}
                          className="flex-1"
                        >
                          {isSaving
                            ? 'İşleniyor...'
                            : `${actionType === 'approve' ? 'Onayla' : actionType === 'reject' ? 'Reddet' : 'Yükselt'}`}
                        </Button>
                        <Button
                          onClick={() => {
                            setActionType(null);
                            setActionNotes('');
                          }}
                          variant="outline"
                          disabled={isSaving}
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
