'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
import { logger } from '@/lib/shared/utils/logger';
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Database,
  Shield,
  Activity,
  Eye,
  Trash2,
} from 'lucide-react';

interface AdminLog {
  id: number | string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  details: string;
  userId: string;
  ip: string;
}

export function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const logLevels = [
    { id: 'all', name: 'Tüm Seviyeler', color: 'gray' },
    { id: 'error', name: 'Hata', color: 'red', icon: XCircle },
    { id: 'warning', name: 'Uyarı', color: 'yellow', icon: AlertTriangle },
    { id: 'info', name: 'Bilgi', color: 'blue', icon: Info },
    { id: 'success', name: 'Başarılı', color: 'green', icon: CheckCircle },
  ];

  const logSources = [
    { id: 'all', name: 'Tüm Kaynaklar' },
    { id: 'auth', name: 'Kimlik Doğrulama', icon: Shield },
    { id: 'api', name: 'API İstekleri', icon: Globe },
    { id: 'database', name: 'Veritabanı', icon: Database },
    { id: 'user', name: 'Kullanıcı İşlemleri', icon: User },
    { id: 'system', name: 'Sistem', icon: Activity },
  ];

  // Fetch logs from backend
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(selectedSource !== 'all' && { source: selectedSource }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/v1/admin/logs?${params}`, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Loglar alınamadı');
      }

      const data = await response.json();
      setLogs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      // Fallback to empty array on error
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevel, selectedSource, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    fetchLogs();
  };

  const logStats = [
    {
      name: 'Toplam Log',
      value: '12,847',
      change: '+234 bugün',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      name: 'Hata Logları',
      value: '23',
      change: '-5 bu hafta',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: 'Uyarılar',
      value: '156',
      change: '+12 bugün',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      name: 'Kritik Olaylar',
      value: '2',
      change: 'Son 24 saat',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const refreshLogs = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const exportLogs = async () => {
    // Export logs to CSV or JSON
    try {
      const response = await fetch('/api/v1/admin/logs/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedLevel,
          source: selectedSource,
          search: searchTerm,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-logs-${new Date().toISOString()}.csv`;
        a.click();
      }
    } catch (error) {
      logger.error('Failed to export logs:', error);
    }
  };

  const getLogLevelBadge = (level: string) => {
    const config = {
      error: { variant: 'destructive' as const, text: 'Hata' },
      warning: { variant: 'warning' as const, text: 'Uyarı' },
      info: { variant: 'default' as const, text: 'Bilgi' },
      success: { variant: 'success' as const, text: 'Başarılı' },
    };

    const levelConfig = config[level as keyof typeof config] || {
      variant: 'default' as const,
      text: level,
    };
    return <Badge variant={levelConfig.variant}>{levelConfig.text}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      auth: Shield,
      api: Globe,
      database: Database,
      user: User,
      system: Activity,
    };

    const Icon = icons[source as keyof typeof icons] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  // Client-side filtering is redundant since backend filters,
  // but kept for instant UI feedback
  const filteredLogs = logs.filter((log: AdminLog) => {
    if (!searchTerm) return true;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Logları</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem olayları ve hata takibi
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {logStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className={`border ${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Arama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Log mesajlarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Log Level Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log Seviyesi</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              {logLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Source Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kaynak</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              {logSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Log Kayıtları</span>
            <Badge variant="outline" className="text-gray-600">
              {filteredLogs.length} kayıt
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Filtrelere uygun log kaydı bulunamadı
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {getSourceIcon(log.source)}
                          <span className="text-sm font-medium text-gray-600">
                            {logSources.find((s) => s.id === log.source)
                              ?.name || log.source}
                          </span>
                        </div>
                        {getLogLevelBadge(log.level)}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>

                      <h3 className="mb-1 font-medium text-gray-900">
                        {log.message}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        {log.details}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>User: {log.userId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminLogs;
