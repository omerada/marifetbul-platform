'use client';

import React from 'react';
import Image from 'next/image';
import { Freelancer } from '@/types';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { PortfolioGallery } from '@/components/shared/features';
import {
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Globe,
  MessageCircle,
  Heart,
  Share2,
  Award,
  Clock,
} from 'lucide-react';

interface ProfileViewProps {
  freelancer: Freelancer;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onSendMessage?: () => void;
  onHire?: () => void;
}

export function ProfileView({
  freelancer,
  isOwnProfile = false,
  onEditProfile,
  onSendMessage,
  onHire,
}: ProfileViewProps) {
  const profileCompleteness = calculateProfileCompleteness(freelancer);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Avatar & Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                  {freelancer.avatar ? (
                    <Image
                      src={freelancer.avatar}
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100">
                      <span className="text-2xl font-bold text-blue-600">
                        {freelancer.firstName?.[0] || 'F'}
                        {freelancer.lastName?.[0] || ''}
                      </span>
                    </div>
                  )}
                </div>
                {freelancer.isOnline && (
                  <div className="absolute right-2 bottom-2 h-6 w-6 rounded-full border-2 border-white bg-green-500"></div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-6 flex-1 lg:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {freelancer.firstName} {freelancer.lastName}
                  </h1>

                  {freelancer.title && (
                    <p className="mt-1 text-xl text-gray-600">
                      {freelancer.title}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {freelancer.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {freelancer.location}
                      </div>
                    )}

                    {freelancer.rating && (
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                        {freelancer.rating.toFixed(1)} (
                        {freelancer.reviewCount || freelancer.totalReviews || 0}{' '}
                        değerlendirme)
                      </div>
                    )}

                    {freelancer.hourlyRate && (
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {freelancer.hourlyRate}₺/saat
                      </div>
                    )}

                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {freelancer.createdAt
                        ? new Date(freelancer.createdAt).toLocaleDateString(
                            'tr-TR'
                          )
                        : 'Belirtilmemiş'}{' '}
                      tarihinde katıldı
                    </div>
                  </div>

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {freelancer.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 6 && (
                          <Badge variant="outline">
                            +{freelancer.skills.length - 6} daha
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:ml-6 sm:flex-row">
                  {isOwnProfile ? (
                    <>
                      <Button onClick={onEditProfile} variant="outline">
                        Profili Düzenle
                      </Button>
                      <Button>
                        <Share2 className="mr-2 h-4 w-4" />
                        Paylaş
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={onSendMessage} variant="outline">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Mesaj Gönder
                      </Button>
                      <Button onClick={onHire}>İşe Al</Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {/* About */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Hakkımda
              </h2>
              {freelancer.bio ? (
                <p className="leading-relaxed text-gray-700">
                  {freelancer.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  Henüz bir biyografi eklenmemiş.
                </p>
              )}
            </Card>

            {/* Portfolio */}
            <PortfolioGallery
              freelancer={freelancer}
              isOwnProfile={isOwnProfile}
            />

            {/* Experience & Education */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Deneyim
              </h2>
              <div className="py-8 text-center">
                <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">
                  Deneyim bilgileri yakında eklenecek!
                </p>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Değerlendirmeler
              </h2>
              <div className="py-8 text-center">
                <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">Henüz değerlendirme yok.</p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* Profile Completeness (Own Profile Only) */}
            {isOwnProfile && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Profil Tamamlanma
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      İlerleme
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {profileCompleteness}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${profileCompleteness}%` }}
                    ></div>
                  </div>
                  {profileCompleteness < 100 && (
                    <p className="text-xs text-gray-600">
                      Profilinizi tamamlayarak daha fazla iş fırsatı yakalayın!
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Hızlı Bilgiler
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Deneyim Seviyesi
                  </span>
                  <Badge
                    variant={
                      freelancer.experience === 'expert'
                        ? 'default'
                        : freelancer.experience === 'intermediate'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {freelancer.experience === 'expert'
                      ? 'Uzman'
                      : freelancer.experience === 'intermediate'
                        ? 'Orta'
                        : 'Başlangıç'}
                  </Badge>
                </div>

                {(freelancer.completedProjects || freelancer.completedJobs) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Tamamlanan Projeler
                    </span>
                    <span className="text-sm font-medium">
                      {freelancer.completedProjects || freelancer.completedJobs}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yanıt Süresi</span>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4 text-green-500" />
                    <span>~1 saat</span>
                  </div>
                </div>

                {freelancer.languages && freelancer.languages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Diller</span>
                    <span className="text-sm font-medium">
                      {freelancer.languages.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                İletişim
              </h3>

              <div className="space-y-3">
                {freelancer.website && (
                  <a
                    href={freelancer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </a>
                )}

                {freelancer.socialLinks?.linkedin && (
                  <a
                    href={freelancer.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <span className="mr-2 h-4 w-4">in</span>
                    LinkedIn
                  </a>
                )}

                {freelancer.socialLinks?.github && (
                  <a
                    href={freelancer.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <span className="mr-2 h-4 w-4">gh</span>
                    GitHub
                  </a>
                )}
              </div>
            </Card>

            {/* Verification Status */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Doğrulamalar
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    Email Doğrulandı
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Telefon Doğrulanmadı
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Kimlik Doğrulanmadı
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(freelancer: Freelancer): number {
  const fields = [
    freelancer.firstName,
    freelancer.lastName,
    freelancer.email,
    freelancer.bio,
    freelancer.title,
    freelancer.location,
    freelancer.avatar,
    freelancer.skills && freelancer.skills.length > 0,
    freelancer.hourlyRate,
    freelancer.experience,
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}
