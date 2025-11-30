'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Freelancer, Employer } from '@/types';
import { useProfile, useProfileEdit } from '@/hooks';
import { useToast } from '@/hooks';
import { AvatarUpload } from './AvatarUpload';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  freelancerProfileSchema,
  employerProfileSchema,
  type FreelancerProfileFormData,
  type EmployerProfileFormData,
  calculateProfileCompleteness,
  fieldLabels,
} from '@/lib/core/validations/profile';
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

type ProfileFormData = FreelancerProfileFormData | EmployerProfileFormData;

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = React.useState<'basic' | 'professional'>(
    'basic'
  );

  const isFreelancer = user.userType === 'freelancer';
  const schema = isFreelancer ? freelancerProfileSchema : employerProfileSchema;

  // Setup react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
      ...(isFreelancer && {
        title: (user as Freelancer).title || '',
        hourlyRate: (user as Freelancer).hourlyRate || 0,
        experience: (user as Freelancer).experience || '',
        skills: (user as Freelancer).skills || [],
      }),
      ...(!isFreelancer && {
        companyName: (user as Employer).companyName || '',
        industry: (user as Employer).industry || '',
        companySize: (user as Employer).companySize || '',
      }),
    },
  });

  // Watch all form values for completeness calculation
  const formValues = watch();

  // Calculate profile completeness
  const { percentage: completeness, missingFields } = React.useMemo(
    () =>
      calculateProfileCompleteness(
        formValues,
        isFreelancer ? 'freelancer' : 'employer'
      ),
    [formValues, isFreelancer]
  );

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        website: profile.website || '',
        ...(isFreelancer && {
          title: (profile as Freelancer).title || '',
          hourlyRate: (profile as Freelancer).hourlyRate || 0,
          experience: (profile as Freelancer).experience || '',
          skills: (profile as Freelancer).skills || [],
        }),
        ...(!isFreelancer && {
          companyName: (profile as Employer).companyName || '',
          industry: (profile as Employer).industry || '',
          companySize: (profile as Employer).companySize || '',
        }),
      });
    }
  }, [profile, isFreelancer, reset]);

  // Enhanced auto-save with useProfileEdit hook
  const { queueSave, forceSave, isSaving, hasUnsavedChanges, lastSavedText } =
    useProfileEdit();

  // Auto-save when form changes
  useEffect(() => {
    if (isDirty) {
      queueSave(formValues as Record<string, unknown>);
    }
  }, [formValues, isDirty, queueSave]);

  // Submit handler - Force save and navigate
  const onSubmit = handleSubmit(async (data) => {
    try {
      await forceSave(data as Record<string, unknown>);
      reset(data); // Mark as pristine
      router.push(`/profile/${user.id}`);
    } catch {
      showError('Hata', 'Profil güncellenirken bir hata oluştu');
    }
  });

  // Avatar update handler
  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
      success('Başarılı', 'Profil fotoğrafı güncellendi!');
    } catch {
      showError('Hata', 'Fotoğraf yüklenirken bir hata oluştu');
    }
  };

  // Skills management for freelancers
  const skills = (watch('skills' as keyof ProfileFormData) as string[]) || [];

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setValue(
        'skills' as keyof ProfileFormData,
        [...skills, skill.trim()] as never,
        {
          shouldDirty: true,
        }
      );
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      'skills' as keyof ProfileFormData,
      skills.filter((s: string) => s !== skillToRemove) as never,
      { shouldDirty: true }
    );
  };

  // Loading state
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
          {/* Auto-save status */}
          {isSaving && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              Kaydediliyor...
            </div>
          )}
          {!isSaving && lastSavedText && (
            <div className="text-sm text-gray-500">{lastSavedText}</div>
          )}
          {!isSaving && hasUnsavedChanges && (
            <div className="text-sm text-orange-600">
              Kaydedilmemiş değişiklikler
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => router.push(`/profile/${user.id}`)}
            disabled={isUpdating || isSaving}
          >
            İptal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !isDirty || isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {isSubmitting || isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
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
              type="button"
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
                      {...register('firstName')}
                      placeholder="Adınızı girin"
                      error={errors.firstName?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Soyad *
                    </label>
                    <Input
                      {...register('lastName')}
                      placeholder="Soyadınızı girin"
                      error={errors.lastName?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Biyografi
                  </label>
                  <textarea
                    {...register('bio')}
                    className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Kendinizi tanıtın..."
                    rows={4}
                    maxLength={1000}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bio.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {(watch('bio') || '').length}/1000 karakter
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      <MapPin className="mr-1 inline h-4 w-4" />
                      Lokasyon
                    </label>
                    <Input
                      {...register('location')}
                      placeholder="Şehir, Ülke"
                      error={errors.location?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      <Phone className="mr-1 inline h-4 w-4" />
                      Telefon
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="+90 555 123 45 67"
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Globe className="mr-1 inline h-4 w-4" />
                    Website
                  </label>
                  <Input
                    {...register('website')}
                    placeholder="https://website.com"
                    type="url"
                    error={errors.website?.message}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Professional Information Tab - NEXT SECTION */}
          {activeTab === 'professional' && (
            <Card className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {isFreelancer ? 'Profesyonel Bilgiler' : 'Şirket Bilgileri'}
              </h2>

              {isFreelancer ? (
                <FreelancerFields
                  register={register}
                  errors={errors}
                  skills={skills}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                />
              ) : (
                <EmployerFields register={register} errors={errors} />
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <ProfileSidebar
          user={user}
          profile={profile}
          completeness={completeness}
          missingFields={missingFields}
          handleAvatarUpdate={handleAvatarUpdate}
          isFreelancer={isFreelancer}
        />
      </div>

      {/* Save Changes Bar */}
      {isDirty && (
        <SaveChangesBar
          onCancel={() => reset()}
          onSave={onSubmit}
          isUpdating={isSubmitting}
        />
      )}
    </div>
  );
}

// ======================================
// SUB-COMPONENTS
// ======================================

interface FreelancerFieldsProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

function FreelancerFields({
  register,
  errors,
  skills,
  addSkill,
  removeSkill,
}: FreelancerFieldsProps) {
  const [newSkill, setNewSkill] = React.useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill);
      setNewSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Profesyonel Başlık
        </label>
        <Input
          {...register('title')}
          placeholder="Örn: Senior Full-Stack Developer"
          error={
            (errors as Record<string, { message?: string }>).title?.message
          }
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
              onClick={handleAddSkill}
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
        {(errors as Record<string, { message?: string }>).skills && (
          <p className="mt-1 text-sm text-red-600">
            {(errors as Record<string, { message?: string }>).skills.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Saatlik Ücret (TL)
          </label>
          <Input
            {...register('hourlyRate', { valueAsNumber: true })}
            type="number"
            placeholder="75"
            min="0"
            error={
              (errors as Record<string, { message?: string }>).hourlyRate
                ?.message
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deneyim Seviyesi
          </label>
          <select
            {...register('experience')}
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seçiniz</option>
            <option value="beginner">Başlangıç</option>
            <option value="intermediate">Orta</option>
            <option value="expert">Uzman</option>
          </select>
          {(errors as Record<string, { message?: string }>).experience && (
            <p className="mt-1 text-sm text-red-600">
              {
                (errors as Record<string, { message?: string }>).experience
                  .message
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmployerFieldsProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}

function EmployerFields({ register, errors }: EmployerFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Şirket Adı
        </label>
        <Input
          {...register('companyName')}
          placeholder="Şirket adınızı girin"
          error={
            (errors as Record<string, { message?: string }>).companyName
              ?.message
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sektör
          </label>
          <Input
            {...register('industry')}
            placeholder="Örn: Teknoloji"
            error={
              (errors as Record<string, { message?: string }>).industry?.message
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Şirket Büyüklüğü
          </label>
          <select
            {...register('companySize')}
            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seçiniz</option>
            <option value="1-10">1-10 çalışan</option>
            <option value="11-50">11-50 çalışan</option>
            <option value="51-200">51-200 çalışan</option>
            <option value="201-1000">201-1000 çalışan</option>
            <option value="1000+">1000+</option>
          </select>
          {(errors as Record<string, { message?: string }>).companySize && (
            <p className="mt-1 text-sm text-red-600">
              {
                (errors as Record<string, { message?: string }>).companySize
                  .message
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProfileSidebarProps {
  user: User;
  profile: User | null;
  completeness: number;
  missingFields: string[];
  handleAvatarUpdate: (url: string) => void;
  isFreelancer: boolean;
}

function ProfileSidebar({
  user,
  profile,
  completeness,
  missingFields,
  handleAvatarUpdate,
  isFreelancer,
}: ProfileSidebarProps) {
  return (
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
                    {fieldLabels[field] || field}
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
  );
}

interface SaveChangesBarProps {
  onCancel: () => void;
  onSave: () => void;
  isUpdating: boolean;
}

function SaveChangesBar({ onCancel, onSave, isUpdating }: SaveChangesBarProps) {
  return (
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
            onClick={onCancel}
            disabled={isUpdating}
          >
            Geri Al
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isUpdating}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Kaydet</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
