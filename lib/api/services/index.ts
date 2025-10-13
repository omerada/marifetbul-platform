/**
 * ================================================
 * API SERVICES - PUBLIC EXPORTS
 * ================================================
 * Central export point for all API service modules
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

// Export services
export { default as authService } from './auth.service';
export { default as packageService } from './package.service';

// Export types
export type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
} from './auth.service';

export type {
  Package,
  PackageSearchParams,
  PackageListResponse,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageStats,
} from './package.service';

// Note: Additional services will be added as needed:
// - jobService (jobs/projects)
// - proposalService (bids)
// - orderService (orders)
// - messageService (messaging)
// - notificationService (notifications)
// - reviewService (reviews & ratings)
// - paymentService (payments)
// - walletService (wallet & payouts)
// - categoryService (categories)
// - dashboardService (dashboard stats)
// - searchService (search & discovery)
