/**
 * Performance Monitor Component
 * Displays real-time performance metrics and alerts
 */

'use client';

import React from 'react';
import { useEnhancedPerformance } from '@/hooks';

interface PerformanceMonitorProps {
  className?: string;
  showDetailsPanel?: boolean;
  autoStart?: boolean;
}

export function PerformanceMonitor({
  className = '',
  showDetailsPanel = false,
  autoStart = true,
}: PerformanceMonitorProps) {
  const {
    metrics,
    score,
    isLoading,
    isTracking,
    error,
    performanceGrade,
    activeAlerts,
    recommendations,
    startTracking,
    stopTracking,
    dismissAlert,
    dismissAllAlerts,
  } = useEnhancedPerformance({ autoStart });

  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
      >
        <h3 className="font-medium text-red-800">Performance Monitor Error</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-gray-50 p-4 ${className}`}
      >
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded bg-gray-300"></div>
          <div className="h-3 w-1/2 rounded bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Performance Monitor
        </h3>

        <div className="flex items-center gap-2">
          {score !== null && (
            <div
              className={`rounded px-2 py-1 text-sm font-medium ${
                score >= 90
                  ? 'bg-green-100 text-green-800'
                  : score >= 70
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {performanceGrade} ({score})
            </div>
          )}

          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`rounded px-3 py-1 text-sm font-medium ${
              isTracking
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isTracking ? 'Stop' : 'Start'} Tracking
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      {metrics && (
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.coreWebVitals.lcp?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">LCP (ms)</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.coreWebVitals.fid?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">FID (ms)</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.coreWebVitals.cls?.toFixed(3) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">CLS</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.coreWebVitals.fcp?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">FCP (ms)</div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Active Alerts ({activeAlerts.length})
            </h4>
            <button
              onClick={dismissAllAlerts}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss All
            </button>
          </div>

          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded p-2 text-sm ${
                  alert.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : alert.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                }`}
              >
                <span>{alert.message}</span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && showDetailsPanel && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Recommendations
          </h4>
          <ul className="space-y-1 text-xs text-gray-600">
            {recommendations.slice(0, 5).map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="mt-2 mr-2 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400"></span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;
