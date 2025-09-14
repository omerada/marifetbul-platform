/**
 * Discriminated Unions
 * Provides type-safe unions with discriminant properties for better type checking
 */

// API Response Discriminated Union
export type ApiResult<TData = unknown, TError = string> =
  | {
      success: true;
      data: TData;
      message?: string;
      timestamp: string;
    }
  | {
      success: false;
      error: TError;
      code?: string;
      timestamp: string;
    };

// User Account Status Discriminated Union
export type UserAccountState =
  | {
      status: 'active';
      lastLoginAt: string;
      loginCount: number;
    }
  | {
      status: 'suspended';
      suspendedAt: string;
      suspensionReason: string;
      suspendedUntil?: string;
    }
  | {
      status: 'banned';
      bannedAt: string;
      banReason: string;
      isPermanent: boolean;
    }
  | {
      status: 'pending_verification';
      verificationToken: string;
      tokenExpiresAt: string;
    };

// Payment Method Discriminated Union
export type PaymentMethod =
  | {
      type: 'credit_card';
      id: string;
      last4: string;
      brand: string;
      expiryMonth: number;
      expiryYear: number;
      holderName: string;
      isDefault: boolean;
    }
  | {
      type: 'bank_transfer';
      id: string;
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      accountHolderName: string;
      isDefault: boolean;
    }
  | {
      type: 'paypal';
      id: string;
      email: string;
      isVerified: boolean;
      isDefault: boolean;
    }
  | {
      type: 'crypto';
      id: string;
      currency: 'BTC' | 'ETH' | 'USDC' | 'USDT';
      walletAddress: string;
      network: string;
      isDefault: boolean;
    };

// Notification Type Discriminated Union
export type NotificationVariant =
  | {
      type: 'message';
      senderId: string;
      senderName: string;
      conversationId: string;
      preview: string;
    }
  | {
      type: 'payment_received';
      amount: number;
      currency: string;
      paymentId: string;
      orderId: string;
    }
  | {
      type: 'payment_sent';
      amount: number;
      currency: string;
      paymentId: string;
      recipientName: string;
    }
  | {
      type: 'job_application';
      jobId: string;
      jobTitle: string;
      applicantName: string;
      proposalId: string;
    }
  | {
      type: 'job_accepted';
      jobId: string;
      jobTitle: string;
      employerName: string;
      startDate: string;
    }
  | {
      type: 'order_update';
      orderId: string;
      orderTitle: string;
      status: 'in_progress' | 'completed' | 'cancelled' | 'disputed';
      updatedBy: string;
    }
  | {
      type: 'review_received';
      reviewId: string;
      rating: number;
      reviewerName: string;
      orderId: string;
    }
  | {
      type: 'system_maintenance';
      maintenanceStart: string;
      maintenanceEnd: string;
      affectedServices: string[];
    }
  | {
      type: 'security_alert';
      alertType: 'login_attempt' | 'password_change' | 'suspicious_activity';
      location?: string;
      ipAddress?: string;
    };

// Job Status Discriminated Union
export type JobState =
  | {
      status: 'draft';
      createdAt: string;
      lastModified: string;
    }
  | {
      status: 'open';
      publishedAt: string;
      applicationsCount: number;
      expiresAt?: string;
    }
  | {
      status: 'in_progress';
      assignedTo: string;
      startedAt: string;
      expectedCompletion: string;
      milestones: Array<{
        id: string;
        title: string;
        completed: boolean;
        dueDate: string;
      }>;
    }
  | {
      status: 'completed';
      completedAt: string;
      completedBy: string;
      finalDeliverable?: string;
      clientApproval: boolean;
    }
  | {
      status: 'cancelled';
      cancelledAt: string;
      cancelledBy: string;
      cancellationReason: string;
      refundIssued: boolean;
    }
  | {
      status: 'disputed';
      disputeOpenedAt: string;
      disputeReason: string;
      disputeStatus: 'open' | 'in_review' | 'resolved';
      mediatorAssigned?: string;
    };

// Order Item Discriminated Union
export type OrderItem =
  | {
      type: 'service_package';
      packageId: string;
      packageTitle: string;
      basePrice: number;
      deliveryTime: number;
      revisions: number;
    }
  | {
      type: 'custom_service';
      description: string;
      agreedPrice: number;
      estimatedDelivery: string;
      requirements: string[];
    }
  | {
      type: 'hourly_service';
      hourlyRate: number;
      estimatedHours: number;
      timeTracking: boolean;
      billingCycle: 'weekly' | 'monthly';
    }
  | {
      type: 'addon';
      addonId: string;
      addonTitle: string;
      price: number;
      description: string;
      parentItemId: string;
    };

// File Upload Result Discriminated Union
export type FileUploadResult =
  | {
      status: 'success';
      fileId: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      uploadedAt: string;
    }
  | {
      status: 'error';
      fileName: string;
      errorCode: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'VIRUS_DETECTED';
      errorMessage: string;
      maxSize?: number;
      allowedTypes?: string[];
    }
  | {
      status: 'processing';
      fileName: string;
      uploadProgress: number;
      estimatedTimeRemaining?: number;
    };

// Search Result Discriminated Union
export type SearchResult =
  | {
      type: 'job';
      id: string;
      title: string;
      description: string;
      budget: number;
      location: string;
      employer: {
        name: string;
        avatar?: string;
        rating: number;
      };
      postedAt: string;
      relevanceScore: number;
    }
  | {
      type: 'freelancer';
      id: string;
      name: string;
      title: string;
      avatar?: string;
      skills: string[];
      hourlyRate: number;
      rating: number;
      completedJobs: number;
      responseTime: string;
      relevanceScore: number;
    }
  | {
      type: 'service_package';
      id: string;
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      images: string[];
      seller: {
        name: string;
        avatar?: string;
        rating: number;
      };
      rating: number;
      ordersInQueue: number;
      relevanceScore: number;
    };

// Message Content Discriminated Union
export type MessageContent =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'file';
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }
  | {
      type: 'image';
      imageUrl: string;
      thumbnailUrl?: string;
      alt?: string;
      width?: number;
      height?: number;
    }
  | {
      type: 'voice';
      audioUrl: string;
      duration: number;
      waveform?: number[];
    }
  | {
      type: 'location';
      latitude: number;
      longitude: number;
      address?: string;
      placeName?: string;
    }
  | {
      type: 'order_update';
      orderId: string;
      updateType: 'status_change' | 'milestone_completed' | 'payment_released';
      details: string;
    };

// Error Type Discriminated Union
export type AppError =
  | {
      type: 'validation_error';
      field: string;
      message: string;
      code: string;
    }
  | {
      type: 'authentication_error';
      message: string;
      redirectTo?: string;
    }
  | {
      type: 'authorization_error';
      resource: string;
      action: string;
      message: string;
    }
  | {
      type: 'network_error';
      statusCode?: number;
      endpoint: string;
      message: string;
      retryable: boolean;
    }
  | {
      type: 'business_logic_error';
      operation: string;
      message: string;
      data?: Record<string, unknown>;
    }
  | {
      type: 'system_error';
      message: string;
      stack?: string;
      errorId: string;
    };

// Type guards for discriminated unions
export const isSuccessResult = <T>(result: ApiResult<T>): result is Extract<ApiResult<T>, { success: true }> => 
  result.success === true;

export const isErrorResult = <T>(result: ApiResult<T>): result is Extract<ApiResult<T>, { success: false }> => 
  result.success === false;

export const isActiveUser = (state: UserAccountState): state is Extract<UserAccountState, { status: 'active' }> => 
  state.status === 'active';

export const isSuspendedUser = (state: UserAccountState): state is Extract<UserAccountState, { status: 'suspended' }> => 
  state.status === 'suspended';

export const isBannedUser = (state: UserAccountState): state is Extract<UserAccountState, { status: 'banned' }> => 
  state.status === 'banned';

export const isCreditCardPayment = (method: PaymentMethod): method is Extract<PaymentMethod, { type: 'credit_card' }> => 
  method.type === 'credit_card';

export const isBankTransferPayment = (method: PaymentMethod): method is Extract<PaymentMethod, { type: 'bank_transfer' }> => 
  method.type === 'bank_transfer';

export const isPaypalPayment = (method: PaymentMethod): method is Extract<PaymentMethod, { type: 'paypal' }> => 
  method.type === 'paypal';

export const isMessageNotification = (notification: NotificationVariant): notification is Extract<NotificationVariant, { type: 'message' }> => 
  notification.type === 'message';

export const isPaymentNotification = (notification: NotificationVariant): notification is Extract<NotificationVariant, { type: 'payment_received' | 'payment_sent' }> => 
  notification.type === 'payment_received' || notification.type === 'payment_sent';

export const isJobNotification = (notification: NotificationVariant): notification is Extract<NotificationVariant, { type: 'job_application' | 'job_accepted' }> => 
  notification.type === 'job_application' || notification.type === 'job_accepted';

export const isOpenJob = (job: JobState): job is Extract<JobState, { status: 'open' }> => 
  job.status === 'open';

export const isInProgressJob = (job: JobState): job is Extract<JobState, { status: 'in_progress' }> => 
  job.status === 'in_progress';

export const isCompletedJob = (job: JobState): job is Extract<JobState, { status: 'completed' }> => 
  job.status === 'completed';

export const isServicePackageOrder = (item: OrderItem): item is Extract<OrderItem, { type: 'service_package' }> => 
  item.type === 'service_package';

export const isCustomServiceOrder = (item: OrderItem): item is Extract<OrderItem, { type: 'custom_service' }> => 
  item.type === 'custom_service';

export const isHourlyServiceOrder = (item: OrderItem): item is Extract<OrderItem, { type: 'hourly_service' }> => 
  item.type === 'hourly_service';

export const isSuccessfulUpload = (result: FileUploadResult): result is Extract<FileUploadResult, { status: 'success' }> => 
  result.status === 'success';

export const isFailedUpload = (result: FileUploadResult): result is Extract<FileUploadResult, { status: 'error' }> => 
  result.status === 'error';

export const isProcessingUpload = (result: FileUploadResult): result is Extract<FileUploadResult, { status: 'processing' }> => 
  result.status === 'processing';

export const isJobSearchResult = (result: SearchResult): result is Extract<SearchResult, { type: 'job' }> => 
  result.type === 'job';

export const isFreelancerSearchResult = (result: SearchResult): result is Extract<SearchResult, { type: 'freelancer' }> => 
  result.type === 'freelancer';

export const isServicePackageSearchResult = (result: SearchResult): result is Extract<SearchResult, { type: 'service_package' }> => 
  result.type === 'service_package';

export const isTextMessage = (content: MessageContent): content is Extract<MessageContent, { type: 'text' }> => 
  content.type === 'text';

export const isFileMessage = (content: MessageContent): content is Extract<MessageContent, { type: 'file' }> => 
  content.type === 'file';

export const isImageMessage = (content: MessageContent): content is Extract<MessageContent, { type: 'image' }> => 
  content.type === 'image';

export const isVoiceMessage = (content: MessageContent): content is Extract<MessageContent, { type: 'voice' }> => 
  content.type === 'voice';

export const isLocationMessage = (content: MessageContent): content is Extract<MessageContent, { type: 'location' }> => 
  content.type === 'location';

export const isValidationError = (error: AppError): error is Extract<AppError, { type: 'validation_error' }> => 
  error.type === 'validation_error';

export const isAuthenticationError = (error: AppError): error is Extract<AppError, { type: 'authentication_error' }> => 
  error.type === 'authentication_error';

export const isAuthorizationError = (error: AppError): error is Extract<AppError, { type: 'authorization_error' }> => 
  error.type === 'authorization_error';

export const isNetworkError = (error: AppError): error is Extract<AppError, { type: 'network_error' }> => 
  error.type === 'network_error';

export const isBusinessLogicError = (error: AppError): error is Extract<AppError, { type: 'business_logic_error' }> => 
  error.type === 'business_logic_error';

export const isSystemError = (error: AppError): error is Extract<AppError, { type: 'system_error' }> => 
  error.type === 'system_error';