'use client';

import { useState } from 'react';
import { AvatarGallery } from './AvatarGallery';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvatar?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentAvatar,
  onAvatarUpdate,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onAvatarUpdate(selectedAvatar);
    onClose();
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold">Profil Fotoğrafı Seç</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <AvatarGallery
            userId={userId}
            currentAvatar={selectedAvatar}
            onAvatarSelect={handleAvatarSelect}
          />
        </div>

        <div className="sticky bottom-0 flex justify-end space-x-3 border-t border-gray-200 bg-white px-6 py-4">
          <Button onClick={onClose} variant="outline">
            İptal
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={selectedAvatar === currentAvatar}
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
};
