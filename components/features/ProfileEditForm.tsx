'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { User, Freelancer, Employer } from '@/types';
import useAuthStore from '@/lib/store/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Camera,
  Save,
  ArrowLeft,
  User as UserIcon,
  Building,
  MapPin,
  Plus,
  X,
} from 'lucide-react';

// Validation Schemas
const baseProfileSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Açıklama 500 karakterden fazla olamaz').optional(),
});

const freelancerProfileSchema = baseProfileSchema.extend({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır').optional(),
  hourlyRate: z.number().min(1, 'Saatlik ücret 1₺ dan az olamaz').optional(),
  skills: z.array(z.string()).min(1, 'En az 1 yetenek seçmelisiniz'),
});

const employerProfileSchema = baseProfileSchema.extend({
  companyName: z
    .string()
    .min(2, 'Şirket adı en az 2 karakter olmalıdır')
    .optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
});

type ProfileFormData = z.infer<typeof baseProfileSchema> & {
  title?: string;
  hourlyRate?: number;
  skills?: string[];
  companyName?: string;
  companySize?: string;
  industry?: string;
};

interface ProfileEditFormProps {
  user: User;
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(
    user.userType === 'freelancer' ? (user as Freelancer).skills : []
  );

  const schema =
    user.userType === 'freelancer'
      ? freelancerProfileSchema
      : employerProfileSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      ...(user.userType === 'freelancer' && {
        title: (user as Freelancer).title || '',
        hourlyRate: (user as Freelancer).hourlyRate || 0,
        skills: (user as Freelancer).skills || [],
      }),
      ...(user.userType === 'employer' && {
        companyName: (user as Employer).companyName || '',
        companySize: (user as Employer).companySize || '',
        industry: (user as Employer).industry || '',
      }),
    },
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Include skills for freelancers
      const submitData = {
        ...data,
        ...(user.userType === 'freelancer' && { skills }),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in store
      updateUser(submitData);

      // Show success message
      alert('Profil başarıyla güncellendi!');

      // Redirect to profile
      router.push(`/profile/${user.id}`);
    } catch {
      alert('Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setValue('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    setValue('skills', updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const companySizeOptions = [
    { value: '1-10', label: '1-10 Çalışan' },
    { value: '11-50', label: '11-50 Çalışan' },
    { value: '51-200', label: '51-200 Çalışan' },
    { value: '201-500', label: '201-500 Çalışan' },
    { value: '500+', label: '500+ Çalışan' },
  ];

  const industryOptions = [
    'Teknoloji',
    'Pazarlama',
    'Tasarım',
    'Yazılım',
    'E-ticaret',
    'Finans',
    'Sağlık',
    'Eğitim',
    'İnşaat',
    'Turizm',
    'Diğer',
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
          <h1 className="text-2xl font-bold text-gray-900">Profili Düzenle</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Profile Photo */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Profil Fotoğrafı
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Image
                src={user.avatar || '/images/default-avatar.jpg'}
                alt="Profil fotoğrafı"
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
              <button
                type="button"
                className="bg-primary-600 hover:bg-primary-700 absolute right-0 bottom-0 rounded-full p-1.5 text-white transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600">
                JPG, PNG veya GIF formatında, maksimum 5MB
              </p>
              <Button type="button" variant="outline" size="sm">
                Fotoğraf Yükle
              </Button>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <UserIcon className="mr-2 h-5 w-5" />
            Temel Bilgiler
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ad *
              </label>
              <Input
                {...register('firstName')}
                placeholder="Adınız"
                error={errors.firstName?.message}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Soyad *
              </label>
              <Input
                {...register('lastName')}
                placeholder="Soyadınız"
                error={errors.lastName?.message}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="email@example.com"
                error={errors.email?.message}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <Input
                {...register('phone')}
                placeholder="+90 555 123 45 67"
                error={errors.phone?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MapPin className="mr-1 inline h-4 w-4" />
                Konum
              </label>
              <Input
                {...register('location')}
                placeholder="Şehir, Ülke"
                error={errors.location?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hakkımda
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Kendinizi tanıtın..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.bio.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Freelancer Specific Fields */}
        {user.userType === 'freelancer' && (
          <>
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Freelancer Bilgileri
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Uzmanlik Alanı
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="örn: Full Stack Geliştirici"
                    error={errors.title?.message}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Saatlik Ücret (₺)
                  </label>
                  <Input
                    {...register('hourlyRate', { valueAsNumber: true })}
                    type="number"
                    placeholder="50"
                    error={errors.hourlyRate?.message}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Yetenekler *
                  </label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-primary-100 text-primary-800 inline-flex items-center rounded-full px-3 py-1 text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-primary-600 hover:text-primary-800 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Yeni yetenek ekle"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.skills.message}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Employer Specific Fields */}
        {user.userType === 'employer' && (
          <Card className="p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Building className="mr-2 h-5 w-5" />
              Şirket Bilgileri
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Şirket Adı
                </label>
                <Input
                  {...register('companyName')}
                  placeholder="Şirket Adı Ltd."
                  error={errors.companyName?.message}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Şirket Büyüklüğü
                </label>
                <select
                  {...register('companySize')}
                  className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Seçiniz</option>
                  {companySizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sektör
                </label>
                <select
                  {...register('industry')}
                  className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Seçiniz</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Kaydediliyor...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
