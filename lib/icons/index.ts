/**
 * Optimized Icons Module
 * Tree-shakable icon imports to reduce bundle size
 * Instead of importing all icons from lucide-react, import only what's needed
 */

// Core UI Icons
export {
  Send,
  Paperclip,
  Smile,
  Mic,
  Square,
  X,
  Plus,
  Loader2,
  Check,
  CheckCircle,
  AlertTriangle,
  Info,
  Home,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react';

// File & Media Icons
export {
  ImageIcon as Image,
  FileText,
  File,
  Camera,
  Video,
  Music,
  Folder,
  FolderOpen,
} from 'lucide-react';

// Communication Icons
export {
  MessageSquare,
  MessageCircle,
  Phone,
  PhoneCall,
  Mail,
  Send as SendIcon,
  Bell,
  BellOff,
} from 'lucide-react';

// Admin & Analytics Icons
export {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

// Navigation Icons
export {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Link,
  Bookmark,
  Star,
  Heart,
  Share,
} from 'lucide-react';

// Status Icons
export {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  Zap,
} from 'lucide-react';

// Social & Interaction Icons
export {
  ThumbsUp,
  ThumbsDown,
  MessageSquare as Comment,
  Share2,
  Flag,
  MoreHorizontal,
  MoreVertical,
} from 'lucide-react';

// Special Purpose Icons
export {
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Tag,
  Target,
  Award,
  Trophy,
  Gift,
  Briefcase,
  HardDrive,
  CloudUpload,
  CloudDownload,
} from 'lucide-react';

/**
 * Icon Size Constants
 * Standardized icon sizes across the application
 */
export const ICON_SIZES = {
  xs: 'h-3 w-3', // 12px
  sm: 'h-4 w-4', // 16px
  md: 'h-5 w-5', // 20px (default)
  lg: 'h-6 w-6', // 24px
  xl: 'h-8 w-8', // 32px
  '2xl': 'h-10 w-10', // 40px
  '3xl': 'h-12 w-12', // 48px
} as const;
