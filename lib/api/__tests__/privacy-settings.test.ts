import {
  fetchPrivacySettings,
  updatePrivacySettings,
  resetPrivacySettings,
  PRIVACY_PRESETS,
  PrivacySettings,
  UpdatePrivacySettingsRequest,
} from '../privacy-settings';

// Mock API client
jest.mock('@/lib/infrastructure/api/client');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiClient } = require('@/lib/infrastructure/api/client');

describe('Privacy Settings API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    apiClient.get = jest.fn();
    apiClient.put = jest.fn();
    apiClient.post = jest.fn();
  });

  // Mock data
  const mockPrivacySettings: PrivacySettings = {
    id: 'settings-123',
    userId: 'user-123',
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
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('fetchPrivacySettings', () => {
    it('should fetch privacy settings successfully', async () => {
      // Arrange
      const mockResponse = {
        data: mockPrivacySettings,
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPrivacySettings();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/settings/privacy');
      expect(result).toEqual(mockPrivacySettings);
      expect(result.profileVisible).toBe(true);
      expect(result.showEmail).toBe(false);
    });

    it('should auto-create settings if not exists', async () => {
      // Arrange - Backend auto-creates with defaults
      const defaultSettings: PrivacySettings = {
        ...mockPrivacySettings,
        id: 'new-settings-123',
        profileVisible: true,
        searchable: true,
      };
      const mockResponse = { data: defaultSettings };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPrivacySettings();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/settings/privacy');
      expect(result.id).toBe('new-settings-123');
      expect(result.profileVisible).toBe(true);
    });

    it('should handle API errors', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch privacy settings')
      );

      // Act & Assert
      await expect(fetchPrivacySettings()).rejects.toThrow(
        'Failed to fetch privacy settings'
      );
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update privacy settings successfully', async () => {
      // Arrange
      const updateRequest: UpdatePrivacySettingsRequest = {
        profileVisible: false,
        showEmail: true,
        searchable: false,
      };
      const updatedSettings: PrivacySettings = {
        ...mockPrivacySettings,
        profileVisible: false,
        showEmail: true,
        searchable: false,
        updatedAt: '2025-01-02T00:00:00Z',
      };
      const mockResponse = { data: updatedSettings };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await updatePrivacySettings(updateRequest);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/privacy',
        updateRequest
      );
      expect(result.profileVisible).toBe(false);
      expect(result.showEmail).toBe(true);
      expect(result.searchable).toBe(false);
    });

    it('should support partial updates', async () => {
      // Arrange - Only update one field
      const updateRequest: UpdatePrivacySettingsRequest = {
        showOnlineStatus: true,
      };
      const updatedSettings: PrivacySettings = {
        ...mockPrivacySettings,
        showOnlineStatus: true,
      };
      const mockResponse = { data: updatedSettings };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await updatePrivacySettings(updateRequest);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v1/settings/privacy',
        updateRequest
      );
      expect(result.showOnlineStatus).toBe(true);
      // Other fields remain unchanged
      expect(result.profileVisible).toBe(true);
      expect(result.showEmail).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const updateRequest: UpdatePrivacySettingsRequest = {
        shareAnalytics: false,
        shareActivity: false,
        allowDataCollection: false,
      };
      const updatedSettings: PrivacySettings = {
        ...mockPrivacySettings,
        shareAnalytics: false,
        shareActivity: false,
        allowDataCollection: false,
      };
      const mockResponse = { data: updatedSettings };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await updatePrivacySettings(updateRequest);

      // Assert
      expect(result.shareAnalytics).toBe(false);
      expect(result.shareActivity).toBe(false);
      expect(result.allowDataCollection).toBe(false);
    });

    it('should handle update errors', async () => {
      // Arrange
      const updateRequest: UpdatePrivacySettingsRequest = {
        profileVisible: false,
      };
      (apiClient.put as jest.Mock).mockRejectedValue(
        new Error('Failed to update privacy settings')
      );

      // Act & Assert
      await expect(updatePrivacySettings(updateRequest)).rejects.toThrow(
        'Failed to update privacy settings'
      );
    });
  });

  describe('resetPrivacySettings', () => {
    it('should reset privacy settings to defaults', async () => {
      // Arrange
      const defaultSettings: PrivacySettings = {
        ...mockPrivacySettings,
        profileVisible: true,
        searchable: true,
        publicProfileEnabled: true,
        updatedAt: '2025-01-03T00:00:00Z',
      };
      const mockResponse = { data: defaultSettings };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await resetPrivacySettings();

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/settings/privacy/reset',
        {}
      );
      expect(result).toEqual(defaultSettings);
    });

    it('should handle reset errors', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Failed to reset privacy settings')
      );

      // Act & Assert
      await expect(resetPrivacySettings()).rejects.toThrow(
        'Failed to reset privacy settings'
      );
    });
  });

  describe('PRIVACY_PRESETS', () => {
    it('should have PUBLIC preset with correct structure', () => {
      // Assert
      expect(PRIVACY_PRESETS.PUBLIC).toBeDefined();
      expect(PRIVACY_PRESETS.PUBLIC.name).toBe('Herkese Açık');
      expect(PRIVACY_PRESETS.PUBLIC.description).toBeTruthy();
      expect(PRIVACY_PRESETS.PUBLIC.settings).toBeDefined();

      // Public preset should be most open
      const settings = PRIVACY_PRESETS.PUBLIC.settings;
      expect(settings.profileVisible).toBe(true);
      expect(settings.searchable).toBe(true);
      expect(settings.publicProfileEnabled).toBe(true);
      expect(settings.indexedBySearchEngines).toBe(true);
      expect(settings.allowMessagesFromAnyone).toBe(true);
    });

    it('should have BALANCED preset with correct structure', () => {
      // Assert
      expect(PRIVACY_PRESETS.BALANCED).toBeDefined();
      expect(PRIVACY_PRESETS.BALANCED.name).toBe('Dengeli');
      expect(PRIVACY_PRESETS.BALANCED.description).toBeTruthy();

      // Balanced preset should have moderate settings
      const settings = PRIVACY_PRESETS.BALANCED.settings;
      expect(settings.profileVisible).toBe(true);
      expect(settings.searchable).toBe(true);
      expect(settings.showOnlineStatus).toBe(false);
      expect(settings.showLastActive).toBe(false);
      expect(settings.allowMessagesFromAnyone).toBe(false);
    });

    it('should have PRIVATE preset with correct structure', () => {
      // Assert
      expect(PRIVACY_PRESETS.PRIVATE).toBeDefined();
      expect(PRIVACY_PRESETS.PRIVATE.name).toBe('Gizli');
      expect(PRIVACY_PRESETS.PRIVATE.description).toBeTruthy();

      // Private preset should be most restrictive
      const settings = PRIVACY_PRESETS.PRIVATE.settings;
      expect(settings.profileVisible).toBe(false);
      expect(settings.searchable).toBe(false);
      expect(settings.publicProfileEnabled).toBe(false);
      expect(settings.indexedBySearchEngines).toBe(false);
      expect(settings.allowMessagesFromAnyone).toBe(false);
      expect(settings.shareAnalytics).toBe(false);
      expect(settings.shareActivity).toBe(false);
      expect(settings.allowDataCollection).toBe(false);
    });

    it('should have all three presets defined', () => {
      // Assert
      expect(Object.keys(PRIVACY_PRESETS)).toEqual([
        'PUBLIC',
        'BALANCED',
        'PRIVATE',
      ]);
    });

    it('should have valid UpdatePrivacySettingsRequest structure in presets', () => {
      // Assert - Check all presets have valid settings objects
      Object.values(PRIVACY_PRESETS).forEach((preset) => {
        expect(preset.settings).toBeDefined();
        expect(typeof preset.settings.profileVisible).toBe('boolean');
        expect(typeof preset.settings.searchable).toBe('boolean');
        expect(typeof preset.settings.publicProfileEnabled).toBe('boolean');
      });
    });
  });
});
