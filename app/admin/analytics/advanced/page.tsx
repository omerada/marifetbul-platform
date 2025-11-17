'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { RevenueChart } from '../components/RevenueChart';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { UserActivityChart } from '../components/UserActivityChart';
import { ExportDialog } from '../components/ExportDialog';
import type { TimePeriod } from '@/hooks/business/analytics';

export default function AdvancedAnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>('30d');

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform performance metrics and insights
          </p>
        </div>
        <ExportDialog />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('7d')}
          className={`rounded-md px-4 py-2 transition-colors ${
            period === '7d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPeriod('30d')}
          className={`rounded-md px-4 py-2 transition-colors ${
            period === '30d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setPeriod('90d')}
          className={`rounded-md px-4 py-2 transition-colors ${
            period === '90d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Last 90 Days
        </button>
        <button
          onClick={() => setPeriod('1y')}
          className={`rounded-md px-4 py-2 transition-colors ${
            period === '1y'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Last Year
        </button>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueChart period={period} />
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <ConversionFunnel period={period} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserActivityChart period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
