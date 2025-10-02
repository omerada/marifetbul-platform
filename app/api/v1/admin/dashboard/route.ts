import { NextRequest, NextResponse } from 'next/server';
import type { AdminDashboardData, SecurityAlert, SystemHealth } from '@/types';

/**
 * GET /api/v1/admin/dashboard
 * Admin dashboard data endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (would normally validate JWT token)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Mock data for development - replace with real database queries
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'security',
        title: 'Şüpheli Giriş Tespit Edildi',
        description: 'Birden fazla IP adresinden başarısız giriş denemeleri',
        severity: 'high',
        priority: 'high',
        category: 'Güvenlik',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        type: 'warning',
        title: 'Yüksek Sistem Yükü',
        description: 'CPU kullanımı %85 seviyesinde',
        severity: 'medium',
        priority: 'medium',
        category: 'Performans',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: '3',
        type: 'warning',
        title: 'İçerik Raporu',
        description: '3 yeni içerik raporu denetim bekliyor',
        severity: 'low',
        priority: 'medium',
        category: 'Denetim',
        isRead: true,
        isResolved: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
    ];

    const mockSystemHealth: SystemHealth = {
      status: 'healthy',
      uptime: 99.98,
      responseTime: 142,
      lastCheck: new Date().toISOString(),
      issues: [],
      metrics: {
        cpu: 23,
        memory: 67,
        disk: 34,
        network: 12,
      },
    };

    const mockRecentActivity: SecurityAlert[] = [
      {
        id: '1',
        type: 'security',
        title: 'Yeni kullanıcı kaydı',
        description: 'Ahmet Yılmaz platforme katıldı',
        severity: 'low',
        isResolved: true,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'security',
        title: 'Yeni iş ilanı',
        description: 'React Developer pozisyonu yayınlandı',
        severity: 'low',
        isResolved: true,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'security',
        title: 'Ödeme tamamlandı',
        description: '₺2,500 tutarında ödeme gerçekleşti',
        severity: 'low',
        isResolved: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    // Generate mock stats
    const mockStats = {
      totalUsers: 12847 + Math.floor(Math.random() * 100),
      activeUsers: 3245 + Math.floor(Math.random() * 50),
      newUsersToday: 23 + Math.floor(Math.random() * 10),
      newUsersThisWeek: 156 + Math.floor(Math.random() * 20),
      newUsersThisMonth: 743 + Math.floor(Math.random() * 50),

      totalJobs: 8934 + Math.floor(Math.random() * 100),
      activeJobs: 234 + Math.floor(Math.random() * 20),
      completedJobs: 8700 + Math.floor(Math.random() * 50),
      pendingOrders: 45 + Math.floor(Math.random() * 10),

      monthlyRevenue: 125750 + Math.floor(Math.random() * 10000),
      totalRevenue: 1847392 + Math.floor(Math.random() * 50000),
      revenueGrowth: 12.5 + Math.random() * 5,
      pendingPayouts: 5640 + Math.floor(Math.random() * 500),

      conversionRate: 3.2 + Math.random() * 2,
      userRetentionRate: 78.5 + Math.random() * 10,
      averageOrderValue: 1250 + Math.floor(Math.random() * 500),

      supportTickets: 23 + Math.floor(Math.random() * 10),
      pendingModerations: 12 + Math.floor(Math.random() * 5),
      platformFeeTotal: 18473 + Math.floor(Math.random() * 1000),
    };

    const mockCharts = {
      userGrowth: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [
          {
            label: 'Yeni Kullanıcılar',
            data: [450, 523, 612, 578, 689, 743],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        ],
      },
      revenue: {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [
          {
            label: 'Gelir (₺)',
            data: [85000, 92000, 108000, 115000, 121000, 125750],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          },
        ],
      },
      jobs: {
        labels: [
          'Pazartesi',
          'Salı',
          'Çarşamba',
          'Perşembe',
          'Cuma',
          'Cumartesi',
          'Pazar',
        ],
        datasets: [
          {
            label: 'Yeni İş İlanları',
            data: [12, 19, 15, 25, 22, 18, 8],
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
          },
        ],
      },
    };

    const dashboardData: AdminDashboardData = {
      stats: mockStats,
      charts: mockCharts,
      alerts: mockAlerts,
      recentActivity: mockRecentActivity,
      systemHealth: mockSystemHealth,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
        message: 'Dashboard data retrieved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Dashboard verisi alınamadı',
      },
      { status: 500 }
    );
  }
}
