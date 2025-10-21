'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/Card';
import { logger } from '@/lib/shared/utils/logger';
import {
  Clock,
  DollarSign,
  MessageCircle,
  Star,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Briefcase,
} from 'lucide-react';

interface Activity {
  id: string;
  type: string; // ActivityType enum from backend (ORDER_PLACED, PAYMENT_RECEIVED, etc.)
  title: string;
  description: string;
  timestamp: string;
  entityType?: string; // ORDER, PAYMENT, MESSAGE, etc.
  entityId?: string;
  user?: {
    id?: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  status?: string;
  metadata?: {
    amount?: number;
    currency?: string;
    orderNumber?: string;
    [key: string]: string | number | boolean | undefined;
  };
  isRead?: boolean;
  variant?: string; // success, destructive, default, secondary
}

interface ActivityTimelineProps {
  user?: User;
  showTitle?: boolean;
  className?: string;
}

export function ActivityTimeline({
  user,
  showTitle = true,
  className = '',
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchActivities = async () => {
      // Don't fetch if no user
      if (!user?.userType) {
        if (isMounted) {
          setActivities([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Real API call to get user activities
        const endpoint =
          user.userType === 'freelancer'
            ? '/api/v1/dashboard/freelancer/activities'
            : '/api/v1/dashboard/employer/activities';

        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If 401/403, don't retry - it's an auth issue
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication required');
          }

          // For other errors, try to get error message
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (isMounted) {
          if (data?.success && Array.isArray(data?.data)) {
            setActivities(data.data);
            setRetryCount(0); // Reset retry count on success
          } else {
            // Backend returned success: false or invalid format
            setActivities([]);
            logger.warn('Invalid activities data format:', data);
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch activities';
          setError(errorMessage);
          logger.error('Error fetching activities:', error);

          // Retry logic - max 3 retries with exponential backoff
          if (retryCount < 3 && !errorMessage.includes('Authentication')) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s
            logger.debug(
              `Retrying activities fetch in ${delay}ms (attempt ${retryCount + 1}/3)`
            );

            retryTimeout = setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, delay);
          } else {
            // Max retries reached or auth error - set empty array
            setActivities([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user, retryCount]);

  const getActivityIcon = (type: string) => {
    // Map backend ActivityType enum to icons
    if (type.includes('MESSAGE')) {
      return <MessageCircle className="h-5 w-5 text-blue-600" />;
    }
    if (type.includes('PAYMENT') || type.includes('PAYOUT')) {
      return <DollarSign className="h-5 w-5 text-green-600" />;
    }
    if (type.includes('ORDER')) {
      return <CheckCircle className="h-5 w-5 text-purple-600" />;
    }
    if (type.includes('REVIEW')) {
      return <Star className="h-5 w-5 text-yellow-600" />;
    }
    if (type.includes('PROPOSAL')) {
      return <Briefcase className="h-5 w-5 text-indigo-600" />;
    }
    if (type.includes('JOB')) {
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
    if (type.includes('PROFILE')) {
      return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getActivityBgColor = (type: string) => {
    // Map backend ActivityType enum to colors
    if (type.includes('MESSAGE')) {
      return 'bg-blue-100';
    }
    if (type.includes('PAYMENT') || type.includes('PAYOUT')) {
      return 'bg-green-100';
    }
    if (type.includes('ORDER')) {
      return 'bg-purple-100';
    }
    if (type.includes('REVIEW')) {
      return 'bg-yellow-100';
    }
    if (type.includes('PROPOSAL')) {
      return 'bg-indigo-100';
    }
    if (type.includes('JOB')) {
      return 'bg-orange-100';
    }
    if (type.includes('PROFILE')) {
      return 'bg-gray-100';
    }
    return 'bg-gray-100';
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          {showTitle && (
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Son Aktiviteler
              </h3>
            </div>
          )}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          {showTitle && (
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Son Aktiviteler
              </h3>
            </div>
          )}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Aktiviteler yüklenemedi
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                {retryCount < 3 && (
                  <button
                    onClick={() => setRetryCount((prev) => prev + 1)}
                    className="mt-3 text-sm font-medium text-red-800 underline hover:text-red-900"
                  >
                    Tekrar dene
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          {showTitle && (
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Son Aktiviteler
              </h3>
            </div>
          )}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900">
              Henüz aktivite yok
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Aktiviteleriniz burada görünecek
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {showTitle && (
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Son Aktiviteler
            </h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Tümünü Gör
            </button>
          </div>
        )}

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="group flex items-start space-x-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityBgColor(activity.type)} transition-transform group-hover:scale-110`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>

                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        {activity.timestamp}
                      </span>

                      {activity.user && (
                        <span className="text-xs text-gray-500">
                          {activity.user.name}
                        </span>
                      )}

                      {activity.metadata?.amount && (
                        <span className="text-xs font-medium text-green-600">
                          {activity.metadata.currency || '₺'}
                          {activity.metadata.amount.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {index < activities.length - 1 && (
                <div className="absolute left-8 mt-12 h-8 w-px bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <button className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
            Daha Fazla Aktivite Göster
          </button>
        </div>
      </div>
    </Card>
  );
}
