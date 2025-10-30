/**
 * Unit tests for Payment Methods API Service
 * Tests all API functions with mocked apiClient
 *
 * Sprint 21 - Frontend Testing
 * @author MarifetBul Development Team
 */

import {
  fetchPaymentMethods,
  fetchAllPaymentMethods,
  fetchPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  isCardExpired,
  getCardBrandIcon,
  getPaymentMethodTypeName,
  type PaymentMethod,
  type AddPaymentMethodRequest,
  type UpdatePaymentMethodRequest,
} from '../payment-methods';
import { apiClient } from '@/lib/infrastructure/api/client';

// Mock apiClient
jest.mock('@/lib/infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Payment Methods API Service', () => {
  // Mock data
  const mockPaymentMethod: PaymentMethod = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    type: 'CREDIT_CARD',
    lastFour: '1234',
    brand: 'VISA',
    expiryMonth: 12,
    expiryYear: 2025,
    cardHolderName: 'John Doe',
    isDefault: true,
    isVerified: true,
    nickname: 'My Business Card',
    gatewayName: 'IYZICO',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockBankAccount: PaymentMethod = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    userId: 'user-123',
    type: 'BANK_TRANSFER',
    bankName: 'Garanti BBVA',
    iban: 'TR330006100519786457841326',
    accountHolderName: 'John Doe',
    isDefault: false,
    isVerified: false,
    nickname: 'Salary Account',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== fetchPaymentMethods ====================

  describe('fetchPaymentMethods', () => {
    it('should fetch paginated payment methods successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          content: [mockPaymentMethod, mockBankAccount],
          totalElements: 2,
          totalPages: 1,
          size: 10,
          number: 0,
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPaymentMethods(0, 10);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/payment-methods?page=0&size=10'
      );
      expect(result).toEqual(mockResponse.data);
      expect(result.content).toHaveLength(2);
      expect(result.totalElements).toBe(2);
    });

    it('should use default pagination parameters', async () => {
      // Arrange
      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          number: 0,
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await fetchPaymentMethods();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/payment-methods?page=0&size=10'
      );
    });

    it('should handle API errors', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(fetchPaymentMethods()).rejects.toThrow('Network error');
    });
  });

  // ==================== fetchAllPaymentMethods ====================

  describe('fetchAllPaymentMethods', () => {
    it('should fetch all payment methods successfully', async () => {
      // Arrange
      const mockResponse = {
        data: [mockPaymentMethod, mockBankAccount],
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchAllPaymentMethods();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/payment-methods/all');
      expect(result).toEqual(mockResponse.data);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no payment methods exist', async () => {
      // Arrange
      const mockResponse = { data: [] };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchAllPaymentMethods();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ==================== fetchPaymentMethod ====================

  describe('fetchPaymentMethod', () => {
    it('should fetch single payment method by id', async () => {
      // Arrange
      const mockResponse = { data: mockPaymentMethod };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await fetchPaymentMethod(mockPaymentMethod.id);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/v1/payment-methods/${mockPaymentMethod.id}`
      );
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should handle not found error', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Payment method not found')
      );

      // Act & Assert
      await expect(fetchPaymentMethod('invalid-id')).rejects.toThrow(
        'Payment method not found'
      );
    });
  });

  // ==================== addPaymentMethod ====================

  describe('addPaymentMethod', () => {
    it('should add credit card successfully', async () => {
      // Arrange
      const request: AddPaymentMethodRequest = {
        type: 'CREDIT_CARD',
        lastFour: '5678',
        brand: 'MASTERCARD',
        expiryMonth: 6,
        expiryYear: 2026,
        cardHolderName: 'Jane Doe',
        nickname: 'Personal Card',
      };
      const mockResponse = { data: mockPaymentMethod };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await addPaymentMethod(request);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/payment-methods',
        request
      );
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should add bank account successfully', async () => {
      // Arrange
      const request: AddPaymentMethodRequest = {
        type: 'BANK_TRANSFER',
        bankName: 'Garanti BBVA',
        iban: 'TR330006100519786457841326',
        accountHolderName: 'John Doe',
      };
      const mockResponse = { data: mockBankAccount };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await addPaymentMethod(request);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/payment-methods',
        request
      );
      expect(result).toEqual(mockBankAccount);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const request: AddPaymentMethodRequest = {
        type: 'CREDIT_CARD',
        lastFour: 'invalid',
      };
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Validation error')
      );

      // Act & Assert
      await expect(addPaymentMethod(request)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  // ==================== updatePaymentMethod ====================

  describe('updatePaymentMethod', () => {
    it('should update payment method nickname', async () => {
      // Arrange
      const request: UpdatePaymentMethodRequest = {
        nickname: 'Updated Nickname',
      };
      const updatedMethod = {
        ...mockPaymentMethod,
        nickname: 'Updated Nickname',
      };
      const mockResponse = { data: updatedMethod };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await updatePaymentMethod(mockPaymentMethod.id, request);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/v1/payment-methods/${mockPaymentMethod.id}`,
        request
      );
      expect(result.nickname).toBe('Updated Nickname');
    });

    it('should handle update errors', async () => {
      // Arrange
      const request: UpdatePaymentMethodRequest = { nickname: 'Test' };
      (apiClient.put as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      // Act & Assert
      await expect(updatePaymentMethod('invalid-id', request)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  // ==================== deletePaymentMethod ====================

  describe('deletePaymentMethod', () => {
    it('should delete payment method successfully', async () => {
      // Arrange
      (apiClient.delete as jest.Mock).mockResolvedValue({ status: 204 });

      // Act
      await deletePaymentMethod(mockPaymentMethod.id);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/payment-methods/${mockPaymentMethod.id}`
      );
    });

    it('should handle delete errors', async () => {
      // Arrange
      (apiClient.delete as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      // Act & Assert
      await expect(deletePaymentMethod('invalid-id')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  // ==================== setDefaultPaymentMethod ====================

  describe('setDefaultPaymentMethod', () => {
    it('should set payment method as default', async () => {
      // Arrange
      const updatedMethod = { ...mockPaymentMethod, isDefault: true };
      const mockResponse = { data: updatedMethod };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await setDefaultPaymentMethod(mockPaymentMethod.id);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/payment-methods/${mockPaymentMethod.id}/set-default`,
        {}
      );
      expect(result.isDefault).toBe(true);
    });

    it('should handle set default errors', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Failed to set default')
      );

      // Act & Assert
      await expect(setDefaultPaymentMethod('invalid-id')).rejects.toThrow(
        'Failed to set default'
      );
    });
  });

  // ==================== UTILITY FUNCTIONS ====================

  describe('isCardExpired', () => {
    it('should return false for valid future card', () => {
      const result = isCardExpired(12, 2030);
      expect(result).toBe(false);
    });

    it('should return true for expired card (past year)', () => {
      const result = isCardExpired(12, 2020);
      expect(result).toBe(true);
    });

    it('should return true for expired card (current year, past month)', () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (currentMonth > 1) {
        const result = isCardExpired(currentMonth - 1, currentYear);
        expect(result).toBe(true);
      }
    });

    it('should return false for current month and year', () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const result = isCardExpired(currentMonth, currentYear);
      expect(result).toBe(false);
    });

    it('should return false when month or year is undefined', () => {
      expect(isCardExpired(undefined, 2025)).toBe(false);
      expect(isCardExpired(12, undefined)).toBe(false);
      expect(isCardExpired(undefined, undefined)).toBe(false);
    });
  });

  describe('getCardBrandIcon', () => {
    it('should return credit-card icon for VISA', () => {
      expect(getCardBrandIcon('VISA')).toBe('credit-card');
      expect(getCardBrandIcon('visa')).toBe('credit-card');
    });

    it('should return credit-card icon for MASTERCARD', () => {
      expect(getCardBrandIcon('MASTERCARD')).toBe('credit-card');
      expect(getCardBrandIcon('mastercard')).toBe('credit-card');
    });

    it('should return credit-card icon for AMEX', () => {
      expect(getCardBrandIcon('AMEX')).toBe('credit-card');
      expect(getCardBrandIcon('AMERICAN EXPRESS')).toBe('credit-card');
    });

    it('should return credit-card icon for unknown brand', () => {
      expect(getCardBrandIcon('UNKNOWN')).toBe('credit-card');
      expect(getCardBrandIcon(undefined)).toBe('credit-card');
    });
  });

  describe('getPaymentMethodTypeName', () => {
    it('should return Turkish name for CREDIT_CARD', () => {
      expect(getPaymentMethodTypeName('CREDIT_CARD')).toBe('Kredi Kartı');
    });

    it('should return Turkish name for DEBIT_CARD', () => {
      expect(getPaymentMethodTypeName('DEBIT_CARD')).toBe('Banka Kartı');
    });

    it('should return Turkish name for BANK_TRANSFER', () => {
      expect(getPaymentMethodTypeName('BANK_TRANSFER')).toBe('Banka Havalesi');
    });

    it('should return Turkish name for WALLET', () => {
      expect(getPaymentMethodTypeName('WALLET')).toBe('Dijital Cüzdan');
    });

    it('should return Turkish name for OTHER', () => {
      expect(getPaymentMethodTypeName('OTHER')).toBe('Diğer');
    });

    it('should return original type for unknown type', () => {
      expect(getPaymentMethodTypeName('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
    });
  });
});
