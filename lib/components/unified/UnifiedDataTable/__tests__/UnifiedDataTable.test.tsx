/**
 * ================================================
 * UNIFIED DATA TABLE - UNIT TESTS
 * ================================================
 * Sprint 2 - Story 1.1: Core Component Tests
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

import { describe, it, expect, vi } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedDataTable } from '../UnifiedDataTable';
import type { Column } from '../types';

// ============================================================================
// TEST DATA
// ============================================================================

interface TestUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}

const mockUsers: TestUser[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    balance: 1500.5,
    status: 'ACTIVE',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    balance: 2750.0,
    status: 'ACTIVE',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '3',
    name: 'Ayşe Kaya',
    email: 'ayse@example.com',
    balance: 500.25,
    status: 'INACTIVE',
    createdAt: new Date('2025-02-01'),
  },
];

const testColumns: Column<TestUser>[] = [
  {
    id: 'name',
    header: 'İsim',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: 'E-posta',
    accessor: 'email',
  },
  {
    id: 'balance',
    header: 'Bakiye',
    accessor: 'balance',
    formatter: 'currency',
    align: 'right',
  },
  {
    id: 'status',
    header: 'Durum',
    accessor: 'status',
  },
];

// ============================================================================
// TESTS
// ============================================================================

describe('UnifiedDataTable', () => {
  describe('Basic Rendering', () => {
    it('should render table with data', () => {
      render(
        <UnifiedDataTable<TestUser> data={mockUsers} columns={testColumns} />
      );

      // Check headers
      expect(screen.getByText('İsim')).toBeInTheDocument();
      expect(screen.getByText('E-posta')).toBeInTheDocument();
      expect(screen.getByText('Bakiye')).toBeInTheDocument();

      // Check data
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('ahmet@example.com')).toBeInTheDocument();
    });

    it('should show loading skeleton when isLoading is true', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={[]}
          columns={testColumns}
          isLoading={true}
        />
      );

      // TableSkeleton should be rendered
      // (exact assertion depends on TableSkeleton implementation)
      expect(screen.queryByText('İsim')).not.toBeInTheDocument();
    });

    it('should show empty state when data is empty', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={[]}
          columns={testColumns}
          emptyMessage="Kullanıcı bulunamadı"
        />
      );

      expect(screen.getByText('Kullanıcı bulunamadı')).toBeInTheDocument();
    });

    it('should show error state when error is provided', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={[]}
          columns={testColumns}
          error="Bir hata oluştu"
        />
      );

      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    });
  });

  describe('Formatters', () => {
    it('should format currency correctly', () => {
      render(
        <UnifiedDataTable<TestUser> data={mockUsers} columns={testColumns} />
      );

      // Check if currency is formatted (Turkish locale)
      expect(screen.getByText(/₺1\.500,50/)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should render checkboxes when selection is enabled', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={mockUsers}
          columns={testColumns}
          selection={{
            enabled: true,
            rowIdAccessor: 'id',
          }}
        />
      );

      // Should have checkboxes (header + 3 rows)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);
    });

    it('should call onSelectionChange when row is selected', () => {
      const onSelectionChange = vi.fn();

      render(
        <UnifiedDataTable<TestUser>
          data={mockUsers}
          columns={testColumns}
          selection={{
            enabled: true,
            rowIdAccessor: 'id',
            onSelectionChange,
          }}
        />
      );

      // Click first data row checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes[1].click();

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when enabled', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={mockUsers}
          columns={testColumns}
          pagination={{
            enabled: true,
            pageSize: 2,
          }}
        />
      );

      expect(screen.getByText('Önceki')).toBeInTheDocument();
      expect(screen.getByText('Sonraki')).toBeInTheDocument();
    });

    it('should paginate data correctly', () => {
      render(
        <UnifiedDataTable<TestUser>
          data={mockUsers}
          columns={testColumns}
          pagination={{
            enabled: true,
            pageSize: 2,
          }}
        />
      );

      // Should only show first 2 users
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
      expect(screen.queryByText('Ayşe Kaya')).not.toBeInTheDocument();
    });
  });

  describe('Custom Render', () => {
    it('should use custom render function when provided', () => {
      const columnsWithCustomRender: Column<TestUser>[] = [
        {
          id: 'status',
          header: 'Durum',
          render: (value) => (
            <span data-testid="custom-status">
              {value === 'ACTIVE' ? 'Aktif' : 'Pasif'}
            </span>
          ),
        },
      ];

      render(
        <UnifiedDataTable<TestUser>
          data={mockUsers}
          columns={columnsWithCustomRender}
        />
      );

      expect(screen.getAllByTestId('custom-status')).toHaveLength(3);
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });
  });
});
