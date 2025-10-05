'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Code,
  Palette,
  Megaphone,
  Home,
  GraduationCap,
  Heart,
  Car,
  DollarSign,
  Leaf,
  ChefHat,
  PartyPopper,
  Dumbbell,
  Baby,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { CategoryCardProps } from '@/types/business/features/marketplace-categories';

// Icon mapping
const iconMap = {
  Code,
  Palette,
  Megaphone,
  Home,
  GraduationCap,
  Heart,
  Car,
  DollarSign,
  Leaf,
  ChefHat,
  PartyPopper,
  Dumbbell,
  Baby,
};

// Animation variants
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2 },
  },
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  variant = 'default',
  showStats = true,
  showSubcategories = false,
  onClick,
  className = '',
}) => {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;

  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Render different variants
  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants as any}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <Card className="border-0 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${category.iconColor}15`,
                color: category.iconColor,
              }}
            >
              <IconComponent className="h-5 w-5" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {category.title}
              </h3>
              <p className="truncate text-xs text-gray-500">
                {category.serviceCount} hizmet
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        variants={cardVariants as any}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <Card className="relative h-full overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 p-6 transition-all duration-300 hover:border-blue-100 hover:shadow-xl">
          <div className="flex h-full flex-col space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <motion.div
                variants={iconVariants}
                className="flex h-16 w-16 items-center justify-center rounded-xl shadow-sm"
                style={{
                  backgroundColor: `${category.iconColor}15`,
                  color: category.iconColor,
                }}
              >
                <IconComponent className="h-8 w-8" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900">
                  {category.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-600">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(category.serviceCount)}
                  </div>
                  <div className="text-xs text-gray-500">Hizmet</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(category.averagePrice)}
                  </div>
                  <div className="text-xs text-gray-500">Ort. Fiyat</div>
                </div>
              </div>
            )}

            {/* Popular Services */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Popüler Hizmetler
              </h4>
              <div className="flex flex-wrap gap-1">
                {category.popularServices.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2 pt-2">
              <Link
                href={`/marketplace/categories/${category.slug}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:border-blue-300"
                >
                  Hizmetleri Gör
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
              <Link href="/marketplace/jobs/create" className="flex-1">
                <Button size="sm" className="w-full">
                  İş Ver
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        variants={cardVariants as any}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`group cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <Card className="bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <motion.div
                variants={iconVariants}
                className="flex h-14 w-14 items-center justify-center rounded-xl shadow-sm"
                style={{
                  backgroundColor: `${category.iconColor}15`,
                  color: category.iconColor,
                }}
              >
                <IconComponent className="h-7 w-7" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            {showStats && (
              <div className="grid grid-cols-4 gap-4 border-y border-gray-100 py-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(category.serviceCount)}
                  </div>
                  <div className="text-xs text-gray-500">Hizmet</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(category.averagePrice)}
                  </div>
                  <div className="text-xs text-gray-500">Ort. Fiyat</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {category.stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                    <Clock className="h-3 w-3" />
                    {category.stats.responseTime}s
                  </div>
                  <div className="text-xs text-gray-500">Yanıt</div>
                </div>
              </div>
            )}

            {/* Skills & Services */}
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Popüler Beceriler
                </h4>
                <div className="flex flex-wrap gap-1">
                  {category.topSkills.slice(0, 4).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-50 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Popüler Hizmetler
                </h4>
                <div className="flex flex-wrap gap-1">
                  {category.popularServices
                    .slice(0, 4)
                    .map((service, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `${category.iconColor}10`,
                          color: category.iconColor,
                          borderColor: `${category.iconColor}30`,
                        }}
                      >
                        {service}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {showSubcategories && category.subcategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Alt Kategoriler
                </h4>
                <div className="space-y-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{sub.name}</span>
                      <span className="text-gray-400">
                        {sub.serviceCount} hizmet
                      </span>
                    </div>
                  ))}
                  {category.subcategories.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{category.subcategories.length - 3} alt kategori daha...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/marketplace/categories/${category.slug}`}
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Kategoriyi İncele
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketplace/jobs/create">
                <Button size="sm">İş Ver</Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={cardVariants as any}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Card className="bg-white p-6 transition-all duration-300 hover:shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div
              variants={iconVariants}
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${category.iconColor}15`,
                color: category.iconColor,
              }}
            >
              <IconComponent className="h-6 w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900">
                {category.title}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-600">
                {category.shortDescription || category.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center justify-between border-t border-gray-100 py-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {formatNumber(category.serviceCount)}
                </span>{' '}
                hizmet
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {formatPrice(category.averagePrice)}
                </span>{' '}
                ort.
              </div>
            </div>
          )}

          {/* Popular Services */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {category.popularServices.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={`/marketplace/categories/${category.slug}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                Hizmetleri Görüntüle
              </Button>
            </Link>
            <Link href="/marketplace/jobs/create">
              <Button size="sm">İş Ver</Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
