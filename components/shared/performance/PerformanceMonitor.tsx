/**
 * Performance Monitor Component
 * Displays real-time performance metrics and alerts
 */

'use client';

import React from 'react';

interface PerformanceMonitorProps {
  className?: string;
  showDetailsPanel?: boolean;
  autoStart?: boolean;
}

export function PerformanceMonitor({
  className = '',
}: PerformanceMonitorProps) {
  // Temporarily disabled to prevent render errors
  // TODO: Fix performance hook issues

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Performance Monitor
        </h3>
        <div className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800">
          Initializing...
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">--</div>
          <div className="text-xs text-gray-500">LCP (ms)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">--</div>
          <div className="text-xs text-gray-500">FID (ms)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">--</div>
          <div className="text-xs text-gray-500">CLS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">--</div>
          <div className="text-xs text-gray-500">FCP (ms)</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Performance monitoring temporarily disabled
      </div>
    </div>
  );
}

export default PerformanceMonitor;
