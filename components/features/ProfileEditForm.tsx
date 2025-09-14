'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Freelancer, Employer } from '@/types';
import { useProfile, useProfileValidation } from '@/hooks/useProfile';
import { AvatarUpload } from '@/components/features/AvatarUpload';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/hooks/useToast';
import {
  Save,
  ArrowLeft,
  User as UserIcon,
  Building,
  MapPin,
  Plus,
  X,
  Globe,
  Phone,
} from 'lucide-react';

interface ProfileEditFormProps {
  user: User;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  // Freelancer specific
  title?: string;
  hourlyRate?: number;
  experience?: string;
  skills?: string[];
  // Employer specific
  companyName?: string;
  industry?: string;
  companySize?: string;
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();
  const { completeness, missingFields } = useProfileValidation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'basic' | 'professional'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
  });

  // Skills state for freelancers
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const isFreelancer = user.userType === 'freelancer';

  // Initialize form data
  useEffect(() => {
    const currentData = profile || user;
    setFormData({
      firstName: currentData.firstName || '',
      lastName: currentData.lastName || '',
      email: currentData.email || '',
      bio: currentData.bio || '',
      location: currentData.location || '',
      phone: currentData.phone || '',
      website: currentData.website || '',
      ...(isFreelancer && {
        title: (currentData as Freelancer).title || '',
        hourlyRate: (currentData as Freelancer).hourlyRate || 0,
        experience: (currentData as Freelancer).experience || '',
      }),
      ...(!isFreelancer && {
        companyName: (currentData as Employer).companyName || '',
        industry: (currentData as Employer).industry || '',
        companySize: (currentData as Employer).companySize || '',
      }),
    });

    if (isFreelancer && (currentData as Freelancer).skills) {
      setSkills((currentData as Freelancer).skills || []);
    }
  }, [profile, user, isFreelancer]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        const submitData = {
          ...formData,
          ...(isFreelancer && { skills }),
        };

        await updateProfile(submitData);
        setHasChanges(false);
        showToast('Değişiklikler otomatik kaydedildi', 'success');
      } catch {
        // Silent fail for auto-save
        console.log('Auto-save failed');
      }
    }, 3000); // 3 seconds delay

    return () => clearTimeout(autoSaveTimer);
  }, [formData, skills, hasChanges, updateProfile, isFreelancer, showToast]);

  // Track changes
  useEffect(() => {
    const currentData = profile || user;
    const hasFormChanges =
      JSON.stringify(formData) !==
      JSON.stringify({
        firstName: currentData.firstName || '',
        lastName: currentData.lastName || '',
        email: currentData.email || '',
        bio: currentData.bio || '',
        location: currentData.location || '',
        phone: currentData.phone || '',
        website: currentData.website || '',
      });
    setHasChanges(hasFormChanges);
  }, [formData, profile, user]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        ...(isFreelancer && { skills }),
      };

      await updateProfile(submitData);
      showToast('Profil başarıyla güncellendi!', 'success');
      setHasChanges(false);
      router.push(`/profile/${user.id}`);
    } catch {
      showToast('Profil güncellenirken bir hata oluştu', 'error');
    }
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
      showToast('Profil fotoğrafı güncellendi!', 'success');
    } catch {
      showToast('Fotoğraf yüklenirken bir hata oluştu', 'error');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill('');
      setHasChanges(true);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    setHasChanges(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-96 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 rounded bg-gray-200"></div>
              <div className="h-48 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Düzenle</h1>
            <p className="mt-1 text-gray-600">
              Bilgilerinizi güncel tutarak daha fazla fırsat yakalayın
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/profile/${user.id}`)}
            disabled={isUpdating}
          >
            İptal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isUpdating || !hasChanges}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isUpdating ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="mr-2 inline h-4 w-4" />
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'professional'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="mr-2 inline h-4 w-4" />
              {isFreelancer ? 'Profesyonel' : 'Şirket'}
            </button>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Temel Bilgiler
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Ad *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      placeholder="Adınızı girin"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Soyad *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      placeholder="Soyadınızı girin"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Biyografi
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Kendinizi tanıtın..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(formData.bio || '').length}/1000 karakter
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      <MapPin className="mr-1 inline h-4 w-4" />
                      Lokasyon
                    </label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) =>
                        handleInputChange('location', e.target.value)
                      }
                      placeholder="Şehir, Ülke"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      <Phone className="mr-1 inline h-4 w-4" />
                      Telefon
                    </label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Globe className="mr-1 inline h-4 w-4" />
                    Website
                  </label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    placeholder="https://website.com"
                    type="url"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {isFreelancer ? 'Profesyonel Bilgiler' : 'Şirket Bilgileri'}
              </h2>

              {isFreelancer ? (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Profesyonel Başlık *
                    </label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      placeholder="ör. Full Stack Developer"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Beceriler *
                    </label>

                    <div className="mb-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Beceri ekleyin (ör. React)"
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          variant="outline"
                          disabled={!newSkill.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex cursor-pointer items-center space-x-1 hover:bg-red-100"
                          onClick={() => removeSkill(skill)}
                        >
                          <span>{skill}</span>
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Saatlik Ücret (TL)
                      </label>
                      <Input
                        value={formData.hourlyRate || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'hourlyRate',
                            Number(e.target.value)
                          )
                        }
                        type="number"
                        placeholder="75"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Deneyim Seviyesi *
                      </label>
                      <select
                        value={formData.experience || ''}
                        onChange={(e) =>
                          handleInputChange('experience', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seçiniz</option>
                        <option value="beginner">Başlangıç</option>
                        <option value="intermediate">Orta</option>
                        <option value="expert">Uzman</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Şirket Adı *
                    </label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) =>
                        handleInputChange('companyName', e.target.value)
                      }
                      placeholder="Şirket adınızı girin"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Sektör *
                      </label>
                      <Input
                        value={formData.industry || ''}
                        onChange={(e) =>
                          handleInputChange('industry', e.target.value)
                        }
                        placeholder="ör. Teknoloji"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Şirket Büyüklüğü
                      </label>
                      <select
                        value={formData.companySize || ''}
                        onChange={(e) =>
                          handleInputChange('companySize', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seçiniz</option>
                        <option value="1-10">1-10 çalışan</option>
                        <option value="11-50">11-50 çalışan</option>
                        <option value="51-200">51-200 çalışan</option>
                        <option value="201-1000">201-1000 çalışan</option>
                        <option value="1000+">1000+ çalışan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar Upload */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Profil Fotoğrafı
            </h3>
            <AvatarUpload
              currentAvatar={profile?.avatar || user.avatar}
              userId={user.id}
              onAvatarUpdate={handleAvatarUpdate}
              size="xl"
            />
          </Card>

          {/* Profile Completeness */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Profil Tamamlanma
            </h3>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    İlerleme
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {completeness}%
                  </span>
                </div>
                <Progress value={completeness} className="h-2" />
              </div>

              {missingFields.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-gray-600">Eksik alanlar:</p>
                  <div className="flex flex-wrap gap-1">
                    {missingFields.map((field, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {completeness >= 90 && (
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-sm text-green-800">
                    🎉 Profiliniz tamamlandı! Daha fazla iş fırsatı
                    yakalayabilirsiniz.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Tips */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Profil İpuçları
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <span>Profil fotoğrafınız profesyonel ve net olmalı</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <span>Biyografınızda yeteneklerinizi vurgulayın</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">•</span>
                <span>İletişim bilgilerinizi güncel tutun</span>
              </div>
              {isFreelancer && (
                <>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>Portfolyonuza en iyi çalışmalarınızı ekleyin</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">•</span>
                    <span>Becerilerinizi gerçekçi şekilde belirtin</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Save Changes Bar */}
      {hasChanges && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-700">
                Kaydedilmemiş değişiklikleriniz var
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    phone: user.phone || '',
                    website: user.website || '',
                  })
                }
                disabled={isUpdating}
              >
                Geri Al
              </Button>
              <Button
                size="sm"
                onClick={onSubmit}
                disabled={isUpdating}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Kaydet</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
