// Shared features index - components that are used across domains
export { UniversalSearch } from '../../domains/search/UniversalSearch';
export { EnhancedSearchSystem } from '../../domains/search/EnhancedSearchSystem';
export { ServiceDetail } from '../../domains/packages/ServiceDetail';
export { ProfileView } from '../../domains/profile/ProfileView';
export { EmployerProfile } from '../../domains/profile/EmployerProfile';
export { ProfileEditForm } from '../../domains/profile/ProfileEditForm';
export { PortfolioGallery } from '../../domains/profile/PortfolioGallery';

// Dashboard Overview - now using UnifiedDashboard
export { UnifiedDashboard as DashboardOverview } from '../../domains/dashboard/UnifiedDashboard';

export { JobDetail as JobSummary } from '../../domains/jobs/JobDetail';
export { PackageDetail as PackageSummary } from '../../domains/packages/PackageDetail';

// Dashboard widgets - use from domains/dashboard/widgets
// Legacy exports removed - use UnifiedDashboard or specific widgets from domains/dashboard/widgets
