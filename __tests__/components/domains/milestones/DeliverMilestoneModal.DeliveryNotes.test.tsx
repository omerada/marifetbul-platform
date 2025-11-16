/**
 * ================================================
 * DELIVER MILESTONE - DELIVERY NOTES VALIDATION TESTS
 * ================================================
 * Sprint Day 2 - Story 2.3: Delivery notes validation (1 SP)
 *
 * Test Coverage:
 * - Required field validation
 * - Minimum length validation
 * - Maximum length validation
 * - XSS protection
 * - HTML sanitization
 * - Empty/whitespace validation
 * - Character count display
 * - Real-time validation feedback
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeliverMilestoneModal } from '@/components/domains/milestones/DeliverMilestoneModal';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/hooks/business/useMilestones');

// ============================================================================
// TEST DATA
// ============================================================================

const mockMilestone: OrderMilestone = {
  id: 'milestone-1',
  orderId: 'order-1',
  sequence: 1,
  title: 'Design Phase',
  description: 'Complete UI/UX design',
  amount: 500,
  status: 'IN_PROGRESS',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2024-02-01T00:00:00Z',
};

// ============================================================================
// TEST SUITE: DELIVERY NOTES VALIDATION
// ============================================================================

describe('DeliverMilestoneModal - Delivery Notes Validation', () => {
  const mockDeliverMilestone = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    (useMilestoneActions as jest.Mock).mockReturnValue({
      deliverMilestone: mockDeliverMilestone,
      isDelivering: false,
    });

    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. REQUIRED FIELD VALIDATION
  // ==========================================================================

  describe('Required Field Validation', () => {
    test('shows delivery notes textarea', () => {
      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      expect(textarea).toBeDefined();
    });

    test('shows error when submitting without delivery notes', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/teslim notu gerekli|delivery notes.*required/i)
        ).toBeDefined();
      });

      expect(mockDeliverMilestone).not.toHaveBeenCalled();
    });

    test('allows submission with valid delivery notes', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(
        textarea,
        'Tüm tasarım dosyaları tamamlandı ve yüklendi.'
      );

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: 'Tüm tasarım dosyaları tamamlandı ve yüklendi.',
          })
        );
      });
    });
  });

  // ==========================================================================
  // 2. MINIMUM LENGTH VALIDATION
  // ==========================================================================

  describe('Minimum Length Validation', () => {
    test('shows error for notes shorter than minimum length', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, 'OK'); // Too short

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/en az.*karakter|minimum.*characters/i)
        ).toBeDefined();
      });

      expect(mockDeliverMilestone).not.toHaveBeenCalled();
    });

    test('accepts notes meeting minimum length requirement', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, 'Tasarım dosyaları hazır.'); // Meets minimum (20+ chars)

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // 3. MAXIMUM LENGTH VALIDATION
  // ==========================================================================

  describe('Maximum Length Validation', () => {
    test('shows error for notes exceeding maximum length', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const longText = 'A'.repeat(2001); // Exceeds 2000 char limit
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, longText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/en fazla.*karakter|maximum.*characters|2000/i)
        ).toBeDefined();
      });

      expect(mockDeliverMilestone).not.toHaveBeenCalled();
    });

    test('accepts notes at maximum length boundary', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const maxText = 'A'.repeat(2000); // Exactly at limit
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, maxText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // 4. EMPTY/WHITESPACE VALIDATION
  // ==========================================================================

  describe('Empty/Whitespace Validation', () => {
    test('rejects notes with only whitespace', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, '     \n\n   \t  '); // Only whitespace

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/teslim notu gerekli|delivery notes.*required/i)
        ).toBeDefined();
      });

      expect(mockDeliverMilestone).not.toHaveBeenCalled();
    });

    test('trims leading and trailing whitespace', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, '   Valid delivery note with spaces   ');

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: 'Valid delivery note with spaces',
          })
        );
      });
    });
  });

  // ==========================================================================
  // 5. XSS PROTECTION
  // ==========================================================================

  describe('XSS Protection', () => {
    test('sanitizes HTML tags from delivery notes', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(
        textarea,
        '<script>alert("XSS")</script>Delivery complete'
      );

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.not.stringContaining('<script>'),
          })
        );
      });
    });

    test('removes dangerous event handlers', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, '<img src=x onerror="alert(1)">Design ready');

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.not.stringContaining('onerror'),
          })
        );
      });
    });

    test('allows safe characters and formatting', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const safeText =
        'Milestone tamamlandı!\n- Logo tasarımı ✓\n- Banner tasarımı ✓';
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, safeText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.stringContaining('Milestone tamamlandı'),
          })
        );
      });
    });
  });

  // ==========================================================================
  // 6. CHARACTER COUNT DISPLAY
  // ==========================================================================

  describe('Character Count Display', () => {
    test('shows character count while typing', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, 'Test message');

      await waitFor(() => {
        expect(screen.getByText(/12.*\/.*2000|12.*karakter/i)).toBeDefined();
      });
    });

    test('updates character count in real-time', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });

      await user.type(textarea, 'Hello');
      expect(screen.getByText(/5.*\/.*2000/i)).toBeDefined();

      await user.type(textarea, ' World');
      expect(screen.getByText(/11.*\/.*2000/i)).toBeDefined();
    });

    test('shows warning when approaching character limit', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nearLimit = 'A'.repeat(1950); // 50 chars from limit
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, nearLimit);

      await waitFor(() => {
        expect(screen.getByText(/1950.*\/.*2000/i)).toBeDefined();
        // Should show warning color/style
        expect(screen.getByText(/1950.*\/.*2000/i)).toHaveClass(
          /warning|text-orange|text-yellow/
        );
      });
    });

    test('shows error when exceeding character limit', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const overLimit = 'A'.repeat(2050);
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, overLimit);

      await waitFor(() => {
        expect(screen.getByText(/2050.*\/.*2000/i)).toBeDefined();
        // Should show error color/style
        expect(screen.getByText(/2050.*\/.*2000/i)).toHaveClass(
          /error|text-red/
        );
      });
    });
  });

  // ==========================================================================
  // 7. REAL-TIME VALIDATION FEEDBACK
  // ==========================================================================

  describe('Real-time Validation Feedback', () => {
    test('shows validation error immediately on blur', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.click(textarea);
      await user.tab(); // Blur without typing

      await waitFor(() => {
        expect(
          screen.getByText(/teslim notu gerekli|delivery notes.*required/i)
        ).toBeDefined();
      });
    });

    test('clears validation error when valid input provided', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });

      // Trigger error
      await user.click(textarea);
      await user.tab();

      expect(
        screen.getByText(/teslim notu gerekli|delivery notes.*required/i)
      ).toBeDefined();

      // Fix error
      await user.type(textarea, 'Valid delivery notes message');

      await waitFor(() => {
        expect(
          screen.queryByText(/teslim notu gerekli|delivery notes.*required/i)
        ).toBeNull();
      });
    });

    test('disables submit button when validation fails', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /teslim et/i });

      // Initially disabled (no notes)
      expect(submitButton).toHaveAttribute('disabled');

      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, 'Valid delivery note');

      // Enabled after valid input
      await waitFor(() => {
        expect(submitButton).not.toHaveAttribute('disabled');
      });
    });
  });

  // ==========================================================================
  // 8. EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    test('handles newlines and special characters correctly', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const specialText =
        'Line 1\nLine 2\n\nLine 3 with "quotes" and \'apostrophes\'';
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, specialText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.stringContaining('Line 1'),
          })
        );
      });
    });

    test('handles emoji and unicode characters', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const emojiText = 'Tamamlandı! ✅ Harika bir çalışma oldu 🎉';
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, emojiText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.stringContaining('✅'),
          })
        );
      });
    });

    test('preserves line breaks in multiline notes', async () => {
      const user = userEvent.setup();

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const multilineText =
        'Completed items:\n1. Logo design\n2. Banner design\n3. Social media graphics';
      const textarea = screen.getByRole('textbox', {
        name: /teslim not|delivery note/i,
      });
      await user.type(textarea, multilineText);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeliverMilestone).toHaveBeenCalledWith(
          'milestone-1',
          expect.objectContaining({
            deliveryNotes: expect.stringMatching(
              /1\. Logo design.*2\. Banner design/s
            ),
          })
        );
      });
    });
  });
});
