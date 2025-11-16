/**
 * ================================================
 * DELIVER MILESTONE MODAL - FILE UPLOAD TESTS
 * ================================================
 * Sprint Day 2 - Story 2.2: File upload in deliver modal (1 SP)
 *
 * Test Coverage:
 * - File selection and upload
 * - Progress bar display
 * - Multiple file handling
 * - File type validation
 * - File size validation
 * - Upload cancellation
 * - Error handling
 * - Cloudinary integration
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { DeliverMilestoneModal } from '@/components/domains/milestones/DeliverMilestoneModal';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { fileUploadService } from '@/lib/services/file-upload.service';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/hooks/business/useMilestones');
jest.mock('@/lib/services/file-upload.service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

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

const createMockFile = (name: string, size: number, type: string): File => {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
};

// ============================================================================
// TEST SUITE: FILE UPLOAD IN DELIVER MODAL
// ============================================================================

describe('DeliverMilestoneModal - File Upload', () => {
  const mockDeliverMilestone = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockUploadFile = jest.fn();
  const mockUploadMultipleFiles = jest.fn();

  beforeEach(() => {
    (useMilestoneActions as jest.Mock).mockReturnValue({
      deliverMilestone: mockDeliverMilestone,
      isDelivering: false,
    });

    (fileUploadService.uploadFile as jest.Mock) = mockUploadFile;
    (fileUploadService.uploadMultipleFiles as jest.Mock) =
      mockUploadMultipleFiles;

    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. FILE SELECTION
  // ==========================================================================

  describe('File Selection', () => {
    test('shows file input field', () => {
      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const fileInput = screen.getByLabelText(/dosya ekle|upload/i);
      expect(fileInput).toBeDefined();
    });

    test('accepts single file selection', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile('design.pdf', 1024 * 1024, 'application/pdf');
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files?.[0]).toBe(file);
    });

    test('accepts multiple file selection', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const files = [
        createMockFile('design1.pdf', 1024 * 1024, 'application/pdf'),
        createMockFile('design2.png', 2048 * 1024, 'image/png'),
        createMockFile('design3.jpg', 1536 * 1024, 'image/jpeg'),
      ];

      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, files);

      expect(fileInput.files).toHaveLength(3);
    });

    test('displays selected file names', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'final-design.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/final-design\.pdf/i)).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // 2. FILE TYPE VALIDATION
  // ==========================================================================

  describe('File Type Validation', () => {
    test('accepts allowed file types (PDF, images, documents)', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const allowedFiles = [
        createMockFile('document.pdf', 1024, 'application/pdf'),
        createMockFile('image.png', 1024, 'image/png'),
        createMockFile('photo.jpg', 1024, 'image/jpeg'),
        createMockFile('design.psd', 1024, 'image/vnd.adobe.photoshop'),
        createMockFile(
          'doc.docx',
          1024,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ),
      ];

      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      for (const file of allowedFiles) {
        await user.upload(fileInput, file);
        expect(toast.error).not.toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    test('rejects disallowed file types', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const disallowedFile = createMockFile(
        'virus.exe',
        1024,
        'application/x-msdownload'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, disallowedFile);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/dosya tipi|file type|desteklenmiyor/i)
        );
      });
    });
  });

  // ==========================================================================
  // 3. FILE SIZE VALIDATION
  // ==========================================================================

  describe('File Size Validation', () => {
    test('accepts files within size limit (< 10MB)', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const validFile = createMockFile(
        'small.pdf',
        5 * 1024 * 1024,
        'application/pdf'
      ); // 5MB
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, validFile);

      expect(toast.error).not.toHaveBeenCalled();
    });

    test('rejects files exceeding size limit (> 10MB)', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const largeFile = createMockFile(
        'huge.pdf',
        15 * 1024 * 1024,
        'application/pdf'
      ); // 15MB
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/boyut|size|10.*mb/i)
        );
      });
    });

    test('displays file size for selected files', async () => {
      const user = userEvent.setup();

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'medium.pdf',
        2.5 * 1024 * 1024,
        'application/pdf'
      ); // 2.5MB
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/2\.5.*mb/i)).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // 4. UPLOAD PROGRESS
  // ==========================================================================

  describe('Upload Progress', () => {
    test('shows progress bar during upload', async () => {
      const user = userEvent.setup();

      let progressCallback: ((progress: number) => void) | undefined;

      mockUploadFile.mockImplementation(
        (_file: File, options: { onProgress?: (progress: number) => void }) => {
          progressCallback = options.onProgress;
          return new Promise((resolve) => {
            setTimeout(() => {
              if (progressCallback) {
                progressCallback(50);
                setTimeout(() => {
                  if (progressCallback) progressCallback(100);
                  resolve({
                    url: 'https://cloudinary.com/uploaded.pdf',
                    publicId: 'milestone-file',
                  });
                }, 100);
              }
            }, 100);
          });
        }
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile('upload.pdf', 1024 * 1024, 'application/pdf');
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeDefined();
      });
    });

    test('updates progress percentage during upload', async () => {
      const user = userEvent.setup();

      let progressCallback: ((progress: number) => void) | undefined;

      mockUploadFile.mockImplementation(
        (_file: File, options: { onProgress?: (progress: number) => void }) => {
          progressCallback = options.onProgress;
          return new Promise((resolve) => {
            setTimeout(() => {
              if (progressCallback) progressCallback(25);
              setTimeout(() => {
                if (progressCallback) progressCallback(50);
                setTimeout(() => {
                  if (progressCallback) progressCallback(75);
                  setTimeout(() => {
                    if (progressCallback) progressCallback(100);
                    resolve({
                      url: 'https://cloudinary.com/uploaded.pdf',
                      publicId: 'milestone-file',
                    });
                  }, 50);
                }, 50);
              }, 50);
            }, 50);
          });
        }
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'progress-test.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/25%/)).toBeDefined();
      });

      await waitFor(() => {
        expect(screen.getByText(/50%/)).toBeDefined();
      });

      await waitFor(() => {
        expect(screen.getByText(/75%/)).toBeDefined();
      });

      await waitFor(() => {
        expect(screen.getByText(/100%/)).toBeDefined();
      });
    });

    test('hides progress bar after upload completes', async () => {
      const user = userEvent.setup();

      mockUploadFile.mockResolvedValue({
        url: 'https://cloudinary.com/uploaded.pdf',
        publicId: 'milestone-file',
      });

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'complete.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).toBeNull();
      });
    });
  });

  // ==========================================================================
  // 5. MULTIPLE FILES UPLOAD
  // ==========================================================================

  describe('Multiple Files Upload', () => {
    test('uploads multiple files sequentially', async () => {
      const user = userEvent.setup();

      mockUploadMultipleFiles.mockResolvedValue([
        { url: 'https://cloudinary.com/file1.pdf', publicId: 'file1' },
        { url: 'https://cloudinary.com/file2.png', publicId: 'file2' },
        { url: 'https://cloudinary.com/file3.jpg', publicId: 'file3' },
      ]);

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const files = [
        createMockFile('file1.pdf', 1024 * 1024, 'application/pdf'),
        createMockFile('file2.png', 2048 * 1024, 'image/png'),
        createMockFile('file3.jpg', 1536 * 1024, 'image/jpeg'),
      ];

      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;
      await user.upload(fileInput, files);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUploadMultipleFiles).toHaveBeenCalledWith(
          files,
          expect.objectContaining({
            folder: expect.stringMatching(/milestones?/i),
          })
        );
      });
    });

    test('shows individual progress for each file', async () => {
      const user = userEvent.setup();

      mockUploadMultipleFiles.mockImplementation(
        (
          files: File[],
          options: {
            onProgress?: (progress: number, fileIndex: number) => void;
          }
        ) => {
          return new Promise((resolve) => {
            files.forEach((_, index) => {
              setTimeout(() => {
                if (options.onProgress) {
                  options.onProgress(100, index);
                }
              }, index * 100);
            });
            setTimeout(
              () => {
                resolve(
                  files.map((file, i) => ({
                    url: `https://cloudinary.com/${file.name}`,
                    publicId: `file${i}`,
                  }))
                );
              },
              files.length * 100 + 100
            );
          });
        }
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const files = [
        createMockFile('file1.pdf', 1024, 'application/pdf'),
        createMockFile('file2.png', 2048, 'image/png'),
      ];

      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;
      await user.upload(fileInput, files);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/file1\.pdf/)).toBeDefined();
        expect(screen.getByText(/file2\.png/)).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // 6. UPLOAD CANCELLATION
  // ==========================================================================

  describe('Upload Cancellation', () => {
    test('shows cancel button during upload', async () => {
      const user = userEvent.setup();

      mockUploadFile.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves - simulates long upload
          })
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'long-upload.pdf',
        10 * 1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /iptal|cancel/i })
        ).toBeDefined();
      });
    });

    test('cancels upload when cancel button clicked', async () => {
      const user = userEvent.setup();

      const abortController = new AbortController();
      mockUploadFile.mockImplementation(
        () =>
          new Promise((_, reject) => {
            abortController.signal.addEventListener('abort', () => {
              reject(new Error('Upload cancelled'));
            });
          })
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'cancel-test.pdf',
        5 * 1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      const cancelButton = await screen.findByRole('button', {
        name: /iptal|cancel/i,
      });
      await user.click(cancelButton);

      abortController.abort();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/iptal|cancelled/i)
        );
      });
    });
  });

  // ==========================================================================
  // 7. ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    test('shows error toast when upload fails', async () => {
      const user = userEvent.setup();

      mockUploadFile.mockRejectedValue(
        new Error('Upload failed: Network error')
      );

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'error-test.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/upload failed|yükleme başarısız/i)
        );
      });
    });

    test('allows retry after upload failure', async () => {
      const user = userEvent.setup();

      mockUploadFile
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          url: 'https://cloudinary.com/retry-success.pdf',
          publicId: 'retry-file',
        });

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile('retry.pdf', 1024 * 1024, 'application/pdf');
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      // First attempt
      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Retry
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledTimes(2);
        expect(mockDeliverMilestone).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // 8. CLOUDINARY INTEGRATION
  // ==========================================================================

  describe('Cloudinary Integration', () => {
    test('uploads to correct Cloudinary folder (milestones)', async () => {
      const user = userEvent.setup();

      mockUploadFile.mockResolvedValue({
        url: 'https://res.cloudinary.com/marifetbul/image/upload/milestones/file.pdf',
        publicId: 'milestones/milestone-1-file',
      });

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'cloudinary-test.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(
          file,
          expect.objectContaining({
            folder: expect.stringMatching(/milestones?/i),
          })
        );
      });
    });

    test('includes milestone ID in uploaded file metadata', async () => {
      const user = userEvent.setup();

      mockUploadFile.mockResolvedValue({
        url: 'https://cloudinary.com/uploaded.pdf',
        publicId: 'milestone-1-delivery',
      });

      mockDeliverMilestone.mockResolvedValue(mockMilestone);

      render(
        <DeliverMilestoneModal
          milestone={mockMilestone}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const file = createMockFile(
        'metadata-test.pdf',
        1024 * 1024,
        'application/pdf'
      );
      const fileInput = screen.getByLabelText(
        /dosya ekle|upload/i
      ) as HTMLInputElement;

      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /teslim et/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(
          file,
          expect.objectContaining({
            context: expect.objectContaining({
              milestoneId: 'milestone-1',
              orderId: 'order-1',
            }),
          })
        );
      });
    });
  });
});
