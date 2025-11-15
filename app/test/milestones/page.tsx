/**
 * ================================================
 * MILESTONE SYSTEM TEST PAGE
 * ================================================
 * Sprint 1 - Story 1.1 Visual Test
 * Test page for milestone components
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MilestoneList } from '@/components/domains/milestones';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Users, Briefcase } from 'lucide-react';

export default function MilestoneTestPage() {
  const [userRole, setUserRole] = useState<'FREELANCER' | 'EMPLOYER'>('FREELANCER');
  
  // Test order ID - replace with real order ID from your backend
  const testOrderId = '123e4567-e89b-12d3-a456-426614174000';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Milestone Payment System
          </h1>
          <p className="text-gray-600">
            Sprint 1 - Story 1.1: MilestoneList Component Test
          </p>
        </div>

        {/* Role Switcher */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Test Rolü
              </h2>
              <p className="text-sm text-gray-600">
                Farklı kullanıcı rolleri için görünümü test edin
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setUserRole('FREELANCER')}
                variant={userRole === 'FREELANCER' ? 'primary' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Freelancer
              </Button>
              <Button
                onClick={() => setUserRole('EMPLOYER')}
                variant={userRole === 'EMPLOYER' ? 'primary' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Employer
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Aktif Rol:</span>
            <Badge variant="outline" className="font-medium">
              {userRole === 'FREELANCER' ? '👨‍💻 Freelancer (Seller)' : '🏢 Employer (Buyer)'}
            </Badge>
          </div>
        </Card>

        {/* Order Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Sipariş Bilgileri
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sipariş ID:</span>
              <p className="font-mono text-xs text-gray-900 mt-1">{testOrderId}</p>
            </div>
            <div>
              <span className="text-gray-600">Paket:</span>
              <p className="text-gray-900 mt-1">Web Tasarım - Premium</p>
            </div>
          </div>
        </Card>

        {/* Milestone List Component */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Milestone Listesi
            </h2>
            <Badge variant="outline" className="text-xs">
              Story 1.1 ✅
            </Badge>
          </div>

          <MilestoneList
            orderId={testOrderId}
            userRole={userRole}
            showCreateButton={userRole === 'FREELANCER'}
            onCreateClick={() => {
              // eslint-disable-next-line no-console
              console.log('Create milestone clicked');
              alert('CreateMilestoneForm modal açılacak (Story 1.7)');
            }}
          />
        </div>

        {/* Documentation */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📚 Test Notları
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              ✅ <strong>Story 1.1:</strong> MilestoneList component tamamlandı
            </li>
            <li>
              ⏳ <strong>Story 1.2:</strong> API client zaten mevcut (lib/api/milestones.ts)
            </li>
            <li>
              ⏳ <strong>Story 1.3:</strong> Hooks zaten mevcut (hooks/business/useMilestones.ts)
            </li>
            <li>
              🔜 <strong>Story 1.4:</strong> DeliverMilestoneModal component eklenecek
            </li>
            <li>
              🔜 <strong>Story 1.5:</strong> AcceptMilestoneModal component eklenecek
            </li>
            <li>
              🔜 <strong>Story 1.6:</strong> RejectMilestoneModal component eklenecek
            </li>
          </ul>
        </Card>

        {/* API Note */}
        <Card className="p-6 mt-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            ⚠️ Backend Bağlantısı
          </h3>
          <p className="text-sm text-yellow-800">
            Bu test sayfası backend API&apos;ye gerçek istek gönderir. Backend sunucunuzun 
            <code className="mx-1 px-2 py-1 bg-yellow-100 rounded text-xs">
              localhost:8080
            </code>
            adresinde çalıştığından emin olun.
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            Test için backend&apos;de örnek milestone&apos;ları olan bir sipariş oluşturmanız gerekebilir.
          </p>
        </Card>
      </div>
    </div>
  );
}
