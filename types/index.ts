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

export interface OrdersResponse {
  orders: OrderTracking[];
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
  title: string;
  description: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'freelancer' | 'system';
  };
  metadata?: Record<string, any>;
}

export interface OrderProgress {
  percentage: number;
  currentStage: string;
  stagesCompleted: number;
  totalStages: number;
  estimatedCompletion?: string;
}

export interface OrderMilestone {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  completedAt?: string;
  amount: number;
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
