/**
 * ============================================================================
 * SESSION MANAGER COMPONENT - Active Sessions Management UI
 * ============================================================================
 * Component for viewing and managing active user sessions (devices)
 *
 * Features:
 * - List all active sessions with device info
 * - Show current session badge
 * - Device icons and location
 * - Revoke individual sessions
 * - Revoke all other sessions
 * - Password confirmation modal
 * - Real-time activity timestamps
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 2
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Monitor,
  Smartphone,
  Tablet,
  HelpCircle,
  MapPin,
  Clock,
  LogOut,
  Shield,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useSessions } from '@/hooks/business/useSessions';
import {
  formatDeviceName,
  formatLocation,
  getTimeSinceActivity,
  type SessionInfo,
} from '@/lib/api/sessions';

// ============================================================================
// TYPES
// ============================================================================

interface SessionManagerProps {
  /** Show as full page or embedded card */
  variant?: 'full' | 'card';
  /** Callback when sessions are updated */
  onSessionsUpdated?: (count: number) => void;
}

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
  title: string;
  description: string;
  actionLabel: string;
}

// ============================================================================
// PASSWORD CONFIRMATION MODAL
// ============================================================================

function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel,
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Şifre gerekli');
      return;
    }

    setIsLoading(true);

    const success = await onConfirm(password);

    setIsLoading(false);

    if (success) {
      setPassword('');
      onClose();
    } else {
      setError('Geçersiz şifre');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Şifreniz
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'İşleniyor...' : actionLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ============================================================================
// SESSION CARD
// ============================================================================

interface SessionCardProps {
  session: SessionInfo;
  onRevoke: () => void;
  isRevoking: boolean;
}

function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const getDeviceIcon = () => {
    const iconClass = 'h-5 w-5';

    switch (session.deviceType) {
      case 'desktop':
        return <Monitor className={iconClass} />;
      case 'mobile':
        return <Smartphone className={iconClass} />;
      case 'tablet':
        return <Tablet className={iconClass} />;
      default:
        return <HelpCircle className={iconClass} />;
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        session.isCurrent
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex space-x-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              session.isCurrent
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {getDeviceIcon()}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">
                {formatDeviceName(session)}
              </p>
              {session.isCurrent && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Bu Cihaz
                </span>
              )}
            </div>

            <div className="mt-1 space-y-1 text-xs text-gray-500">
              <div className="flex items-center">
                <MapPin className="mr-1 h-3 w-3" />
                {formatLocation(session)} • {session.ipAddress}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Son Etkinlik: {getTimeSinceActivity(session.lastActivityAt)}
              </div>
            </div>
          </div>
        </div>

        {!session.isCurrent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            disabled={isRevoking}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-1 h-4 w-4" />
            {isRevoking ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SESSION MANAGER COMPONENT
// ============================================================================

export function SessionManager({
  variant = 'full',
  onSessionsUpdated,
}: SessionManagerProps) {
  const {
    sessions,
    isLoading,
    fetchSessions,
    revokeSession,
    revokeAllSessions,
    currentSession,
    otherSessions,
    sessionCount,
  } = useSessions();

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Notify parent of session count changes
  useEffect(() => {
    if (sessions && onSessionsUpdated) {
      onSessionsUpdated(sessionCount);
    }
  }, [sessionCount, sessions, onSessionsUpdated]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRevokeSession = async (sessionId: string, password: string) => {
    setRevokingSessionId(sessionId);
    const success = await revokeSession(sessionId, password);
    setRevokingSessionId(null);
    return success;
  };

  const handleRevokeAll = async (password: string) => {
    return await revokeAllSessions(password);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const content = (
    <div className="space-y-4">
      {/* Stats */}
      {sessions && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Aktif Oturum Sayısı
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {sessionCount}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !sessions && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
            <p className="text-sm text-gray-600">Oturumlar yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sessions && sessions.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aktif oturum bulunamadı
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Şu anda hiç aktif oturum yok
          </p>
        </div>
      )}

      {/* Sessions list */}
      {sessions && sessions.length > 0 && (
        <div className="space-y-4">
          {/* Current session */}
          {currentSession && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Mevcut Oturum
              </h3>
              <SessionCard
                session={currentSession}
                onRevoke={() => {}}
                isRevoking={false}
              />
            </div>
          )}

          {/* Other sessions */}
          {otherSessions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  Diğer Oturumlar ({otherSessions.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeAllModal(true)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Tümünü Sonlandır
                </Button>
              </div>

              <div className="space-y-2">
                {otherSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onRevoke={() => {
                      setRevokingSessionId(session.id);
                      setShowRevokeModal(true);
                    }}
                    isRevoking={revokingSessionId === session.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-600">
          💡 Tanımadığınız bir cihaz görüyorsanız, hemen çıkış yapın ve
          şifrenizi değiştirin. Güvenliğiniz için tüm oturumları düzenli olarak
          kontrol edin.
        </p>
      </div>

      {/* Modals */}
      <PasswordConfirmModal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setRevokingSessionId(null);
        }}
        onConfirm={async (password) => {
          if (revokingSessionId) {
            return await handleRevokeSession(revokingSessionId, password);
          }
          return false;
        }}
        title="Oturumu Sonlandır"
        description="Bu cihazı hesabınızdan çıkış yapmaya zorlamak için şifrenizi girin."
        actionLabel="Çıkış Yap"
      />

      <PasswordConfirmModal
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        onConfirm={handleRevokeAll}
        title="Tüm Oturumları Sonlandır"
        description="Bu cihaz dışındaki tüm cihazları çıkış yapmaya zorlamak için şifrenizi girin."
        actionLabel="Tümünü Sonlandır"
      />
    </div>
  );

  if (variant === 'card') {
    return <Card className="p-6">{content}</Card>;
  }

  return content;
}

export default SessionManager;
