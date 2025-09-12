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

export interface FavoriteFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
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
