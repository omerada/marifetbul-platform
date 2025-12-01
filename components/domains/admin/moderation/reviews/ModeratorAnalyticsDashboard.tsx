'use client';

/**
 * ================================================
 * MODERATOR ANALYTICS DASHBOARD
 * ================================================
 * Component for displaying moderator performance analytics
 *
 * Sprint: Sprint 3 - Day 4 (Moderator Dashboard Enhancement)
 * Features: SLA tracking, performance metrics, trend charts, workload distribution
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Download,
  RefreshCcw,
  Activity,
  Award,
  Target,
} from 'lucide-react';
import {
  getModerationAnalytics,
  getSLAMetrics,
  getWorkloadDistribution,
  exportAnalyticsReport,
  getPeriodLabel,
  getSLAStatusColor,
  getPerformanceTier,
  formatDuration,
  getWorkloadStatusColor,
  type ModerationAnalytics,
  type SLAMetrics,
  type WorkloadDistribution,
  type AnalyticsPeriod,
} from '@/lib/api/moderation-analytics';
import { formatPercentage } from '@/lib/shared/formatters';

export interface ModeratorAnalyticsDashboardProps {
  className?: string;
}

export function ModeratorAnalyticsDashboard({
  className = '',
}: ModeratorAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null);
  const [workload, setWorkload] = useState<WorkloadDistribution | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [analyticsData, slaData, workloadData] = await Promise.all([
        getModerationAnalytics({ period }),
        getSLAMetrics(period),
        getWorkloadDistribution(),
      ]);

      setAnalytics(analyticsData);
      setSlaMetrics(slaData);
      setWorkload(workloadData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setIsExporting(true);
      const blob = await exportAnalyticsReport({ period }, format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moderasyon-raporu-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_err) {
      setError('Rapor dışa aktarılırken hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
          <p className="mt-4 text-sm text-gray-600">
            Analitik veriler yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Hata Oluştu</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadAnalytics} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (!analytics || !slaMetrics || !workload) {
    return null;
  }

  const overview = analytics.overview;
  const trends = analytics.trends;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Moderasyon Analitikleri
          </h2>
          <p className="text-sm text-gray-600">
            {analytics.startDate} - {analytics.endDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <Select
            value={period}
            onValueChange={(val) => setPeriod(val as AnalyticsPeriod)}
          >
            <SelectTrigger className="w-[180px]" />
            <SelectContent>
              <SelectItem value="day">Bugün</SelectItem>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
              <SelectItem value="quarter">Bu Çeyrek</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Dışa aktarılıyor...' : 'Rapor İndir'}
          </Button>

          {/* Refresh Button */}
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Pending */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Bekleyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {overview.totalPending}
            </div>
            {overview.pendingChange !== 0 && (
              <div className="mt-2 flex items-center gap-1">
                {overview.pendingChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
                <span
                  className={`text-sm ${
                    overview.pendingChange > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {overview.pendingChange > 0 ? '+' : ''}
                  {formatPercentage(Math.abs(overview.pendingChange))}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Activity className="h-4 w-4" />
              İnceleniyor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {overview.totalInReview}
            </div>
            <p className="mt-2 text-xs text-gray-600">Aktif inceleme</p>
          </CardContent>
        </Card>

        {/* Flagged */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <AlertCircle className="h-4 w-4" />
              Bayraklı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overview.totalFlagged}
            </div>
            {overview.flagsChange !== 0 && (
              <div className="mt-2 flex items-center gap-1">
                {overview.flagsChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
                <span
                  className={`text-sm ${
                    overview.flagsChange > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {overview.flagsChange > 0 ? '+' : ''}
                  {formatPercentage(Math.abs(overview.flagsChange))}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviewed Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <CheckCircle className="h-4 w-4" />
              Bugün İncelendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overview.reviewedToday}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {overview.approvedToday} onaylandı, {overview.rejectedToday}{' '}
              reddedildi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SLA Performansı
          </CardTitle>
          <p className="text-sm text-gray-600">
            Yanıt ve çözüm süresi hedefleri
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Response Time SLA */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Yanıt Süresi</h4>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Ortalama</span>
                <span className="text-lg font-semibold">
                  {formatDuration(slaMetrics.averageResponseTimeMinutes)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Hedef</span>
                <span className="text-lg font-semibold text-gray-400">
                  {formatDuration(slaMetrics.slaResponseTarget)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Uyum Oranı</span>
                <span
                  className={`text-lg font-semibold ${getSLAStatusColor(slaMetrics.slaResponseComplianceRate).split(' ')[0]}`}
                >
                  {formatPercentage(slaMetrics.slaResponseComplianceRate)}
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${getSLAStatusColor(slaMetrics.slaResponseComplianceRate).includes('green') ? 'bg-green-500' : getSLAStatusColor(slaMetrics.slaResponseComplianceRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${slaMetrics.slaResponseComplianceRate}%` }}
                />
              </div>
            </div>

            {/* Resolution Time SLA */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Çözüm Süresi</h4>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Ortalama</span>
                <span className="text-lg font-semibold">
                  {formatDuration(slaMetrics.averageResolutionTimeMinutes)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Hedef</span>
                <span className="text-lg font-semibold text-gray-400">
                  {formatDuration(slaMetrics.slaResolutionTarget)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Uyum Oranı</span>
                <span
                  className={`text-lg font-semibold ${getSLAStatusColor(slaMetrics.slaResolutionComplianceRate).split(' ')[0]}`}
                >
                  {formatPercentage(slaMetrics.slaResolutionComplianceRate)}
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${getSLAStatusColor(slaMetrics.slaResolutionComplianceRate).includes('green') ? 'bg-green-500' : getSLAStatusColor(slaMetrics.slaResolutionComplianceRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{
                    width: `${slaMetrics.slaResolutionComplianceRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-4 font-medium text-gray-900">
              Öncelik Bazında SLA
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {/* High Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">
                    Yüksek
                  </span>
                  <span
                    className={`text-xs ${getSLAStatusColor(slaMetrics.highPrioritySLA.complianceRate)}`}
                  >
                    {formatPercentage(
                      slaMetrics.highPrioritySLA.complianceRate
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Yanıt:{' '}
                  {formatDuration(slaMetrics.highPrioritySLA.responseTime)}
                </div>
                <div className="text-xs text-gray-600">
                  Çözüm:{' '}
                  {formatDuration(slaMetrics.highPrioritySLA.resolutionTime)}
                </div>
              </div>

              {/* Medium Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-600">
                    Orta
                  </span>
                  <span
                    className={`text-xs ${getSLAStatusColor(slaMetrics.mediumPrioritySLA.complianceRate)}`}
                  >
                    {formatPercentage(
                      slaMetrics.mediumPrioritySLA.complianceRate
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Yanıt:{' '}
                  {formatDuration(slaMetrics.mediumPrioritySLA.responseTime)}
                </div>
                <div className="text-xs text-gray-600">
                  Çözüm:{' '}
                  {formatDuration(slaMetrics.mediumPrioritySLA.resolutionTime)}
                </div>
              </div>

              {/* Low Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Düşük
                  </span>
                  <span
                    className={`text-xs ${getSLAStatusColor(slaMetrics.lowPrioritySLA.complianceRate)}`}
                  >
                    {formatPercentage(slaMetrics.lowPrioritySLA.complianceRate)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Yanıt:{' '}
                  {formatDuration(slaMetrics.lowPrioritySLA.responseTime)}
                </div>
                <div className="text-xs text-gray-600">
                  Çözüm:{' '}
                  {formatDuration(slaMetrics.lowPrioritySLA.resolutionTime)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            İş Yükü Dağılımı
          </CardTitle>
          <p className="text-sm text-gray-600">
            {workload.totalModerators} moderatör, {workload.totalPendingReviews}{' '}
            bekleyen inceleme
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* By Moderator */}
            <div>
              <h4 className="mb-3 font-medium text-gray-900">
                Moderatörlere Göre
              </h4>
              <div className="space-y-3">
                {workload.byModerator.slice(0, 5).map((mod) => (
                  <div
                    key={mod.moderatorId}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {mod.moderatorName}
                        </span>
                        <span
                          className={`text-xs ${getWorkloadStatusColor(mod.workloadPercentage)}`}
                        >
                          {mod.pendingReviews} bekleyen
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${mod.workloadPercentage}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        Bugün {mod.completedToday} tamamlandı
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Priority and Category */}
            <div className="grid grid-cols-2 gap-6 border-t pt-4">
              <div>
                <h4 className="mb-3 font-medium text-gray-900">
                  Önceliğe Göre
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Yüksek</span>
                    <span className="font-semibold">
                      {workload.byPriority.high}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">Orta</span>
                    <span className="font-semibold">
                      {workload.byPriority.medium}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Düşük</span>
                    <span className="font-semibold">
                      {workload.byPriority.low}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-gray-900">
                  Kategoriye Göre
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spam</span>
                    <span className="font-semibold">
                      {workload.byCategory.spam}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saldırgan</span>
                    <span className="font-semibold">
                      {workload.byCategory.offensive}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taciz</span>
                    <span className="font-semibold">
                      {workload.byCategory.harassment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {analytics.topPerformers && analytics.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              En İyi Performans
            </CardTitle>
            <p className="text-sm text-gray-600">
              {getPeriodLabel(period)} içinde en iyi performans gösteren
              moderatörler
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformers.slice(0, 5).map((performer, index) => {
                const tier = getPerformanceTier(performer.accuracyScore);
                return (
                  <div
                    key={performer.moderatorId}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {performer.moderatorName}
                        </span>
                        <span className={`text-xs ${tier.color}`}>
                          {tier.tier}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span>{performer.totalReviews} inceleme</span>
                        <span>•</span>
                        <span>
                          {formatPercentage(performer.accuracyScore)} doğruluk
                        </span>
                        <span>•</span>
                        <span>
                          {formatDuration(
                            performer.averageResolutionTimeMinutes
                          )}{' '}
                          ort. süre
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(performer.approvalRate, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-xs text-gray-600">onay oranı</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aktivite Trendi
          </CardTitle>
          <p className="text-sm text-gray-600">Günlük inceleme aktivitesi</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trends.dailyActivity.slice(-7).map((day) => {
              const total = day.approved + day.rejected;
              const approvalRate = total > 0 ? (day.approved / total) * 100 : 0;

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString('tr-TR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-gray-600">
                      {total} inceleme
                    </span>
                  </div>
                  <div className="flex h-6 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="bg-green-500"
                      style={{ width: `${approvalRate}%` }}
                      title={`${day.approved} onaylandı`}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${100 - approvalRate}%` }}
                      title={`${day.rejected} reddedildi`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{day.approved} onay</span>
                    <span>{day.rejected} red</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
