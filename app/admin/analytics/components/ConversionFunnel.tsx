'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useConversionAnalytics,
  type TimePeriod,
} from '@/hooks/business/analytics';
import { Loader2, ChevronDown } from 'lucide-react';

interface ConversionFunnelProps {
  period: TimePeriod;
}

export function ConversionFunnel({ period }: ConversionFunnelProps) {
  const { data, isLoading, error } = useConversionAnalytics(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <p className="text-muted-foreground text-sm">
            Loading conversion data...
          </p>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <p className="text-destructive text-sm">
            Failed to load conversion data: {error}
          </p>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  const stageColors = {
    view: 'bg-blue-500',
    contact: 'bg-indigo-500',
    order: 'bg-purple-500',
    complete: 'bg-green-500',
  };

  const stageLabels = {
    view: 'Service View',
    contact: 'Seller Contact',
    order: 'Order Created',
    complete: 'Order Completed',
  };

  return (
    <div className="space-y-4">
      {/* Overall Conversion */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {data.overallConversion.toFixed(2)}%
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            From service view to completed order
          </p>
        </CardContent>
      </Card>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <p className="text-muted-foreground text-sm">
            User journey breakdown
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.funnel.map((stage, index) => {
              const isLast = index === data.funnel.length - 1;
              const maxCount = data.funnel[0].count;
              const widthPercentage = (stage.count / maxCount) * 100;

              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${stageColors[stage.stage as keyof typeof stageColors]}`}
                      />
                      <span className="font-medium">
                        {stageLabels[stage.stage as keyof typeof stageLabels]}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {stage.count.toLocaleString()}
                      </div>
                      {index > 0 && (
                        <div className="text-sm text-green-600">
                          {stage.conversionRate.toFixed(1)}% conversion
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative h-12 overflow-hidden rounded-lg bg-gray-100">
                    <div
                      className={`h-full ${stageColors[stage.stage as keyof typeof stageColors]} flex items-center justify-center font-medium text-white transition-all duration-500`}
                      style={{ width: `${widthPercentage}%` }}
                    >
                      {widthPercentage > 20 && (
                        <span>{widthPercentage.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex justify-center">
                      <ChevronDown className="text-muted-foreground h-6 w-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Drop-off Points</CardTitle>
          <p className="text-muted-foreground text-sm">
            Where users abandon the funnel
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.dropOffPoints.map((dropOff) => (
              <div
                key={dropOff.stage}
                className="bg-muted flex items-center justify-between rounded-lg p-3"
              >
                <span className="font-medium">{dropOff.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {dropOff.dropOffRate.toFixed(1)}%
                    </div>
                    <div className="text-muted-foreground text-xs">
                      drop-off rate
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
