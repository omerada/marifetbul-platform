/**
 * Dashboard Constants
 *
 * Configuration data for dashboard components
 */

import {
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  Clock,
} from 'lucide-react';
import type {
  StatCard,
  ActivityItem,
  PendingTask,
  DemoFeature,
} from '../types/adminDashboardTypes';

// ============================================================================
// Stat Cards Configuration
// ============================================================================

export const STAT_CARDS_CONFIG: Omit<StatCard, 'value' | 'change'>[] = [
  {
    title: 'Toplam Kullanıcı',
    name: 'users',
    icon: Users,
    color: 'blue',
    trend: 'up',
  },
  {
    title: 'Aylık Gelir',
    name: 'revenue',
    icon: DollarSign,
    color: 'green',
    trend: 'up',
  },
  {
    title: 'Aktif Siparişler',
    name: 'orders',
    icon: ShoppingCart,
    color: 'orange',
    trend: 'up',
  },
  {
    title: 'Dönüşüm Oranı',
    name: 'conversion',
    icon: TrendingUp,
    color: 'purple',
    trend: 'up',
  },
];

// ============================================================================
// Activity Items
// ============================================================================

export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    icon: Users,
    color: 'blue',
    title: 'Yeni kullanıcı kaydı',
    time: '2 dakika önce',
    detail: 'Ahmet Yılmaz serbest çalışan olarak katıldı',
  },
  {
    icon: Briefcase,
    color: 'green',
    title: 'İş ilanı yayınlandı',
    time: '8 dakika önce',
    detail: 'Web geliştirme projesi',
  },
  {
    icon: DollarSign,
    color: 'emerald',
    title: 'Ödeme tamamlandı',
    time: '15 dakika önce',
    detail: '₺2,500 işlem',
  },
  {
    icon: AlertTriangle,
    color: 'red',
    title: 'İçerik rapor edildi',
    time: '32 dakika önce',
    detail: 'İnceleme gerekli',
  },
];

// ============================================================================
// Pending Tasks
// ============================================================================

export const DEFAULT_TASKS: PendingTask[] = [
  {
    icon: Clock,
    title: 'Kullanıcı Onayları',
    description: 'Bekleyen kullanıcı onaylarını inceleyin',
    count: 23,
    color: 'orange',
  },
  {
    icon: AlertTriangle,
    title: 'Denetim Kuyruğu',
    description: 'İçerikleri denetleyin ve onaylayın',
    count: 12,
    color: 'red',
  },
  {
    icon: MessageSquare,
    title: 'Destek Talepleri',
    description: 'Bekleyen destek taleplerini yanıtlayın',
    count: 8,
    color: 'blue',
  },
  {
    icon: ShoppingCart,
    title: 'Bekleyen Ödemeler',
    description: 'Ödeme işlemlerini kontrol edin',
    count: 5,
    color: 'purple',
  },
];

// ============================================================================
// Demo Features
// ============================================================================

export const DEMO_FEATURES: DemoFeature[] = [
  {
    label: 'Kullanıcı Yönetimi',
    status: 'Aktif',
  },
  {
    label: 'Gerçek Zamanlı Analitik',
    status: 'Canlı',
  },
  {
    label: 'İçerik Denetimi',
    status: 'Hazır',
  },
  {
    label: 'Platform Ayarları',
    status: 'Yapılandırıldı',
  },
];

// ============================================================================
// Color Mappings
// ============================================================================

export const STAT_COLOR_CONFIG = {
  users: {
    text: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
  },
  revenue: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  },
  orders: {
    text: 'text-orange-600',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
  },
  conversion: {
    text: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
  },
} as const;

export const ACTIVITY_COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  red: 'bg-red-100 text-red-600',
} as const;

export const TASK_COLOR_MAP = {
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  red: 'text-red-600 bg-red-50 border-red-200',
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
  purple: 'text-purple-600 bg-purple-50 border-purple-200',
} as const;

export const PRIORITY_CONFIG = {
  critical: {
    bg: 'bg-gradient-to-r from-red-50 to-red-100',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  high: {
    bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  medium: {
    bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  low: {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
} as const;
