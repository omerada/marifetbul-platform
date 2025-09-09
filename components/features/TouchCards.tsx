'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  Clock,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface TouchJobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    deadline: string;
    skills: string[];
    employer: {
      name: string;
      avatar?: string;
      rating: number;
      location: string;
    };
    postedAt: string;
    proposalCount: number;
    isFeatured: boolean;
  };
  onLike?: (jobId: string) => void;
  onBookmark?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
}

export function TouchJobCard({
  job,
  onLike,
  onBookmark,
  onShare,
}: TouchJobCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const skillsRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(job.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(job.id);
  };

  const handleShare = () => {
    onShare?.(job.id);
  };

  const nextSkill = () => {
    if (currentSkillIndex < job.skills.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
    }
  };

  const prevSkill = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1);
    }
  };

  return (
    <Card className="relative touch-manipulation overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Featured Badge */}
      {job.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <div className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
            ÖNE ÇIKAN
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex space-x-2">
        <button
          onClick={handleLike}
          className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
            isLiked
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleBookmark}
          className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
            isBookmarked
              ? 'bg-blue-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
          }`}
        >
          <Bookmark
            className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
          />
        </button>

        <button
          onClick={handleShare}
          className="rounded-full bg-white/80 p-2 text-gray-600 backdrop-blur-sm transition-all duration-200 hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Header */}
        <div>
          <h3 className="line-clamp-2 text-lg leading-tight font-semibold text-gray-900">
            {job.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">
            {job.description}
          </p>
        </div>

        {/* Budget & Deadline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-semibold">
              ₺{job.budget.min.toLocaleString()} - ₺
              {job.budget.max.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs">{job.deadline}</span>
          </div>
        </div>

        {/* Skills - Swipeable */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSkill}
              disabled={currentSkillIndex === 0}
              className="rounded-full bg-gray-100 p-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            <div className="flex-1 overflow-hidden">
              <div
                ref={skillsRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSkillIndex * 100}%)`,
                }}
              >
                {job.skills.map((skill, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <span className="inline-block w-full rounded-full bg-blue-100 px-2 py-1 text-center text-xs font-medium text-blue-800">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextSkill}
              disabled={currentSkillIndex === job.skills.length - 1}
              className="rounded-full bg-gray-100 p-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Skill Indicators */}
          <div className="mt-2 flex justify-center space-x-1">
            {job.skills.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSkillIndex(index)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentSkillIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Employer Info */}
        <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {job.employer.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {job.employer.name}
            </p>
            <div className="mt-1 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="text-xs text-gray-600">
                  {job.employer.rating}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="truncate text-xs text-gray-600">
                  {job.employer.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{job.proposalCount} teklif</span>
            </div>
            <span>{job.postedAt}</span>
          </div>

          <Button size="sm" className="px-4 py-2 text-sm">
            Teklif Ver
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface TouchServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: {
      amount: number;
      currency: string;
    };
    deliveryTime: string;
    images: string[];
    rating: number;
    reviewCount: number;
    freelancer: {
      name: string;
      avatar?: string;
      level: string;
    };
    tags: string[];
  };
  onLike?: (serviceId: string) => void;
  onBookmark?: (serviceId: string) => void;
}

export function TouchServiceCard({
  service,
  onLike,
  onBookmark,
}: TouchServiceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(service.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(service.id);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    );
  };

  return (
    <Card className="touch-manipulation overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Image Carousel */}
      <div className="relative h-40 bg-gray-200">
        {service.images.length > 0 ? (
          <>
            <Image
              src={service.images[currentImageIndex]}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Image Navigation */}
            {service.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-2 -translate-y-1/2 transform rounded-full bg-white/80 p-1 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full bg-white/80 p-1 backdrop-blur-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform space-x-1">
                  {service.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-2xl font-bold text-white">
              {service.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleLike}
            className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleBookmark}
            className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
              isBookmarked
                ? 'bg-blue-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Title & Description */}
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
            {service.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {service.description}
          </p>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span className="text-sm font-medium">{service.rating}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({service.reviewCount} değerlendirme)
          </span>
        </div>

        {/* Freelancer Info */}
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-xs font-semibold text-white">
            {service.freelancer.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">
            {service.freelancer.name}
          </span>
          <span className="text-xs font-medium text-blue-600">
            {service.freelancer.level}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {service.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
          {service.tags.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              +{service.tags.length - 3}
            </span>
          )}
        </div>

        {/* Price & Delivery */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-lg font-bold">
              ₺{service.price.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{service.deliveryTime}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button className="mt-3 w-full" size="sm">
          Hizmeti İncele
        </Button>
      </div>
    </Card>
  );
}
