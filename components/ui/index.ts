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

// Error System - Production Ready
export {
  UnifiedErrorBoundary as ErrorBoundary,
  UnifiedErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  ErrorBoundaryConfigProvider,
  useErrorBoundaryConfig,
} from './UnifiedErrorBoundary';
export { SimpleErrorDisplay } from './SimpleErrorDisplay';

// New Error Boundary System - Sprint EPIC 4
// TODO: Create ErrorBoundary.tsx file with PageErrorBoundary, SectionErrorBoundary, ComponentErrorBoundary
// Temporarily commented out for build - use UnifiedErrorBoundary instead
// export {
//   ErrorBoundary as ReactErrorBoundary,
//   PageErrorBoundary,
//   SectionErrorBoundary,
//   ComponentErrorBoundary,
//   withErrorBoundary as withReactErrorBoundary,
// } from './ErrorBoundary';
// export type { ErrorBoundaryProps } from './ErrorBoundary';

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
export { DateRangePicker } from './DateRangePicker';
export type { DateRangePickerProps } from './DateRangePicker';

// Layout Components
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from './Card';
export { Badge } from './Badge';
export { Alert, AlertTitle, AlertDescription } from './Alert';
export { Pagination, MobilePagination } from './Pagination';
export { ScrollArea } from './ScrollArea';
export { Slider } from './Slider';

// Stats Components - Sprint 1: Duplicate Elimination
export { StatCard, StatCardSkeleton } from './cards/StatCard';
export type {
  StatCardProps,
  StatCardColor,
  StatCardVariant,
  StatCardTrend,
} from './cards/StatCard';

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
export { Skeleton as BaseSkeleton } from './skeleton';
// Note: Skeleton.tsx also exports Skeleton - use BaseSkeleton for skeleton.tsx version

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

// Dialog Components
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';

// Animation Components
export {
  AnimatedContainer,
  StaggeredContainer,
  ScrollTriggeredAnimation,
  PageTransition,
  HoverAnimation,
  LoadingAnimation,
} from './AnimatedContainer';

// ================================================
// LOWERCASE ALIASES FOR SHADCN COMPATIBILITY
// ================================================
// Support both Button and button imports
export { UnifiedButton as button } from './UnifiedButton';
export { Card as card } from './Card';
export { Alert as alert } from './Alert';
export { Checkbox as checkbox } from './Checkbox';
export { Label as label } from './Label';
export { Skeleton as skeleton } from './skeleton';

// Progress component
export { Progress } from './Progress';
export { Progress as progress } from './Progress';

// Switch component
export { Switch } from './Switch';
export { Switch as switch } from './Switch';

// Table component
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table';
// Lowercase alias for table
export {
  Table as table,
  TableHeader as tableHeader,
  TableBody as tableBody,
  TableFooter as tableFooter,
  TableHead as tableHead,
  TableRow as tableRow,
  TableCell as tableCell,
  TableCaption as tableCaption,
} from './Table';

// Tabs component - lowercase aliases
export {
  Tabs as tabs,
  TabsList as tabsList,
  TabsTrigger as tabsTrigger,
  TabsContent as tabsContent,
} from './Tabs';

// Select component - lowercase aliases
export {
  Select as select,
  SelectContent as selectContent,
  SelectItem as selectItem,
  SelectTrigger as selectTrigger,
  SelectValue as selectValue,
} from './Select';

// AlertDialog component
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

// BottomSheet component
export { BottomSheet } from './BottomSheet';

// MultiSelect component
export { MultiSelect } from './MultiSelect';
export type { MultiSelectProps, SelectOption } from './MultiSelect';

// DeleteConfirmationModal
export { DeleteConfirmationModal } from './DeleteConfirmationModal';
