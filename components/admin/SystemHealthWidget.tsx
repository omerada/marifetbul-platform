'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface SystemHealthWidgetProps {
  className?: string;
}

export default function SystemHealthWidget({
  className,
}: SystemHealthWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Server Status</span>
            <span className="text-green-600">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Database</span>
            <span className="text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Memory Usage</span>
            <span className="text-blue-600">45%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>CPU Usage</span>
            <span className="text-blue-600">32%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
