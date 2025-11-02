/**
 * ================================================
 * MODERATION QUEUE - UNIT TESTS
 * ================================================
 * Test suite for ModerationQueue component
 *
 * Sprint 3: Test Coverage Enhancement
 * Test Coverage: Filtering, item selection, bulk actions,
 *               item approval/rejection, loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3: Enhanced Test Coverage
 * @since 2025-01-20
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModerationQueue } from '@/components/domains/moderator/ModerationQueue';
import type { PendingItem } from '@/types/business/moderation';

// Mock data
const mockPendingItems: PendingItem[] = [
  {
    id: 'item-1',
    type: 'COMMENT',
    content: 'This is a test comment that needs moderation',
    authorId: 'user-1',
    authorName: 'John Doe',
    createdAt: new Date('2025-01-20T10:00:00Z'),
    priority: 'HIGH',
    reportCount: 3,
  },
  {
    id: 'item-2',
    type: 'REVIEW',
    content: 'Great service, highly recommended!',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    createdAt: new Date('2025-01-20T11:00:00Z'),
    priority: 'LOW',
    reportCount: 0,
    rating: 5,
  },
  {
    id: 'item-3',
    type: 'REPORT',
    content: 'User is spamming the forum',
    authorId: 'user-3',
    authorName: 'Alice Johnson',
    createdAt: new Date('2025-01-20T12:00:00Z'),
    priority: 'MEDIUM',
    reportCount: 1,
  },
];

describe('ModerationQueue', () => {
  const mockHandlers = {
    onItemSelect: jest.fn(),
    onSelectAll: jest.fn(),
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onBulkAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================================
  // RENDERING TESTS
  // ================================================

  describe('Rendering', () => {
    it('should render pending items list', () => {
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
      expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<ModerationQueue items={[]} isLoading {...mockHandlers} />);
      expect(screen.getByText(/yükleniyor/i)).toBeInTheDocument();
    });

    it('should show empty state when no items', () => {
      render(<ModerationQueue items={[]} {...mockHandlers} />);
      expect(screen.getByText(/bekleyen öğe yok/i)).toBeInTheDocument();
    });

    it('should display item type badges', () => {
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      expect(screen.getByText('Yorum')).toBeInTheDocument();
      expect(screen.getByText('Değerlendirme')).toBeInTheDocument();
      expect(screen.getByText('Şikayet')).toBeInTheDocument();
    });

    it('should display priority badges', () => {
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      expect(screen.getByText('Yüksek')).toBeInTheDocument();
      expect(screen.getByText('Orta')).toBeInTheDocument();
      expect(screen.getByText('Düşük')).toBeInTheDocument();
    });
  });

  // ================================================
  // FILTERING TESTS
  // ================================================

  describe('Filtering', () => {
    it('should filter items by search query', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const searchInput = screen.getByPlaceholderText(/ara/i);
      await user.type(searchInput, 'spam');

      await waitFor(() => {
        expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
        expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();
      });
    });

    it('should filter items by type', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const typeSelect = screen.getByRole('combobox', { name: /tür/i });
      await user.click(typeSelect);
      await user.click(screen.getByText('Yorum'));

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();
      });
    });

    it('should filter items by priority', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const prioritySelect = screen.getByRole('combobox', { name: /öncelik/i });
      await user.click(prioritySelect);
      await user.click(screen.getByText('Yüksek'));

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/alice johnson/i)).not.toBeInTheDocument();
      });
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      // Search for "comment"
      const searchInput = screen.getByPlaceholderText(/ara/i);
      await user.type(searchInput, 'comment');

      // Filter by HIGH priority
      const prioritySelect = screen.getByRole('combobox', { name: /öncelik/i });
      await user.click(prioritySelect);
      await user.click(screen.getByText('Yüksek'));

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/alice johnson/i)).not.toBeInTheDocument();
      });
    });
  });

  // ================================================
  // ITEM SELECTION TESTS
  // ================================================

  describe('Item Selection', () => {
    it('should select individual item', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First item checkbox (skip select all)

      expect(mockHandlers.onItemSelect).toHaveBeenCalledWith('item-1');
    });

    it('should select all items', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /tümünü seç/i,
      });
      await user.click(selectAllCheckbox);

      expect(mockHandlers.onSelectAll).toHaveBeenCalled();
    });

    it('should display selected items count', () => {
      render(
        <ModerationQueue
          items={mockPendingItems}
          selectedItems={['item-1', 'item-2']}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/2.*seçili/i)).toBeInTheDocument();
    });
  });

  // ================================================
  // BULK ACTIONS TESTS
  // ================================================

  describe('Bulk Actions', () => {
    it('should approve multiple selected items', async () => {
      const user = userEvent.setup();
      mockHandlers.onBulkAction.mockResolvedValue(undefined);

      render(
        <ModerationQueue
          items={mockPendingItems}
          selectedItems={['item-1', 'item-2']}
          {...mockHandlers}
        />
      );

      const approveButton = screen.getByRole('button', {
        name: /toplu onayla/i,
      });
      await user.click(approveButton);

      await waitFor(() => {
        expect(mockHandlers.onBulkAction).toHaveBeenCalledWith('approve', [
          'item-1',
          'item-2',
        ]);
      });
    });

    it('should reject multiple selected items', async () => {
      const user = userEvent.setup();
      mockHandlers.onBulkAction.mockResolvedValue(undefined);

      render(
        <ModerationQueue
          items={mockPendingItems}
          selectedItems={['item-1', 'item-3']}
          {...mockHandlers}
        />
      );

      const rejectButton = screen.getByRole('button', {
        name: /toplu reddet/i,
      });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(mockHandlers.onBulkAction).toHaveBeenCalledWith('reject', [
          'item-1',
          'item-3',
        ]);
      });
    });

    it('should mark multiple items as spam', async () => {
      const user = userEvent.setup();
      mockHandlers.onBulkAction.mockResolvedValue(undefined);

      render(
        <ModerationQueue
          items={mockPendingItems}
          selectedItems={['item-2', 'item-3']}
          {...mockHandlers}
        />
      );

      const spamButton = screen.getByRole('button', {
        name: /spam olarak işaretle/i,
      });
      await user.click(spamButton);

      await waitFor(() => {
        expect(mockHandlers.onBulkAction).toHaveBeenCalledWith('spam', [
          'item-2',
          'item-3',
        ]);
      });
    });

    it('should disable bulk actions when no items selected', () => {
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const approveButton = screen.getByRole('button', {
        name: /toplu onayla/i,
      });
      const rejectButton = screen.getByRole('button', {
        name: /toplu reddet/i,
      });

      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });

  // ================================================
  // INDIVIDUAL ACTIONS TESTS
  // ================================================

  describe('Individual Actions', () => {
    it('should approve single item', async () => {
      const user = userEvent.setup();
      mockHandlers.onApprove.mockResolvedValue(undefined);

      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const approveButtons = screen.getAllByRole('button', { name: /onayla/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(mockHandlers.onApprove).toHaveBeenCalledWith('item-1');
      });
    });

    it('should reject single item', async () => {
      const user = userEvent.setup();
      mockHandlers.onReject.mockResolvedValue(undefined);

      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const rejectButtons = screen.getAllByRole('button', { name: /reddet/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(mockHandlers.onReject).toHaveBeenCalledWith('item-1');
      });
    });

    it('should show loading state for individual action', async () => {
      const user = userEvent.setup();
      mockHandlers.onApprove.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const approveButtons = screen.getAllByRole('button', { name: /onayla/i });
      await user.click(approveButtons[0]);

      // Button should show loading state
      expect(approveButtons[0]).toBeDisabled();
    });
  });

  // ================================================
  // SORTING TESTS
  // ================================================

  describe('Sorting', () => {
    it('should sort by priority (high to low)', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const sortSelect = screen.getByRole('combobox', { name: /sırala/i });
      await user.click(sortSelect);
      await user.click(screen.getByText('Öncelik'));

      // First item should be HIGH priority (John Doe)
      const items = screen.getAllByRole('article');
      expect(items[0]).toHaveTextContent('John Doe');
    });

    it('should sort by date (newest first)', async () => {
      const user = userEvent.setup();
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const sortSelect = screen.getByRole('combobox', { name: /sırala/i });
      await user.click(sortSelect);
      await user.click(screen.getByText('Tarih'));

      // First item should be newest (Alice Johnson)
      const items = screen.getAllByRole('article');
      expect(items[0]).toHaveTextContent('Alice Johnson');
    });
  });

  // ================================================
  // TIME DISPLAY TESTS
  // ================================================

  describe('Time Display', () => {
    it('should display relative time for items', () => {
      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      // Should show relative time like "2 hours ago"
      expect(screen.getAllByText(/ago|önce/i).length).toBeGreaterThan(0);
    });
  });

  // ================================================
  // ERROR HANDLING TESTS
  // ================================================

  describe('Error Handling', () => {
    it('should handle approval failure gracefully', async () => {
      const user = userEvent.setup();
      mockHandlers.onApprove.mockRejectedValue(new Error('Approval failed'));

      render(<ModerationQueue items={mockPendingItems} {...mockHandlers} />);

      const approveButtons = screen.getAllByRole('button', { name: /onayla/i });
      await user.click(approveButtons[0]);

      // Should not crash the component
      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      });
    });

    it('should handle bulk action failure gracefully', async () => {
      const user = userEvent.setup();
      mockHandlers.onBulkAction.mockRejectedValue(
        new Error('Bulk action failed')
      );

      render(
        <ModerationQueue
          items={mockPendingItems}
          selectedItems={['item-1']}
          {...mockHandlers}
        />
      );

      const approveButton = screen.getByRole('button', {
        name: /toplu onayla/i,
      });
      await user.click(approveButton);

      // Should not crash the component
      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      });
    });
  });
});
