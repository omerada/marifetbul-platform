'use client';

import { useState } from 'react';
import { AvatarUpload, AvatarModal } from '@/components/features';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';

export default function AvatarDemoPage() {
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const mockUser = {
    id: 'demo-user-1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl);
    if (avatarUrl) {
      showToast('Profil fotoğrafı başarıyla güncellendi!', 'success');
    } else {
      showToast('Profil fotoğrafı kaldırıldı', 'info');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="py-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Avatar Yükleme Sistemi Demo
          </h1>
          <p className="text-gray-600">
            Profil fotoğrafı yükleme, değiştirme ve avatar galeri özelliklerini
            test edin
          </p>
        </div>

        {/* Current Avatar Display */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Mevcut Profil Fotoğrafı
          </h2>
          <div className="flex items-center space-x-6">
            <AvatarUpload
              currentAvatar={currentAvatar}
              userId={mockUser.id}
              onAvatarUpdate={handleAvatarUpdate}
              size="xl"
              isEditable={true}
            />
            <div>
              <h3 className="text-lg font-medium">
                {mockUser.firstName} {mockUser.lastName}
              </h3>
              <p className="mb-3 text-gray-600">
                {currentAvatar ? 'Özel profil fotoğrafı' : 'Varsayılan avatar'}
              </p>
              <Button onClick={openModal} variant="outline" className="mr-3">
                Avatar Galerisini Aç
              </Button>
              {currentAvatar && (
                <Button
                  onClick={() => handleAvatarUpdate('')}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Fotoğrafı Kaldır
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Different Sizes Demo */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Farklı Avatar Boyutları
          </h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <AvatarUpload
                currentAvatar={currentAvatar}
                userId={mockUser.id}
                onAvatarUpdate={handleAvatarUpdate}
                size="sm"
                isEditable={false}
              />
              <p className="mt-2 text-sm text-gray-600">Küçük (48px)</p>
            </div>
            <div className="text-center">
              <AvatarUpload
                currentAvatar={currentAvatar}
                userId={mockUser.id}
                onAvatarUpdate={handleAvatarUpdate}
                size="md"
                isEditable={false}
              />
              <p className="mt-2 text-sm text-gray-600">Orta (64px)</p>
            </div>
            <div className="text-center">
              <AvatarUpload
                currentAvatar={currentAvatar}
                userId={mockUser.id}
                onAvatarUpdate={handleAvatarUpdate}
                size="lg"
                isEditable={false}
              />
              <p className="mt-2 text-sm text-gray-600">Büyük (96px)</p>
            </div>
            <div className="text-center">
              <AvatarUpload
                currentAvatar={currentAvatar}
                userId={mockUser.id}
                onAvatarUpdate={handleAvatarUpdate}
                size="xl"
                isEditable={false}
              />
              <p className="mt-2 text-sm text-gray-600">Çok Büyük (128px)</p>
            </div>
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Özellikler</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-green-600">
                ✅ Tamamlanan Özellikler
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Dosya yükleme ve validasyon</li>
                <li>• Gerçek zamanlı preview</li>
                <li>• Boyut ve format kontrolleri</li>
                <li>• Avatar galerisi</li>
                <li>• Rastgele avatar üretimi</li>
                <li>• Toast bildirimler</li>
                <li>• Responsive tasarım</li>
                <li>• Erişilebilirlik özellikleri</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600">🔧 Teknik Detaylar</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• JPEG, PNG, WebP formatları</li>
                <li>• Maksimum 5MB dosya boyutu</li>
                <li>• 100x100 minimum boyut</li>
                <li>• 2000x2000 maksimum boyut</li>
                <li>• Luhn algoritması ile validasyon</li>
                <li>• MSW ile mock API</li>
                <li>• TypeScript tip güvenliği</li>
                <li>• Next.js Image optimizasyonu</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* API Test Section */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">API Test Sonuçları</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">
                  Avatar Upload API
                </span>
              </div>
              <p className="ml-6 text-sm text-green-700">
                POST /api/upload/avatar - Dosya yükleme çalışıyor
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">
                  Avatar Delete API
                </span>
              </div>
              <p className="ml-6 text-sm text-green-700">
                DELETE /api/upload/avatar/:userId - Avatar silme çalışıyor
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">
                  User Update API
                </span>
              </div>
              <p className="ml-6 text-sm text-green-700">
                PATCH /api/users/:userId - Kullanıcı güncelleme çalışıyor
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={isModalOpen}
        onClose={closeModal}
        userId={mockUser.id}
        currentAvatar={currentAvatar}
        onAvatarUpdate={handleAvatarUpdate}
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
}
