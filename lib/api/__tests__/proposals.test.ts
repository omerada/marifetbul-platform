import {
  createProposal,
  getProposalById,
  updateProposal,
  withdrawProposal,
  deleteProposal,
  acceptProposal,
  rejectProposal,
  getMyProposals,
  getProposalsByJob,
  canEditProposal,
  canWithdrawProposal,
  getProposalStatusColor,
  getProposalStatusLabel,
} from '@/lib/api/proposals';
import type { ProposalResponse, ProposalStatus } from '@/types/backend-aligned';

// Mock fetch globally
global.fetch = jest.fn();

describe('Proposals API Service', () => {
  const API_BASE_URL = 'http://localhost:8080';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;
  });

  const mockProposal: ProposalResponse = {
    id: 'proposal-123',
    jobId: 'job-456',
    jobTitle: 'Web Development Project',
    freelancerId: 'freelancer-789',
    freelancerName: 'John Doe',
    freelancerAvatar: 'avatar.jpg',
    freelancerRating: 4.5,
    freelancerSkills: ['React', 'Node.js'],
    coverLetter: 'I am interested in this project',
    proposedBudget: 1000,
    proposedTimeline: '2 weeks',
    deliveryDays: 14,
    status: 'PENDING' as ProposalStatus,
    attachments: [],
    milestones: [],
    questions: [],
    isViewed: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('createProposal', () => {
    it('should create a proposal successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProposal }),
      });

      const request = {
        jobId: 'job-456',
        coverLetter: 'Test cover letter',
        bidAmount: 1000,
        deliveryTime: 14,
      };

      const result = await createProposal(request);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        }
      );
      expect(result.data).toEqual(mockProposal);
    });

    it('should throw error on failed creation', async () => {
      const errorMessage = 'Failed to create proposal';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      await expect(
        createProposal({
          jobId: 'job-456',
          coverLetter: 'Test',
          bidAmount: 1000,
          deliveryTime: 14,
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('getProposalById', () => {
    it('should fetch proposal by ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProposal }),
      });

      const result = await getProposalById('proposal-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/proposal-123`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result.data).toEqual(mockProposal);
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      await expect(getProposalById('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('updateProposal', () => {
    it('should update proposal successfully', async () => {
      const updatedProposal = { ...mockProposal, proposedBudget: 1500 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedProposal }),
      });

      const updates = { bidAmount: 1500, coverLetter: 'Updated letter' };
      const result = await updateProposal('proposal-123', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/proposal-123`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      expect(result.data.proposedBudget).toBe(1500);
    });
  });

  describe('withdrawProposal', () => {
    it('should withdraw proposal successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await withdrawProposal('proposal-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/proposal-123/withdraw`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should handle withdraw error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Cannot withdraw' }),
      });

      await expect(withdrawProposal('proposal-123')).rejects.toThrow(
        'Cannot withdraw'
      );
    });
  });

  describe('deleteProposal', () => {
    it('should delete proposal successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await deleteProposal('proposal-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/proposal-123`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  });

  describe('acceptProposal', () => {
    it('should accept proposal successfully', async () => {
      const acceptedProposal = {
        ...mockProposal,
        status: 'ACCEPTED' as ProposalStatus,
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: acceptedProposal }),
      });

      const result = await acceptProposal('proposal-123', {
        message: 'Accepted!',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/proposal-123/accept`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Accepted!' }),
        }
      );
      expect(result.data.status).toBe('ACCEPTED');
    });

    it('should accept without message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProposal }),
      });

      await acceptProposal('proposal-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        })
      );
    });
  });

  describe('rejectProposal', () => {
    it('should reject proposal successfully', async () => {
      const rejectedProposal = {
        ...mockProposal,
        status: 'REJECTED' as ProposalStatus,
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: rejectedProposal }),
      });

      const result = await rejectProposal('proposal-123', {
        reason: 'Not suitable',
      });

      expect(result.data.status).toBe('REJECTED');
    });
  });

  describe('getMyProposals', () => {
    it('should fetch my proposals with filters', async () => {
      const mockResponse = {
        data: {
          content: [mockProposal],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getMyProposals({
        status: 'PENDING',
        page: 0,
        size: 20,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/proposals/me?status=PENDING&page=0&size=20`,
        expect.any(Object)
      );
      expect(result.data.content).toHaveLength(1);
    });

    it('should handle multiple statuses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { content: [] } }),
      });

      await getMyProposals({ status: ['PENDING', 'ACCEPTED'] });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('status=PENDING');
      expect(callUrl).toContain('status=ACCEPTED');
    });
  });

  describe('getProposalsByJob', () => {
    it('should fetch proposals for a job', async () => {
      const mockResponse = {
        data: {
          content: [mockProposal],
          totalElements: 1,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getProposalsByJob('job-456', {
        status: 'PENDING',
        minAmount: 500,
        maxAmount: 2000,
      });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('/jobs/job-456/proposals');
      expect(callUrl).toContain('status=PENDING');
      expect(callUrl).toContain('minAmount=500');
      expect(callUrl).toContain('maxAmount=2000');
      expect(result.data.content).toHaveLength(1);
    });
  });

  describe('Utility Functions', () => {
    describe('canEditProposal', () => {
      it('should return true for PENDING proposals', () => {
        expect(canEditProposal(mockProposal)).toBe(true);
      });

      it('should return false for ACCEPTED proposals', () => {
        const acceptedProposal = {
          ...mockProposal,
          status: 'ACCEPTED' as ProposalStatus,
        };
        expect(canEditProposal(acceptedProposal)).toBe(false);
      });

      it('should return false for REJECTED proposals', () => {
        const rejectedProposal = {
          ...mockProposal,
          status: 'REJECTED' as ProposalStatus,
        };
        expect(canEditProposal(rejectedProposal)).toBe(false);
      });
    });

    describe('canWithdrawProposal', () => {
      it('should return true for PENDING proposals', () => {
        expect(canWithdrawProposal(mockProposal)).toBe(true);
      });

      it('should return true for SHORTLISTED proposals', () => {
        const shortlistedProposal = {
          ...mockProposal,
          status: 'SHORTLISTED' as ProposalStatus,
        };
        expect(canWithdrawProposal(shortlistedProposal)).toBe(true);
      });

      it('should return false for ACCEPTED proposals', () => {
        const acceptedProposal = {
          ...mockProposal,
          status: 'ACCEPTED' as ProposalStatus,
        };
        expect(canWithdrawProposal(acceptedProposal)).toBe(false);
      });
    });

    describe('getProposalStatusColor', () => {
      it('should return correct colors for each status', () => {
        expect(getProposalStatusColor('PENDING')).toBe('yellow');
        expect(getProposalStatusColor('ACCEPTED')).toBe('green');
        expect(getProposalStatusColor('REJECTED')).toBe('red');
        expect(getProposalStatusColor('WITHDRAWN')).toBe('gray');
        expect(getProposalStatusColor('SHORTLISTED')).toBe('blue');
      });

      it('should return gray for unknown status', () => {
        expect(getProposalStatusColor('UNKNOWN' as ProposalStatus)).toBe(
          'gray'
        );
      });
    });

    describe('getProposalStatusLabel', () => {
      it('should return Turkish labels for each status', () => {
        expect(getProposalStatusLabel('PENDING')).toBe('Beklemede');
        expect(getProposalStatusLabel('ACCEPTED')).toBe('Kabul Edildi');
        expect(getProposalStatusLabel('REJECTED')).toBe('Reddedildi');
        expect(getProposalStatusLabel('WITHDRAWN')).toBe('Geri Çekildi');
        expect(getProposalStatusLabel('SHORTLISTED')).toBe(
          'Kısa Listeye Alındı'
        );
      });

      it('should return status as-is for unknown status', () => {
        expect(getProposalStatusLabel('UNKNOWN' as ProposalStatus)).toBe(
          'UNKNOWN'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(getProposalById('proposal-123')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle malformed JSON in error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(getProposalById('proposal-123')).rejects.toThrow(
        'Failed to fetch proposal'
      );
    });
  });
});
