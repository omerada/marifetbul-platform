// ================================================
// PACKAGE REPOSITORY
// ================================================
// Repository for package/service-related API operations

import {
  BaseRepository,
  PaginatedResult,
  SearchOptions,
} from './BaseRepository';

export interface Package {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  tiers: PackageTier[];
  seller: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    verificationStatus: boolean;
    level: 'NEW' | 'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED';
  };
  gallery: PackageMedia[];
  tags: string[];
  skills: string[];
  features: string[];
  faq: PackageFAQ[];
  deliveryTime: {
    min: number;
    max: number;
    unit: 'HOURS' | 'DAYS' | 'WEEKS';
  };
  revisions: {
    included: number;
    additional: number; // price per additional revision
  };
  requirements: string[];
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'UNDER_REVIEW' | 'REJECTED';
  analytics: {
    views: number;
    orders: number;
    impressions: number;
    clickThroughRate: number;
    conversionRate: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastOrderAt?: string;
  featuredUntil?: string;
  isBestseller: boolean;
  isChoiceAward: boolean;
}

export interface PackageTier {
  id: string;
  name: 'BASIC' | 'STANDARD' | 'PREMIUM';
  title: string;
  description: string;
  price: number;
  currency: string;
  deliveryTime: number;
  deliveryUnit: 'HOURS' | 'DAYS' | 'WEEKS';
  revisions: number;
  features: string[];
  addOns?: PackageAddOn[];
}

export interface PackageAddOn {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  deliveryUnit: 'HOURS' | 'DAYS' | 'WEEKS';
}

export interface PackageMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  order: number;
}

export interface PackageFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface CreatePackageData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  tiers: Omit<PackageTier, 'id'>[];
  tags: string[];
  skills: string[];
  features: string[];
  faq?: Omit<PackageFAQ, 'id'>[];
  requirements: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
}

export interface UpdatePackageData {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  subcategory?: string;
  tiers?: Omit<PackageTier, 'id'>[];
  tags?: string[];
  skills?: string[];
  features?: string[];
  faq?: Omit<PackageFAQ, 'id'>[];
  requirements?: string[];
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number; revenue: number }>;
  bestsellingPackages: Package[];
  recentOrders: number;
}

export interface PackageSearchFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  deliveryTime?: number;
  deliveryUnit?: 'HOURS' | 'DAYS' | 'WEEKS';
  sellerLevel?: 'NEW' | 'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED';
  minRating?: number;
  tags?: string[];
  skills?: string[];
  hasVideoIntro?: boolean;
  isBestseller?: boolean;
  isChoiceAward?: boolean;
  onlineNow?: boolean;
}

class PackageRepository extends BaseRepository<
  Package,
  CreatePackageData,
  UpdatePackageData
> {
  protected readonly baseEndpoint = '/packages';

  constructor() {
    super('package');
  }

  // ================================================
  // PACKAGE-SPECIFIC METHODS
  // ================================================

  async findByCategory(category: string, limit?: number): Promise<Package[]> {
    return this.customQuery<Package[]>(
      `category/${encodeURIComponent(category)}${limit ? `?limit=${limit}` : ''}`
    );
  }

  async findBySeller(sellerId: string): Promise<Package[]> {
    return this.customQuery<Package[]>(`seller/${sellerId}`);
  }

  async findMyPackages(status?: Package['status']): Promise<Package[]> {
    const params = status ? { status } : undefined;
    return this.customQuery<Package[]>('my-packages', 'GET', params);
  }

  async findRecommended(limit: number = 10): Promise<Package[]> {
    return this.customQuery<Package[]>(`recommended?limit=${limit}`);
  }

  async findSimilar(packageId: string, limit: number = 5): Promise<Package[]> {
    return this.customQuery<Package[]>(`${packageId}/similar?limit=${limit}`);
  }

  // ================================================
  // PACKAGE SEARCH & FILTERING
  // ================================================

  async searchPackages(
    options: SearchOptions & PackageSearchFilters
  ): Promise<Package[]> {
    return this.search(options);
  }

  async searchPackagesPaginated(
    options: SearchOptions & PackageSearchFilters
  ): Promise<PaginatedResult<Package>> {
    return this.searchPaginated(options);
  }

  async getFeaturedPackages(limit: number = 8): Promise<Package[]> {
    return this.customQuery<Package[]>(`featured?limit=${limit}`);
  }

  async getBestsellingPackages(
    category?: string,
    limit: number = 10
  ): Promise<Package[]> {
    const params = category ? { category, limit } : { limit };
    return this.customQuery<Package[]>('bestselling', 'GET', params);
  }

  async getChoiceAwardPackages(limit: number = 5): Promise<Package[]> {
    return this.customQuery<Package[]>(`choice-awards?limit=${limit}`);
  }

  async getNewPackages(limit: number = 10): Promise<Package[]> {
    return this.customQuery<Package[]>(`new?limit=${limit}`);
  }

  // ================================================
  // PACKAGE MANAGEMENT
  // ================================================

  async publishPackage(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/publish`, 'POST');
  }

  async pausePackage(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/pause`, 'POST');
  }

  async resumePackage(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/resume`, 'POST');
  }

  async duplicatePackage(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/duplicate`, 'POST');
  }

  // ================================================
  // PACKAGE MEDIA
  // ================================================

  async uploadMedia(
    packageId: string,
    file: File,
    type: 'IMAGE' | 'VIDEO'
  ): Promise<PackageMedia> {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', type);

    return this.customQuery<PackageMedia>(
      `${packageId}/media`,
      'POST',
      formData,
      {
        headers: {}, // Let browser set Content-Type for FormData
      }
    );
  }

  async updateMediaOrder(
    packageId: string,
    mediaOrder: Array<{ id: string; order: number }>
  ): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/media/order`, 'PUT', {
      mediaOrder,
    });
  }

  async deleteMedia(packageId: string, mediaId: string): Promise<void> {
    await this.customQuery<void>(`${packageId}/media/${mediaId}`, 'DELETE');
  }

  // ================================================
  // PACKAGE TIERS & ADD-ONS
  // ================================================

  async updateTiers(
    packageId: string,
    tiers: Omit<PackageTier, 'id'>[]
  ): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/tiers`, 'PUT', { tiers });
  }

  async addTierAddOn(
    packageId: string,
    tierId: string,
    addOn: Omit<PackageAddOn, 'id'>
  ): Promise<Package> {
    return this.customQuery<Package>(
      `${packageId}/tiers/${tierId}/add-ons`,
      'POST',
      addOn
    );
  }

  async updateTierAddOn(
    packageId: string,
    tierId: string,
    addOnId: string,
    addOn: Partial<PackageAddOn>
  ): Promise<Package> {
    return this.customQuery<Package>(
      `${packageId}/tiers/${tierId}/add-ons/${addOnId}`,
      'PUT',
      addOn
    );
  }

  async deleteTierAddOn(
    packageId: string,
    tierId: string,
    addOnId: string
  ): Promise<Package> {
    return this.customQuery<Package>(
      `${packageId}/tiers/${tierId}/add-ons/${addOnId}`,
      'DELETE'
    );
  }

  // ================================================
  // PACKAGE INTERACTIONS
  // ================================================

  async viewPackage(packageId: string): Promise<void> {
    await this.customQuery<void>(`${packageId}/view`, 'POST');
  }

  async favoritePackage(packageId: string): Promise<void> {
    await this.customQuery<void>(`${packageId}/favorite`, 'POST');
  }

  async unfavoritePackage(packageId: string): Promise<void> {
    await this.customQuery<void>(`${packageId}/unfavorite`, 'POST');
  }

  async getFavoritePackages(): Promise<Package[]> {
    return this.customQuery<Package[]>('favorites');
  }

  async sharePackage(packageId: string, platform: string): Promise<void> {
    await this.customQuery<void>(`${packageId}/share`, 'POST', { platform });
  }

  async reportPackage(
    packageId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    await this.customQuery<void>(`${packageId}/report`, 'POST', {
      reason,
      details,
    });
  }

  // ================================================
  // PACKAGE ANALYTICS
  // ================================================

  async getPackageAnalytics(
    packageId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    views: Record<string, number>;
    orders: Record<string, number>;
    revenue: Record<string, number>;
    impressions: Record<string, number>;
    clickThroughRate: Record<string, number>;
    conversionRate: Record<string, number>;
  }> {
    return this.customQuery<{
      views: Record<string, number>;
      orders: Record<string, number>;
      revenue: Record<string, number>;
      impressions: Record<string, number>;
      clickThroughRate: Record<string, number>;
      conversionRate: Record<string, number>;
    }>(`${packageId}/analytics?period=${period}`);
  }

  async getPackageStats(): Promise<PackageStats> {
    return this.customQuery<PackageStats>('stats');
  }

  async getCategoryStats(): Promise<
    Array<{
      category: string;
      count: number;
      averagePrice: number;
      revenue: number;
    }>
  > {
    return this.customQuery<
      Array<{
        category: string;
        count: number;
        averagePrice: number;
        revenue: number;
      }>
    >('stats/categories');
  }

  // ================================================
  // PACKAGE CATEGORIES & TAGS
  // ================================================

  async getCategories(): Promise<
    Array<{
      id: string;
      name: string;
      subcategories: Array<{ id: string; name: string }>;
    }>
  > {
    return this.customQuery<
      Array<{
        id: string;
        name: string;
        subcategories: Array<{ id: string; name: string }>;
      }>
    >('categories');
  }

  async getPopularTags(category?: string): Promise<string[]> {
    const params = category ? { category } : undefined;
    return this.customQuery<string[]>('tags/popular', 'GET', params);
  }

  async getTagSuggestions(query: string): Promise<string[]> {
    return this.customQuery<string[]>(
      `tags/suggestions?q=${encodeURIComponent(query)}`
    );
  }

  // ================================================
  // PACKAGE PROMOTION
  // ================================================

  async featurePackage(packageId: string, duration: number): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/feature`, 'POST', {
      duration,
    });
  }

  async promotePackage(
    packageId: string,
    budget: number,
    duration: number
  ): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/promote`, 'POST', {
      budget,
      duration,
    });
  }

  async getPromotionOptions(): Promise<{
    feature: { durations: number[]; prices: number[] };
    promote: { budgets: number[]; durations: number[] };
  }> {
    return this.customQuery<{
      feature: { durations: number[]; prices: number[] };
      promote: { budgets: number[]; durations: number[] };
    }>('promotion-options');
  }

  // ================================================
  // PACKAGE REVIEWS
  // ================================================

  async getPackageReviews(
    packageId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<
    PaginatedResult<{
      id: string;
      rating: number;
      comment: string;
      reviewer: {
        id: string;
        username: string;
        avatar?: string;
      };
      order: {
        id: string;
        tier: string;
        completedAt: string;
      };
      createdAt: string;
      helpful: number;
      isHelpful?: boolean;
    }>
  > {
    return this.customQuery<
      PaginatedResult<{
        id: string;
        rating: number;
        comment: string;
        reviewer: {
          id: string;
          username: string;
          avatar?: string;
        };
        order: {
          id: string;
          tier: string;
          completedAt: string;
        };
        createdAt: string;
        helpful: number;
        isHelpful?: boolean;
      }>
    >(`${packageId}/reviews?page=${page}&limit=${limit}`);
  }

  async markReviewHelpful(packageId: string, reviewId: string): Promise<void> {
    await this.customQuery<void>(
      `${packageId}/reviews/${reviewId}/helpful`,
      'POST'
    );
  }

  async unmarkReviewHelpful(
    packageId: string,
    reviewId: string
  ): Promise<void> {
    await this.customQuery<void>(
      `${packageId}/reviews/${reviewId}/helpful`,
      'DELETE'
    );
  }

  // ================================================
  // ADMIN OPERATIONS
  // ================================================

  async moderatePackage(
    packageId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/moderate`, 'POST', {
      action,
      reason,
    });
  }

  async getFlaggedPackages(): Promise<Package[]> {
    return this.customQuery<Package[]>('flagged');
  }

  async getPackageReports(packageId: string): Promise<
    Array<{
      id: string;
      reason: string;
      details?: string;
      reporter: { id: string; username: string };
      createdAt: string;
    }>
  > {
    return this.customQuery<
      Array<{
        id: string;
        reason: string;
        details?: string;
        reporter: { id: string; username: string };
        createdAt: string;
      }>
    >(`${packageId}/reports`);
  }

  async awardChoiceBadge(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/choice-award`, 'POST');
  }

  async removeChoiceBadge(packageId: string): Promise<Package> {
    return this.customQuery<Package>(`${packageId}/choice-award`, 'DELETE');
  }
}

// Export singleton instance
export const packageRepository = new PackageRepository();
export default packageRepository;
