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
  Users,
  Scale,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui';
import type { Category } from '@/types/business/features/marketplace-categories';

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

interface AllCategoriesCardProps {
  category: Category;
  className?: string;
}

// Animation variants
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const AllCategoriesCard: React.FC<AllCategoriesCardProps> = ({
  category,
  className = '',
}) => {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <motion.div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants={cardVariants as any}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Link href={`/marketplace/categories/${category.slug}`}>
        <Card className="group relative h-full overflow-hidden border border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300/80 hover:shadow-lg">
          {/* Soft Hover Gradient Overlay */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${category.iconColor}05 0%, ${category.iconColor}02 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative p-5">
            {/* Header with Icon & Title */}
            <div className="mb-4 flex items-start gap-3.5">
              {/* Icon */}
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105"
                style={{
                  backgroundColor: `${category.iconColor}10`,
                  color: category.iconColor,
                }}
              >
                <IconComponent className="h-6 w-6" strokeWidth={2} />
              </div>

              {/* Title & Description */}
              <div className="min-w-0 flex-1">
                <h3 className="mb-1.5 line-clamp-1 text-base font-semibold text-gray-900 transition-colors group-hover:text-gray-700">
                  {category.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                  {category.shortDescription || category.description}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50/80 p-3 transition-colors group-hover:bg-white/80">
              <div className="text-center">
                <div className="mb-0.5 text-lg font-semibold text-gray-900">
                  {formatNumber(category.serviceCount)}
                </div>
                <div className="text-xs font-medium text-gray-500">Hizmet</div>
              </div>
              <div className="text-center">
                <div className="mb-0.5 text-lg font-semibold text-gray-900">
                  {formatPrice(category.averagePrice)}
                </div>
                <div className="text-xs font-medium text-gray-500">
                  Ortalama
                </div>
              </div>
            </div>

            {/* Popular Services Tags */}
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium tracking-wide text-gray-600">
                Popüler Hizmetler
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.popularServices.slice(0, 3).map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-all duration-200"
                    style={{
                      backgroundColor: `${category.iconColor}08`,
                      color: category.iconColor,
                    }}
                  >
                    {service}
                  </span>
                ))}
                {category.popularServices.length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{category.popularServices.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Subcategories Count */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 transition-colors group-hover:bg-white/50">
                <span className="text-sm font-medium text-gray-700">
                  Alt Kategoriler
                </span>
                <span
                  className="flex items-center gap-1 text-sm font-semibold"
                  style={{ color: category.iconColor }}
                >
                  {category.subcategories.length}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </div>
            )}

            {/* Footer - View Button */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs font-medium text-gray-500">
                Kategoriyi İncele
              </span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1"
                style={{
                  backgroundColor: `${category.iconColor}12`,
                  color: category.iconColor,
                }}
              >
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default AllCategoriesCard;
