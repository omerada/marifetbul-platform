import { useCallback, useEffect } from 'react';
import { useReputationStore } from '@/lib/core/store/reputationStore';
import type { SecurityVerification } from '@/types';

export function useReputation(userId?: string, autoLoad = true) {
  const {
    reputationScore,
    securityStatus,
    trustIndicators,
    securityAlerts,
    isLoading,
    error,
    lastUpdated,
    fetchReputation,
    fetchSecurityAlerts,
    dismissAlert,
    startVerification,
    updateVerificationStatus,
    markRecommendationCompleted,
    refreshReputation,
    clearError,
    reset,
  } = useReputationStore();

  // Load reputation data when component mounts
  useEffect(() => {
    if (autoLoad && userId) {
      fetchReputation(userId);
      fetchSecurityAlerts(userId);
    }
  }, [userId, fetchReputation, fetchSecurityAlerts, autoLoad]);

  // Memoized functions
  const handleDismissAlert = useCallback(
    async (alertId: string) => {
      await dismissAlert(alertId);
    },
    [dismissAlert]
  );

  const handleStartVerification = useCallback(
    async (type: SecurityVerification['type']) => {
      await startVerification(type);
    },
    [startVerification]
  );

  const handleUpdateVerificationStatus = useCallback(
    (
      type: SecurityVerification['type'],
      status: SecurityVerification['status']
    ) => {
      updateVerificationStatus(type, status);
    },
    [updateVerificationStatus]
  );

  const handleMarkRecommendationCompleted = useCallback(
    (recommendationId: string) => {
      markRecommendationCompleted(recommendationId);
    },
    [markRecommendationCompleted]
  );

  const handleRefresh = useCallback(() => {
    refreshReputation();
  }, [refreshReputation]);

  // Computed values
  const overallScore = reputationScore?.overallScore || 0;
  const securityScore = securityStatus?.overallScore || 0;
  const trustScore = trustIndicators?.overallTrustScore || 0;

  const verificationLevels = securityStatus?.verifications || [];
  const verifiedCount = verificationLevels.filter(
    (v) => v.status === 'verified'
  ).length;
  const totalVerifications = verificationLevels.length;
  const verificationPercentage =
    totalVerifications > 0 ? (verifiedCount / totalVerifications) * 100 : 0;

  const criticalAlerts = securityAlerts.filter(
    (alert) => alert.severity === 'critical'
  );
  const highPriorityAlerts = securityAlerts.filter(
    (alert) => alert.severity === 'high'
  );
  const activeAlerts = securityAlerts.filter((alert) => !alert.isDismissed);

  return {
    // State
    reputationScore,
    securityStatus,
    trustIndicators,
    securityAlerts,
    isLoading,
    error,
    lastUpdated,

    // Actions
    dismissAlert: handleDismissAlert,
    startVerification: handleStartVerification,
    updateVerificationStatus: handleUpdateVerificationStatus,
    markRecommendationCompleted: handleMarkRecommendationCompleted,
    refresh: handleRefresh,
    clearError,
    reset,

    // Computed values
    hasData: !!(reputationScore || securityStatus || trustIndicators),
    overallScore,
    securityScore,
    trustScore,
    level: reputationScore?.level || 'bronze',
    badges: reputationScore?.badges || [],

    // Verification status
    verifications: verificationLevels,
    verifiedCount,
    totalVerifications,
    verificationPercentage,
    isFullyVerified:
      verifiedCount === totalVerifications && totalVerifications > 0,

    // Alerts summary
    totalAlerts: securityAlerts.length,
    activeAlerts: activeAlerts.length,
    criticalAlerts: criticalAlerts.length,
    highPriorityAlerts: highPriorityAlerts.length,
    hasCriticalAlerts: criticalAlerts.length > 0,
    hasActiveAlerts: activeAlerts.length > 0,

    // Quick access arrays
    activeCriticalAlerts: criticalAlerts.filter((alert) => !alert.isDismissed),
    activeHighPriorityAlerts: highPriorityAlerts.filter(
      (alert) => !alert.isDismissed
    ),
    recommendations: securityStatus?.recommendations || [],
    incompleteRecommendations:
      securityStatus?.recommendations?.filter((r) => {
        if (typeof r === 'string') return false;
        return !r.isCompleted;
      }) || [],
  };
}

// Simplified hook for reputation display
export function useReputationSummary(userId: string) {
  const {
    reputationScore,
    trustIndicators,
    isLoading,
    error,
    fetchReputation,
  } = useReputationStore();

  useEffect(() => {
    if (userId) {
      fetchReputation(userId);
    }
  }, [userId, fetchReputation]);

  return {
    score: reputationScore?.overallScore || 0,
    level: reputationScore?.level || 'bronze',
    badges: reputationScore?.badges || [],
    trustScore: trustIndicators?.overallTrustScore || 0,
    profileCompletion: trustIndicators?.profileCompletion || 0,
    verificationLevel: trustIndicators?.verificationLevel || 0,
    isLoading,
    error,
  };
}

// Hook for security alerts management
export function useSecurityAlerts(userId?: string) {
  const {
    securityAlerts,
    isLoading,
    error,
    fetchSecurityAlerts,
    dismissAlert,
  } = useReputationStore();

  useEffect(() => {
    if (userId) {
      fetchSecurityAlerts(userId);
    }
  }, [userId, fetchSecurityAlerts]);

  const handleDismissAlert = useCallback(
    async (alertId: string) => {
      await dismissAlert(alertId);
    },
    [dismissAlert]
  );

  const criticalAlerts = securityAlerts.filter(
    (alert) => alert.severity === 'critical' && !alert.isDismissed
  );

  const highPriorityAlerts = securityAlerts.filter(
    (alert) => alert.severity === 'high' && !alert.isDismissed
  );

  const actionRequiredAlerts = securityAlerts.filter(
    (alert) => alert.actionRequired && !alert.isDismissed
  );

  return {
    alerts: securityAlerts,
    activeAlerts: securityAlerts.filter((alert) => !alert.isDismissed),
    criticalAlerts,
    highPriorityAlerts,
    actionRequiredAlerts,
    isLoading,
    error,
    dismissAlert: handleDismissAlert,
    hasCriticalAlerts: criticalAlerts.length > 0,
    hasActionRequired: actionRequiredAlerts.length > 0,
  };
}

// Hook for verification status
export function useVerificationStatus(userId?: string) {
  const {
    securityStatus,
    isLoading,
    error,
    fetchReputation,
    startVerification,
    updateVerificationStatus,
  } = useReputationStore();

  useEffect(() => {
    if (userId) {
      fetchReputation(userId);
    }
  }, [userId, fetchReputation]);

  const verifications = securityStatus?.verifications || [];
  const emailVerification = verifications.find((v) => v.type === 'email');
  const phoneVerification = verifications.find((v) => v.type === 'phone');
  const identityVerification = verifications.find((v) => v.type === 'identity');
  const twoFactorVerification = verifications.find((v) => v.type === '2fa');

  const verifiedCount = verifications.filter(
    (v) => v.status === 'verified'
  ).length;
  const pendingCount = verifications.filter(
    (v) => v.status === 'pending'
  ).length;
  const failedCount = verifications.filter((v) => v.status === 'failed').length;

  return {
    verifications,
    emailVerification,
    phoneVerification,
    identityVerification,
    twoFactorVerification,
    verifiedCount,
    pendingCount,
    failedCount,
    totalVerifications: verifications.length,
    verificationPercentage:
      verifications.length > 0
        ? (verifiedCount / verifications.length) * 100
        : 0,
    isFullyVerified:
      verifiedCount === verifications.length && verifications.length > 0,
    isLoading,
    error,
    startVerification,
    updateVerificationStatus,
  };
}
