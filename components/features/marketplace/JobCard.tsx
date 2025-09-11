'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Heart,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Award,
} from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import type { Job } from '@/types';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  layout: 'grid' | 'list';
}

export function JobCard({ job, layout }: JobCardProps) {
  const { isFavoriteJob, toggleJobFavorite } = useMarketplace();
  const isFavorite = isFavoriteJob(job.id);

  const formatBudget = () => {
    if (job.budget.type === 'hourly') {
      return `${formatCurrency(job.budget.amount)}/saat`;
    }
    return formatCurrency(job.budget.amount);
  };

  const timeAgo = formatDistanceToNow(new Date(job.createdAt), {
    locale: tr,
    addSuffix: true,
  });

  const isUrgent =
    job.proposalsCount < 5 &&
    new Date(job.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  const isPopular = job.proposalsCount > 20;

  if (layout === 'list') {
    return (
      <Card className="group border-gray-200 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            {/* Main Content */}
            <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                    >
                      {job.category}
                    </Badge>
                    {isUrgent && (
                      <Badge className="border-red-200 bg-red-100 text-xs text-red-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Acil
                      </Badge>
                    )}
                    {isPopular && (
                      <Badge className="border-amber-200 bg-amber-100 text-xs text-amber-800">
                        <Award className="mr-1 h-3 w-3" />
                        Popüler
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="line-clamp-2 block text-xl font-bold text-gray-900 transition-colors hover:text-blue-600"
                  >
                    {job.title}
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Briefcase className="mr-1 h-4 w-4" />
                      <span className="font-medium">
                        {job.employer.companyName || 'Şirket'}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{timeAgo}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleJobFavorite(job.id)}
                  className={cn(
                    'rounded-full p-3 transition-all duration-200 hover:scale-110',
                    isFavorite
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
                  )}
                >
                  <Heart
                    className={cn('h-5 w-5', isFavorite && 'fill-current')}
                  />
                </button>
              </div>

              <p className="line-clamp-2 leading-relaxed text-gray-600">
                {job.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="font-medium">{formatBudget()}</span>
                </div>
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="font-medium">{job.timeline}</span>
                </div>
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1">
                  <Users className="mr-1 h-4 w-4" />
                  <span className="font-medium">
                    {job.proposalsCount} teklif
                  </span>
                </div>
                {job.location && (
                  <div className="flex items-center rounded-full bg-green-50 px-3 py-1 text-green-700">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span className="font-medium">{job.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-gray-200 bg-white text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-100 text-xs"
                  >
                    +{job.skills.length - 5} daha
                  </Badge>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex w-full flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:w-auto sm:min-w-[140px] sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
              <div className="text-left sm:text-right">
                <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {formatBudget()}
                </div>
                <div className="text-sm text-gray-500">
                  {job.budget.type === 'hourly'
                    ? 'saatlik ücret'
                    : 'toplam bütçe'}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:space-y-3 sm:text-right">
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-xs text-green-700"
                >
                  {job.experienceLevel === 'beginner' && 'Başlangıç'}
                  {job.experienceLevel === 'intermediate' && 'Orta Seviye'}
                  {job.experienceLevel === 'expert' && 'Uzman'}
                </Badge>

                <div className="flex gap-2 sm:w-full sm:flex-col sm:space-y-2">
                  <Link href={`/jobs/${job.id}`} className="flex-1 sm:block">
                    <Button
                      size="sm"
                      className="sm:size-lg w-full bg-blue-600 shadow-md hover:bg-blue-700"
                    >
                      Teklif Ver
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}`} className="flex-1 sm:block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="sm:size-sm w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                    >
                      Detaylar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group border-gray-200 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-xs text-blue-700"
            >
              {job.category}
            </Badge>
            {isUrgent && (
              <Badge className="border-red-200 bg-red-100 text-xs text-red-800">
                <Clock className="mr-1 h-3 w-3" />
                Acil
              </Badge>
            )}
            {isPopular && (
              <Badge className="border-amber-200 bg-amber-100 text-xs text-amber-800">
                <Award className="mr-1 h-3 w-3" />
                Popüler
              </Badge>
            )}
          </div>
          <button
            onClick={() => toggleJobFavorite(job.id)}
            className={cn(
              'rounded-full p-2 transition-all duration-200 hover:scale-110',
              isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="line-clamp-2 text-lg leading-tight font-bold text-gray-900 transition-colors hover:text-blue-600"
        >
          {job.title}
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="mr-1 h-4 w-4" />
          <span className="font-medium">
            {job.employer.companyName || 'Şirket'}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{timeAgo}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center text-gray-600">
              <DollarSign className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">{formatBudget()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center text-gray-600">
              <Users className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">
                {job.proposalsCount} teklif
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
          <div className="flex items-center text-green-700">
            <Clock className="mr-1 h-4 w-4" />
            <span className="text-sm font-medium">{job.timeline}</span>
          </div>
          {job.location && (
            <div className="flex items-center text-green-700">
              <MapPin className="mr-1 h-4 w-4" />
              <span className="text-sm font-medium">{job.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="border-gray-200 bg-white text-xs"
            >
              {skill}
            </Badge>
          ))}
          {job.skills.length > 3 && (
            <Badge
              variant="outline"
              className="border-gray-300 bg-gray-100 text-xs"
            >
              +{job.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-xs text-green-700"
            >
              {job.experienceLevel === 'beginner' && 'Başlangıç'}
              {job.experienceLevel === 'intermediate' && 'Orta Seviye'}
              {job.experienceLevel === 'expert' && 'Uzman'}
            </Badge>
          </div>

          <div className="space-x-2">
            <Link href={`/jobs/${job.id}`}>
              <Button
                size="sm"
                className="bg-blue-600 shadow-md hover:bg-blue-700"
              >
                Teklif Ver
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
