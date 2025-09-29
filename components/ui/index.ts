// ================================================
// UNIFIED UI COMPONENTS - PRODUCTION READY
// ================================================
// Single source of truth for all UI components

// Button System
export {
  UnifiedButton as Button,
  UnifiedButton,
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  LoadingButton,
} from './UnifiedButton';

// Image System
export {
  UnifiedImage as Image,
  UnifiedImage,
  AvatarImage,
  HeroImage,
  GalleryImage,
  ThumbnailImage,
  BackgroundImage,
} from './UnifiedImage';

// Avatar System
export { Avatar, AvatarFallback, AvatarComponents } from './Avatar';

// Loading System
export {
  UnifiedLoading as Loading,
  UnifiedLoading,
  LoadingCard,
  LoadingPageSkeleton,
  LoadingOverlay,
  ProgressLoader,
  useLoadingState,
} from './UnifiedLoadingSystem';

// Error System
export {
  UnifiedErrorBoundary as ErrorBoundary,
  UnifiedErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  ErrorBoundaryConfigProvider,
  useErrorBoundaryConfig,
} from './UnifiedErrorBoundary';

// Form Components
export { Input } from './Input';
export { Checkbox } from './Checkbox';
export { Textarea } from './Textarea';
export { Label } from './Label';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';

// Layout Components
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { Badge } from './Badge';
export { Pagination, MobilePagination } from './Pagination';
export { ScrollArea } from './ScrollArea';
export { Slider } from './Slider';

// Skeleton Components
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonComponent,
  SkeletonPage,
  UnifiedSkeletonSystem,
} from './UnifiedSkeleton';

// Interactive Components
export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  BasicTooltip,
} from './Tooltip';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './DropdownMenu';

// Upload & Toast Components
export { default as FileUpload } from './FileUpload';
export { Toast, ToastContainer } from './Toast';

// Animation Components
export {
  AnimatedContainer,
  StaggeredContainer,
  ScrollTriggeredAnimation,
  PageTransition,
  HoverAnimation,
  LoadingAnimation,
} from './AnimatedContainer';
