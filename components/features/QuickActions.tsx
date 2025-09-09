'use client';

import React from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Search,
  MessageCircle,
  Calendar,
  FileText,
  Users,
  Settings,
  Eye,
  Edit,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  user: User;
}

export function QuickActions({ user }: QuickActionsProps) {
  if (user.userType === 'freelancer') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hızlı Eylemler</h3>
          <span className="text-sm text-gray-500">Sık kullanılan işlemler</span>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/jobs" className="group">
            <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900">İş Ara</span>
              <span className="text-xs text-gray-500">Yeni projeler</span>
            </div>
          </Link>

          <Link href="/profile/edit" className="group">
            <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                <Edit className="h-6 w-6 text-green-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900">Profil Düzenle</span>
              <span className="text-xs text-gray-500">Bilgileri güncelle</span>
            </div>
          </Link>

          <button className="group">
            <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900">Mesajlar</span>
              <span className="text-xs text-gray-500">3 yeni mesaj</span>
            </div>
          </button>

          <Link href={`/profile/${user.id}`} className="group">
            <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900">Profilim</span>
              <span className="text-xs text-gray-500">Profili görüntüle</span>
            </div>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Diğer İşlemler</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Takvim
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sözleşmeler
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Portfolyo
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hızlı Eylemler</h3>
        <span className="text-sm text-gray-500">Sık kullanılan işlemler</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <button className="group">
          <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900">İş İlanı Ver</span>
            <span className="text-xs text-gray-500">Yeni proje</span>
          </div>
        </button>

        <Link href="/marketplace" className="group">
          <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900">Freelancer Ara</span>
            <span className="text-xs text-gray-500">Yetenekli kişiler</span>
          </div>
        </Link>

        <button className="group">
          <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900">Mesajlar</span>
            <span className="text-xs text-gray-500">5 yeni mesaj</span>
          </div>
        </button>

        <button className="group">
          <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900">Ekibim</span>
            <span className="text-xs text-gray-500">Çalışanlar</span>
          </div>
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Diğer İşlemler</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Takvim
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Raporlar
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            İşe Alınanlar
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </div>
    </Card>
  );
}
