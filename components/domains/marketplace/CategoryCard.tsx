'use client';

import React, { useState } from 'react';
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
  Users,
  Scale,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Users,
  Scale,
  MapPin,
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
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1,
    rotate: 0,
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
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
  searchTerm = '',
}) => {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;

  // State for expanded subcategories
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(category.id);
    }
  };

  const toggleSubcategory = (subcategoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
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
      className={`group h-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Card className="flex h-full flex-col bg-white p-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex h-full flex-col space-y-4">
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
            {/* Expand/Collapse Button */}
            {isExpandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title={isExpanded ? 'Daralt' : 'Genişlet'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
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

          {/* Subcategories - Always shown when available */}
          {showSubcategories &&
            category.subcategories &&
            category.subcategories.length > 0 && (
              <div className="flex-1">
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Alt Kategoriler
                </h4>
                <div className="space-y-2">
                  {category.subcategories.slice(0, 6).map((subcategory) => (
                    <div key={subcategory.id} className="space-y-2">
                      <div
                        className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                        onClick={(e) => toggleSubcategory(subcategory.id, e)}
                      >
                        <div className="flex flex-1 items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                            {subcategory.name}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 transition-colors group-hover:bg-gray-200">
                            {subcategory.serviceCount}
                          </span>
                        </div>
                        {subcategory.popularServices &&
                          subcategory.popularServices.length > 0 && (
                            <ChevronDown
                              className={`h-4 w-4 text-gray-400 transition-all group-hover:text-gray-600 ${
                                expandedSubcategories.has(subcategory.id)
                                  ? 'rotate-180'
                                  : ''
                              }`}
                            />
                          )}
                      </div>

                      {/* Subcategory Services */}
                      {expandedSubcategories.has(subcategory.id) &&
                        subcategory.popularServices && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1"
                          >
                            <div className="mb-2 text-xs font-medium text-gray-600">
                              {subcategory.serviceCount} Hizmet Türü:
                            </div>
                            <div className="grid max-h-96 grid-cols-1 gap-1 overflow-y-auto">
                              {subcategory.popularServices.map(
                                (service: string, index: number) => (
                                  <div
                                    key={index}
                                    className="group flex cursor-pointer items-center gap-2 rounded-r border-l-2 border-blue-100 p-2 pl-3 text-sm text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
                                  >
                                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 transition-colors group-hover:bg-blue-500"></span>
                                    <span className="transition-colors group-hover:text-blue-700">
                                      {service}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                            {subcategory.popularServices.length > 0 && (
                              <div className="mt-2 border-t border-blue-100 p-1 pt-2 pl-3 text-xs text-blue-600">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    Toplam: {subcategory.popularServices.length}{' '}
                                    hizmet türü
                                  </span>
                                  <span className="text-gray-500">
                                    Ort. fiyat:{' '}
                                    {formatPrice(subcategory.averagePrice)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                    </div>
                  ))}

                  {category.subcategories.length > 6 && (
                    <div className="pt-2 text-center text-xs text-gray-500">
                      +{category.subcategories.length - 6} alt kategori daha
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Direct Services - Shown when no subcategories */}
          {showSubcategories &&
            (!category.subcategories || category.subcategories.length === 0) &&
            category.popularServices &&
            category.popularServices.length > 0 && (
              <div className="flex-1">
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Popüler Hizmetler ({category.popularServices.length})
                </h4>
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {category.popularServices.map((service, index) => (
                    <div
                      key={index}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
                    >
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 transition-colors group-hover:bg-blue-600"></span>
                      <span className="font-medium transition-colors group-hover:text-blue-700">
                        {service}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium">
                      Toplam: {category.popularServices.length} hizmet türü
                    </span>
                    <span>
                      Fiyat aralığı: {formatPrice(category.priceRange.min)} -{' '}
                      {formatPrice(category.priceRange.max)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Top Skills - Additional info when available */}
          {showSubcategories &&
            category.topSkills &&
            category.topSkills.length > 0 &&
            (!category.subcategories ||
              category.subcategories.length === 0) && (
              <div className="border-t border-gray-100 pt-3">
                <h5 className="mb-2 text-xs font-medium tracking-wide text-gray-700 uppercase">
                  Aranan Yetenekler
                </h5>
                <div className="flex flex-wrap gap-1">
                  {category.topSkills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {category.topSkills.length > 6 && (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
                      +{category.topSkills.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-gray-100 pt-4">
                {/* All Subcategories */}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Alt Kategoriler ({category.subcategories.length})
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
                          >
                            <span className="text-sm text-gray-700">
                              {subcategory.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {subcategory.serviceCount} hizmet
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Top Skills */}
                {category.topSkills && category.topSkills.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Popüler Yetenekler
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {category.topSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Popular Services */}
                {category.popularServices &&
                  category.popularServices.length > 3 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Tüm Popüler Hizmetler
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {category.popularServices.map((service, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Price Range */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Fiyat Aralığı
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {formatPrice(category.priceRange.min)}
                    </span>
                    <span>-</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(category.priceRange.max)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions - Always at bottom */}
          <div className="mt-auto flex gap-2 pt-4">
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
