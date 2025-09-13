// Base types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: 'freelancer' | 'employer' | 'admin';
  role?: 'user' | 'admin' | 'moderator' | 'super_admin';
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  permissions?: string[];
  lastLoginAt?: string;
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
  // Extended fields for detail pages
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
  questions?: {
    question: string;
    answer: string;
  }[];
}

// Extended Job interface for detail pages
export interface JobDetail {
  id: string;
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
  duration?: string;
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
  // Extended fields for detail pages
  requirements: string[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  expiresAt: string;
}

// Extended Package interface for detail pages
export interface PackageDetail extends ServicePackage {
  overview: string;
  whatIncluded: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  pricing: {
    basic: {
      price: number;
      title: string;
      description: string;
      features: string[];
      deliveryTime: number;
      revisions: number;
    };
    standard: {
      price: number;
      title: string;
      description: string;
      features: string[];
      deliveryTime: number;
      revisions: number;
    };
    premium: {
      price: number;
      title: string;
      description: string;
      features: string[];
      deliveryTime: number;
      revisions: number;
    };
  };
  addOns: {
    id: string;
    title: string;
    price: number;
    deliveryTime: number;
  }[];
  totalOrders: number;
  detailedReviews: Review[];
  relatedPackages: Partial<ServicePackage>[];
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
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'canceled'
    | 'refunded'
    | 'in_progress'
    | 'under_review'
    | 'disputed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  deliverables?: string[];
  deadlineDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Sprint 5 - Order tracking fields
  clientId?: string;
  freelancerId?: string;
  title?: string;
  description?: string;
  totalAmount?: number;
  deadline?: string;
  deliveryDate?: string;
  timeline?: OrderTimeline[];
  progress?: OrderProgress;
  milestones?: OrderMilestone[];
  communications?: OrderCommunication[];
  metadata?: {
    category?: string;
    subcategory?: string;
    urgency?: 'low' | 'medium' | 'high';
    clientRating?: number;
    freelancerRating?: number;
  };
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

// ========================================
// SPRINT 5: MESSAGING & ORDER TRACKING TYPES
// ========================================

// Messaging Types - Enhanced for Sprint 5
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  sentAt: string;
  readAt?: string;
  editedAt?: string;
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
  thumbnailUrl?: string;
}

export interface MessageMetadata {
  isEdited?: boolean;
  replyTo?: string; // Message ID being replied to
  mentions?: string[]; // User IDs mentioned
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'order'; // order-based or direct messaging
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  lastActivity: string;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  orderId?: string; // If conversation is order-related
  metadata?: ConversationMetadata;
}

export interface ConversationParticipant {
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  joinedAt: string;
  lastReadAt?: string;
  isTyping?: boolean;
  isOnline?: boolean;
}

export interface ConversationMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageSearchParams {
  query?: string;
  conversationId?: string;
  senderId?: string;
  type?: ChatMessage['type'];
  hasAttachments?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MessageSearchResult {
  message: ChatMessage;
  conversation: Pick<ChatConversation, 'id' | 'type' | 'participants'>;
  matches: string[]; // Highlighted text matches
}

// Order Tracking Types
export interface OrderTracking {
  id: string;
  orderNumber: string;
  packageId?: string;
  jobId?: string;
  package?: ServicePackage;
  job?: Job;
  buyerId: string;
  sellerId: string;
  buyer: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  status: OrderTrackingStatus;
  price: number;
  currency: 'TRY' | 'USD' | 'EUR';
  deliveryDate: string;
  completedAt?: string;
  files: OrderFile[];
  timeline: OrderTimelineEvent[];
  conversationId: string;
  invoiceUrl?: string;
  paymentStatus: OrderPaymentStatus;
  revisionCount: number;
  maxRevisions: number;
  requirements?: string;
  description?: string;
  metadata?: OrderTrackingMetadata;
  createdAt: string;
  updatedAt: string;
}

export type OrderTrackingStatus =
  | 'pending_payment'
  | 'active'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'revision_in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type OrderPaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface OrderFile {
  id: string;
  orderId: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
  uploadedBy: string; // User ID
  uploadedAt: string;
  version?: number;
  description?: string;
  isDeliverable: boolean; // Final delivery files vs work files
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  type: OrderEventType;
  status?: OrderTrackingStatus;
  title: string;
  description?: string;
  userId?: string; // Who triggered the event
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  timestamp: string;
  metadata?: OrderEventMetadata;
}

export type OrderEventType =
  | 'order_created'
  | 'payment_received'
  | 'work_started'
  | 'file_uploaded'
  | 'delivery_submitted'
  | 'revision_requested'
  | 'revision_submitted'
  | 'order_completed'
  | 'order_cancelled'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'message_sent';

export interface OrderEventMetadata {
  fileIds?: string[];
  messageId?: string;
  revisionReason?: string;
  paymentAmount?: number;
  disputeReason?: string;
}

export interface OrderTrackingMetadata {
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
  externalOrderId?: string;
  source?: 'web' | 'mobile' | 'api';
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  requestedBy: string;
  reason: string;
  description?: string;
  requestedFiles?: string[]; // File IDs to revise
  requestedAt: string;
  respondedAt?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

export interface DeliverySubmission {
  id: string;
  orderId: string;
  submittedBy: string;
  files: OrderFile[];
  message?: string;
  submittedAt: string;
  acceptedAt?: string;
  status: 'submitted' | 'accepted' | 'revision_requested';
}

// Pagination Helper Type
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types for Messaging & Orders
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  attachments?: Omit<MessageAttachment, 'id'>[];
  replyTo?: string;
}

export interface CreateConversationRequest {
  type: 'direct' | 'order';
  participantIds: string[];
  orderId?: string;
  initialMessage?: string;
  title?: string;
}

export interface SubmitDeliveryRequest {
  orderId: string;
  files: File[];
  message?: string;
}

export interface RequestRevisionRequest {
  orderId: string;
  reason: string;
  description?: string;
  requestedFiles?: string[];
}

export interface AcceptDeliveryRequest {
  orderId: string;
  rating?: number;
  review?: string;
}

// API Response Types
export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: PaginationMeta;
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
  pagination: PaginationMeta;
}

export interface MessageSearchResponse {
  results: MessageSearchResult[];
  pagination: PaginationMeta;
  totalMatches: number;
}

// WebSocket Events (for real-time messaging)
export interface WebSocketEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface MessageEvent extends WebSocketEvent {
  type: 'message_sent' | 'message_read' | 'message_edited' | 'message_deleted';
  payload: {
    conversationId: string;
    message: ChatMessage;
  };
}

export interface TypingEvent extends WebSocketEvent {
  type: 'typing_start' | 'typing_stop';
  payload: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
    timestamp: string;
  };
}

export interface OrderEvent extends WebSocketEvent {
  type: 'order_updated' | 'delivery_submitted' | 'revision_requested';
  payload: {
    orderId: string;
    order: OrderTracking;
    event: OrderTimelineEvent;
  };
}

export interface OnlineStatusEvent extends WebSocketEvent {
  type: 'user_online' | 'user_offline';
  payload: {
    userId: string;
    isOnline: boolean;
  };
}

// Sprint 5 - Additional Order Tracking Types
export interface OrderTimeline {
  id: string;
  orderId: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'canceled'
    | 'refunded'
    | 'in_progress'
    | 'under_review'
    | 'disputed';
  eventType:
    | 'milestone_completed'
    | 'payment_received'
    | 'revision_requested'
    | 'communication'
    | 'status_change'
    | 'order_created'
    | 'work_started'
    | 'delivery_submitted'
    | 'order_completed'
    | 'review_submitted'
    | 'dispute_created'
    | 'message_sent';
  title: string;
  description: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'freelancer' | 'system';
  };
  metadata?: {
    amount?: number;
    files?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
    }>;
    [key: string]: unknown;
  };
}

export interface OrderProgress {
  percentage: number;
  currentStage: string;
  stagesCompleted: number;
  totalStages: number;
  status:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'requires_approval'
    | 'rejected'
    | 'delayed';
  estimatedCompletion?: string;
}

export interface OrderMilestone {
  id: string;
  title: string;
  description?: string;
  status:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'requires_approval'
    | 'rejected';
  dueDate: string;
  completedAt?: string;
  amount: number;
  deliverables?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
}

export interface OrderCommunication {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  attachments: string[];
}

export interface OrderUpdate {
  from: string;
  to: string;
  message: string;
  attachments?: string[];
}

export interface OrderDispute {
  id: string;
  orderId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  createdAt: string;
  evidence?: string[];
}

export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

// ========================================
// SPRINT 6: PAYMENT SYSTEM & NOTIFICATIONS
// ========================================

// Enhanced Payment Types for Sprint 6
export type PaymentMethodType = 'credit_card' | 'bank_transfer' | 'wallet';

export interface CreatePaymentRequest {
  orderId: string;
  method: PaymentMethodType;
  amount: number;
  currency?: 'TRY' | 'USD' | 'EUR';
  saveCard?: boolean;
  cardDetails?: PaymentCard;
  billingAddress?: BillingAddress;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  success: boolean;
  data?: {
    paymentId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentUrl?: string;
    invoiceUrl?: string;
    redirectUrl?: string;
    estimatedCompletionTime?: string;
  };
  error?: string;
  message?: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  method: PaymentMethodType;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  failureReason?: string;
  transactionId?: string;
  gatewayReference?: string;
  paymentMethodDetails?: PaymentMethodDetails;
  escrowStatus?: 'held' | 'released' | 'refunded';
  escrowReleaseDate?: string;
  fees?: {
    platformFee: number;
    processingFee: number;
    total: number;
  };
  invoiceUrl?: string;
  receiptUrl?: string;
  refundableAmount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PaymentMethodDetails {
  type: PaymentMethodType;
  last4?: string; // Last 4 digits for cards
  brand?: string; // Visa, Mastercard, etc.
  bankName?: string; // For bank transfers
  accountNumber?: string; // Masked account number
  holderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

export interface EscrowDetails {
  id: string;
  paymentId: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: 'held' | 'released' | 'disputed' | 'refunded' | 'cancelled';
  holdStartDate: string;
  releaseDate?: string;
  releaseTrigger: 'manual' | 'automatic' | 'milestone' | 'dispute_resolution';
  disputeId?: string;
  releaseConditions?: string[];
  fees: {
    escrowFee: number;
    platformFee: number;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  payments: Payment[];
  summary: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
    escrowAmount: number;
  };
  pagination: PaginationMeta;
}

export interface PaymentFilters {
  status?: Payment['status'][];
  method?: Payment['method'][];
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  orderId?: string;
  search?: string;
  currency?: 'TRY' | 'USD' | 'EUR';
}

// Enhanced Invoice Types
export interface InvoiceGeneration {
  orderId: string;
  paymentId: string;
  templateType: 'standard' | 'detailed' | 'simple';
  language: 'tr' | 'en';
  includeItemizedBreakdown: boolean;
  includeTaxBreakdown: boolean;
  customFields?: Record<string, string>;
}

export interface InvoiceDetails extends Invoice {
  escrowInfo?: {
    amount: number;
    status: 'held' | 'released';
    releaseDate?: string;
  };
  paymentBreakdown: {
    subtotal: number;
    platformFee: number;
    processingFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  downloadUrls: {
    pdf: string;
    xml?: string;
    print: string;
  };
  emailStatus?: {
    sent: boolean;
    sentAt?: string;
    recipientEmail?: string;
  };
}

// Notification Types for Sprint 6
export interface NotificationPreferences {
  userId: string;
  browser: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
    marketing: boolean;
  };
  email: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
    marketing: boolean;
    digest: 'never' | 'daily' | 'weekly' | 'monthly';
    digestTime?: string; // HH:mm format
  };
  sms: {
    enabled: boolean;
    urgent: boolean;
    payments: boolean;
    security: boolean;
  };
  push: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
    sound: boolean;
    vibration: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
    daysOfWeek: string[]; // ['monday', 'tuesday', ...]
  };
  frequency: {
    immediate: string[]; // Notification types for immediate delivery
    batched: string[]; // Notification types for batched delivery
    batchInterval: number; // Minutes between batches
  };
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationTypeEnum;
  channel: 'browser' | 'email' | 'sms' | 'push';
  language: 'tr' | 'en';
  subject?: string; // For email
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
  variables: string[]; // Template variables like {{userName}}, {{amount}}
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationTypeEnum =
  | 'payment_received'
  | 'payment_completed'
  | 'payment_failed'
  | 'escrow_released'
  | 'invoice_generated'
  | 'refund_processed'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'order_created'
  | 'order_updated'
  | 'order_completed'
  | 'order_cancelled'
  | 'delivery_submitted'
  | 'revision_requested'
  | 'message_received'
  | 'review_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'system_maintenance'
  | 'security_alert'
  | 'account_verification'
  | 'password_reset'
  | 'login_attempt'
  | 'subscription_expiring'
  | 'welcome'
  | 'onboarding_step'
  | 'marketing_announcement';

export interface EnhancedNotification extends Notification {
  category:
    | 'payment'
    | 'order'
    | 'message'
    | 'system'
    | 'security'
    | 'marketing';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'browser' | 'email' | 'sms' | 'push';
  templateId?: string;
  variables?: Record<string, string>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
  readAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
  retryCount?: number;
  scheduledFor?: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryAttempts: NotificationDeliveryAttempt[];
  tags?: string[];
}

export interface NotificationDeliveryAttempt {
  id: string;
  notificationId: string;
  channel: 'browser' | 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'clicked';
  attemptedAt: string;
  deliveredAt?: string;
  failureReason?: string;
  gatewayResponse?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface NotificationCenter {
  notifications: EnhancedNotification[];
  summary: {
    total: number;
    unread: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  pagination: PaginationMeta;
}

export interface NotificationFilters {
  category?: NotificationTypeEnum[];
  priority?: ('low' | 'normal' | 'high' | 'urgent')[];
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string[];
}

export interface NotificationBatch {
  id: string;
  userId: string;
  type: 'digest' | 'batch' | 'scheduled';
  notifications: EnhancedNotification[];
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  channel: 'email' | 'sms' | 'push';
  metadata?: Record<string, unknown>;
}

// Push Notification Enhanced Types
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: PushNotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
  sound?: string;
}

export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscriptionData {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isActive: boolean;
  lastUsed?: string;
  failureCount: number;
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Event Types
export interface NotificationEvent {
  id: string;
  type: NotificationTypeEnum;
  userId: string;
  triggeredBy?: string; // User ID who triggered the event
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentNotificationData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  userRole: 'buyer' | 'seller';
}

export interface OrderNotificationData {
  orderId: string;
  orderNumber: string;
  title: string;
  amount: number;
  status: string;
  userRole: 'buyer' | 'seller';
  deadline?: string;
}

// Form Types for Sprint 6
export interface PaymentFormData {
  orderId: string;
  method: PaymentMethodType;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  saveCard?: boolean;
  cardDetails?: PaymentCard;
  billingAddress?: BillingAddress;
  agreeToTerms: boolean;
}

export interface NotificationSettingsFormData {
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
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// API Response Types for Sprint 6
export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistory;
  message?: string;
}

export interface NotificationCenterResponse {
  success: boolean;
  data: NotificationCenter;
  message?: string;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
  message?: string;
}

export interface InvoiceResponse {
  success: boolean;
  data: InvoiceDetails;
  message?: string;
}

// Error Types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  userMessage: string;
}

export interface NotificationError {
  code: string;
  message: string;
  channel: 'browser' | 'email' | 'sms' | 'push';
  retryable: boolean;
  userMessage: string;
}

// ========================================
// SPRINT 7: ADVANCED SEARCH & LOCATION-BASED FILTERING TYPES
// ========================================

// Advanced Search Types
export interface AdvancedSearchRequest {
  query?: string;
  category?: string;
  skills?: string[];
  location?: {
    city?: string;
    district?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    radius?: number; // km
  };
  budget?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  availability?: 'available' | 'busy' | 'any';
  remoteOk?: boolean;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance';
  page?: number;
  pageSize?: number;
  deliveryTime?: number; // for services
  experienceLevel?: 'beginner' | 'intermediate' | 'expert'; // for jobs
}

export interface AdvancedSearchResponse {
  success: boolean;
  data?: {
    results: (Freelancer | Job | ServicePackage)[];
    pagination: PaginationMeta;
    facets: SearchFacets;
    searchId: string; // For analytics
  };
  error?: string;
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  skills: { name: string; count: number }[];
  priceRanges: { range: string; count: number }[];
  ratings: { rating: number; count: number }[];
  experienceLevels: { level: string; count: number }[];
}

export interface SearchSuggestionsRequest {
  query: string;
  type: 'freelancers' | 'jobs' | 'services' | 'skills' | 'locations';
  limit?: number;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data?: {
    suggestions: string[];
    trending: string[];
    recent: string[];
  };
  error?: string;
}

export interface SearchAnalytics {
  searchId: string;
  query?: string;
  filters: AdvancedSearchRequest;
  resultsCount: number;
  clickedResults: string[];
  searchTime: number; // milliseconds
  userId?: string;
  sessionId: string;
  timestamp: string;
}

// Location-Based Types
export interface LocationSearchRequest {
  query?: string;
  coordinates?: Coordinates;
  radius?: number;
  bounds?: MapBounds;
  types?: ('city' | 'district' | 'neighborhood')[];
  limit?: number;
  language?: 'tr' | 'en';
}

export interface LocationSearchResponse {
  success: boolean;
  data?: LocationSearchResult[];
  error?: string;
}

export interface LocationAutocompleteRequest {
  input: string;
  coordinates?: Coordinates;
  radius?: number;
  types?: string[];
  language?: 'tr' | 'en';
}

export interface LocationAutocompleteResponse {
  success: boolean;
  data?: {
    predictions: LocationPrediction[];
  };
  error?: string;
}

export interface LocationPrediction {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
  matchedSubstrings: {
    offset: number;
    length: number;
  }[];
  placeId?: string;
}

export interface GeocodeRequest {
  address?: string;
  placeId?: string;
  coordinates?: Coordinates;
}

export interface GeocodeResponse {
  success: boolean;
  data?: {
    location: LocationData;
    formattedAddress: string;
    components: AddressComponent[];
  };
  error?: string;
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

// Recommendation System Types
export interface RecommendationsRequest {
  type: 'freelancers' | 'jobs' | 'services';
  userId?: string;
  basedOn?: 'profile' | 'activity' | 'similar' | 'collaborative';
  targetItemId?: string; // For "similar to this" recommendations
  limit?: number;
  excludeIds?: string[];
}

export interface RecommendationsResponse {
  success: boolean;
  data?: Recommendation[];
  error?: string;
}

export interface Recommendation {
  item: Freelancer | Job | ServicePackage;
  score: number; // 0-1 confidence score
  reason: RecommendationReason;
  metadata?: RecommendationMetadata;
}

export interface RecommendationReason {
  type:
    | 'skill_match'
    | 'location_proximity'
    | 'rating_similarity'
    | 'price_range'
    | 'category_preference'
    | 'collaborative_filtering';
  description: string;
  factors: RecommendationFactor[];
}

export interface RecommendationFactor {
  name: string;
  weight: number; // 0-1
  value: string | number;
  contribution: number; // How much this factor contributed to the score
}

export interface RecommendationMetadata {
  algorithm: string;
  version: string;
  generatedAt: string;
  expiresAt: string;
  debug?: Record<string, unknown>;
}

export interface RecommendationFeedback {
  recommendationId: string;
  userId: string;
  feedback:
    | 'like'
    | 'dislike'
    | 'not_relevant'
    | 'already_contacted'
    | 'too_expensive';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Favorites System Types
export interface FavoritesRequest {
  type?: 'freelancers' | 'jobs' | 'services';
  folderId?: string;
  page?: number;
  limit?: number;
}

export interface FavoritesResponse {
  success: boolean;
  data?: {
    freelancers: Freelancer[];
    jobs: Job[];
    services: ServicePackage[];
    folders: FavoriteFolder[];
  };
  error?: string;
}

// ========================================
// SPRINT 17: HELP CENTER & SUPPORT SYSTEM TYPES
// ========================================

// Help Center & Knowledge Base Types
export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  parentId?: string;
  children?: HelpCategory[];
  order: number;
  isVisible: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  category?: HelpCategory;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  featured: boolean;
  status: 'published' | 'draft' | 'archived' | 'under_review';
  estimatedReadTime: number; // minutes
  language: 'tr' | 'en';
  relatedArticles?: string[]; // Article IDs
  attachments?: ArticleAttachment[];
  seoTitle?: string;
  seoDescription?: string;
  lastReviewedAt?: string;
  nextReviewDate?: string;
  version: number;
}

export interface ArticleAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number;
  description?: string;
  downloadCount: number;
  uploadedAt: string;
}

export interface ArticleRating {
  id: string;
  articleId: string;
  userId: string;
  rating: number; // 1-5
  feedback?: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface ArticleView {
  id: string;
  articleId: string;
  userId?: string;
  sessionId: string;
  viewedAt: string;
  timeSpent?: number; // seconds
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

// Support Ticket System Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category:
    | 'technical'
    | 'billing'
    | 'account'
    | 'general'
    | 'report_user'
    | 'feature_request'
    | 'bug_report';
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'open'
    | 'pending'
    | 'in_progress'
    | 'waiting_user'
    | 'resolved'
    | 'closed';
  userId: string;
  user: Pick<
    User,
    'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'userType'
  >;
  assignedAgentId?: string;
  assignedAgent?: SupportAgent;
  attachments: TicketAttachment[];
  responses: TicketResponse[];
  tags: string[];
  metadata?: TicketMetadata;
  slaDetails: SLADetails;
  satisfaction?: TicketSatisfaction;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  firstResponseAt?: string;
  lastUserResponseAt?: string;
  lastAgentResponseAt?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title: string;
  department: string;
  specialties: string[];
  languages: string[];
  isOnline: boolean;
  currentLoad: number; // Number of active tickets
  maxLoad: number;
  rating: number;
  totalTicketsResolved: number;
  averageResponseTime: number; // minutes
  isAvailable: boolean;
  workingHours: {
    timezone: string;
    schedule: DailySchedule[];
  };
  lastActiveAt: string;
}

export interface DailySchedule {
  day:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  isWorkingDay: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breaks?: {
    startTime: string;
    endTime: string;
    title: string;
  }[];
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  responseId?: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
  scanStatus: 'pending' | 'clean' | 'malware' | 'suspicious';
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  responseType:
    | 'agent_reply'
    | 'user_reply'
    | 'system_note'
    | 'status_change'
    | 'assignment_change';
  content: string;
  authorId: string;
  author: (
    | Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
    | Pick<SupportAgent, 'id' | 'name' | 'avatar'>
  ) & { role: 'user' | 'agent' | 'system' };
  isPublic: boolean; // Internal notes vs public responses
  attachments: TicketAttachment[];
  mentions?: string[]; // User/Agent IDs mentioned
  metadata?: ResponseMetadata;
  createdAt: string;
  editedAt?: string;
}

export interface ResponseMetadata {
  isAutoResponse?: boolean;
  templateId?: string;
  macroId?: string;
  escalationLevel?: number;
  timeToResponse?: number; // minutes
  responseChannel?: 'web' | 'email' | 'chat' | 'phone';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TicketMetadata {
  source: 'web' | 'email' | 'chat' | 'phone' | 'mobile_app';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
  customerType?: 'free' | 'premium' | 'enterprise';
  originalCategory?: string;
  escalationPath?: string[];
  customFields?: Record<string, string | number | boolean>;
  relatedTickets?: string[];
  duplicateOf?: string;
  mergedTickets?: string[];
}

export interface SLADetails {
  responseTime: {
    target: number; // minutes
    remaining: number;
    status: 'within_sla' | 'approaching_breach' | 'breached';
  };
  resolutionTime: {
    target: number; // minutes
    remaining: number;
    status: 'within_sla' | 'approaching_breach' | 'breached';
  };
  escalationThresholds: {
    level: number;
    triggerTime: number; // minutes
    triggered: boolean;
    triggeredAt?: string;
  }[];
}

export interface TicketSatisfaction {
  rating: number; // 1-5
  feedback?: string;
  categories?: {
    responsiveness: number;
    helpfulness: number;
    professionalism: number;
    resolution: number;
  };
  wouldRecommend: boolean;
  submittedAt: string;
}

// Live Chat System Types
export interface ChatSession {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  agentId?: string;
  agent?: Pick<SupportAgent, 'id' | 'name' | 'avatar' | 'title'>;
  status: 'queued' | 'connected' | 'ended' | 'transferred' | 'abandoned';
  topic?: string;
  department: 'technical' | 'billing' | 'sales' | 'general';
  priority: 'normal' | 'high' | 'urgent';
  queuePosition?: number;
  estimatedWaitTime?: number; // minutes
  actualWaitTime?: number; // minutes
  sessionDuration?: number; // minutes
  metadata?: ChatSessionMetadata;
  startedAt: string;
  connectedAt?: string;
  endedAt?: string;
  lastActivityAt: string;
  rating?: ChatRating;
  transcript?: string;
  tags?: string[];
}

export interface ChatSessionMetadata {
  source: 'website' | 'mobile_app' | 'widget';
  pageUrl?: string;
  userAgent?: string;
  referrer?: string;
  currentOrder?: string;
  customerValue?: 'low' | 'medium' | 'high';
  transferHistory?: {
    fromAgentId: string;
    toAgentId: string;
    reason: string;
    transferredAt: string;
  }[];
  proactiveChat?: boolean;
  automation?: {
    botHandled: boolean;
    botDuration?: number;
    escalatedReason?: string;
  };
}

export interface SupportChatMessage {
  id: string;
  chatId: string;
  from: 'user' | 'agent' | 'system' | 'bot';
  senderId: string; // Made required to match earlier declaration
  sender?:
    | Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
    | Pick<SupportAgent, 'id' | 'name' | 'avatar'>; // Fixed type constraint
  message: string;
  messageType:
    | 'text'
    | 'file'
    | 'image'
    | 'system'
    | 'automated'
    | 'quick_reply'
    | 'card';
  timestamp: string;
  readAt?: string;
  deliveredAt?: string;
  attachments?: MessageAttachment[]; // Use consistent type
  quickReplies?: QuickReply[];
  cardData?: ChatCard;
  metadata?: MessageMetadata; // Use consistent type
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: string; // Message ID being replied to
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface QuickReply {
  id: string;
  title: string;
  payload: string;
  imageUrl?: string;
}

export interface ChatCard {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttons: {
    title: string;
    type: 'url' | 'postback';
    url?: string;
    payload?: string;
  }[];
}

export interface ChatMessageMetadata {
  deliveryChannel?: 'web' | 'mobile';
  messageSource?: 'manual' | 'template' | 'macro' | 'automation';
  templateId?: string;
  confidence?: number; // For bot messages
  intent?: string; // For bot messages
  entities?: Record<string, unknown>; // For bot messages
}

export interface ChatRating {
  rating: number; // 1-5
  feedback?: string;
  categories?: {
    responsiveness: number;
    helpfulness: number;
    professionalism: number;
  };
  wouldRecommend: boolean;
  submittedAt: string;
}

export interface ChatQueue {
  department: string;
  queueLength: number;
  averageWaitTime: number; // minutes
  availableAgents: number;
  totalAgents: number;
  longestWaitTime: number; // minutes
  estimatedWaitTime: number; // minutes
}

export interface ChatAvailability {
  isOnline: boolean;
  departments: {
    name: string;
    isAvailable: boolean;
    queueLength: number;
    estimatedWaitTime: number;
    message?: string;
  }[];
  businessHours: {
    timezone: string;
    currentTime: string;
    isBusinessHours: boolean;
    nextAvailable?: string;
    schedule: DailySchedule[];
  };
  maintenance?: {
    isScheduled: boolean;
    startTime?: string;
    endTime?: string;
    message?: string;
  };
}

export interface UserReputation {
  userId: string;
  reputation: number;
  level: number;
  stats: {
    threadsCreated: number;
    postsWritten: number;
    bestAnswers: number;
    helpfulVotes: number;
    thanksReceived: number;
  };
  history: ReputationChange[];
}

export interface ReputationChange {
  id: string;
  userId: string;
  change: number;
  reason: string;
  sourceId?: string; // Thread, post, or badge ID
  timestamp: string;
}

// Support Analytics Types
export interface SupportAnalytics {
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number; // hours
    averageResponseTime: number; // minutes
    customerSatisfaction: number; // 1-5
    firstCallResolution: number; // percentage
  };
  ticketsByCategory: {
    category: string;
    count: number;
    percentage: number;
    averageResolutionTime: number;
  }[];
  ticketsByPriority: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  responseTimeMetrics: {
    period: string;
    averageTime: number;
    target: number;
    performance: number; // percentage
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    ticketsHandled: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
    responseTime: number;
  }[];
  chatMetrics: {
    totalSessions: number;
    averageWaitTime: number;
    averageSessionDuration: number;
    abandonmentRate: number;
    satisfactionRating: number;
    transferRate: number;
  };
  knowledgeBaseMetrics: {
    totalArticles: number;
    totalViews: number;
    averageRating: number;
    searchQueries: number;
    successfulSearches: number; // percentage
    topArticles: {
      articleId: string;
      title: string;
      views: number;
      rating: number;
    }[];
  };
  trends: {
    period: string;
    tickets: number;
    resolutionTime: number;
    satisfaction: number;
  }[];
}

// API Request/Response Types
export interface HelpCategoriesResponse {
  data: HelpCategory[];
  success: boolean;
  message?: string;
}

export interface HelpArticlesResponse {
  data: HelpArticle[];
  pagination: PaginationMeta;
  success: boolean;
  message?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: {
    name: string;
    url: string;
    size: number;
  }[];
  metadata?: Record<string, unknown>;
}

export interface CreateTicketResponse {
  success: boolean;
  data?: {
    id: string;
    ticketNumber: string;
    subject: string;
    status: 'open';
    priority: string;
    createdAt: string;
    estimatedResolutionTime: string;
  };
  error?: string;
  message?: string;
}

export interface UserTicketsResponse {
  data: SupportTicket[];
  pagination: PaginationMeta;
  success: boolean;
  message?: string;
}

export interface StartChatRequest {
  topic?: string;
  department?: 'technical' | 'billing' | 'sales' | 'general';
  priority?: 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

export interface StartChatResponse {
  success: boolean;
  data?: {
    chatId: string;
    queuePosition: number;
    estimatedWaitTime: number; // minutes
    availableAgents: number;
    sessionToken?: string;
  };
  error?: string;
  message?: string;
}

export interface ChatMessagesResponse {
  data: SupportChatMessage[];
  pagination: PaginationMeta;
  success: boolean;
  message?: string;
}

export interface ArticleSearchRequest {
  query?: string;
  categoryId?: string;
  tags?: string[];
  featured?: boolean;
  language?: 'tr' | 'en';
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'views' | 'rating' | 'date';
}

export interface TicketSearchRequest {
  status?: SupportTicket['status'][];
  category?: SupportTicket['category'][];
  priority?: SupportTicket['priority'][];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  assignedAgent?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created' | 'updated' | 'priority' | 'status';
}

export interface ArticleRatingRequest {
  articleId: string;
  rating: number; // 1-5
  feedback?: string;
  isHelpful: boolean;
}

export interface ArticleRatingResponse {
  success: boolean;
  data?: {
    averageRating: number;
    ratingCount: number;
  };
  message?: string;
}

// Form Data Types
export interface CreateTicketFormData {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
}

export interface ArticleRatingFormData {
  articleId: string;
  rating: number;
  feedback?: string;
  isHelpful: boolean;
}

export interface ChatFeedbackFormData {
  chatId: string;
  rating: number;
  feedback?: string;
  categories?: {
    responsiveness: number;
    helpfulness: number;
    professionalism: number;
  };
  wouldRecommend: boolean;
}

export interface TicketResponseFormData {
  ticketId: string;
  content: string;
  attachments?: File[];
  isPublic: boolean;
}

// Error Types
export interface HelpCenterError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  userMessage: string;
}

export interface SupportError {
  code: string;
  message: string;
  category: 'ticket' | 'chat' | 'knowledge_base';
  retryable: boolean;
  userMessage: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// SPRINT 8: REVIEW & RATING SYSTEM TYPES
// ========================================

// Review System Types
export interface ReviewCategories {
  communication: number; // 1-5
  quality: number; // 1-5
  timing: number; // 1-5
  professionalism?: number; // 1-5
  value?: number; // 1-5
}

export interface ReviewData {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  reviewer: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  reviewee: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'>;
  rating: number; // Overall rating 1-5
  categories: ReviewCategories;
  comment: string;
  isPublic: boolean;
  reply?: ReviewReply;
  status: 'active' | 'hidden' | 'disputed' | 'spam';
  helpfulCount?: number;
  reportCount?: number;
  verifiedPurchase: boolean;
  projectTitle?: string;
  projectCategory?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  categoryAverages: ReviewCategories;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ReviewData[];
  verifiedPurchasePercentage: number;
}

export interface CreateReviewRequest {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  categories: ReviewCategories;
  comment: string;
  isPublic: boolean;
}

export interface CreateReviewResponse {
  success: boolean;
  data?: ReviewData;
  error?: string;
  message?: string;
}

export interface ReviewFilters {
  rating?: number; // Filter by minimum rating
  category?: string; // Filter by project category
  dateFrom?: string;
  dateTo?: string;
  verified?: boolean; // Only verified purchases
  hasReply?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface ReviewsResponse {
  success: boolean;
  data?: {
    reviews: ReviewData[];
    summary: ReviewSummary;
    pagination: PaginationMeta;
  };
  error?: string;
}

export interface ReviewModerationRequest {
  reviewId: string;
  action: 'approve' | 'hide' | 'mark_spam' | 'dispute';
  reason?: string;
  moderatorNote?: string;
}

export interface ReviewReportRequest {
  reviewId: string;
  reason: 'spam' | 'offensive' | 'fake' | 'inappropriate' | 'other';
  description?: string;
  reporterId: string;
}

// ========================================
// ANALYTICS DASHBOARD TYPES
// ========================================

// Base Analytics Types
export interface AnalyticsTimeframe {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  formattedValue: string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    periodComparison: string; // e.g., "vs last month"
  };
  icon?: string;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'purple';
  description?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  title: string;
  description?: string;
  data: ChartDataPoint[];
  colors?: string[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  formatValue?: (value: number) => string;
}

// Freelancer Analytics
export interface FreelancerAnalytics {
  overview: {
    totalEarnings: number;
    currentMonthEarnings: number;
    averageOrderValue: number;
    completedOrders: number;
    activeOrders: number;
    clientSatisfaction: number;
    repeatClientRate: number;
    responseTime: string; // e.g., "2 hours"
    profileViews: number;
    proposalAcceptanceRate: number;
  };
  earnings: {
    timeframe: AnalyticsTimeframe;
    totalEarnings: number;
    earningsTrend: ChartDataPoint[];
    earningsByCategory: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    monthlyRecurring: number;
    projectedEarnings: number;
  };
  orders: {
    total: number;
    completed: number;
    inProgress: number;
    cancelled: number;
    averageOrderValue: number;
    ordersTrend: ChartDataPoint[];
    ordersByCategory: {
      category: string;
      count: number;
      percentage: number;
    }[];
    averageDeliveryTime: number; // days
    onTimeDeliveryRate: number; // percentage
  };
  clients: {
    totalClients: number;
    newClients: number;
    repeatClients: number;
    repeatClientRate: number;
    clientSatisfaction: number;
    clientRetentionRate: number;
    topClients: {
      clientId: string;
      name: string;
      avatar?: string;
      totalSpent: number;
      orderCount: number;
      lastOrderDate: string;
    }[];
  };
  performance: {
    rating: number;
    totalReviews: number;
    ratingTrend: ChartDataPoint[];
    reviewsByRating: {
      rating: number;
      count: number;
      percentage: number;
    }[];
    skills: {
      skillName: string;
      proficiency: number;
      demandScore: number;
      earningsContribution: number;
    }[];
    responseTime: number; // hours
    proposalWinRate: number; // percentage
  };
  growth: {
    profileViews: ChartDataPoint[];
    proposalsSent: ChartDataPoint[];
    conversionRate: ChartDataPoint[];
    marketShare: number; // in category
    rankInCategory: number;
    growthRate: number; // monthly percentage
    opportunities: GrowthOpportunity[];
  };
}

// Employer Analytics
export interface EmployerAnalytics {
  overview: {
    totalSpent: number;
    currentMonthSpending: number;
    averageProjectCost: number;
    completedProjects: number;
    activeProjects: number;
    freelancerSatisfaction: number;
    projectSuccessRate: number;
    averageProjectDuration: number; // days
    savedFreelancers: number;
    repeatFreelancers: number;
  };
  spending: {
    timeframe: AnalyticsTimeframe;
    totalSpent: number;
    spendingTrend: ChartDataPoint[];
    spendingByCategory: {
      category: string;
      amount: number;
      percentage: number;
    }[];
    budgetUtilization: number; // percentage
    costSavings: number; // vs traditional hiring
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    cancelled: number;
    averageProjectCost: number;
    projectsTrend: ChartDataPoint[];
    projectsByCategory: {
      category: string;
      count: number;
      percentage: number;
    }[];
    averageCompletionTime: number; // days
    onTimeCompletionRate: number; // percentage
    budgetAdherenceRate: number; // percentage
  };
  freelancers: {
    totalFreelancers: number;
    activeFreelancers: number;
    repeatFreelancers: number;
    freelancerRetentionRate: number;
    averageFreelancerRating: number;
    freelancerSatisfaction: number;
    topFreelancers: {
      freelancerId: string;
      name: string;
      avatar?: string;
      totalPaid: number;
      projectCount: number;
      rating: number;
      lastProjectDate: string;
    }[];
  };
  hiring: {
    jobsPosted: number;
    proposalsReceived: number;
    averageProposalsPerJob: number;
    hireRate: number; // percentage of jobs that result in hires
    timeToHire: number; // days
    hiringTrend: ChartDataPoint[];
    proposalQualityScore: number; // 1-10
    freelancerSourceBreakdown: {
      source: 'search' | 'recommendations' | 'favorites' | 'direct';
      count: number;
      percentage: number;
    }[];
  };
  performance: {
    projectSuccessRate: number;
    budgetAccuracy: number; // how close final cost is to budget
    timelineAccuracy: number; // how close delivery is to deadline
    qualitySatisfaction: number;
    communicationSatisfaction: number;
    performanceTrend: ChartDataPoint[];
    categoryPerformance: {
      category: string;
      successRate: number;
      averageRating: number;
      averageCost: number;
    }[];
  };
}

export interface GrowthOpportunity {
  id: string;
  type: 'skill' | 'market' | 'pricing' | 'service';
  title: string;
  description: string;
  potentialImpact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  actionItems: string[];
  estimatedValue?: number;
  timeframe?: string;
}

export interface AnalyticsFilters {
  timeframe: AnalyticsTimeframe;
  category?: string;
  clientType?: 'new' | 'repeat' | 'all';
  projectSize?: 'small' | 'medium' | 'large' | 'all';
  region?: string;
}

export interface AnalyticsExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  sections: string[];
  timeframe: AnalyticsTimeframe;
  includeCharts: boolean;
  includeRawData: boolean;
}

export interface AnalyticsExportResponse {
  success: boolean;
  data?: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
  error?: string;
}

// ========================================
// REPUTATION & SECURITY TYPES
// ========================================

// Reputation System Types
export interface ReputationScore {
  userId: string;
  overallScore: number; // 0-100
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges: ReputationBadge[];
  factors: ReputationFactor[];
  history: ReputationHistory[];
  nextLevelRequirements?: ReputationRequirement[];
  calculatedAt: string;
  expiresAt: string;
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'verification' | 'milestone' | 'quality';
  earnedAt: string;
  isVisible: boolean;
  requirements?: string[];
}

export interface ReputationFactor {
  name: string;
  currentValue: number;
  maxValue: number;
  weight: number; // Contribution to overall score
  trend: 'improving' | 'stable' | 'declining';
  description: string;
}

export interface ReputationHistory {
  date: string;
  score: number;
  change: number;
  reason: string;
  factors: {
    name: string;
    oldValue: number;
    newValue: number;
  }[];
}

export interface ReputationRequirement {
  name: string;
  description: string;
  currentProgress: number;
  targetValue: number;
  isCompleted: boolean;
}

// Security System Types
export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'account' | 'payment' | 'verification' | 'activity' | 'policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  dismissible: boolean;
  isDismissed: boolean;
  dismissedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SecurityStatus {
  userId: string;
  overallScore: number; // 0-100
  level: 'poor' | 'fair' | 'good' | 'excellent';
  verifications: SecurityVerification[];
  alerts: SecurityAlert[];
  recommendations: SecurityRecommendation[];
  lastAssessment: string;
  nextAssessment: string;
}

export interface SecurityVerification {
  type: 'email' | 'phone' | 'identity' | '2fa' | 'payment' | 'address';
  status: 'verified' | 'pending' | 'failed' | 'not_started';
  verifiedAt?: string;
  expiresAt?: string;
  documents?: VerificationDocument[];
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

export interface VerificationDocument {
  id: string;
  type:
    | 'passport'
    | 'id_card'
    | 'driver_license'
    | 'utility_bill'
    | 'bank_statement';
  status: 'uploaded' | 'reviewing' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  fileName: string;
  fileUrl: string;
}

export interface SecurityRecommendation {
  id: string;
  type: 'verification' | 'password' | '2fa' | 'profile' | 'privacy';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string; // What completing this will improve
  actionText: string;
  actionUrl: string;
  isCompleted: boolean;
  completedAt?: string;
  estimatedTime: string; // e.g., "5 minutes"
}

export interface TrustIndicators {
  userId: string;
  profileCompletion: number; // 0-100
  verificationLevel: number; // 0-100
  activityScore: number; // 0-100
  reviewScore: number; // 0-100
  responseReliability: number; // 0-100
  paymentHistory: number; // 0-100
  communityStanding: number; // 0-100
  overallTrustScore: number; // 0-100
  publicBadges: ReputationBadge[];
  calculatedAt: string;
}

// ========================================
// FORM VALIDATION TYPES
// ========================================

export interface ReviewFormData {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  categories: ReviewCategories;
  comment: string;
  isPublic: boolean;
}

export interface ReviewReplyFormData {
  reviewId: string;
  content: string;
}

export interface ReviewModerationFormData {
  action: 'approve' | 'hide' | 'mark_spam' | 'dispute';
  reason?: string;
  moderatorNote?: string;
}

export interface SecurityVerificationFormData {
  type: SecurityVerification['type'];
  documents?: File[];
  additionalInfo?: Record<string, string>;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface GetAnalyticsResponse {
  success: boolean;
  data?: FreelancerAnalytics | EmployerAnalytics;
  error?: string;
  message?: string;
}

export interface GetReputationResponse {
  success: boolean;
  data?: {
    score: ReputationScore;
    status: SecurityStatus;
    trustIndicators: TrustIndicators;
  };
  error?: string;
  message?: string;
}

export interface GetSecurityAlertsResponse {
  success: boolean;
  data?: SecurityAlert[];
  error?: string;
  message?: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  userId: string;
}

export interface UpdateFolderRequest {
  folderId: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

// Favorite type for component usage
export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'freelancer' | 'job' | 'service';
  item: Freelancer | Job | ServicePackage;
  folderId?: string;
  folder?: FavoriteFolder;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AddToFavoritesRequest {
  itemId: string;
  itemType: 'freelancer' | 'job' | 'service';
  folderId?: string;
  note?: string;
}

export interface AddToFavoritesResponse {
  success: boolean;
  data?: {
    favoriteId: string;
    message: string;
  };
  error?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'freelancer' | 'job' | 'service';
  item: Freelancer | Job | ServicePackage;
  folderId?: string;
  folder?: FavoriteFolder;
  note?: string;
  addedAt: string;
  tags?: string[];
}

// Saved Searches Types
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query?: string;
  filters: AdvancedSearchRequest;
  alertEnabled: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  lastRun?: string;
  resultsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSearchRequest {
  name: string;
  query?: string;
  filters: AdvancedSearchRequest;
  alertEnabled?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

export interface SaveSearchResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    savedAt: string;
  };
  error?: string;
}

export interface SavedSearchAlert {
  id: string;
  savedSearchId: string;
  userId: string;
  newResults: (Freelancer | Job | ServicePackage)[];
  triggeredAt: string;
  sent: boolean;
  sentAt?: string;
}

// Map Integration Types
export interface MapConfig {
  apiKey: string;
  defaultCenter: Coordinates;
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
  enableGeolocation: boolean;
  enableSearch: boolean;
  enableClustering: boolean;
  style?: 'default' | 'satellite' | 'terrain' | 'hybrid';
}

export interface MapInstance {
  id: string;
  center: Coordinates;
  zoom: number;
  bounds: MapBounds;
  markers: MapMarker[];
  clusterer?: MarkerClusterer;
}

export interface MarkerClusterer {
  enabled: boolean;
  maxZoom: number;
  gridSize: number;
  style: ClusterStyle[];
}

export interface ClusterStyle {
  url: string;
  height: number;
  width: number;
  textColor: string;
  textSize: number;
}

export interface MapMarkerData {
  freelancer?: Freelancer;
  job?: Job;
  service?: ServicePackage;
  user?: User;
}

export interface MapSearchParams {
  bounds: MapBounds;
  zoom: number;
  center: Coordinates;
  type: 'freelancers' | 'jobs' | 'services';
  filters?: AdvancedSearchRequest;
}

export interface MapSearchResponse {
  success: boolean;
  data?: {
    markers: MapMarker[];
    clusters: MarkerCluster[];
    bounds: MapBounds;
  };
  error?: string;
}

export interface MarkerCluster {
  id: string;
  position: Coordinates;
  count: number;
  bounds: MapBounds;
  markers: MapMarker[];
}

// Trending & Popular Types
export interface TrendingSearches {
  timeframe: 'hour' | 'day' | 'week' | 'month';
  searches: TrendingSearch[];
  updatedAt: string;
}

export interface TrendingSearch {
  query: string;
  count: number;
  growth: number; // Percentage growth compared to previous period
  category?: string;
  rank: number;
}

export interface PopularItems {
  type: 'freelancers' | 'jobs' | 'services';
  timeframe: 'day' | 'week' | 'month';
  items: PopularItem[];
  updatedAt: string;
}

export interface PopularItem {
  item: Freelancer | Job | ServicePackage;
  score: number;
  metrics: {
    views: number;
    contacts: number;
    favorites: number;
    proposals?: number; // for jobs
    orders?: number; // for services
  };
  rank: number;
}

// Search Filters UI Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterGroup {
  id: string;
  name: string;
  type:
    | 'select'
    | 'multi-select'
    | 'range'
    | 'checkbox'
    | 'radio'
    | 'location'
    | 'rating';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  dependencies?: string[]; // Other filter IDs that this depends on
}

export interface ActiveFilter {
  groupId: string;
  value: string | number | string[] | { min: number; max: number };
  label: string;
  removable: boolean;
}

// Search History Types
export interface SearchHistory {
  searches: SearchHistoryItem[];
  pagination: PaginationMeta;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query?: string;
  filters: AdvancedSearchRequest;
  resultsCount: number;
  searchedAt: string;
  clickedResults: string[];
  bookmarked: boolean;
}

// Form Data Types for Sprint 7
export interface AdvancedSearchFormData {
  query?: string;
  category?: string;
  skills?: string[];
  location?: {
    city?: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
    radius?: number;
  };
  budget?: { min?: number; max?: number };
  rating?: number;
  availability?: 'available' | 'busy' | 'any';
  remoteOk?: boolean;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance';
  deliveryTime?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
}

export interface SaveSearchFormData {
  name: string;
  filters: AdvancedSearchFormData;
  alertEnabled?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

export interface LocationPickerFormData {
  query: string;
  selectedLocation?: LocationData;
  useCurrentLocation?: boolean;
  radius?: number;
}

export interface FavoriteFolderFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

// Component Props Types
export interface AdvancedSearchProps {
  mode: 'freelancers' | 'jobs' | 'services';
  defaultFilters?: Partial<AdvancedSearchFormData>;
  onSearch?: (filters: AdvancedSearchRequest) => void;
  onResults?: (results: (Freelancer | Job | ServicePackage)[]) => void;
  showSaveSearch?: boolean;
  showMapToggle?: boolean;
  className?: string;
}

export interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  showRadius?: boolean;
  defaultRadius?: number;
  disabled?: boolean;
  className?: string;
}

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onContact?: (item: Freelancer | Job | ServicePackage) => void;
  onFavorite?: (item: Freelancer | Job | ServicePackage) => void;
  onFeedback?: (feedback: RecommendationFeedback) => void;
  showReason?: boolean;
  className?: string;
}

export interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  trending: string[];
  recent: string[];
  onSelect: (suggestion: string) => void;
  loading?: boolean;
  className?: string;
}

export interface FavoritesListProps {
  type?: 'freelancers' | 'jobs' | 'services';
  folderId?: string;
  onItemClick?: (item: FavoriteItem) => void;
  onFolderChange?: (folderId: string) => void;
  showFolders?: boolean;
  className?: string;
}

export interface MapViewProps {
  searchParams: MapSearchParams;
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  className?: string;
}

// Store Types
export interface AdvancedSearchStore {
  // State
  searchQuery: string;
  searchResults: (Freelancer | Job | ServicePackage)[];
  suggestions: string[];
  recentSearches: string[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  facets: SearchFacets | null;
  searchId: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  getSuggestions: (query: string) => Promise<void>;
  performAdvancedSearch: (filters: AdvancedSearchRequest) => Promise<void>;
  saveSearch: (name: string, filters: AdvancedSearchRequest) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  addToRecentSearches: (query: string) => void;
  clearSearchResults: () => void;
  clearError: () => void;
}

export interface RecommendationStore {
  // State
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRecommendations: (request: RecommendationsRequest) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  provideFeedback: (feedback: RecommendationFeedback) => Promise<void>;
  clearError: () => void;
}

export interface FavoritesStore {
  // State
  favorites: {
    freelancers: Freelancer[];
    jobs: Job[];
    services: ServicePackage[];
    folders: FavoriteFolder[];
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  addToFavorites: (request: AddToFavoritesRequest) => Promise<void>;
  removeFromFavorites: (
    itemId: string,
    itemType: 'freelancer' | 'job' | 'service'
  ) => Promise<void>;
  createFolder: (
    folder: Omit<FavoriteFolder, 'id' | 'itemCount' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  moveToFolder: (itemId: string, folderId: string) => Promise<void>;
  clearError: () => void;
}

export interface LocationStore {
  // State
  currentLocation: Coordinates | null;
  selectedLocation: LocationData | null;
  searchResults: LocationSearchResult[];
  predictions: LocationPrediction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getCurrentLocation: () => Promise<void>;
  searchLocations: (request: LocationSearchRequest) => Promise<void>;
  getAutocomplete: (request: LocationAutocompleteRequest) => Promise<void>;
  geocode: (request: GeocodeRequest) => Promise<void>;
  setSelectedLocation: (location: LocationData | null) => void;
  clearError: () => void;
}

// ========================================
// SPRINT 10: ADMIN PANEL TYPES
// ========================================

// Admin User Types
export interface AdminUser extends User {
  userType: 'admin';
  role: 'admin' | 'moderator' | 'super_admin';
  permissions: string[];
  adminLevel: 'admin' | 'moderator' | 'super_admin';
  managedDepartments?: string[];
  accessLevel: 'full' | 'limited';
  lastAdminAction?: string;
  adminMetadata?: Record<string, unknown>;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope?: 'own' | 'all';
}

// Admin Dashboard Types
export interface AdminDashboardData {
  stats: AdminStats;
  charts: AdminCharts;
  alerts: AdminAlert[];
  recentActivity: AdminActivity[];
  systemHealth: SystemHealth;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalJobs: number;
  activeJobs: number;
  jobsToday: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalServices: number;
  activeServices: number;
  averageOrderValue: number;
  conversionRate: number;
  userRetentionRate: number;
}

export interface AdminCharts {
  userGrowth: Array<{ date: string; users: number; newUsers: number }>;
  revenue: Array<{ date: string; amount: number; orders: number }>;
  activity: Array<{
    date: string;
    jobs: number;
    orders: number;
    messages: number;
  }>;
  userTypes: Array<{
    type: 'freelancer' | 'employer';
    count: number;
    percentage: number;
  }>;
  topCategories: Array<{
    category: string;
    jobCount: number;
    orderCount: number;
  }>;
  orderStatus: Array<{ status: string; count: number; percentage: number }>;
  geographicDistribution: Array<{
    country: string;
    region: string;
    userCount: number;
  }>;
}

export interface AdminAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: 'system' | 'security' | 'moderation' | 'finance' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

export interface AdminActivity {
  id: string;
  type:
    | 'user_action'
    | 'system_event'
    | 'moderation_action'
    | 'financial_transaction';
  userId?: string;
  adminId?: string;
  action: string;
  description: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number; // seconds
  responseTime: number; // milliseconds
  apiStatus: 'operational' | 'degraded' | 'down';
  databaseStatus: 'healthy' | 'slow' | 'down';
  cacheStatus: 'healthy' | 'degraded' | 'down';
  paymentGatewayStatus: 'operational' | 'degraded' | 'down';
  notificationServiceStatus: 'operational' | 'degraded' | 'down';
  lastCheckedAt: string;
  issues: SystemIssue[];
}

export interface SystemIssue {
  id: string;
  component: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startedAt: string;
  resolvedAt?: string;
  status: 'ongoing' | 'resolved' | 'investigating';
}

// User Management Types
export interface AdminUserData extends User {
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'unverified';
  verificationBadges: VerificationBadge[];
  joinDate: string;
  lastActiveAt: string;
  lastLoginAt: string;
  loginCount: number;
  totalOrders: number;
  totalEarnings: number;
  totalSpent: number;
  successRate: number;
  disputeCount: number;
  warningCount: number;
  reputationScore: number;
  riskScore: number;
  notes: AdminUserNote[];
  suspensionHistory: SuspensionRecord[];
  metadata?: UserMetadata;
}

export interface VerificationBadge {
  id: string;
  type: 'email' | 'phone' | 'identity' | 'payment' | 'professional' | 'premium';
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  verifiedAt?: string;
  expiresAt?: string;
  verifiedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminUserNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  category: 'general' | 'warning' | 'positive' | 'security' | 'finance';
  isPublic: boolean;
  createdAt: string;
}

export interface SuspensionRecord {
  id: string;
  adminId: string;
  adminName: string;
  reason: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  type: 'warning' | 'temporary_suspension' | 'permanent_ban';
  metadata?: Record<string, unknown>;
}

export interface UserMetadata {
  registrationIp?: string;
  registrationUserAgent?: string;
  referralSource?: string;
  marketingCampaign?: string;
  deviceInfo?: Record<string, unknown>;
  behaviorFlags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UserFilters {
  search?: string;
  userType?: 'freelancer' | 'employer';
  status?: ('active' | 'suspended' | 'banned' | 'pending_verification')[];
  verificationStatus?: ('verified' | 'pending' | 'rejected' | 'unverified')[];
  joinDateFrom?: string;
  joinDateTo?: string;
  lastActiveFrom?: string;
  lastActiveTo?: string;
  location?: string[];
  minOrders?: number;
  maxOrders?: number;
  minEarnings?: number;
  maxEarnings?: number;
  riskScore?: 'low' | 'medium' | 'high';
  hasDisputes?: boolean;
  sort?:
    | 'newest'
    | 'oldest'
    | 'most_active'
    | 'highest_earnings'
    | 'risk_score';
  page?: number;
  limit?: number;
}

export interface UserActionRequest {
  action:
    | 'suspend'
    | 'unsuspend'
    | 'ban'
    | 'unban'
    | 'verify'
    | 'unverify'
    | 'add_note'
    | 'reset_password';
  reason?: string;
  duration?: number; // For suspensions in days
  endDate?: string;
  note?: string;
  notifyUser?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BulkUserActionRequest {
  userIds: string[];
  action: UserActionRequest;
}

// Content Moderation Types
export interface ModerationItem {
  id: string;
  type: 'review' | 'job' | 'service' | 'profile' | 'message' | 'portfolio';
  contentId: string;
  content: ModerationContent;
  reportedBy?: string;
  reporterInfo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'userType'>;
  reason: ModerationReason;
  category: ModerationCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'dismissed';
  assignedTo?: string;
  moderatorId?: string;
  moderatorNotes?: string;
  automatedFlags: AutomatedFlag[];
  reviewHistory: ModerationReview[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ModerationContent {
  title?: string;
  description?: string;
  images?: string[];
  text?: string;
  rating?: number;
  originalContent?: Record<string, unknown>;
  userContent?: UserGeneratedContent;
}

export interface UserGeneratedContent {
  userId: string;
  userName: string;
  userType: 'freelancer' | 'employer';
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export type ModerationReason =
  | 'spam'
  | 'inappropriate_content'
  | 'false_information'
  | 'copyright_violation'
  | 'harassment'
  | 'hate_speech'
  | 'scam'
  | 'fake_reviews'
  | 'price_manipulation'
  | 'duplicate_content'
  | 'off_topic'
  | 'low_quality'
  | 'policy_violation'
  | 'other';

export type ModerationCategory =
  | 'content_quality'
  | 'user_safety'
  | 'platform_integrity'
  | 'legal_compliance'
  | 'community_standards'
  | 'business_policy';

export interface AutomatedFlag {
  id: string;
  type:
    | 'keyword_detection'
    | 'image_analysis'
    | 'pattern_matching'
    | 'sentiment_analysis'
    | 'duplicate_detection';
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  details: string;
  metadata?: Record<string, unknown>;
  flaggedAt: string;
}

export interface ModerationReview {
  id: string;
  moderatorId: string;
  moderatorName: string;
  action:
    | 'approved'
    | 'rejected'
    | 'escalated'
    | 'requested_changes'
    | 'dismissed';
  notes: string;
  reviewTime: number; // seconds spent reviewing
  timestamp: string;
}

export interface ModerationActionRequest {
  action: 'approve' | 'reject' | 'escalate' | 'dismiss' | 'request_changes';
  reason?: string;
  notes?: string;
  notifyUser?: boolean;
  notifyReporter?: boolean;
  additionalActions?: UserActionRequest[];
  metadata?: Record<string, unknown>;
}

export interface ModerationFilters {
  type?: ('review' | 'job' | 'service' | 'profile' | 'message' | 'portfolio')[];
  status?: ('pending' | 'approved' | 'rejected' | 'escalated' | 'dismissed')[];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  reason?: ModerationReason[];
  category?: ModerationCategory[];
  assignedTo?: string;
  reportedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAutomatedFlags?: boolean;
  search?: string;
  sort?: 'newest' | 'oldest' | 'priority' | 'most_reported';
  page?: number;
  limit?: number;
}

export interface ModerationStats {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  averageReviewTime: number;
  automatedFlagAccuracy: number;
  topModerationReasons: Array<{ reason: ModerationReason; count: number }>;
  moderatorPerformance: Array<{
    moderatorId: string;
    moderatorName: string;
    reviewedItems: number;
    averageTime: number;
    accuracy: number;
  }>;
}

// Platform Settings Types
export interface PlatformSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  security: SecuritySettings;
  email: EmailSettings;
  features: FeatureSettings;
  content: ContentSettings;
  api: ApiSettings;
  integrations: IntegrationSettings;
  maintenance: MaintenanceSettings;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maxFileUploadSize: number; // bytes
  allowedFileTypes: string[];
  defaultLanguage: 'tr' | 'en';
  supportedLanguages: string[];
  timezone: string;
  currency: 'TRY' | 'USD' | 'EUR';
  supportedCurrencies: string[];
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
}

export interface PaymentSettings {
  platformFee: number; // percentage
  minimumWithdrawal: number;
  withdrawalFee: number;
  escrowPeriod: number; // days
  automaticRelease: boolean;
  supportedPaymentMethods: string[];
  taxCalculation: boolean;
  invoiceGeneration: boolean;
  refundPolicy: RefundPolicySettings;
}

export interface RefundPolicySettings {
  allowRefunds: boolean;
  refundPeriod: number; // days
  partialRefunds: boolean;
  automaticRefunds: boolean;
  refundFee: number; // percentage
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordRequirements: PasswordRequirements;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  ipWhitelist: string[];
  ipBlacklist: string[];
  enableCaptcha: boolean;
  dataRetentionPeriod: number; // days
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailVerification: boolean;
  emailTemplates: EmailTemplateSettings[];
}

export interface EmailTemplateSettings {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
  isActive: boolean;
}

export interface FeatureSettings {
  userRegistration: boolean;
  emailVerificationRequired: boolean;
  profileVerification: boolean;
  servicePackages: boolean;
  jobPosting: boolean;
  directMessaging: boolean;
  videoChat: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  affiliateProgram: boolean;
  loyaltyProgram: boolean;
  multiLanguage: boolean;
  darkMode: boolean;
  notificationSystem: boolean;
  searchEngine: boolean;
  analyticsTracking: boolean;
}

export interface ContentSettings {
  moderationEnabled: boolean;
  autoModeration: boolean;
  userGeneratedContent: boolean;
  allowUserProfiles: boolean;
  allowPortfolio: boolean;
  allowCustomCategories: boolean;
  contentFiltering: boolean;
  spamDetection: boolean;
  duplicateDetection: boolean;
  imageModeration: boolean;
  textAnalysis: boolean;
}

export interface ApiSettings {
  enablePublicApi: boolean;
  enableWebhooks: boolean;
  rateLimiting: RateLimitSettings;
  apiVersioning: boolean;
  apiDocumentation: boolean;
  apiKeys: ApiKeySettings[];
}

export interface RateLimitSettings {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burst: number;
}

export interface ApiKeySettings {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  rateLimits: RateLimitSettings;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface IntegrationSettings {
  paymentGateways: PaymentGatewaySettings[];
  emailProviders: EmailProviderSettings[];
  smsProviders: SmsProviderSettings[];
  analyticsProviders: AnalyticsProviderSettings[];
  socialLogins: SocialLoginSettings[];
}

export interface PaymentGatewaySettings {
  id: string;
  name: string;
  isActive: boolean;
  configuration: Record<string, unknown>;
  supportedCurrencies: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface EmailProviderSettings {
  id: string;
  name: string;
  isActive: boolean;
  configuration: Record<string, unknown>;
  isDefault: boolean;
}

export interface SmsProviderSettings {
  id: string;
  name: string;
  isActive: boolean;
  configuration: Record<string, unknown>;
  isDefault: boolean;
  supportedCountries: string[];
}

export interface AnalyticsProviderSettings {
  id: string;
  name: string;
  isActive: boolean;
  configuration: Record<string, unknown>;
  trackingId: string;
}

export interface SocialLoginSettings {
  provider: 'google' | 'facebook' | 'linkedin' | 'twitter' | 'github';
  isActive: boolean;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export interface MaintenanceSettings {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  scheduledMaintenance: ScheduledMaintenance[];
  allowedIps: string[];
  allowedRoles: string[];
}

export interface ScheduledMaintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedServices: string[];
  notifyUsers: boolean;
  isActive: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  adminId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: AuditLogDetails;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user_action' | 'admin_action' | 'system_event' | 'security_event';
}

export interface AuditLogDetails {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  userId?: string;
  adminId?: string;
  action?: string[];
  resource?: string[];
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  category?: (
    | 'user_action'
    | 'admin_action'
    | 'system_event'
    | 'security_event'
  )[];
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Admin Store Interfaces
export interface AdminDashboardStore {
  // State
  data: AdminDashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  clearError: () => void;
}

export interface AdminUserStore {
  // State
  users: AdminUserData[];
  selectedUser: AdminUserData | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: PaginationMeta | null;
  bulkSelectedIds: string[];

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  performUserAction: (
    userId: string,
    action: UserActionRequest
  ) => Promise<void>;
  performBulkAction: (action: BulkUserActionRequest) => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  selectUser: (user: AdminUserData | null) => void;
  toggleBulkSelection: (userId: string) => void;
  selectAllUsers: () => void;
  clearBulkSelection: () => void;
  clearError: () => void;
}

export interface AdminModerationStore {
  // State
  items: ModerationItem[];
  selectedItem: ModerationItem | null;
  stats: ModerationStats | null;
  isLoading: boolean;
  error: string | null;
  filters: ModerationFilters;
  pagination: PaginationMeta | null;

  // Actions
  fetchModerationQueue: (filters?: ModerationFilters) => Promise<void>;
  fetchModerationStats: () => Promise<void>;
  performModerationAction: (
    itemId: string,
    action: ModerationActionRequest
  ) => Promise<void>;
  assignModerator: (itemId: string, moderatorId: string) => Promise<void>;
  escalateItem: (itemId: string, reason: string) => Promise<void>;
  setFilters: (filters: Partial<ModerationFilters>) => void;
  selectItem: (item: ModerationItem | null) => void;
  clearError: () => void;
}

export interface AdminSettingsStore {
  // State
  settings: PlatformSettings | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: (settings: PlatformSettings) => Promise<void>;
  clearError: () => void;
}

export interface AdminAuditStore {
  // State
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  filters: AuditLogFilters;
  pagination: PaginationMeta | null;

  // Actions
  fetchAuditLogs: (filters?: AuditLogFilters) => Promise<void>;
  exportAuditLogs: (filters?: AuditLogFilters) => Promise<void>;
  setFilters: (filters: Partial<AuditLogFilters>) => void;
  clearError: () => void;
}

// Admin API Response Types
export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
  message?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: AdminUserData[];
    pagination: PaginationMeta;
  };
  message?: string;
}

export interface AdminUserResponse {
  success: boolean;
  data: AdminUserData;
  message?: string;
}

export interface AdminUserActionResponse {
  success: boolean;
  data?: {
    user: AdminUserData;
    auditLog: AuditLog;
  };
  message: string;
}

export interface AdminModerationResponse {
  success: boolean;
  data: {
    items: ModerationItem[];
    pagination: PaginationMeta;
  };
  message?: string;
}

export interface AdminModerationStatsResponse {
  success: boolean;
  data: ModerationStats;
  message?: string;
}

export interface AdminModerationActionResponse {
  success: boolean;
  data?: {
    item: ModerationItem;
    auditLog: AuditLog;
  };
  message: string;
}

export interface AdminSettingsResponse {
  success: boolean;
  data: PlatformSettings;
  message?: string;
}

export interface AdminAuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: PaginationMeta;
  };
  message?: string;
}
