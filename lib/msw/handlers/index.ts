// MSW handlers for API mocking
import { advancedSearchHandlers } from './advanced-search';
import { recommendationHandlers } from './recommendations';
import { favoritesHandlers } from './favorites';
import { locationHandlers } from './location';
import { reviewsAnalyticsHandlers } from './reviews-analytics';
import { adminHandlers } from './admin';
import { authHandlers } from './auth';

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...advancedSearchHandlers,
  ...recommendationHandlers,
  ...favoritesHandlers,
  ...locationHandlers,
  ...reviewsAnalyticsHandlers,
  ...adminHandlers,
];

// Export individual handler groups for selective usage
export {
  authHandlers,
  advancedSearchHandlers,
  recommendationHandlers,
  favoritesHandlers,
  locationHandlers,
  reviewsAnalyticsHandlers,
  adminHandlers,
};
