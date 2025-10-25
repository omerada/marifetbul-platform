/**
 * ================================================
 * ORDER TIMELINE COMPONENT
 * ================================================
 * Visual timeline display for order progress
 *
 * Features:
 * - Order status timeline
 * - Status icons
 * - Timestamps
 * - Status descriptions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';

interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function OrderTimeline({ events, className = '' }: OrderTimelineProps) {
  // Get status icon
  const getStatusIcon = (event: TimelineEvent) => {
    if (event.isCompleted) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    if (event.isCurrent) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-600"></div>
        </div>
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Sipariş Zaman Çizelgesi
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10">{getStatusIcon(event)}</div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h4
                      className={`font-semibold ${
                        event.isCurrent
                          ? 'text-indigo-600'
                          : event.isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-500'
                      }`}
                    >
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.actor && (
                    <p className="mt-2 text-xs text-gray-500">
                      {event.actor} tarafından
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderTimeline;
