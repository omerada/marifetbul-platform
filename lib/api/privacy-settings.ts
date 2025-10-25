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

export interface PrivacySettings {
  id: string;
  userId: string;

  // Profile Visibility
  profileVisible: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showPortfolio: boolean;
  showReviews: boolean;

  // Search & Discovery
  searchable: boolean;
  showInRecommendations: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;

  // Data Sharing
  shareAnalytics: boolean;
  shareActivity: boolean;
  allowDataCollection: boolean;

  // Communication
  allowMessagesFromAnyone: boolean;
  allowConnectionRequests: boolean;

  // Public Profile
  publicProfileEnabled: boolean;
  indexedBySearchEngines: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UpdatePrivacySettingsRequest {
  // Profile Visibility
  profileVisible?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showPortfolio?: boolean;
  showReviews?: boolean;

  // Search & Discovery
  searchable?: boolean;
  showInRecommendations?: boolean;
  showOnlineStatus?: boolean;
  showLastActive?: boolean;

  // Data Sharing
  shareAnalytics?: boolean;
  shareActivity?: boolean;
  allowDataCollection?: boolean;

  // Communication
  allowMessagesFromAnyone?: boolean;
  allowConnectionRequests?: boolean;

  // Public Profile
  publicProfileEnabled?: boolean;
  indexedBySearchEngines?: boolean;
}

/**
 * Kullanıcının gizlilik ayarlarını getirir
 * Eğer ayarlar yoksa otomatik olarak varsayılan ayarlar oluşturulur
 */
export async function fetchPrivacySettings(): Promise<PrivacySettings> {
  const response = await apiClient.get<ApiResponse<PrivacySettings>>(
    '/api/v1/settings/privacy'
  );
  return response.data;
}

/**
 * Gizlilik ayarlarını günceller (kısmi güncelleme desteklenir)
 */
export async function updatePrivacySettings(
  data: UpdatePrivacySettingsRequest
): Promise<PrivacySettings> {
  const response = await apiClient.put<ApiResponse<PrivacySettings>>(
    '/api/v1/settings/privacy',
    data
  );
  return response.data;
}

/**
 * Gizlilik ayarlarını varsayılana sıfırlar
 */
export async function resetPrivacySettings(): Promise<PrivacySettings> {
  const response = await apiClient.post<ApiResponse<PrivacySettings>>(
    '/api/v1/settings/privacy/reset',
    {}
  );
  return response.data;
}

/**
 * Gizlilik seviye presetleri
 */
export const PRIVACY_PRESETS = {
  PUBLIC: {
    name: 'Herkese Açık',
    description: 'Profiliniz ve bilgileriniz herkes tarafından görülebilir',
    settings: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showPortfolio: true,
      showReviews: true,
      searchable: true,
      showInRecommendations: true,
      showOnlineStatus: true,
      showLastActive: true,
      shareAnalytics: true,
      shareActivity: true,
      allowDataCollection: true,
      allowMessagesFromAnyone: true,
      allowConnectionRequests: true,
      publicProfileEnabled: true,
      indexedBySearchEngines: true,
    } as UpdatePrivacySettingsRequest,
  },
  BALANCED: {
    name: 'Dengeli',
    description: 'İş görünürlüğü ile gizlilik arasında denge',
    settings: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showPortfolio: true,
      showReviews: true,
      searchable: true,
      showInRecommendations: true,
      showOnlineStatus: false,
      showLastActive: false,
      shareAnalytics: true,
      shareActivity: false,
      allowDataCollection: true,
      allowMessagesFromAnyone: false,
      allowConnectionRequests: true,
      publicProfileEnabled: true,
      indexedBySearchEngines: true,
    } as UpdatePrivacySettingsRequest,
  },
  PRIVATE: {
    name: 'Gizli',
    description: 'Maksimum gizlilik, minimum görünürlük',
    settings: {
      profileVisible: false,
      showEmail: false,
      showPhone: false,
      showLocation: false,
      showPortfolio: false,
      showReviews: false,
      searchable: false,
      showInRecommendations: false,
      showOnlineStatus: false,
      showLastActive: false,
      shareAnalytics: false,
      shareActivity: false,
      allowDataCollection: false,
      allowMessagesFromAnyone: false,
      allowConnectionRequests: false,
      publicProfileEnabled: false,
      indexedBySearchEngines: false,
    } as UpdatePrivacySettingsRequest,
  },
} as const;
