'use client';

import { useState } from 'react';
import { AvatarUpload } from './AvatarUpload';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import Image from 'next/image';

interface AvatarGalleryProps {
  userId: string;
  currentAvatar?: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

export const AvatarGallery: React.FC<AvatarGalleryProps> = ({
  userId,
  currentAvatar,
  onAvatarSelect,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

  // Predefined avatar options
  const defaultAvatars = [
    {
      id: 'default-1',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 1',
    },
    {
      id: 'default-2',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 2',
    },
    {
      id: 'default-3',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 3',
    },
    {
      id: 'default-4',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 4',
    },
    {
      id: 'default-5',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 5',
    },
    {
      id: 'default-6',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 6',
    },
    {
      id: 'default-7',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 7',
    },
    {
      id: 'default-8',
      url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8&backgroundColor=blue,green,red,yellow',
      name: 'Avatar 8',
    },
  ];

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleSaveSelection = () => {
    onAvatarSelect(selectedAvatar);
  };

  const handleCustomUpload = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onAvatarSelect(avatarUrl);
  };

  return (
    <div className="space-y-6">
      {/* Current Selection */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Mevcut Profil Fotoğrafı</h3>
        <div className="flex items-center space-x-4">
          <AvatarUpload
            currentAvatar={selectedAvatar}
            userId={userId}
            onAvatarUpdate={handleCustomUpload}
            size="lg"
            isEditable={false}
          />
          <div>
            <p className="text-sm text-gray-600">
              {selectedAvatar
                ? 'Profil fotoğrafınız seçildi'
                : 'Henüz profil fotoğrafı seçilmedi'}
            </p>
            {selectedAvatar !== currentAvatar && (
              <Button onClick={handleSaveSelection} size="sm" className="mt-2">
                Bu Fotoğrafı Kullan
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Custom Upload Section */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Özel Fotoğraf Yükle</h3>
        <div className="flex items-center space-x-4">
          <AvatarUpload
            currentAvatar=""
            userId={userId}
            onAvatarUpdate={handleCustomUpload}
            size="md"
            isEditable={true}
          />
          <div className="text-sm text-gray-600">
            <p>• Kendi fotoğrafınızı yükleyin</p>
            <p>• JPEG, PNG veya WebP formatında</p>
            <p>• Maksimum 5MB boyutunda</p>
          </div>
        </div>
      </Card>

      {/* Default Avatars Gallery */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Hazır Avatar Seçenekleri</h3>
        <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
          {defaultAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleAvatarSelect(avatar.url)}
              className={`h-16 w-16 overflow-hidden rounded-full border-2 transition-all duration-200 ${
                selectedAvatar === avatar.url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              } `}
              title={avatar.name}
            >
              <Image
                src={avatar.url}
                alt={avatar.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        {selectedAvatar &&
          defaultAvatars.some((a) => a.url === selectedAvatar) && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleSaveSelection}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Seçili Avatarı Kullan
              </Button>
            </div>
          )}
      </Card>

      {/* Avatar Generation Options */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Rastgele Avatar Oluştur</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                const randomSeed = Math.random().toString(36).substring(7);
                const generatedAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=blue,green,red,yellow`;
                handleAvatarSelect(generatedAvatar);
              }}
              variant="outline"
              size="sm"
            >
              Rastgele İnsan Avatar
            </Button>
            <Button
              onClick={() => {
                const randomSeed = Math.random().toString(36).substring(7);
                const generatedAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}&backgroundColor=blue,green,red,yellow`;
                handleAvatarSelect(generatedAvatar);
              }}
              variant="outline"
              size="sm"
            >
              Rastgele Robot Avatar
            </Button>
            <Button
              onClick={() => {
                const randomSeed = Math.random().toString(36).substring(7);
                const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}&backgroundColor=blue,green,red,yellow`;
                handleAvatarSelect(generatedAvatar);
              }}
              variant="outline"
              size="sm"
            >
              İsim Baş Harfleri
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Bu seçenekler ile size özel avatarlar oluşturabilirsiniz
          </p>
        </div>
      </Card>

      {/* Remove Avatar Option */}
      {selectedAvatar && (
        <Card className="border-red-200 p-4">
          <h3 className="mb-4 text-lg font-semibold text-red-700">
            Avatarı Kaldır
          </h3>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => {
                setSelectedAvatar('');
                onAvatarSelect('');
              }}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Profil Fotoğrafını Kaldır
            </Button>
            <p className="text-sm text-gray-600">
              Profil fotoğrafınızı tamamen kaldırır ve varsayılan ikona döner
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
