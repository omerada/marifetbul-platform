/**
 * ================================================
 * USER MODERATION PANEL
 * ================================================
 * Main panel for user warning and suspension management
 *
 * Features:
 * - User search and selection
 * - Active warnings/suspensions display
 * - Issue warning/suspension actions
 * - Moderation history timeline
 *
 * Sprint: Moderator Reporting & Actions
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 */

'use client';

import { useState, useCallback } from 'react';
import { Search, AlertTriangle, Ban, History, UserX } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useUserModeration } from '@/hooks/business/useUserModeration';
import { UserWarningModal } from './UserWarningModal';
import { UserSuspensionModal } from './UserSuspensionModal';
import { UserModerationHistory } from './UserModerationHistory';
import { logger } from '@/lib/shared/utils/logger';
import type { UserWarning, UserSuspension } from '@/lib/api/moderation';

/**
 * User Moderation Panel Component
 */
export function UserModerationPanel() {
  // State
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeWarnings, setActiveWarnings] = useState<UserWarning[]>([]);
  const [activeSuspension, setActiveSuspension] =
    useState<UserSuspension | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Hooks
  const {
    isLoading,
    fetchActiveWarnings,
    checkSuspensionStatus,
    unsuspendUser,
    revokeUserWarning,
  } = useUserModeration();

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle user search
   */
  const handleSearchUser = useCallback(async () => {
    if (!searchUserId.trim()) {
      return;
    }

    logger.debug('Searching user for moderation', { userId: searchUserId });
    setSelectedUserId(searchUserId);

    // Fetch user's active warnings
    const warnings = await fetchActiveWarnings(searchUserId);
    setActiveWarnings(warnings);

    // Fetch suspension status
    const suspension = await checkSuspensionStatus(searchUserId);
    setActiveSuspension(suspension);

    logger.info('User moderation data loaded', {
      userId: searchUserId,
      warningsCount: warnings.length,
      isSuspended: !!suspension,
    });
  }, [searchUserId, fetchActiveWarnings, checkSuspensionStatus]);

  /**
   * Handle warning issued
   */
  const handleWarningIssued = useCallback(async () => {
    setShowWarningModal(false);
    if (selectedUserId) {
      // Refresh data
      const warnings = await fetchActiveWarnings(selectedUserId);
      setActiveWarnings(warnings);

      // Check if auto-suspended
      const suspension = await checkSuspensionStatus(selectedUserId);
      setActiveSuspension(suspension);
    }
  }, [selectedUserId, fetchActiveWarnings, checkSuspensionStatus]);

  /**
   * Handle suspension issued
   */
  const handleSuspensionIssued = useCallback(async () => {
    setShowSuspensionModal(false);
    if (selectedUserId) {
      // Refresh suspension status
      const suspension = await checkSuspensionStatus(selectedUserId);
      setActiveSuspension(suspension);
    }
  }, [selectedUserId, checkSuspensionStatus]);

  /**
   * Handle unsuspend user
   */
  const handleUnsuspend = useCallback(async () => {
    if (!activeSuspension) return;

    const reason = prompt('Askıyı kaldırma nedeni:');
    if (!reason) return;

    const success = await unsuspendUser(activeSuspension.id, reason);
    if (success && selectedUserId) {
      // Refresh data
      const suspension = await checkSuspensionStatus(selectedUserId);
      setActiveSuspension(suspension);
    }
  }, [activeSuspension, selectedUserId, unsuspendUser, checkSuspensionStatus]);

  /**
   * Handle revoke warning
   */
  const handleRevokeWarning = useCallback(
    async (warningId: string) => {
      const reason = prompt('Uyarıyı iptal etme nedeni:');
      if (!reason) return;

      const success = await revokeUserWarning(warningId, reason);
      if (success && selectedUserId) {
        // Refresh warnings
        const warnings = await fetchActiveWarnings(selectedUserId);
        setActiveWarnings(warnings);
      }
    },
    [selectedUserId, revokeUserWarning, fetchActiveWarnings]
  );

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  /**
   * Render warning level badge
   */
  const renderWarningLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      LEVEL_1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LEVEL_2: 'bg-orange-100 text-orange-800 border-orange-300',
      LEVEL_3: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels: Record<string, string> = {
      LEVEL_1: 'Seviye 1',
      LEVEL_2: 'Seviye 2',
      LEVEL_3: 'Seviye 3 (Kritik)',
    };

    return (
      <Badge className={`${colors[level]} border`} variant="outline">
        {labels[level] || level}
      </Badge>
    );
  };

  /**
   * Render suspension type badge
   */
  const renderSuspensionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      TEMPORARY: 'bg-orange-100 text-orange-800 border-orange-300',
      PERMANENT: 'bg-red-100 text-red-800 border-red-300',
      SELLER_RESTRICTED: 'bg-purple-100 text-purple-800 border-purple-300',
      BUYER_RESTRICTED: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    return (
      <Badge className={`${colors[type]} border`} variant="outline">
        {type === 'PERMANENT'
          ? 'Kalıcı'
          : type === 'TEMPORARY'
            ? 'Geçici'
            : type}
      </Badge>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Kullanıcı Ara
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Moderasyon işlemi yapmak için kullanıcı ID&apos;si girin
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Kullanıcı ID (UUID)"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              className="flex-1"
            />
            <UnifiedButton
              onClick={handleSearchUser}
              disabled={isLoading || !searchUserId.trim()}
            >
              <Search className="mr-2 h-4 w-4" />
              Ara
            </UnifiedButton>
          </div>
        </CardContent>
      </Card>

      {/* User Moderation Info */}
      {selectedUserId && (
        <>
          {/* Active Suspension */}
          {activeSuspension && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Ban className="h-5 w-5" />
                  Aktif Askıya Alma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="mb-4 text-sm text-red-700">
                  Bu kullanıcı şu anda askıya alınmış durumda
                </p>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Tip:</span>
                      {renderSuspensionTypeBadge(
                        activeSuspension.suspensionType
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Neden:</span>{' '}
                      {activeSuspension.reasonDescription}
                    </div>
                    <div>
                      <span className="font-semibold">Detay:</span>{' '}
                      {activeSuspension.details}
                    </div>
                    {activeSuspension.expiresAt && (
                      <div>
                        <span className="font-semibold">Bitiş:</span>{' '}
                        {new Date(activeSuspension.expiresAt).toLocaleString(
                          'tr-TR'
                        )}
                      </div>
                    )}
                  </div>
                  <UnifiedButton
                    variant="outline"
                    onClick={handleUnsuspend}
                    disabled={isLoading}
                  >
                    Askıyı Kaldır
                  </UnifiedButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Warnings */}
          {activeWarnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Aktif Uyarılar ({activeWarnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="mb-3 text-sm text-gray-600">
                  Süresiz olmayan veya iptal edilmemiş uyarılar
                </p>
                {activeWarnings.map((warning) => (
                  <div
                    key={warning.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderWarningLevelBadge(warning.warningLevel)}
                        <span className="text-sm text-gray-500">
                          {new Date(warning.createdAt).toLocaleDateString(
                            'tr-TR'
                          )}
                        </span>
                      </div>
                      <div className="font-medium">
                        {warning.reasonDescription}
                      </div>
                      <div className="text-sm text-gray-600">
                        {warning.details}
                      </div>
                      {warning.expiresAt && (
                        <div className="text-xs text-gray-500">
                          Süre sonu:{' '}
                          {new Date(warning.expiresAt).toLocaleDateString(
                            'tr-TR'
                          )}
                        </div>
                      )}
                    </div>
                    <UnifiedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeWarning(warning.id)}
                      disabled={isLoading}
                    >
                      İptal Et
                    </UnifiedButton>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No Active Issues */}
          {!activeSuspension && activeWarnings.length === 0 && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="py-6 text-center">
                <p className="text-green-800">
                  ✓ Bu kullanıcının aktif uyarısı veya askıya alınması
                  bulunmuyor
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <UnifiedButton
              onClick={() => setShowWarningModal(true)}
              disabled={isLoading || !!activeSuspension}
              className="flex-1"
              variant="outline"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Uyarı Ver
            </UnifiedButton>
            <UnifiedButton
              onClick={() => setShowSuspensionModal(true)}
              disabled={isLoading || !!activeSuspension}
              className="flex-1"
              variant="destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Askıya Al
            </UnifiedButton>
            <UnifiedButton
              onClick={() => setShowHistory(true)}
              disabled={isLoading}
              className="flex-1"
              variant="secondary"
            >
              <History className="mr-2 h-4 w-4" />
              Geçmiş
            </UnifiedButton>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedUserId && (
        <Card>
          <CardContent className="py-12 text-center">
            <UserX className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">
              Moderasyon işlemi yapmak için yukarıdan kullanıcı arayın
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedUserId && (
        <>
          <UserWarningModal
            open={showWarningModal}
            onClose={() => setShowWarningModal(false)}
            userId={selectedUserId}
            onSuccess={handleWarningIssued}
            currentWarningsCount={activeWarnings.length}
          />
          <UserSuspensionModal
            open={showSuspensionModal}
            onClose={() => setShowSuspensionModal(false)}
            userId={selectedUserId}
            onSuccess={handleSuspensionIssued}
          />
          <UserModerationHistory
            open={showHistory}
            onClose={() => setShowHistory(false)}
            userId={selectedUserId}
          />
        </>
      )}
    </div>
  );
}

export default UserModerationPanel;
