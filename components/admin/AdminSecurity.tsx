'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Key,
  UserX,
  Activity,
  Clock,
  Globe,
  Smartphone,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function AdminSecurity() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const securityStats = [
    {
      name: 'Güvenlik Skoru',
      value: '94%',
      change: '+2% bu ay',
      changeType: 'increase' as const,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      name: 'Aktif Tehditler',
      value: '3',
      change: '-5 bu hafta',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      name: 'Başarısız Girişler',
      value: '147',
      change: '+23 bugün',
      changeType: 'increase' as const,
      icon: Lock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      name: 'Yasaklı IP',
      value: '89',
      change: '+12 bu hafta',
      changeType: 'increase' as const,
      icon: Ban,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const securityEvents = [
    {
      id: 1,
      type: 'failed_login',
      severity: 'warning',
      title: 'Çoklu başarısız giriş denemesi',
      description: 'IP 192.168.1.50 adresinden 5 başarısız giriş denemesi',
      timestamp: '2024-01-15 14:30:25',
      user: 'ahmet@example.com',
      ip: '192.168.1.50',
      action: 'IP geçici olarak yasaklandı',
    },
    {
      id: 2,
      type: 'suspicious_activity',
      severity: 'high',
      title: 'Şüpheli API trafiği',
      description: 'Anormal yüksek API istek hacmi tespit edildi',
      timestamp: '2024-01-15 14:15:12',
      user: 'sistem',
      ip: '203.0.113.45',
      action: 'Rate limiting uygulandı',
    },
    {
      id: 3,
      type: 'admin_access',
      severity: 'info',
      title: 'Admin paneli erişimi',
      description: 'Yeni admin kullanıcısı sisteme giriş yaptı',
      timestamp: '2024-01-15 13:45:30',
      user: 'admin@example.com',
      ip: '192.168.1.100',
      action: 'Erişim loglandı',
    },
    {
      id: 4,
      type: 'password_change',
      severity: 'info',
      title: 'Şifre değişikliği',
      description: 'Kullanıcı şifresini güncelledi',
      timestamp: '2024-01-15 12:20:45',
      user: 'user@example.com',
      ip: '192.168.1.200',
      action: 'Şifre güncellendi',
    },
    {
      id: 5,
      type: 'blocked_request',
      severity: 'warning',
      title: 'Engellenen istek',
      description:
        'Güvenlik duvarı tarafından engellenen SQL injection denemesi',
      timestamp: '2024-01-15 11:55:18',
      user: 'anonim',
      ip: '203.0.113.89',
      action: 'İstek engellendi',
    },
  ];

  const bannedIPs = [
    {
      ip: '192.168.1.50',
      reason: 'Çoklu başarısız giriş',
      bannedAt: '2024-01-15 14:30',
      expiresAt: '2024-01-16 14:30',
      attempts: 8,
    },
    {
      ip: '203.0.113.45',
      reason: 'SQL injection denemesi',
      bannedAt: '2024-01-15 13:20',
      expiresAt: 'Kalıcı',
      attempts: 15,
    },
    {
      ip: '198.51.100.23',
      reason: 'DDoS saldırısı',
      bannedAt: '2024-01-15 10:45',
      expiresAt: '2024-01-17 10:45',
      attempts: 1247,
    },
  ];

  const getEventIcon = (type: string) => {
    const icons = {
      failed_login: Lock,
      suspicious_activity: AlertTriangle,
      admin_access: Shield,
      password_change: Key,
      blocked_request: Ban,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { variant: 'secondary' as const, text: 'Düşük' },
      warning: { variant: 'warning' as const, text: 'Uyarı' },
      high: { variant: 'destructive' as const, text: 'Yüksek' },
      critical: { variant: 'destructive' as const, text: 'Kritik' },
      info: { variant: 'default' as const, text: 'Bilgi' },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || {
      variant: 'default' as const,
      text: severity,
    };

    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const refreshSecurityData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const tabs = [
    { id: 'overview', name: 'Genel Bakış', icon: Shield },
    { id: 'events', name: 'Güvenlik Olayları', icon: Activity },
    { id: 'blocked', name: "Yasaklı IP'ler", icon: Ban },
    { id: 'settings', name: 'Güvenlik Ayarları', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Güvenlik Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem güvenliği ve tehdit takibi
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSecurityData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Güvenlik Raporu
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {securityStats.map((stat) => {
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
                    <div className="mt-2 flex items-center">
                      {stat.changeType === 'increase' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`ml-1 text-sm font-medium ${
                          stat.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
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

      {/* Security Tabs */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                      : 'border border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Health */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span>Aktif Güvenlik</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">
                          Güvenlik Duvarı
                        </span>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">
                          DDoS Koruması
                        </span>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">
                          SSL Sertifikası
                        </span>
                        <Badge variant="success">Geçerli</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">
                          2FA Zorunluluğu
                        </span>
                        <Badge variant="success">Etkin</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Dikkat Gereken Alanlar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">
                          Şifre Politikası
                        </span>
                        <Badge variant="warning">Güncellenebilir</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">
                          Session Timeout
                        </span>
                        <Badge variant="warning">Uzun</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">
                          Log Retention
                        </span>
                        <Badge variant="warning">90 Gün</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">
                          Admin Hesapları
                        </span>
                        <Badge variant="warning">12 Aktif</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Son Güvenlik Olayları
                </h3>
                <Badge variant="outline" className="text-gray-600">
                  {securityEvents.length} olay
                </Badge>
              </div>

              {securityEvents.map((event) => {
                const Icon = getEventIcon(event.type);

                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="rounded-lg bg-gray-50 p-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {event.title}
                            </h4>
                            {getSeverityBadge(event.severity)}
                          </div>
                          <p className="mb-2 text-sm text-gray-600">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>{event.ip}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Kullanıcı: {event.user}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            Aksiyon: {event.action}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedTab === 'blocked' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Yasaklı IP Adresleri
                </h3>
                <Badge variant="outline" className="text-gray-600">
                  {bannedIPs.length} IP
                </Badge>
              </div>

              {bannedIPs.map((bannedIP, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-2 flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {bannedIP.ip}
                        </h4>
                        <Badge variant="destructive">Yasaklı</Badge>
                      </div>
                      <p className="mb-2 text-sm text-gray-600">
                        Sebep: {bannedIP.reason}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Yasaklandı: {bannedIP.bannedAt}</span>
                        <span>Bitiş: {bannedIP.expiresAt}</span>
                        <span>Deneme sayısı: {bannedIP.attempts}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Kaldır
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Güvenlik Ayarları
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Kimlik Doğrulama
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          İki Faktörlü Kimlik Doğrulama
                        </span>
                        <Button variant="outline" size="sm">
                          Yapılandır
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Timeout (dk)</span>
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Şifre Karmaşıklığı</span>
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Güvenlik Duvarı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DDoS Koruması</span>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Rate Limiting (istek/dk)
                        </span>
                        <input
                          type="number"
                          defaultValue="100"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">IP Whitelist</span>
                        <Button variant="outline" size="sm">
                          Yönet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminSecurity;
