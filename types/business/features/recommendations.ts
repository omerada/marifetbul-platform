import { User } from '../../core/base';
import { ServicePackage } from './marketplace';
import { Job } from '../../core/jobs';
import { PaginationMeta } from '../../shared/api';

// Recommendations Types
export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  targetId: string;
  title: string;
  description: string;
  reason: string[];
  score: number; // 0-1
  confidence: number; // 0-1
  metadata: RecommendationMetadata;
  isViewed: boolean;
  isClicked: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt?: string;
  // Populated data
  package?: ServicePackage;
  freelancer?: User;
  job?: Job;
}

export type RecommendationType =
  | 'package'
  | 'freelancer'
  | 'job'
  | 'skill'
  | 'category'
  | 'similar_buyer'
  | 'trending'
  | 'personalized';

export interface RecommendationMetadata {
  algorithm: string;
  factors: RecommendationFactor[];
  tags?: string[];
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface RecommendationFactor {
  name: string;
  weight: number;
  value: string | number;
  description?: string;
}

export interface RecommendationsRequest {
  type?: RecommendationType[];
  limit?: number;
  excludeViewed?: boolean;
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  pagination: PaginationMeta;
  metadata: {
    totalPersonalized: number;
    totalTrending: number;
    lastUpdated: string;
  };
}

export interface RecommendationFeedback {
  recommendationId: string;
  action: 'view' | 'click' | 'dismiss' | 'like' | 'dislike' | 'not_interested';
  reason?: string;
  timestamp: string;
}
