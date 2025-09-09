'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  User,
  Star,
  Calendar,
  Users,
  Award,
  Send,
  Heart,
  Share2,
  Flag,
} from 'lucide-react';
import { Job } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProposalForm } from './ProposalForm';

interface JobDetailProps {
  job: Job;
  className?: string;
}

export function JobDetail({ job, className }: JobDetailProps) {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatBudget = (budget: Job['budget']) => {
    if (budget.type === 'fixed') {
      return `₺${budget.amount.toLocaleString('tr-TR')} (Sabit Ücret)`;
    } else {
      const maxAmount = budget.maxAmount
        ? `-₺${budget.maxAmount.toLocaleString('tr-TR')}`
        : '';
      return `₺${budget.amount.toLocaleString('tr-TR')}${maxAmount}/saat`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta';
      case 'expert':
        return 'Uzman';
      default:
        return level;
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatTimeAgo(job.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.isRemote ? 'Uzaktan' : job.location}
                  </span>
                  <span className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {job.proposalsCount} teklif
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatBudget(job.budget)}
                  </div>
                  <div className="text-sm text-gray-600">Bütçe</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {getExperienceLevelText(job.experienceLevel)}
                  </div>
                  <div className="text-sm text-gray-600">Deneyim Seviyesi</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Proje Açıklaması
              </h3>
              <div className="prose max-w-none text-gray-700">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Gerekli Yetenekler
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Proje Süresi
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.duration || '1-3 ay'}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Kategori
                  </div>
                  <div className="text-sm text-gray-600">{job.category}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Proposal Form */}
          {showProposalForm && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Teklif Gönder
              </h3>
              <ProposalForm
                jobId={job.id}
                onSubmit={() => setShowProposalForm(false)}
                onCancel={() => setShowProposalForm(false)}
              />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <Card className="p-6">
            {!showProposalForm ? (
              <Button
                size="lg"
                fullWidth
                onClick={() => setShowProposalForm(true)}
                className="mb-4"
              >
                <Send className="mr-2 h-4 w-4" />
                Teklif Gönder
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowProposalForm(false)}
                className="mb-4"
              >
                Formu Kapat
              </Button>
            )}

            <div className="text-center text-sm text-gray-600">
              Bu projeye teklif vermek için
              <br />
              freelancer hesabınızla giriş yapın
            </div>
          </Card>

          {/* Employer Info */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İşveren Bilgileri
            </h3>

            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                <span className="text-lg font-medium text-gray-600">
                  {job.employer.firstName[0]}
                </span>
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">
                  {job.employer.firstName} {job.employer.lastName}
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {job.employer.rating.toFixed(1)} (
                    {job.employer.reviewsCount} değerlendirme)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Üyelik:</span>
                <span className="text-gray-900">
                  {formatTimeAgo(job.employer.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam İş:</span>
                <span className="text-gray-900">
                  {job.employer.totalJobs || 12}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Konum:</span>
                <span className="text-gray-900">
                  {job.employer.location || 'Türkiye'}
                </span>
              </div>
            </div>

            <Link href={`/profile/${job.employer.id}`}>
              <Button variant="outline" fullWidth className="mt-4">
                <User className="mr-2 h-4 w-4" />
                Profili Görüntüle
              </Button>
            </Link>
          </Card>

          {/* Similar Jobs */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Benzer İş İlanları
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <h4 className="mb-1 text-sm font-medium text-gray-900">
                    React.js Frontend Geliştirici
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>₺5.000 - ₺8.000</span>
                    <span>2 gün önce</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/marketplace?mode=jobs">
              <Button variant="outline" size="sm" fullWidth className="mt-4">
                Tüm İş İlanları
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
