/**
 * ================================================
 * USE PROFILE HOOK UNIT TESTS
 * ================================================
 * Comprehensive tests for profile management hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Testing Coverage
 */

import { renderHook } from '@testing-library/react';
import {
  useProfile,
  useAvatarUpload,
  useProfileValidation,
} from '../useProfile';
import { Freelancer, Employer } from '@/types';

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock profile store
const mockFetchProfile = jest.fn();
const mockAutoSave = jest.fn();
const mockUploadAvatar = jest.fn();

jest.mock('@/lib/core/store/profile', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fetchProfile: mockFetchProfile,
    autoSave: mockAutoSave,
    uploadAvatar: mockUploadAvatar,
    currentProfile: null,
    isDirty: false,
    isUpdating: false,
    uploadProgress: 0,
    error: null,
  })),
}));

// Mock auth store
jest.mock('@/lib/core/store/domains/auth/authStore', () => ({
  useAuthStore: jest.fn(),
}));

import useProfileStore from '@/lib/core/store/profile';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseProfileStore = useProfileStore as unknown as jest.Mock;

describe('useProfile Hook', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockProfile: Freelancer = {
    id: 'user-123',
    userType: 'freelancer',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar: 'avatar.jpg',
    title: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'TypeScript'],
    hourlyRate: 50,
    isFreelancer: true,
    isEmployer: false,
    username: 'johndoe',
    emailVerified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: mockUser,
    });

    mockUseProfileStore.mockReturnValue({
      fetchProfile: mockFetchProfile,
      autoSave: mockAutoSave,
      uploadAvatar: mockUploadAvatar,
      currentProfile: mockProfile,
      isDirty: false,
      isUpdating: false,
      uploadProgress: 0,
      error: null,
    });
  });

  describe('Profile Fetching', () => {
    it('should fetch profile on mount if userId provided', () => {
      const userId = 'user-456';

      mockUseProfileStore.mockReturnValue({
        fetchProfile: mockFetchProfile,
        autoSave: mockAutoSave,
        currentProfile: null,
        isDirty: false,
        isUpdating: false,
      });

      renderHook(() => useProfile(userId));

      expect(mockFetchProfile).toHaveBeenCalledWith(userId);
    });

    it('should fetch current user profile if no userId provided', () => {
      mockUseProfileStore.mockReturnValue({
        fetchProfile: mockFetchProfile,
        autoSave: mockAutoSave,
        currentProfile: null,
        isDirty: false,
        isUpdating: false,
      });

      renderHook(() => useProfile());

      expect(mockFetchProfile).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not fetch if profile is already loaded', () => {
      renderHook(() => useProfile(mockUser.id));

      expect(mockFetchProfile).not.toHaveBeenCalled();
    });

    it('should detect own profile correctly', () => {
      const { result } = renderHook(() => useProfile(mockUser.id));

      expect(result.current.isOwnProfile).toBe(true);
      expect(result.current.canEdit).toBe(true);
    });

    it('should detect other user profile correctly', () => {
      const otherUserId = 'user-789';

      mockUseProfileStore.mockReturnValue({
        fetchProfile: mockFetchProfile,
        autoSave: mockAutoSave,
        currentProfile: { ...mockProfile, id: otherUserId },
        isDirty: false,
        isUpdating: false,
      });

      const { result } = renderHook(() => useProfile(otherUserId));

      expect(result.current.isOwnProfile).toBe(false);
      expect(result.current.canEdit).toBe(false);
    });
  });

  describe('Auto-save Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should trigger auto-save after 3 seconds when profile is dirty', () => {
      mockUseProfileStore.mockReturnValue({
        fetchProfile: mockFetchProfile,
        autoSave: mockAutoSave,
        currentProfile: mockProfile,
        isDirty: true,
        isUpdating: false,
      });

      renderHook(() => useProfile());

      // Fast-forward time by 3 seconds
      jest.advanceTimersByTime(3000);

      expect(mockAutoSave).toHaveBeenCalled();
    });

    it('should not auto-save if profile is not dirty', () => {
      mockUseProfileStore.mockReturnValue({
        fetchProfile: mockFetchProfile,
        autoSave: mockAutoSave,
        currentProfile: mockProfile,
        isDirty: false,
        isUpdating: false,
      });

      renderHook(() => useProfile());

      jest.advanceTimersByTime(5000);

      expect(mockAutoSave).not.toHaveBeenCalled();
    });
  });
});

describe('useAvatarUpload Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseProfileStore.mockReturnValue({
      uploadAvatar: mockUploadAvatar,
      isUpdating: false,
      uploadProgress: 0,
      error: null,
    });
  });

  it('should expose upload functionality', () => {
    const { result } = renderHook(() => useAvatarUpload());

    expect(result.current.uploadAvatar).toBe(mockUploadAvatar);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should reflect uploading state', () => {
    mockUseProfileStore.mockReturnValue({
      uploadAvatar: mockUploadAvatar,
      isUpdating: true,
      uploadProgress: 50,
      error: null,
    });

    const { result } = renderHook(() => useAvatarUpload());

    expect(result.current.isUploading).toBe(true);
    expect(result.current.uploadProgress).toBe(50);
  });

  it('should expose upload errors', () => {
    const errorMessage = 'Upload failed';

    mockUseProfileStore.mockReturnValue({
      uploadAvatar: mockUploadAvatar,
      isUpdating: false,
      uploadProgress: 0,
      error: errorMessage,
    });

    const { result } = renderHook(() => useAvatarUpload());

    expect(result.current.error).toBe(errorMessage);
  });
});

describe('useProfileValidation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Freelancer Profile Completeness', () => {
    it('should calculate completeness for complete freelancer profile', () => {
      const completeProfile: Freelancer = {
        id: 'user-123',
        userType: 'freelancer',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js'],
        hourlyRate: 50,
        isFreelancer: true,
        isEmployer: false,
        username: 'johndoe',
        emailVerified: true,
      };

      mockUseProfileStore.mockReturnValue({
        currentProfile: completeProfile,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.completeness).toBe(100);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.missingFields).toHaveLength(0);
    });

    it('should identify missing fields for incomplete freelancer profile', () => {
      const incompleteProfile: Partial<Freelancer> = {
        id: 'user-123',
        userType: 'freelancer',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        isFreelancer: true,
        isEmployer: false,
      };

      mockUseProfileStore.mockReturnValue({
        currentProfile: incompleteProfile,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.completeness).toBeLessThan(90);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.missingFields).toContain('Biyografi');
      expect(result.current.missingFields).toContain('Profil Fotoğrafı');
      expect(result.current.missingFields).toContain('Başlık/Uzmanlık');
    });
  });

  describe('Employer Profile Completeness', () => {
    it('should calculate completeness for complete employer profile', () => {
      const completeProfile: Employer = {
        id: 'user-456',
        userType: 'employer',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@company.com',
        bio: 'HR Manager',
        avatar: 'avatar.jpg',
        companyName: 'Tech Corp',
        industry: 'Technology',
        isFreelancer: false,
        isEmployer: true,
        username: 'janesmith',
        emailVerified: true,
      };

      mockUseProfileStore.mockReturnValue({
        currentProfile: completeProfile,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.completeness).toBe(100);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.missingFields).toHaveLength(0);
    });

    it('should identify missing fields for incomplete employer profile', () => {
      const incompleteProfile: Partial<Employer> = {
        id: 'user-456',
        userType: 'employer',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@company.com',
        isFreelancer: false,
        isEmployer: true,
      };

      mockUseProfileStore.mockReturnValue({
        currentProfile: incompleteProfile,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.completeness).toBeLessThan(90);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.missingFields).toContain('Biyografi');
      expect(result.current.missingFields).toContain('Şirket Adı');
      expect(result.current.missingFields).toContain('Sektör');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null profile gracefully', () => {
      mockUseProfileStore.mockReturnValue({
        currentProfile: null,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.completeness).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.missingFields).toHaveLength(0);
    });

    it('should handle profile with empty skills array', () => {
      const profileWithEmptySkills: Freelancer = {
        id: 'user-123',
        userType: 'freelancer',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        bio: 'Test',
        avatar: 'avatar.jpg',
        title: 'Developer',
        skills: [], // Empty skills
        hourlyRate: 50,
        isFreelancer: true,
        isEmployer: false,
        username: 'johndoe',
        emailVerified: true,
      };

      mockUseProfileStore.mockReturnValue({
        currentProfile: profileWithEmptySkills,
      });

      const { result } = renderHook(() => useProfileValidation());

      expect(result.current.missingFields).toContain('Beceriler');
    });
  });
});
