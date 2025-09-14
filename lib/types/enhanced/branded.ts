/**
 * Branded Types
 * Provides type-safe identifiers and values with compile-time guarantees
 */

// Brand utility type
export type Brand<K, T> = K & { __brand: T };

// ID Branded Types
export type UserId = Brand<string, 'UserId'>;
export type JobId = Brand<string, 'JobId'>;
export type PackageId = Brand<string, 'PackageId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type NotificationId = Brand<string, 'NotificationId'>;
export type TicketId = Brand<string, 'TicketId'>;
export type ReviewId = Brand<string, 'ReviewId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type SkillId = Brand<string, 'SkillId'>;

// Email and URL types
export type Email = Brand<string, 'Email'>;
export type Url = Brand<string, 'Url'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

// Monetary values
export type Price = Brand<number, 'Price'>;
export type Amount = Brand<number, 'Amount'>;
export type Fee = Brand<number, 'Fee'>;

// Date and time types
export type Timestamp = Brand<string, 'Timestamp'>;
export type DateString = Brand<string, 'DateString'>;

// Hash and token types
export type Token = Brand<string, 'Token'>;
export type Hash = Brand<string, 'Hash'>;
export type ApiKey = Brand<string, 'ApiKey'>;

// Geographic types
export type Latitude = Brand<number, 'Latitude'>;
export type Longitude = Brand<number, 'Longitude'>;
export type PostalCode = Brand<string, 'PostalCode'>;

// File and attachment types
export type FileUrl = Brand<string, 'FileUrl'>;
export type FileName = Brand<string, 'FileName'>;
export type MimeType = Brand<string, 'MimeType'>;
export type FileSize = Brand<number, 'FileSize'>;

// Rating and score types
export type Rating = Brand<number, 'Rating'>;
export type Score = Brand<number, 'Score'>;
export type Percentage = Brand<number, 'Percentage'>;

// Helper functions for creating branded types
export const createUserId = (id: string): UserId => id as UserId;
export const createJobId = (id: string): JobId => id as JobId;
export const createPackageId = (id: string): PackageId => id as PackageId;
export const createOrderId = (id: string): OrderId => id as OrderId;
export const createPaymentId = (id: string): PaymentId => id as PaymentId;
export const createConversationId = (id: string): ConversationId => id as ConversationId;
export const createMessageId = (id: string): MessageId => id as MessageId;
export const createNotificationId = (id: string): NotificationId => id as NotificationId;
export const createTicketId = (id: string): TicketId => id as TicketId;
export const createReviewId = (id: string): ReviewId => id as ReviewId;
export const createCategoryId = (id: string): CategoryId => id as CategoryId;
export const createSkillId = (id: string): SkillId => id as SkillId;

export const createEmail = (email: string): Email => {
  if (!isValidEmail(email)) {
    throw new Error(`Invalid email: ${email}`);
  }
  return email as Email;
};

export const createUrl = (url: string): Url => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }
  return url as Url;
};

export const createPhoneNumber = (phone: string): PhoneNumber => {
  if (!isValidPhoneNumber(phone)) {
    throw new Error(`Invalid phone number: ${phone}`);
  }
  return phone as PhoneNumber;
};

export const createPrice = (value: number): Price => {
  if (value < 0) {
    throw new Error(`Price cannot be negative: ${value}`);
  }
  return value as Price;
};

export const createAmount = (value: number): Amount => {
  if (value < 0) {
    throw new Error(`Amount cannot be negative: ${value}`);
  }
  return value as Amount;
};

export const createFee = (value: number): Fee => {
  if (value < 0) {
    throw new Error(`Fee cannot be negative: ${value}`);
  }
  return value as Fee;
};

export const createTimestamp = (date: Date | string): Timestamp => {
  const timestamp = typeof date === 'string' ? date : date.toISOString();
  return timestamp as Timestamp;
};

export const createDateString = (date: Date | string): DateString => {
  const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return dateString as DateString;
};

export const createToken = (token: string): Token => token as Token;
export const createHash = (hash: string): Hash => hash as Hash;
export const createApiKey = (key: string): ApiKey => key as ApiKey;

export const createLatitude = (lat: number): Latitude => {
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }
  return lat as Latitude;
};

export const createLongitude = (lng: number): Longitude => {
  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}`);
  }
  return lng as Longitude;
};

export const createPostalCode = (code: string): PostalCode => code as PostalCode;

export const createFileUrl = (url: string): FileUrl => {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid file URL: ${url}`);
  }
  return url as FileUrl;
};

export const createFileName = (name: string): FileName => {
  if (!name.trim()) {
    throw new Error('File name cannot be empty');
  }
  return name as FileName;
};

export const createMimeType = (type: string): MimeType => {
  if (!isValidMimeType(type)) {
    throw new Error(`Invalid MIME type: ${type}`);
  }
  return type as MimeType;
};

export const createFileSize = (size: number): FileSize => {
  if (size < 0) {
    throw new Error(`File size cannot be negative: ${size}`);
  }
  return size as FileSize;
};

export const createRating = (rating: number): Rating => {
  if (rating < 0 || rating > 5) {
    throw new Error(`Rating must be between 0 and 5: ${rating}`);
  }
  return rating as Rating;
};

export const createScore = (score: number): Score => {
  if (score < 0) {
    throw new Error(`Score cannot be negative: ${score}`);
  }
  return score as Score;
};

export const createPercentage = (percentage: number): Percentage => {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Percentage must be between 0 and 100: ${percentage}`);
  }
  return percentage as Percentage;
};

// Validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation (can be enhanced)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function isValidMimeType(type: string): boolean {
  const mimeTypeRegex = /^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/;
  return mimeTypeRegex.test(type);
}

// Type guards for branded types
export const isUserId = (value: unknown): value is UserId => 
  typeof value === 'string' && value.length > 0;

export const isJobId = (value: unknown): value is JobId => 
  typeof value === 'string' && value.length > 0;

export const isPackageId = (value: unknown): value is PackageId => 
  typeof value === 'string' && value.length > 0;

export const isOrderId = (value: unknown): value is OrderId => 
  typeof value === 'string' && value.length > 0;

export const isPaymentId = (value: unknown): value is PaymentId => 
  typeof value === 'string' && value.length > 0;

export const isConversationId = (value: unknown): value is ConversationId => 
  typeof value === 'string' && value.length > 0;

export const isMessageId = (value: unknown): value is MessageId => 
  typeof value === 'string' && value.length > 0;

export const isNotificationId = (value: unknown): value is NotificationId => 
  typeof value === 'string' && value.length > 0;

export const isEmail = (value: unknown): value is Email => 
  typeof value === 'string' && isValidEmail(value);

export const isUrl = (value: unknown): value is Url => 
  typeof value === 'string' && isValidUrl(value);

export const isPhoneNumber = (value: unknown): value is PhoneNumber => 
  typeof value === 'string' && isValidPhoneNumber(value);

export const isPrice = (value: unknown): value is Price => 
  typeof value === 'number' && value >= 0;

export const isAmount = (value: unknown): value is Amount => 
  typeof value === 'number' && value >= 0;

export const isFee = (value: unknown): value is Fee => 
  typeof value === 'number' && value >= 0;

export const isRating = (value: unknown): value is Rating => 
  typeof value === 'number' && value >= 0 && value <= 5;

export const isScore = (value: unknown): value is Score => 
  typeof value === 'number' && value >= 0;

export const isPercentage = (value: unknown): value is Percentage => 
  typeof value === 'number' && value >= 0 && value <= 100;

// Unwrap branded types back to primitives
export const unwrapUserId = (id: UserId): string => id as string;
export const unwrapJobId = (id: JobId): string => id as string;
export const unwrapPackageId = (id: PackageId): string => id as string;
export const unwrapOrderId = (id: OrderId): string => id as string;
export const unwrapPaymentId = (id: PaymentId): string => id as string;
export const unwrapConversationId = (id: ConversationId): string => id as string;
export const unwrapMessageId = (id: MessageId): string => id as string;
export const unwrapNotificationId = (id: NotificationId): string => id as string;
export const unwrapEmail = (email: Email): string => email as string;
export const unwrapUrl = (url: Url): string => url as string;
export const unwrapPhoneNumber = (phone: PhoneNumber): string => phone as string;
export const unwrapPrice = (price: Price): number => price as number;
export const unwrapAmount = (amount: Amount): number => amount as number;
export const unwrapFee = (fee: Fee): number => fee as number;
export const unwrapRating = (rating: Rating): number => rating as number;
export const unwrapScore = (score: Score): number => score as number;
export const unwrapPercentage = (percentage: Percentage): number => percentage as number;
