import { User } from '../core/base';

// Marketplace & Package Types
export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  pricing: PackagePricing;
  delivery: PackageDelivery;
  features: string[];
  requirements?: string[];
  tags: string[];
  images: string[];
  video?: string;
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
    rating: number;
    completedJobs: number;
  };
  statistics: PackageStatistics;
  reviews: PackageReview[];
  addOns?: PackageAddOn[];
  variants?: PackageVariant[];
  status: 'active' | 'paused' | 'draft' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface PackagePricing {
  basic: PackageTier;
  standard?: PackageTier;
  premium?: PackageTier;
}

export interface PackageTier {
  name: string;
  price: number;
  description: string;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
}

export interface PackageDelivery {
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
  digitalDelivery: boolean;
  formats?: string[];
}

export interface PackageStatistics {
  views: number;
  orders: number;
  rating: number;
  reviewCount: number;
  completionRate: number;
  responseTime: number;
  repeatCustomers: number;
}

export interface PackageReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

export interface PackageAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  isRequired: boolean;
}

export interface PackageVariant {
  id: string;
  name: string;
  options: VariantOption[];
  required: boolean;
}

export interface VariantOption {
  id: string;
  name: string;
  priceModifier: number;
  deliveryModifier: number;
}

export interface PackageFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  rating?: number;
  location?: string;
  language?: string;
  sortBy?:
    | 'relevance'
    | 'price_low'
    | 'price_high'
    | 'rating'
    | 'newest'
    | 'popular';
  search?: string;
}

export interface PackageDetail extends ServicePackage {
  similarPackages: ServicePackage[];
  frequentlyBoughtWith: ServicePackage[];
  sellerOtherPackages: ServicePackage[];
}

// Help Center Types
export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  isPopular: boolean;
  order: number;
  parentId?: string;
  children?: HelpCategory[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  category: HelpCategory;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName'>;
  relatedArticles?: HelpArticle[];
}

export interface ArticleRatingFormData {
  articleId: string;
  isHelpful: boolean;
  feedback?: string;
  category?: 'content' | 'clarity' | 'completeness' | 'accuracy';
}
