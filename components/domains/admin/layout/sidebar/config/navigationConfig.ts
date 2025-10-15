/**
 * Admin Navigation Configuration
 *
 * Centralized navigation structure for admin sidebar.
 * Contains all menu items, sub-items, icons, badges, and permissions.
 */

import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  BarChart3,
  CreditCard,
  MessageCircle,
  Database,
  Lock,
} from 'lucide-react';
import type { NavigationItem } from '../types/sidebarTypes';

export const NAVIGATION_ITEMS: Omit<NavigationItem, 'current'>[] = [
  {
    name: 'Ana Sayfa',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
    badge: 3,
    subItems: [
      { name: 'Tüm Kullanıcılar', href: '/admin/users', current: false },
      {
        name: 'Bekleyen Doğrulamalar',
        href: '/admin/users/verifications',
        current: false,
        badge: 3,
      },
      {
        name: 'Kullanıcı Grupları',
        href: '/admin/users/groups',
        current: false,
      },
      {
        name: 'Engellenen Kullanıcılar',
        href: '/admin/users/blocked',
        current: false,
      },
    ],
  },
  {
    name: 'Analitik',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: null,
    subItems: [
      { name: 'Genel Görünüm', href: '/admin/analytics', current: false },
      {
        name: 'Kullanıcı Analizi',
        href: '/admin/analytics/users',
        current: false,
      },
      {
        name: 'Finansal Analiz',
        href: '/admin/analytics/financial',
        current: false,
      },
      {
        name: 'Platform Performansı',
        href: '/admin/analytics/performance',
        current: false,
      },
    ],
  },
  {
    name: 'İçerik Denetimi',
    href: '/admin/moderation',
    icon: Shield,
    badge: 12,
    subItems: [
      {
        name: 'Bekleyen İncelemeler',
        href: '/admin/moderation',
        current: false,
        badge: 7,
      },
      {
        name: 'Raporlanan İçerik',
        href: '/admin/moderation/reports',
        current: false,
        badge: 5,
      },
      {
        name: 'Otomatik Kurallar',
        href: '/admin/moderation/rules',
        current: false,
      },
      {
        name: 'Engellenmiş İçerik',
        href: '/admin/moderation/blocked',
        current: false,
      },
    ],
  },
  {
    name: 'Finans Yönetimi',
    href: '/admin/financial',
    icon: CreditCard,
    badge: null,
    subItems: [
      { name: 'Genel Bakış', href: '/admin/financial', current: false },
      { name: 'Ödemeler', href: '/admin/financial/payments', current: false },
      {
        name: 'Para Çekme Talepleri',
        href: '/admin/financial/withdrawals',
        current: false,
        badge: 2,
      },
      {
        name: 'Komisyonlar',
        href: '/admin/financial/commissions',
        current: false,
      },
      {
        name: 'Fatura Yönetimi',
        href: '/admin/financial/invoices',
        current: false,
      },
    ],
  },
  {
    name: 'İçerik Yönetimi',
    href: '/admin/content',
    icon: FileText,
    badge: null,
    subItems: [
      { name: 'İş İlanları', href: '/admin/content/jobs', current: false },
      {
        name: 'Hizmet Paketleri',
        href: '/admin/content/packages',
        current: false,
      },
      {
        name: 'Kategoriler',
        href: '/admin/content/categories',
        current: false,
      },
      { name: 'Blog & Sayfalar', href: '/admin/content/pages', current: false },
      {
        name: 'Medya Kütüphanesi',
        href: '/admin/content/media',
        current: false,
      },
    ],
  },
  {
    name: 'Mesajlaşma',
    href: '/admin/messaging',
    icon: MessageCircle,
    badge: 8,
    subItems: [
      { name: 'Tüm Konuşmalar', href: '/admin/messaging', current: false },
      {
        name: 'Şikayet Edilen Mesajlar',
        href: '/admin/messaging/reports',
        current: false,
        badge: 3,
      },
      {
        name: 'Sistem Mesajları',
        href: '/admin/messaging/system',
        current: false,
      },
      {
        name: 'Engellenen Kelimeler',
        href: '/admin/messaging/blocked-words',
        current: false,
      },
    ],
  },
  {
    name: 'Destek Sistemi',
    href: '/admin/support',
    icon: MessageCircle,
    badge: 8,
    subItems: [
      {
        name: 'Destek Talepleri',
        href: '/admin/support',
        current: false,
        badge: 5,
      },
      {
        name: 'Sık Sorulan Sorular',
        href: '/admin/support/faq',
        current: false,
      },
      {
        name: 'Bilgi Bankası',
        href: '/admin/support/knowledge-base',
        current: false,
      },
      {
        name: 'Geri Bildirimler',
        href: '/admin/support/feedback',
        current: false,
        badge: 3,
      },
    ],
  },
  {
    name: 'Raporlar',
    href: '/admin/reports',
    icon: BarChart3,
    badge: null,
    subItems: [
      { name: 'Günlük Raporlar', href: '/admin/reports/daily', current: false },
      {
        name: 'Aylık Raporlar',
        href: '/admin/reports/monthly',
        current: false,
      },
      { name: 'Özel Raporlar', href: '/admin/reports/custom', current: false },
      {
        name: 'Performans Raporları',
        href: '/admin/reports/performance',
        current: false,
      },
    ],
  },
  {
    name: 'Sistem Yönetimi',
    href: '/admin/system',
    icon: Database,
    badge: null,
    permissions: ['super_admin'],
    subItems: [
      { name: 'Sistem Durumu', href: '/admin/system/health', current: false },
      { name: 'Yedekleme', href: '/admin/system/backup', current: false },
      { name: 'Loglar', href: '/admin/system/logs', current: false },
      {
        name: 'Performans İzleme',
        href: '/admin/system/performance',
        current: false,
      },
    ],
  },
  {
    name: 'Güvenlik',
    href: '/admin/security',
    icon: Lock,
    badge: null,
    permissions: ['super_admin', 'admin'],
    subItems: [
      { name: 'Güvenlik Ayarları', href: '/admin/security', current: false },
      {
        name: 'İki Faktörlü Doğrulama',
        href: '/admin/security/2fa',
        current: false,
      },
      {
        name: 'API Anahtarları',
        href: '/admin/security/api-keys',
        current: false,
      },
      {
        name: 'Güvenlik Logları',
        href: '/admin/security/logs',
        current: false,
      },
    ],
  },
  {
    name: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
    badge: null,
    subItems: [
      { name: 'Genel Ayarlar', href: '/admin/settings', current: false },
      {
        name: 'E-posta Şablonları',
        href: '/admin/settings/email',
        current: false,
      },
      {
        name: 'Bildirim Ayarları',
        href: '/admin/settings/notifications',
        current: false,
      },
      { name: 'API Ayarları', href: '/admin/settings/api', current: false },
      {
        name: 'Bakım Modu',
        href: '/admin/settings/maintenance',
        current: false,
      },
    ],
  },
];
