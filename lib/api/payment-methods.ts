import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'WALLET' | 'OTHER';
  lastFour?: string;
  brand?: string; // "VISA", "MASTERCARD", "AMEX"
  expiryMonth?: number;
  expiryYear?: number;
  cardHolderName?: string;
  bankName?: string;
  iban?: string;
  accountHolderName?: string;
  isDefault: boolean;
  isVerified: boolean;
  nickname?: string;
  gatewayName?: string;
  gatewayPaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentMethodRequest {
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'WALLET' | 'OTHER';
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardHolderName?: string;
  bankName?: string;
  iban?: string;
  accountHolderName?: string;
  nickname?: string;
  gatewayName?: string;
  gatewayPaymentMethodId?: string;
}

export interface UpdatePaymentMethodRequest {
  nickname?: string;
}

export interface PaymentMethodsResponse {
  content: PaymentMethod[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Kullanıcının ödeme yöntemlerini getirir (sayfalı)
 */
export async function fetchPaymentMethods(
  page = 0,
  size = 10
): Promise<PaymentMethodsResponse> {
  const response = await apiClient.get<ApiResponse<PaymentMethodsResponse>>(
    `/api/v1/payment-methods?page=${page}&size=${size}`
  );
  return response.data;
}

/**
 * Kullanıcının tüm ödeme yöntemlerini getirir
 */
export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
    '/api/v1/payment-methods/all'
  );
  return response.data;
}

/**
 * Belirli bir ödeme yöntemini getirir
 */
export async function fetchPaymentMethod(id: string): Promise<PaymentMethod> {
  const response = await apiClient.get<ApiResponse<PaymentMethod>>(
    `/api/v1/payment-methods/${id}`
  );
  return response.data;
}

/**
 * Yeni ödeme yöntemi ekler
 */
export async function addPaymentMethod(
  data: AddPaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.post<ApiResponse<PaymentMethod>>(
    '/api/v1/payment-methods',
    data
  );
  return response.data;
}

/**
 * Ödeme yöntemini günceller (sadece nickname)
 */
export async function updatePaymentMethod(
  id: string,
  data: UpdatePaymentMethodRequest
): Promise<PaymentMethod> {
  const response = await apiClient.put<ApiResponse<PaymentMethod>>(
    `/api/v1/payment-methods/${id}`,
    data
  );
  return response.data;
}

/**
 * Ödeme yöntemini siler
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/payment-methods/${id}`);
}

/**
 * Ödeme yöntemini varsayılan olarak ayarlar
 */
export async function setDefaultPaymentMethod(
  id: string
): Promise<PaymentMethod> {
  const response = await apiClient.post<ApiResponse<PaymentMethod>>(
    `/api/v1/payment-methods/${id}/set-default`,
    {}
  );
  return response.data;
}

/**
 * Kartın süresinin dolup dolmadığını kontrol eder
 */
export function isCardExpired(
  expiryMonth?: number,
  expiryYear?: number
): boolean {
  if (!expiryMonth || !expiryYear) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    expiryYear < currentYear ||
    (expiryYear === currentYear && expiryMonth < currentMonth)
  );
}

/**
 * Kart markası için ikon adı döndürür
 */
export function getCardBrandIcon(brand?: string): string {
  switch (brand?.toUpperCase()) {
    case 'VISA':
      return 'credit-card'; // lucide-react icon
    case 'MASTERCARD':
      return 'credit-card';
    case 'AMEX':
    case 'AMERICAN EXPRESS':
      return 'credit-card';
    default:
      return 'credit-card';
  }
}

/**
 * Ödeme yöntemi tipi için görünen ad döndürür
 */
export function getPaymentMethodTypeName(type: string): string {
  switch (type) {
    case 'CREDIT_CARD':
      return 'Kredi Kartı';
    case 'DEBIT_CARD':
      return 'Banka Kartı';
    case 'BANK_TRANSFER':
      return 'Banka Havalesi';
    case 'WALLET':
      return 'Dijital Cüzdan';
    case 'OTHER':
      return 'Diğer';
    default:
      return type;
  }
}
