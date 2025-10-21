'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { FileText, Send, Clock } from 'lucide-react';

export default function FreelancerProposalsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tekliflerim</h1>
          <p className="mt-1 text-gray-600">
            Gönderdiğiniz teklifleri takip edin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gönderilen</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Send className="h-6 w-6 text-blue-600" />
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
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Proposals List */}
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz teklifiniz yok
        </h3>
        <p className="mt-2 text-gray-500">
          İş ilanlarına teklif göndererek işe başlayın
        </p>
        <Link href="/marketplace/jobs">
          <Button className="mt-4">İş İlanlarına Göz At</Button>
        </Link>
      </Card>
    </div>
  );
}
