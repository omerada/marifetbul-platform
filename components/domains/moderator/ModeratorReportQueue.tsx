'use client';

/**
 * ================================================
 * MODERATOR REPORT QUEUE COMPONENT
 * ================================================
 * Dedicated component for moderator report management
 *
 * Features:
 * - Display pending/investigating reports
 * - Assign to self, investigate, resolve, dismiss
 * - Escalate to admin
 * - Priority and type filtering
 * - Bulk actions (dismiss, escalate)
 * - Real-time stats cards
 *
 * Sprint 1 - Story 1.3: Reports Dashboard
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Flag,
  User,
  MessageSquare,
  Package,
  FileText,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  Card,
  Badge,
  UnifiedButton,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui';
import {
  useReportModeration,
  ReportAction,
  ReportStatus,
  ReportType,
  ReportPriority,
  Report,
} from '@/hooks/business/moderation/useReportModeration';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

type FilterTab = 'pending' | 'investigating' | 'highPriority' | 'all';

interface ResolveModalState {
  isOpen: boolean;
  reportId: string | null;
  action: ReportAction;
  notes: string;
}

interface DismissModalState {
  isOpen: boolean;
  reportId: string | null;
  reason: string;
}

interface EscalateModalState {
  isOpen: boolean;
  reportId: string | null;
  reason: string;
  isBulk?: boolean;
  toAdmin?: boolean; // Sprint 1 - Story 1.1: Distinguish admin escalation
}

interface DetailModalState {
  isOpen: boolean;
  report: Report | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorReportQueue() {
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');
  const [resolveModal, setResolveModal] = useState<ResolveModalState>({
    isOpen: false,
    reportId: null,
    action: 'NO_ACTION',
    notes: '',
  });
  const [dismissModal, setDismissModal] = useState<DismissModalState>({
    isOpen: false,
    reportId: null,
    reason: '',
  });
  const [escalateModal, setEscalateModal] = useState<EscalateModalState>({
    isOpen: false,
    reportId: null,
    reason: '',
    isBulk: false,
  });
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    isOpen: false,
    report: null,
  });

  // Get filter based on active tab
  const getFilters = () => {
    switch (activeTab) {
      case 'pending':
        return { status: 'PENDING' as ReportStatus };
      case 'investigating':
        return { status: 'INVESTIGATING' as ReportStatus };
      case 'highPriority':
        return { priority: 'HIGH' as ReportPriority };
      default:
        return {};
    }
  };

  const {
    reports,
    stats,
    pagination,
    isLoading,
    isProcessing,
    selectedReports,
    assignToMe,
    investigate,
    resolve,
    dismiss,
    escalate,
    escalateToAdmin, // Sprint 1 - Story 1.1
    bulkDismiss,
    bulkEscalate,
    bulkEscalateToAdmin, // Sprint 1 - Story 1.1
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    currentPage,
    nextPage,
    previousPage,
  } = useReportModeration({
    filters: getFilters(),
    pageSize: 20,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAssignToMe = async (reportId: string) => {
    const success = await assignToMe(reportId);
    if (success) {
      logger.info('Report assigned to me', { reportId });
    }
  };

  const handleInvestigate = async (reportId: string) => {
    const success = await investigate(reportId);
    if (success) {
      logger.info('Investigation started', { reportId });
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolveModal.reportId) return;

    const success = await resolve(
      resolveModal.reportId,
      resolveModal.action,
      resolveModal.notes
    );
    if (success) {
      setResolveModal({
        isOpen: false,
        reportId: null,
        action: 'NO_ACTION',
        notes: '',
      });
    }
  };

  const handleDismissSubmit = async () => {
    if (!dismissModal.reportId) return;

    const success = await dismiss(dismissModal.reportId, dismissModal.reason);
    if (success) {
      setDismissModal({ isOpen: false, reportId: null, reason: '' });
    }
  };

  const handleEscalateSubmit = async () => {
    if (!escalateModal.reason || escalateModal.reason.length < 10) {
      toast.error('Yükseltme nedeni en az 10 karakter olmalıdır');
      return;
    }

    let success = false;

    // Sprint 1 - Story 1.1: Handle admin escalation separately
    if (escalateModal.toAdmin) {
      if (escalateModal.isBulk) {
        success = await bulkEscalateToAdmin(
          selectedReports,
          escalateModal.reason
        );
      } else if (escalateModal.reportId) {
        success = await escalateToAdmin(
          escalateModal.reportId,
          escalateModal.reason
        );
      }
    } else {
      // Priority escalation (existing)
      if (escalateModal.isBulk) {
        success = await bulkEscalate(selectedReports);
      } else if (escalateModal.reportId) {
        success = await escalate(escalateModal.reportId, escalateModal.reason);
      }
    }

    if (success) {
      setEscalateModal({
        isOpen: false,
        reportId: null,
        reason: '',
        isBulk: false,
        toAdmin: false,
      });
    }
  };

  const handleBulkDismiss = async () => {
    if (selectedReports.length === 0) return;

    const reason = prompt('Red nedeni girin (en az 10 karakter):');
    if (!reason || reason.length < 10) return;

    await bulkDismiss(selectedReports, reason);
  };

  const handleBulkEscalate = async () => {
    if (selectedReports.length === 0) {
      toast.error('Lütfen en az bir rapor seçin');
      return;
    }

    setEscalateModal({
      isOpen: true,
      reportId: null,
      reason: '',
      isBulk: true,
      toAdmin: false,
    });
  };

  /**
   * Sprint 1 - Story 1.1: Escalate to admin handler
   */
  const handleEscalateToAdmin = async (reportId: string, isBulk = false) => {
    setEscalateModal({
      isOpen: true,
      reportId: isBulk ? null : reportId,
      reason: '',
      isBulk,
      toAdmin: true,
    });
  };

  const handleBulkEscalateToAdmin = async () => {
    if (selectedReports.length === 0) {
      toast.error('Lütfen en az bir rapor seçin');
      return;
    }

    handleEscalateToAdmin('', true);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'USER':
        return <User className="h-4 w-4" />;
      case 'REVIEW':
        return <MessageSquare className="h-4 w-4" />;
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4" />;
      case 'PACKAGE':
        return <Package className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: ReportType) => {
    const labels: Record<ReportType, string> = {
      USER: 'Kullanıcı',
      CONTENT: 'İçerik',
      REVIEW: 'Değerlendirme',
      COMMENT: 'Yorum',
      PACKAGE: 'Paket',
      OTHER: 'Diğer',
    };
    return labels[type];
  };

  const getTypeColor = (type: ReportType) => {
    const colors: Record<ReportType, string> = {
      USER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      CONTENT:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      REVIEW:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      COMMENT:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PACKAGE:
        'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[type];
  };

  const getPriorityLabel = (priority: ReportPriority) => {
    const labels: Record<ReportPriority, string> = {
      LOW: 'Düşük',
      NORMAL: 'Normal',
      HIGH: 'Yüksek',
      URGENT: 'Acil',
    };
    return labels[priority];
  };

  const getPriorityColor = (priority: ReportPriority) => {
    const colors: Record<ReportPriority, string> = {
      LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      NORMAL:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority];
  };

  const getStatusLabel = (status: ReportStatus) => {
    const labels: Record<ReportStatus, string> = {
      PENDING: 'Bekliyor',
      INVESTIGATING: 'İnceleniyor',
      RESOLVED: 'Çözüldü',
      DISMISSED: 'Reddedildi',
      ESCALATED: 'Yükseltildi',
    };
    return labels[status];
  };

  const getStatusColor = (status: ReportStatus) => {
    const colors: Record<ReportStatus, string> = {
      PENDING:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      INVESTIGATING:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      RESOLVED:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      DISMISSED:
        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      ESCALATED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status];
  };

  const getActionLabel = (action: ReportAction) => {
    const labels: Record<ReportAction, string> = {
      WARN: 'Uyar',
      SUSPEND: 'Askıya Al',
      BAN: 'Yasakla',
      REMOVE_CONTENT: 'İçeriği Kaldır',
      EDIT_CONTENT: 'İçeriği Düzenle',
      NO_ACTION: 'İşlem Yok',
    };
    return labels[action];
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Bekleyen</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">İnceleniyor</p>
                <p className="text-2xl font-bold">{stats.investigating}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Çözüldü</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Acil</p>
                <p className="text-2xl font-bold">{stats.byPriority.urgent}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <UnifiedButton
            variant={activeTab === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pending')}
          >
            Bekleyen
          </UnifiedButton>
          <UnifiedButton
            variant={activeTab === 'investigating' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('investigating')}
          >
            İnceleniyor
          </UnifiedButton>
          <UnifiedButton
            variant={activeTab === 'highPriority' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('highPriority')}
          >
            Yüksek Öncelik
          </UnifiedButton>
          <UnifiedButton
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            Tümü
          </UnifiedButton>
        </div>

        {selectedReports.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {selectedReports.length} seçili
            </span>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleBulkDismiss}
              disabled={isProcessing}
            >
              Toplu Reddet
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleBulkEscalate}
              disabled={isProcessing}
            >
              Toplu Yükselt
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleBulkEscalateToAdmin}
              disabled={isProcessing}
            >
              <Shield className="mr-1 h-4 w-4" />
              Admin&apos;e Yükselt
            </UnifiedButton>
            <UnifiedButton variant="ghost" size="sm" onClick={clearSelection}>
              Temizle
            </UnifiedButton>
          </div>
        )}
      </div>

      {/* Select All */}
      {reports.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={
              reports.length > 0 && selectedReports.length === reports.length
            }
            onChange={(e) => {
              if (e.target.checked) selectAll();
              else clearSelection();
            }}
          />
          <span className="text-muted-foreground text-sm">Tümünü Seç</span>
        </div>
      )}

      {/* Report List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-12">
          <div className="text-muted-foreground text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Rapor bulunamadı</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className={cn(
                'p-4 transition-all',
                isSelected(report.id) && 'ring-primary ring-2'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={isSelected(report.id)}
                  onChange={() => toggleSelection(report.id)}
                />

                {/* Type Icon */}
                <div
                  className={cn(
                    'rounded-lg p-2',
                    getTypeColor(report.reportType)
                  )}
                >
                  {getTypeIcon(report.reportType)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 font-medium">{report.reason}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {report.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getPriorityColor(report.priority)}>
                        {getPriorityLabel(report.priority)}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-muted-foreground mb-3 flex items-center gap-4 text-xs">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded px-2 py-1',
                        getTypeColor(report.reportType)
                      )}
                    >
                      {getTypeIcon(report.reportType)}
                      {getTypeLabel(report.reportType)}
                    </span>
                    <span>
                      Rapor Eden:{' '}
                      {report.reporterUsername ||
                        report.reporterEmail ||
                        'Bilinmiyor'}
                    </span>
                    <span>
                      {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {report.assignedModeratorUsername && (
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {report.assignedModeratorUsername}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {report.status === 'PENDING' &&
                      !report.assignedModeratorId && (
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignToMe(report.id)}
                          disabled={isProcessing}
                        >
                          Bana Ata
                        </UnifiedButton>
                      )}
                    {report.status === 'PENDING' &&
                      report.assignedModeratorId && (
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvestigate(report.id)}
                          disabled={isProcessing}
                        >
                          İncele
                        </UnifiedButton>
                      )}
                    {(report.status === 'PENDING' ||
                      report.status === 'INVESTIGATING') && (
                      <>
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResolveModal({
                              isOpen: true,
                              reportId: report.id,
                              action: 'NO_ACTION',
                              notes: '',
                            })
                          }
                          disabled={isProcessing}
                        >
                          Çöz
                        </UnifiedButton>
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDismissModal({
                              isOpen: true,
                              reportId: report.id,
                              reason: '',
                            })
                          }
                          disabled={isProcessing}
                        >
                          Reddet
                        </UnifiedButton>
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEscalateModal({
                              isOpen: true,
                              reportId: report.id,
                              reason: '',
                              isBulk: false,
                              toAdmin: false,
                            })
                          }
                          disabled={isProcessing}
                        >
                          <TrendingUp className="mr-1 h-4 w-4" />
                          Yükselt
                        </UnifiedButton>
                        <UnifiedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalateToAdmin(report.id)}
                          disabled={isProcessing}
                        >
                          <Shield className="mr-1 h-4 w-4" />
                          Admin&apos;e
                        </UnifiedButton>
                      </>
                    )}
                    <UnifiedButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailModal({ isOpen: true, report })}
                    >
                      Detay
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </UnifiedButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Sayfa {currentPage + 1} / {pagination.totalPages} (
            {pagination.totalElements} rapor)
          </div>
          <div className="flex gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 0 || isLoading}
            >
              Önceki
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= pagination.totalPages - 1 || isLoading}
            >
              Sonraki
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      <Dialog
        open={resolveModal.isOpen}
        onOpenChange={(open) =>
          !open && setResolveModal({ ...resolveModal, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raporu Çöz</DialogTitle>
            <DialogDescription>
              Alınan aksiyonu seçin ve detaylı notlar ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Alınan Aksiyon
              </label>
              <Select
                value={resolveModal.action}
                onValueChange={(value) =>
                  setResolveModal({
                    ...resolveModal,
                    action: value as ReportAction,
                  })
                }
              >
                <SelectTrigger placeholder="Aksiyon Seç" />
                <SelectContent>
                  <SelectItem value="NO_ACTION">İşlem Yok</SelectItem>
                  <SelectItem value="WARN">Uyar</SelectItem>
                  <SelectItem value="SUSPEND">Askıya Al</SelectItem>
                  <SelectItem value="BAN">Yasakla</SelectItem>
                  <SelectItem value="REMOVE_CONTENT">İçeriği Kaldır</SelectItem>
                  <SelectItem value="EDIT_CONTENT">İçeriği Düzenle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Moderatör Notları
              </label>
              <Textarea
                value={resolveModal.notes}
                onChange={(e) =>
                  setResolveModal({ ...resolveModal, notes: e.target.value })
                }
                placeholder="Rapor hakkında detaylı notlar girin (en az 10 karakter)..."
                rows={4}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {resolveModal.notes.length} / 10 karakter minimum
              </p>
            </div>
          </div>
          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() =>
                setResolveModal({ ...resolveModal, isOpen: false })
              }
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              onClick={handleResolveSubmit}
              disabled={resolveModal.notes.length < 10 || isProcessing}
            >
              Çöz
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dismiss Modal */}
      <Dialog
        open={dismissModal.isOpen}
        onOpenChange={(open) =>
          !open && setDismissModal({ ...dismissModal, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raporu Reddet</DialogTitle>
            <DialogDescription>
              Red nedenini açıklayın. Bu bilgi rapora kayıt edilecektir.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              value={dismissModal.reason}
              onChange={(e) =>
                setDismissModal({ ...dismissModal, reason: e.target.value })
              }
              placeholder="Red nedeni (en az 10 karakter)..."
              rows={4}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {dismissModal.reason.length} / 10 karakter minimum
            </p>
          </div>
          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() =>
                setDismissModal({ ...dismissModal, isOpen: false })
              }
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              onClick={handleDismissSubmit}
              disabled={dismissModal.reason.length < 10 || isProcessing}
              variant="destructive"
            >
              Reddet
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Modal */}
      <Dialog
        open={escalateModal.isOpen}
        onOpenChange={(open) =>
          !open &&
          setEscalateModal({
            isOpen: false,
            reportId: null,
            reason: '',
            isBulk: false,
            toAdmin: false,
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {escalateModal.toAdmin
                ? escalateModal.isBulk
                  ? 'Toplu Admin Yükseltme'
                  : 'Admin İncelemesine Yükselt'
                : escalateModal.isBulk
                  ? 'Toplu Öncelik Yükseltme'
                  : 'Öncelik Yükselt'}
            </DialogTitle>
            <DialogDescription>
              {escalateModal.toAdmin
                ? escalateModal.isBulk
                  ? `${selectedReports.length} rapor admin incelemesi için yükseltilecektir. Detaylı nedeni açıklayın.`
                  : 'Bu rapor admin seviyesinde inceleme için yükseltilecektir. Detaylı nedeni açıklayın.'
                : escalateModal.isBulk
                  ? `${selectedReports.length} rapor öncelik seviyesi artırılacaktır.`
                  : 'Bu rapor öncelik seviyesi artırılacaktır.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {escalateModal.toAdmin
                  ? 'Yükseltme Nedeni'
                  : 'Notlar (opsiyonel)'}
              </label>
              <Textarea
                value={escalateModal.reason}
                onChange={(e) =>
                  setEscalateModal({ ...escalateModal, reason: e.target.value })
                }
                placeholder={
                  escalateModal.toAdmin
                    ? 'Admin yükseltme nedenini detaylıca açıklayın (en az 10 karakter)...'
                    : 'Öncelik artırma nedenini açıklayın...'
                }
                rows={4}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {escalateModal.reason.length} /{' '}
                {escalateModal.toAdmin ? '10 karakter minimum' : 'karakter'}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Not:</strong>{' '}
                {escalateModal.toAdmin
                  ? 'Yükseltilen raporlar ESCALATED durumuna geçirilerek admin kuyruğuna taşınacaktır.'
                  : 'Yükseltilen raporlar bir üst öncelik seviyesine çıkarılacaktır.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() =>
                setEscalateModal({
                  isOpen: false,
                  reportId: null,
                  reason: '',
                  isBulk: false,
                  toAdmin: false,
                })
              }
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              onClick={handleEscalateSubmit}
              disabled={
                (escalateModal.toAdmin && escalateModal.reason.length < 10) ||
                isProcessing
              }
            >
              {escalateModal.toAdmin ? (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {escalateModal.isBulk
                    ? `${selectedReports.length} Raporu Admin'e Yükselt`
                    : "Admin'e Yükselt"}
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {escalateModal.isBulk
                    ? `${selectedReports.length} Raporu Yükselt`
                    : 'Yükselt'}
                </>
              )}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog
        open={detailModal.isOpen}
        onOpenChange={(open) =>
          !open && setDetailModal({ isOpen: false, report: null })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapor Detayı</DialogTitle>
          </DialogHeader>
          {detailModal.report && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Durum
                  </p>
                  <Badge className={getStatusColor(detailModal.report.status)}>
                    {getStatusLabel(detailModal.report.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Öncelik
                  </p>
                  <Badge
                    className={getPriorityColor(detailModal.report.priority)}
                  >
                    {getPriorityLabel(detailModal.report.priority)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tip
                  </p>
                  <Badge
                    className={getTypeColor(detailModal.report.reportType)}
                  >
                    {getTypeLabel(detailModal.report.reportType)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Tarih
                  </p>
                  <p className="text-sm">
                    {new Date(detailModal.report.createdAt).toLocaleString(
                      'tr-TR'
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Neden
                </p>
                <p className="text-sm">{detailModal.report.reason}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Açıklama
                </p>
                <p className="text-sm">{detailModal.report.description}</p>
              </div>

              {detailModal.report.entityDescription && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Varlık Açıklaması
                  </p>
                  <p className="text-sm">
                    {detailModal.report.entityDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Rapor Eden
                  </p>
                  <p className="text-sm">
                    {detailModal.report.reporterUsername ||
                      detailModal.report.reporterEmail}
                  </p>
                </div>
                {detailModal.report.assignedModeratorUsername && (
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Atanan Moderatör
                    </p>
                    <p className="text-sm">
                      {detailModal.report.assignedModeratorUsername}
                    </p>
                  </div>
                )}
              </div>

              {detailModal.report.moderatorNotes && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Moderatör Notları
                  </p>
                  <p className="bg-muted rounded p-3 text-sm">
                    {detailModal.report.moderatorNotes}
                  </p>
                </div>
              )}

              {detailModal.report.actionTaken && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    Alınan Aksiyon
                  </p>
                  <Badge>
                    {getActionLabel(detailModal.report.actionTaken)}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
