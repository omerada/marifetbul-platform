'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

export default function FreelancerReviewsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Değerlendirmeler</h1>
        <p className="mt-1 text-gray-600">
          Aldığınız müşteri değerlendirmelerini görüntüleyin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ortalama Puan</p>
              <div className="mt-1 flex items-center">
                <p className="text-3xl font-bold text-yellow-600">0.0</p>
                <Star className="ml-2 h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Değerlendirme</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">0</p>
            </div>
            <ThumbsUp className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Yorumlar</p>
              <p className="mt-1 text-3xl font-bold text-purple-600">0</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="p-8 text-center">
        <Star className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz değerlendirmeniz yok
        </h3>
        <p className="mt-2 text-gray-500">
          İşleri tamamladıkça müşterilerden değerlendirme alacaksınız
        </p>
      </Card>
    </div>
  );
}
