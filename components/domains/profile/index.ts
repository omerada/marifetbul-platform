// ================================================
// PROFILE DOMAIN COMPONENTS
// ================================================
// All user profile related components
// Includes freelancer profiles, employer profiles, and profile management

// Profile Views
export { FreelancerProfile } from './FreelancerProfile';
export { EmployerProfile } from './EmployerProfile';
export { ProfileView } from './ProfileView';

// Profile Management
export { ProfileEditForm } from './ProfileEditForm';
export { ProfileAvatarSection } from './ProfileAvatarSection';
export { ProfileCompletionWidget } from './ProfileCompletionWidget';
export { PrivacySettingsWidget } from './PrivacySettingsWidget';
export type { PrivacySettingsWidgetProps } from './PrivacySettingsWidget';

export {
  EmailVerificationBadge,
  InlineVerificationStatus,
} from './EmailVerificationBadge';
export type {
  EmailVerificationBadgeProps,
  InlineVerificationStatusProps,
  VerificationStatus,
} from './EmailVerificationBadge';

// Phone Verification
export { PhoneVerificationModal } from './PhoneVerificationModal';
export type { PhoneVerificationModalProps } from './PhoneVerificationModal';

export {
  PhoneBadge,
  InlinePhoneStatus,
  PhoneSecurityBadge,
} from './PhoneBadge';
export type {
  PhoneBadgeProps,
  PhoneVerificationStatus,
  InlinePhoneStatusProps,
  PhoneSecurityBadgeProps,
} from './PhoneBadge';

// Avatar Components
export { AvatarUpload } from './AvatarUpload';
export { AvatarGallery } from './AvatarGallery';
export { AvatarModal } from './AvatarModal';

// Portfolio Components
export { PortfolioGallery } from './PortfolioGallery';
export { PortfolioModal } from './PortfolioModal';

// Reputation
export { ReputationScore } from './ReputationScore';

// Note: Review components moved to @/components/shared
// Use: import { ReviewCard, ReviewList } from '@/components/shared';
