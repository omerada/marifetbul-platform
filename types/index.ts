// Base types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: 'freelancer' | 'employer';
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Freelancer extends User {
  userType: 'freelancer';
  title?: string;
  skills: string[];
  hourlyRate?: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  rating: number;
  totalReviews: number;
  reviewCount?: number; // Alternative naming
  totalEarnings: number;
  completedJobs: number;
  completedProjects?: number; // Alternative naming
  responseTime: string; // e.g., "2 hours"
  availability: 'available' | 'busy' | 'not_available';
  portfolio: PortfolioItem[];
  languages?: string[];
  isOnline?: boolean;
}

export interface Employer extends User {
  userType: 'employer';
  companyName?: string;
  companySize?: string;
  industry?: string;
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  rating: number;
  totalReviews: number;
  reviewsCount: number;
  totalJobs: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  url?: string;
  skills: string[];
  completedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    maxAmount?: number; // For hourly jobs
  };
  timeline: string;
  duration?: string; // Project duration estimate
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote: boolean;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  employerId: string;
  employer: Employer;
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  attachments?: string[];
}

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  images: string[];
  freelancerId: string;
  freelancer: Freelancer;
  orders: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: Freelancer;
  coverLetter: string;
  proposedBudget: number;
  proposedTimeline: string;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: User;
  reviewee: User;
  jobId?: string;
  packageId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'proposal_received'
    | 'proposal_accepted'
    | 'job_completed'
    | 'review_received'
    | 'message_received'
    | 'payment_received'
    | 'order_update'
    | 'system_announcement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// Push Notification types
export interface PushNotificationData {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  url?: string;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface NotificationSettings {
  userId: string;
  browser: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
  };
  email: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
    digest: 'never' | 'daily' | 'weekly';
  };
  sms: {
    enabled: boolean;
    urgent: boolean;
    payments: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  attachments?: FileAttachment[];
  isRead: boolean;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // File size in bytes
  uploadedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  jobId?: string;
  packageId?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
  agreeToTerms: boolean;
}

export interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    maxAmount?: number;
  };
  timeline: string;
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote: boolean;
  deadline?: string;
}

export interface PackageFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
}

// Filter types
export interface JobFilters {
  category?: string;
  subcategory?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly';
  jobType?: 'fixed' | 'hourly';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: string[];
  isRemote?: boolean;
  skills?: string[];
  search?: string;
  deadline?: 'urgent' | 'week' | 'month' | 'flexible';
  sort?: 'newest' | 'budget' | 'proposals' | 'rating';
}

export interface PackageFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  deliveryTime?: number;
  rating?: number;
  search?: string;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
}

// Dashboard stats
export interface FreelancerStats {
  totalEarnings: number;
  activeProposals: number;
  completedJobs: number;
  profileViews: number;
  rating: number;
  responseRate: number;
}

export interface EmployerStats {
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  totalProposals: number;
  averageRating: number;
  savedFreelancers: number;
}

// Dashboard data interfaces
export interface FreelancerDashboard {
  stats: {
    totalEarnings: number;
    currentMonthEarnings: number;
    activeOrders: number;
    completedJobs: number;
    responseRate: number;
    rating: number;
    profileViews: number;
  };
  recentOrders: Order[];
  recentProposals: Proposal[];
  notifications: Notification[];
  quickStats: {
    pendingProposals: number;
    messagesWaiting: number;
    reviewsPending: number;
  };
}

export interface EmployerDashboard {
  stats: {
    totalSpent: number;
    currentMonthSpending: number;
    activeJobs: number;
    completedJobs: number;
    avgProjectCost: number;
    savedFreelancers: number;
  };
  activeJobs: Job[];
  recentHires: {
    freelancerId: string;
    jobTitle: string;
    amount: number;
    startDate: string;
  }[];
  notifications: Notification[];
  quickStats: {
    proposalsReceived: number;
    messagesWaiting: number;
    jobsExpiringSoon: number;
  };
}

// Profile interfaces
export interface FreelancerProfile extends Freelancer {
  certifications?: Certification[];
  languages?: string[];
  memberSince: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

export interface EmployerProfile extends Employer {
  memberSince: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  paymentMethods?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

// Payment System Types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  name: string;
  cardNumber?: string; // Masked card number (e.g., "**** **** **** 1234")
  expiryDate?: string;
  cardHolderName?: string;
  isDefault: boolean;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  description: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodId: string;
  userId: string;
  jobId?: string;
  packageId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCard {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
  billingAddress?: BillingAddress;
}

export interface BillingAddress {
  fullName: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  packageId?: string;
  package?: ServicePackage;
  jobId?: string;
  job?: Job;
  amount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: 'pending' | 'processing' | 'completed' | 'canceled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  deliverables?: string[];
  deadlineDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  order: Order;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  billingAddress: BillingAddress;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'TRY' | 'USD' | 'EUR';
  frozenAmount: number; // Dondurulan miktar (pending işlemler için)
  totalEarnings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'payment'
    | 'refund'
    | 'commission'
    | 'bonus';
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  description: string;
  referenceId?: string; // Order, job, or payment ID
  fees?: number;
  netAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Form Types
export interface PaymentFormData {
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentMethodId?: string;
  saveCard?: boolean;
  cardData?: PaymentCard;
  billingAddress?: BillingAddress;
  notes?: string;
}

export interface CheckoutFormData {
  packageId?: string;
  jobId?: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentMethod: PaymentCard;
  billingAddress: BillingAddress;
  notes?: string;
  agreeToTerms: boolean;
}

// Location and Map Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates: Coordinates;
  type: 'city' | 'district' | 'neighborhood' | 'custom';
  parentLocation?: string;
}

export interface LocationSearchResult {
  id: string;
  displayName: string;
  address: string;
  coordinates: Coordinates;
  distance?: number; // Distance in kilometers from search point
  relevanceScore?: number;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  type: 'job' | 'freelancer' | 'service' | 'user';
  data: Job | ServicePackage | User;
  icon?: string;
  color?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface LocationFilter {
  coordinates?: Coordinates;
  radius?: number; // Radius in kilometers
  city?: string;
  state?: string;
  country?: string;
  bounds?: MapBounds;
}

export interface GeolocationSettings {
  enabled: boolean;
  accuracy: 'high' | 'medium' | 'low';
  timeout: number; // milliseconds
  maximumAge: number; // milliseconds
  fallbackLocation?: Coordinates;
}

export interface LocationSearchParams {
  query?: string;
  coordinates?: Coordinates;
  radius?: number;
  bounds?: MapBounds;
  types?: string[];
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  language?: string;
}

// Extended Job and Service types with location
export interface JobWithLocation extends Omit<Job, 'location'> {
  location?: LocationData;
  locationString?: string; // Keep the original location field as locationString
  allowRemote?: boolean;
  preferredRadius?: number; // in kilometers
}

export interface ServicePackageWithLocation extends ServicePackage {
  serviceLocation?: LocationData;
  serviceRadius?: number; // Service area radius in kilometers
  allowRemote?: boolean;
  travelFee?: number; // Additional fee for travel
}

export interface FreelancerWithLocation extends Omit<Freelancer, 'location'> {
  location?: string; // Keep original location field
  baseLocation?: LocationData;
  serviceAreas?: LocationData[];
  maxTravelDistance?: number; // in kilometers
  travelRate?: number; // per kilometer
}
