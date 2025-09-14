'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Activity,
  Zap,
  Timer,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { usePerformanceStore } from '@/lib/store/performance';
import { cn } from '@/lib/utils';

interface PerformanceMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function PerformanceMonitor({
  autoRefresh = false,
  refreshInterval = 30000,
  className,
}: PerformanceMonitorProps) {
  const {
    metrics,
    score,
    alerts,
    isLoading,
    error,
    resourceTimings,
    fetchMetrics,
    clearAlerts,
    clearError,
  } = usePerformanceStore();

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoRefresh, refreshInterval]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-yellow-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Gauge className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatMetricValue = (value: number, metric: string) => {
    switch (metric) {
      case 'lcp':
      case 'fcp':
        return `${(value * 1000).toFixed(0)}ms`;
      case 'fid':
      case 'ttfb':
        return `${value.toFixed(0)}ms`;
      case 'cls':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Performance izleme hatası</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  clearError();
                  fetchMetrics();
                }}
              >
                Tekrar dene
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Performance Skoru
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {score ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getGradeIcon(score.grade)}
                <div>
                  <div
                    className={cn(
                      'text-3xl font-bold',
                      getScoreColor(score.overall)
                    )}
                  >
                    {score.overall}
                  </div>
                  <div className="text-muted-foreground text-sm capitalize">
                    {score.grade.replace('-', ' ')}
                  </div>
                </div>
              </div>
              <Progress value={score.overall} className="w-32" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Performance Uyarıları
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearAlerts}>
              Temizle
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.type === 'error' ? 'destructive' : 'default'}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.message}</AlertTitle>
                <AlertDescription>{alert.recommendation}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {metrics && score && (
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
            <TabsTrigger value="timings">Load Timings</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                title="LCP"
                description="Largest Contentful Paint"
                value={formatMetricValue(metrics.coreWebVitals.lcp, 'lcp')}
                score={score.breakdown.lcp}
                icon={<Timer className="h-4 w-4" />}
              />
              <MetricCard
                title="FID"
                description="First Input Delay"
                value={formatMetricValue(metrics.coreWebVitals.fid, 'fid')}
                score={score.breakdown.fid}
                icon={<Zap className="h-4 w-4" />}
              />
              <MetricCard
                title="CLS"
                description="Cumulative Layout Shift"
                value={formatMetricValue(metrics.coreWebVitals.cls, 'cls')}
                score={score.breakdown.cls}
                icon={<Activity className="h-4 w-4" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="timings" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MetricCard
                title="TTFB"
                description="Time to First Byte"
                value={formatMetricValue(metrics.loadTimes.ttfb, 'ttfb')}
                score={score.breakdown.ttfb}
                icon={<Timer className="h-4 w-4" />}
              />
              <MetricCard
                title="FCP"
                description="First Contentful Paint"
                value={formatMetricValue(metrics.coreWebVitals.fcp, 'fcp')}
                score={score.breakdown.fcp}
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricCard
                title="DOM Ready"
                description="DOM Content Loaded"
                value={`${metrics.loadTimes.domReady}ms`}
                icon={<Gauge className="h-4 w-4" />}
              />
              <MetricCard
                title="Load Complete"
                description="Full Page Load"
                value={`${metrics.loadTimes.loadComplete}ms`}
                icon={<CheckCircle className="h-4 w-4" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bundle Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">JavaScript</span>
                    <Badge variant="outline">{metrics.bundleSize.js}KB</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CSS</span>
                    <Badge variant="outline">{metrics.bundleSize.css}KB</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Images</span>
                    <Badge variant="outline">
                      {metrics.bundleSize.images}KB
                    </Badge>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-sm">Total</span>
                    <Badge>{metrics.bundleSize.total}KB</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cache Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Hit Rate</span>
                      <Badge variant="outline">
                        {(metrics.cacheHitRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={metrics.cacheHitRate * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {resourceTimings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Recent Resource Timings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {resourceTimings.slice(-10).map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="max-w-48 truncate">
                          {resource.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {resource.loadTime}ms
                          </span>
                          {resource.cached && (
                            <Badge variant="secondary" className="text-xs">
                              cached
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  description: string;
  value: string;
  score?: number;
  icon: React.ReactNode;
}

function MetricCard({
  title,
  description,
  value,
  score,
  icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        {score !== undefined && (
          <div className="mt-2">
            <Progress value={score} className="h-2" />
            <p className="text-muted-foreground mt-1 text-xs">
              Score: {score}/100
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
