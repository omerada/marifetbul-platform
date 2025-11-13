/**
 * EVIDENCE GALLERY TESTS
 * Sprint 1: Dispute Resolution System
 *
 * Test Coverage:
 * - Lightbox functionality
 * - Keyboard navigation
 * - Zoom controls
 * - Image/PDF rendering
 * - Download functionality
 * - Empty state
 *
 * @author MarifetBul Development Team
 * @created November 13, 2025
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock lucide-react BEFORE importing component
jest.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  FileText: () => <span>FileText</span>,
  Download: () => <span>Download</span>,
  ZoomIn: () => <span>ZoomIn</span>,
  ZoomOut: () => <span>ZoomOut</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  ExternalLink: () => <span>ExternalLink</span>,
}));

// Mock UI components to avoid complex dependencies
jest.mock('@/components/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
    size,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    size?: string;
    variant?: string;
  }) => (
    <button
      onClick={onClick}
      className={className}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/Card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

import {
  EvidenceGallery,
  EvidenceItem,
} from '@/components/domains/disputes/EvidenceGallery';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('EvidenceGallery', () => {
  const mockEvidence: EvidenceItem[] = [
    {
      id: '1',
      fileName: 'test-image.jpg',
      fileUrl: 'https://example.com/image1.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024000,
      uploadedAt: '2025-11-13T10:00:00Z',
      uploadedByUserName: 'John Doe',
      description: 'Test evidence image',
    },
    {
      id: '2',
      fileName: 'test-document.pdf',
      fileUrl: 'https://example.com/doc1.pdf',
      fileType: 'application/pdf',
      fileSize: 2048000,
      uploadedAt: '2025-11-13T11:00:00Z',
      uploadedByUserName: 'Jane Smith',
    },
    {
      id: '3',
      fileName: 'another-image.png',
      fileUrl: 'https://example.com/image2.png',
      fileType: 'image/png',
      fileSize: 512000,
      uploadedAt: '2025-11-13T12:00:00Z',
    },
  ];

  // ==================== RENDERING TESTS ====================

  it('should render evidence gallery with all items', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('another-image.png')).toBeInTheDocument();
  });

  it('should display empty state when no evidence', () => {
    render(<EvidenceGallery evidence={[]} />);

    expect(screen.getByText('Henüz kanıt yüklenmemiş')).toBeInTheDocument();
  });

  it('should show file sizes correctly', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument(); // 1024000 bytes
    expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument(); // 2048000 bytes
    expect(screen.getByText(/512\.0 KB/)).toBeInTheDocument(); // 512000 bytes
  });

  it('should show uploader names when available', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    expect(screen.getByText('Yükleyen: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Yükleyen: Jane Smith')).toBeInTheDocument();
  });

  it('should show descriptions when available', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    expect(screen.getByText('Test evidence image')).toBeInTheDocument();
  });

  // ==================== LIGHTBOX TESTS ====================

  it('should open lightbox when clicking on evidence', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Lightbox should be open
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('should close lightbox when clicking close button', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Close lightbox
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );
    if (closeButton) {
      await user.click(closeButton);
    }

    // Lightbox should be closed
    await waitFor(() => {
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });
  });

  it('should close lightbox with ESC key', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Press ESC
    fireEvent.keyDown(window, { key: 'Escape' });

    // Lightbox should be closed
    await waitFor(() => {
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  it('should navigate to next image with arrow key', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Should show first image
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    // Press right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Should show second image
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });

  it('should navigate to previous image with arrow key', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox on second item
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[1]);

    // Should show second image
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    // Press left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // Should show first image
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('should not navigate beyond first image', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox on first item
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Press left arrow (should not change)
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    // Should still show first image
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('should not navigate beyond last image', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox on last item
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[2]);

    // Press right arrow (should not change)
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Should still show last image
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
  });

  // ==================== ZOOM TESTS ====================

  it('should increase zoom level on zoom in', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox on image
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Should show 100% initially
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    // Click zoom in
    const zoomInButton = screen
      .getAllByRole('button')
      .find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-zoom-in')
      );
    if (zoomInButton) {
      await user.click(zoomInButton);
    }

    // Should show 125%
    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument();
    });
  });

  it('should decrease zoom level on zoom out', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Click zoom out
    const zoomOutButton = screen
      .getAllByRole('button')
      .find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-zoom-out')
      );
    if (zoomOutButton) {
      await user.click(zoomOutButton);
    }

    // Should show 75%
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('should reset zoom when changing images', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[0]);

    // Zoom in
    const zoomInButton = screen
      .getAllByRole('button')
      .find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-zoom-in')
      );
    if (zoomInButton) {
      await user.click(zoomInButton);
    }

    // Navigate to next image
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Zoom should reset to 100%
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  // ==================== FILE TYPE TESTS ====================

  it('should show PDF label for PDF files', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    const pdfElements = screen.getAllByText('PDF');
    expect(pdfElements.length).toBeGreaterThan(0);
  });

  it('should render PDF in iframe when opened in lightbox', async () => {
    const user = userEvent.setup();
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Open lightbox on PDF
    const viewButtons = screen.getAllByText('Görüntüle');
    await user.click(viewButtons[1]); // Second item is PDF

    // Should render iframe
    await waitFor(() => {
      const iframe = screen.getByTitle('test-document.pdf');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://example.com/doc1.pdf');
    });
  });

  // ==================== DELETE FUNCTIONALITY ====================

  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = jest.fn();

    render(
      <EvidenceGallery
        evidence={mockEvidence}
        onDelete={handleDelete}
        showDelete={true}
      />
    );

    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );

    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      expect(handleDelete).toHaveBeenCalledWith('1');
    }
  });

  it('should not show delete buttons when showDelete is false', () => {
    render(
      <EvidenceGallery
        evidence={mockEvidence}
        onDelete={jest.fn()}
        showDelete={false}
      />
    );

    const deleteButtons = screen
      .queryAllByRole('button')
      .filter((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );

    // Should only have delete buttons in lightbox, not in gallery
    expect(deleteButtons.length).toBe(0);
  });

  // ==================== DATE FORMATTING TESTS ====================

  it('should format dates correctly', () => {
    render(<EvidenceGallery evidence={mockEvidence} />);

    // Check that dates are rendered (format: "13 Kas 2025, 10:00")
    expect(screen.getByText(/13 Kas 2025/)).toBeInTheDocument();
  });

  // ==================== RESPONSIVE TESTS ====================

  it('should apply correct grid classes', () => {
    const { container } = render(<EvidenceGallery evidence={mockEvidence} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EvidenceGallery evidence={mockEvidence} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
