// ================================================
// AUTHENTICATION FORMS
// ================================================
export { LoginForm } from './LoginForm';
export { AdminLoginForm } from './AdminLoginForm';
export { RegisterForm } from './RegisterForm';
export { MultiStepRegisterForm } from './MultiStepRegisterForm';
export { ForgotPasswordForm } from './ForgotPasswordForm';
export { ResetPasswordForm } from './ResetPasswordForm';
export { VerifyEmailForm } from './VerifyEmailForm';

// ================================================
// JOB POSTING FORMS
// ================================================
export { JobPostingForm } from './JobPostingForm';
export { default as JobPostingWizard } from './JobPostingWizard';

// ================================================
// MIGRATION NOTICE
// ================================================
/**
 * Payment forms have been consolidated into UnifiedCheckout
 *
 * OLD (Removed in Sprint 1):
 * - import { CheckoutModal } from '@/components/forms'
 * - import { PaymentForm } from '@/components/forms'
 *
 * NEW:
 * - import { UnifiedCheckout } from '@/components/checkout'
 *
 * See: SPRINT_1_PROGRESS.md for migration guide
 */
