'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Eye,
  Clock,
  CheckCircle,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useReputation } from '@/hooks';
import type { SecurityAlert as SecurityAlertType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface SecurityAlertProps {
  alert: SecurityAlertType;
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string, action: string) => void;
  showActions?: boolean;
  className?: string;
}

interface SecurityAlertsListProps {
  userId?: string;
  maxAlerts?: number;
  showDismissed?: boolean;
  className?: string;
}

const alertIcons = {
  suspicious_login: AlertTriangle,
  payment_warning: AlertTriangle,
  profile_security: Shield,
  account_verification: CheckCircle,
  privacy_update: Eye,
  timeout_warning: Clock,
};

const alertColors = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
  critical: 'destructive',
} as const;

// Single Alert Component
export function SecurityAlert({
  alert,
  onDismiss,
  onAction,
  showActions = true,
  className,
}: SecurityAlertProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDismiss = async () => {
    if (!onDismiss) return;

    setIsProcessing(true);
    try {
      await onDismiss(alert.id);
    } catch (error) {
      console.error('Alert dismiss error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!onAction) return;

    setIsProcessing(true);
    try {
      await onAction(alert.id, action);
    } catch (error) {
      console.error('Alert action error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const IconComponent =
    alertIcons[alert.type as keyof typeof alertIcons] || AlertTriangle;
  const badgeVariant = alertColors[alert.severity];

  return (
    <Card
      className={`border-l-4 ${
        alert.severity === 'high'
          ? 'border-l-red-500'
          : alert.severity === 'medium'
            ? 'border-l-yellow-500'
            : 'border-l-blue-500'
      } ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-lg p-2 ${
                alert.severity === 'high'
                  ? 'bg-red-100 text-red-600'
                  : alert.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-blue-100 text-blue-600'
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <CardTitle className="text-base">{alert.title}</CardTitle>
                <Badge variant={badgeVariant} className="text-xs">
                  {alert.severity === 'high'
                    ? 'Yüksek'
                    : alert.severity === 'medium'
                      ? 'Orta'
                      : alert.severity === 'low'
                        ? 'Düşük'
                        : alert.severity === 'critical'
                          ? 'Kritik'
                          : 'Bilgi'}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm">
                {alert.description}
              </p>

              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                <span>{formatDate(alert.createdAt)}</span>

                {alert.expiresAt && (
                  <>
                    <span>•</span>
                    <span>Bitiş: {formatDate(alert.expiresAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {showActions && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              disabled={isProcessing || alert.isDismissed}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {alert.recommendations && alert.recommendations.length > 0 && (
        <CardContent className="pt-0">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <Info className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="space-y-1">
                <p className="mb-1 text-xs font-medium">Öneriler:</p>
                <ul className="space-y-1">
                  {alert.recommendations.map((rec, index) => (
                    <li key={index} className="text-muted-foreground text-xs">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {showActions && alert.actionRequired && alert.actionUrl && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction('primary')}
              disabled={isProcessing}
              className="gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {alert.actionText || 'İşlem Yap'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Security Alerts List Component
export function SecurityAlertsList({
  userId,
  maxAlerts = 5,
  showDismissed = false,
  className,
}: SecurityAlertsListProps) {
  const { securityAlerts, isLoading, error, dismissAlert } =
    useReputation(userId);

  const handleDismiss = async (alertId: string) => {
    await dismissAlert(alertId);
  };

  const handleAction = async (alertId: string, action: string) => {
    // Handle specific actions based on action type
    console.log('Security alert action:', { alertId, action });
    // Implement specific action handlers here
  };

  const filteredAlerts =
    securityAlerts
      ?.filter((alert) => showDismissed || !alert.isDismissed)
      ?.slice(0, maxAlerts) || [];

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="bg-muted h-20 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center">
          <Shield className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground mb-3 text-sm">
            Güvenlik uyarıları yüklenemedi
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h3 className="mb-2 text-lg font-medium">Güvenlik Durumu İyi</h3>
          <p className="text-muted-foreground">
            Şu anda herhangi bir güvenlik uyarısı bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Güvenlik Uyarıları</h3>
        {filteredAlerts.length > 0 && (
          <Badge variant="outline">{filteredAlerts.length} uyarı</Badge>
        )}
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <SecurityAlert
            key={alert.id}
            alert={alert}
            onDismiss={handleDismiss}
            onAction={handleAction}
            showActions={true}
          />
        ))}
      </div>

      {securityAlerts && securityAlerts.length > maxAlerts && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            Tüm Uyarıları Görüntüle ({securityAlerts.length - maxAlerts} daha)
          </Button>
        </div>
      )}
    </div>
  );
}
