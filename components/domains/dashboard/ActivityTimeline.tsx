'use client';

import React, { useState, useEffect } from 'react';
import { User, Order, Proposal } from '@/types';
import { Card } from '@/components/ui/Card';
import {
import { logger } from '@/lib/shared/utils/logger';
  Clock,
  DollarSign,
  MessageCircle,
  Star,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Briefcase,
  Award,
} from 'lucide-react';

interface Activity {
  id: string;
  type:
    | 'message'
    | 'payment'
    | 'project_update'
    | 'review'
    | 'proposal'
    | 'milestone'
    | 'job_posted'
    | 'profile_view';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  amount?: number;
  rating?: number;
}

interface ActivityTimelineProps {
  user?: User;
  items?: (Activity | Order | Proposal)[];
  type?: 'orders' | 'proposals' | 'activities';
  showTitle?: boolean;
  className?: string;
}

export function ActivityTimeline({
  user,
  items = [],
  type = 'activities',
  showTitle = true,
  className = '',
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Props are used in component logic below
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Real API call to get user activities
        const endpoint =
          user?.userType === 'freelancer'
            ? '/api/v1/dashboard/freelancer/activities'
            : '/api/v1/dashboard/employer/activities';

        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data.data || []);
      } catch (error) {
        logger.error('Error fetching activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'project_update':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'proposal':
        return <Briefcase className="h-5 w-5 text-indigo-600" />;
      case 'milestone':
        return <Award className="h-5 w-5 text-emerald-600" />;
      case 'job_posted':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'profile_view':
        return <UserIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100';
      case 'payment':
        return 'bg-green-100';
      case 'project_update':
        return 'bg-purple-100';
      case 'review':
        return 'bg-yellow-100';
      case 'proposal':
        return 'bg-indigo-100';
      case 'milestone':
        return 'bg-emerald-100';
      case 'job_posted':
        return 'bg-orange-100';
      case 'profile_view':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Son Aktiviteler
          </h3>
        </div>
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
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Tümünü Gör
        </button>
      </div>

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

                    {activity.amount && (
                      <span className="text-xs font-medium text-green-600">
                        ₺{activity.amount.toLocaleString('tr-TR')}
                      </span>
                    )}

                    {activity.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(activity.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-current text-yellow-400"
                          />
                        ))}
                      </div>
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
    </Card>
  );
}
