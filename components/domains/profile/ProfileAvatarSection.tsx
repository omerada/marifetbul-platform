'use client';

import { useState } from 'react';
import { AvatarUpload } from './AvatarUpload';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import logger from '@/lib/infrastructure/monitoring/logger';
import { User, Freelancer, Employer } from '@/types';

interface ProfileAvatarSectionProps {
  user: User | Freelancer | Employer;
  onUserUpdate: (updatedUser: Partial<User>) => void;
  isEditing?: boolean;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  user,
  onUserUpdate,
  isEditing = false,
}) => {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || '',
    website: user.website || '',
  });

  const handleAvatarUpdate = (avatarUrl: string) => {
    onUserUpdate({ avatar: avatarUrl });
  };

  const handleBasicInfoSave = async () => {
    try {
      // API call to update user
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Güncelleme baþarýsýz');
      }

      onUserUpdate(formData);
      setIsEditingBasic(false);
    } catch (error) {
      logger.error('Error updating user:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
    });
    setIsEditingBasic(false);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <AvatarUpload
            currentAvatar={user.avatar}
            userId={user.id}
            onAvatarUpdate={handleAvatarUpdate}
            size="xl"
            isEditable={isEditing}
          />
        </div>

        {/* User Info Section */}
        <div className="flex-1">
          {!isEditingBasic ? (
            // Display Mode
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                {user.userType === 'freelancer' &&
                  (user as Freelancer).title && (
                    <p className="mt-1 text-lg text-gray-600">
                      {(user as Freelancer).title}
                    </p>
                  )}
                {user.userType === 'employer' &&
                  (user as Employer).companyName && (
                    <p className="mt-1 text-lg text-gray-600">
                      {(user as Employer).companyName}
                    </p>
                  )}
              </div>

              {user.bio && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-700">
                    Hakkýnda
                  </h3>
                  <p className="text-gray-600">{user.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {user.location && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">??</span>
                    <span className="text-gray-600">{user.location}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">??</span>
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">??</span>
                  <span className="text-gray-600">{user.email}</span>
                </div>

                {user.website && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">??</span>
                    <a
                      href={
                        user.website.startsWith('http')
                          ? user.website
                          : `https://${user.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4">
                  <Button
                    onClick={() => setIsEditingBasic(true)}
                    variant="outline"
                    size="sm"
                  >
                    Bilgileri Düzenle
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Ad"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Soyad"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hakkýnda
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Kendiniz hakkýnda kýsa bir açýklama yazýn..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Konum"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Ýstanbul, Türkiye"
                />
                <Input
                  label="Telefon"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <Input
                label="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="www.example.com"
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBasicInfoSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Kaydet
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Ýptal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      {user.userType === 'freelancer' && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(user as Freelancer).rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Deðerlendirme</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {(user as Freelancer).completedJobs}
              </div>
              <div className="text-sm text-gray-500">Tamamlanan Ýþ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(user as Freelancer).totalReviews}
              </div>
              <div className="text-sm text-gray-500">Yorum</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {(user as Freelancer).responseTime}
              </div>
              <div className="text-sm text-gray-500">Yanýt Süresi</div>
            </div>
          </div>
        </div>
      )}

      {user.userType === 'employer' && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {(user as Employer).rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Deðerlendirme</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {(user as Employer).completedJobs}
              </div>
              <div className="text-sm text-gray-500">Tamamlanan Ýþ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(user as Employer).activeJobs}
              </div>
              <div className="text-sm text-gray-500">Aktif Ýþ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ?{(user as Employer).totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Toplam Harcama</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
