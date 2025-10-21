'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, Check, X, Clock } from 'lucide-react';

export default function EmployerProposalsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alınan Teklifler</h1>
        <p className="mt-1 text-gray-600">
          İş ilanlarınıza gelen teklifleri değerlendirin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kabul Edilen</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reddedilen</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Proposals List */}
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz teklif yok
        </h3>
        <p className="mt-2 text-gray-500">
          İş ilanı oluşturduğunuzda freelancer&apos;lardan teklifler alacaksınız
        </p>
      </Card>
    </div>
  );
}
