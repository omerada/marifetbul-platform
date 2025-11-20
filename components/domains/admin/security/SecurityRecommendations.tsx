/**
 * ================================================
 * SECURITY RECOMMENDATIONS
 * ================================================
 * Component displaying security best practices and recommendations
 *
 * Features:
 * - Security checklist
 * - Status indicators
 * - Recommendations based on 2FA status
 *
 * @version 1.0.0
 * @sprint Sprint 2: Admin 2FA System
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  Key,
  Smartphone,
  Lock,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityRecommendationsProps {
  twoFactorEnabled: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SecurityRecommendations Component
 */
export function SecurityRecommendations({
  twoFactorEnabled,
}: SecurityRecommendationsProps) {
  const recommendations = [
    {
      id: 'strong-password',
      title: 'Güçlü Parola Kullanın',
      description:
        'En az 12 karakter, büyük/küçük harf, rakam ve özel karakter içeren parola',
      icon: Lock,
      status: 'recommended' as const,
    },
    {
      id: '2fa-enabled',
      title: 'İki Faktörlü Doğrulama',
      description: 'Hesabınıza ek güvenlik katmanı sağlar',
      icon: Shield,
      status: twoFactorEnabled ? ('completed' as const) : ('action' as const),
    },
    {
      id: 'backup-codes',
      title: 'Yedek Kodları Saklayın',
      description: 'Authenticator erişimi kaybında giriş yapabilmeniz için',
      icon: Key,
      status: twoFactorEnabled
        ? ('recommended' as const)
        : ('disabled' as const),
    },
    {
      id: 'secure-device',
      title: 'Güvenli Cihaz Kullanın',
      description: 'Güncel işletim sistemi ve antivirüs yazılımı',
      icon: Smartphone,
      status: 'recommended' as const,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'action':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'recommended':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case 'disabled':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'action':
        return 'Aksiyon Gerekli';
      case 'recommended':
        return 'Önerilen';
      case 'disabled':
        return 'İlk önce 2FA aktif edin';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'action':
        return 'text-orange-600';
      case 'recommended':
        return 'text-blue-600';
      case 'disabled':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Güvenlik Önerileri</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    {getStatusIcon(rec.status)}
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <p
                    className={`text-xs font-medium ${getStatusColor(rec.status)}`}
                  >
                    {getStatusText(rec.status)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Security Score */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Güvenlik Skoru
              </p>
              <p className="text-xs text-gray-500">
                {twoFactorEnabled
                  ? 'Mükemmel - Hesabınız iyi korunuyor'
                  : 'Orta - 2FA ile güvenliği artırabilirsiniz'}
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {twoFactorEnabled ? '95%' : '60%'}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: twoFactorEnabled ? '95%' : '60%' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SecurityRecommendations;
