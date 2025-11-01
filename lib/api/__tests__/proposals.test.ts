/* eslint-disable */
/**import {

 * ================================================  createProposal,

 * PROPOSALS API - UNIT TESTS  getProposalById,

 * ================================================  updateProposal,

 * Unit tests for standardized proposals API service  withdrawProposal,

 *  deleteProposal,

 * @author MarifetBul Development Team  acceptProposal,

 * @version 2.0.0 - Sprint 5  rejectProposal,

 */  getMyProposals,

  getProposalsByJob,

import {  canEditProposal,

  createProposal,  canWithdrawProposal,

  getProposalById,  getProposalStatusColor,

  updateProposal,  getProposalStatusLabel,

  withdrawProposal,} from '@/lib/api/proposals';

  deleteProposal,import type { ProposalResponse, ProposalStatus } from '@/types/backend-aligned';

  acceptProposal,

  rejectProposal,// Mock fetch globally

  shortlistProposal,global.fetch = jest.fn();

  getProposalsByJob,

  getMyProposals,describe('Proposals API Service', () => {

  getMyPendingProposals,  const API_BASE_URL = 'http://localhost:8080';

  getMyAcceptedProposals,

  getMyRejectedProposals,  beforeEach(() => {

  getMyActiveProposals,    jest.clearAllMocks();

  canEditProposal,    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;

  canWithdrawProposal,  });

  canRespondToProposal,

  getProposalStatusColor,  const mockProposal: ProposalResponse = {

  getProposalStatusLabel,    id: 'proposal-123',

} from '../proposals';    jobId: 'job-456',

import { apiClient } from '../../infrastructure/api/client';    jobTitle: 'Web Development Project',

import type {    freelancerId: 'freelancer-789',

  ProposalResponse,    freelancerName: 'John Doe',

  PageResponse,    freelancerAvatar: 'avatar.jpg',

  CreateProposalRequest,    freelancerRating: 4.5,

  UpdateProposalRequest,    freelancerSkills: ['React', 'Node.js'],

} from '../../../types/backend-aligned';    coverLetter: 'I am interested in this project',

    proposedBudget: 1000,

// Mock apiClient    proposedTimeline: '2 weeks',

jest.mock('../../infrastructure/api/client', () => ({    deliveryDays: 14,

  apiClient: {    status: 'PENDING' as ProposalStatus,

    get: jest.fn(),    attachments: [],

    post: jest.fn(),    milestones: [],

    put: jest.fn(),    questions: [],

    delete: jest.fn(),    isViewed: false,

  },    createdAt: '2025-01-01T00:00:00Z',

}));    updatedAt: '2025-01-01T00:00:00Z',

  };

describe('Proposals API', () => {

  beforeEach(() => {  describe('createProposal', () => {

    jest.clearAllMocks();    it('should create a proposal successfully', async () => {

  });      (global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: true,

  // ============================================================================        json: async () => ({ data: mockProposal }),

  // MOCK DATA      });

  // ============================================================================

      const request = {

  const mockProposal: ProposalResponse = {        jobId: 'job-456',

    id: 'proposal-123',        coverLetter: 'Test cover letter',

    jobId: 'job-456',        bidAmount: 1000,

    jobTitle: 'Web Development Project',        deliveryTime: 14,

    freelancerId: 'freelancer-789',      };

    freelancerName: 'John Doe',

    freelancerAvatar: 'https://example.com/avatar.jpg',      const result = await createProposal(request);

    freelancerRating: 4.5,

    freelancerSkills: ['React', 'Node.js', 'TypeScript'],      expect(global.fetch).toHaveBeenCalledWith(

    coverLetter:        `${API_BASE_URL}/api/v1/proposals`,

      'I am very interested in this project and have 5 years of experience with the required technologies.',        {

    proposedBudget: 5000,          method: 'POST',

    proposedTimeline: '4 weeks',          credentials: 'include',

    deliveryDays: 28,          headers: { 'Content-Type': 'application/json' },

    status: 'PENDING',          body: JSON.stringify(request),

    attachments: ['resume.pdf', 'portfolio.pdf'],        }

    milestones: [      );

      {      expect(result.data).toEqual(mockProposal);

        title: 'Phase 1: Setup',    });

        description: 'Initial setup and architecture',

        amount: 1500,    it('should throw error on failed creation', async () => {

        dueDate: '2025-02-01T00:00:00Z',      const errorMessage = 'Failed to create proposal';

      },      (global.fetch as jest.Mock).mockResolvedValueOnce({

      {        ok: false,

        title: 'Phase 2: Development',        json: async () => ({ message: errorMessage }),

        description: 'Core feature implementation',      });

        amount: 2500,

        dueDate: '2025-02-15T00:00:00Z',      await expect(

      },        createProposal({

      {          jobId: 'job-456',

        title: 'Phase 3: Testing',          coverLetter: 'Test',

        description: 'QA and deployment',          bidAmount: 1000,

        amount: 1000,          deliveryTime: 14,

        dueDate: '2025-02-22T00:00:00Z',        })

      },      ).rejects.toThrow(errorMessage);

    ],    });

    questions: [  });

      {

        question: 'What is your availability?',  describe('getProposalById', () => {

        answer: 'Full-time, starting immediately',    it('should fetch proposal by ID', async () => {

      },      (global.fetch as jest.Mock).mockResolvedValueOnce({

    ],        ok: true,

    isViewed: false,        json: async () => ({ data: mockProposal }),

    createdAt: '2025-01-15T10:00:00Z',      });

    updatedAt: '2025-01-15T10:00:00Z',

  };      const result = await getProposalById('proposal-123');



  // ============================================================================      expect(global.fetch).toHaveBeenCalledWith(

  // CREATE PROPOSAL        `${API_BASE_URL}/api/v1/proposals/proposal-123`,

  // ============================================================================        {

          method: 'GET',

  describe('createProposal', () => {          credentials: 'include',

    it('should create a proposal successfully', async () => {          headers: { 'Content-Type': 'application/json' },

      const request: CreateProposalRequest = {        }

        jobId: 'job-456',      );

        coverLetter: 'I am very interested in this project...',      expect(result.data).toEqual(mockProposal);

        proposedBudget: 5000,    });

        deliveryDays: 28,

      };    it('should handle fetch error', async () => {

      (global.fetch as jest.Mock).mockResolvedValueOnce({

      (apiClient.post as jest.Mock).mockResolvedValue(mockProposal);        ok: false,

        json: async () => ({ message: 'Not found' }),

      const result = await createProposal(request);      });



      expect(apiClient.post).toHaveBeenCalledWith('/proposals', request);      await expect(getProposalById('invalid-id')).rejects.toThrow('Not found');

      expect(result).toEqual(mockProposal);    });

      expect(result.id).toBe('proposal-123');  });

    });

  describe('updateProposal', () => {

    it('should handle validation errors', async () => {    it('should update proposal successfully', async () => {

      const error = new Error('Cover letter must be at least 50 characters');      const updatedProposal = { ...mockProposal, proposedBudget: 1500 };

      error.name = 'ValidationError';      (global.fetch as jest.Mock).mockResolvedValueOnce({

      (apiClient.post as jest.Mock).mockRejectedValue(error);        ok: true,

        json: async () => ({ data: updatedProposal }),

      await expect(      });

        createProposal({

          jobId: 'job-456',      const updates = { bidAmount: 1500, coverLetter: 'Updated letter' };

          coverLetter: 'Too short',      const result = await updateProposal('proposal-123', updates);

          proposedBudget: 5000,

          deliveryDays: 28,      expect(global.fetch).toHaveBeenCalledWith(

        })        `${API_BASE_URL}/api/v1/proposals/proposal-123`,

      ).rejects.toThrow('Cover letter must be at least 50 characters');        {

    });          method: 'PUT',

  });          credentials: 'include',

          headers: { 'Content-Type': 'application/json' },

  // ============================================================================          body: JSON.stringify(updates),

  // GET PROPOSAL BY ID        }

  // ============================================================================      );

      expect(result.data.proposedBudget).toBe(1500);

  describe('getProposalById', () => {    });

    it('should fetch a proposal by ID', async () => {  });

      (apiClient.get as jest.Mock).mockResolvedValue(mockProposal);

  describe('withdrawProposal', () => {

      const result = await getProposalById('proposal-123');    it('should withdraw proposal successfully', async () => {

      (global.fetch as jest.Mock).mockResolvedValueOnce({

      expect(apiClient.get).toHaveBeenCalledWith('/proposals/proposal-123');        ok: true,

      expect(result).toEqual(mockProposal);        json: async () => ({}),

      expect(result.id).toBe('proposal-123');      });

    });

      await withdrawProposal('proposal-123');

    it('should handle not found errors', async () => {

      const error = new Error('Proposal not found');      expect(global.fetch).toHaveBeenCalledWith(

      error.name = 'NotFoundError';        `${API_BASE_URL}/api/v1/proposals/proposal-123/withdraw`,

      (apiClient.get as jest.Mock).mockRejectedValue(error);        {

          method: 'POST',

      await expect(getProposalById('invalid-id')).rejects.toThrow(          credentials: 'include',

        'Proposal not found'          headers: { 'Content-Type': 'application/json' },

      );        }

    });      );

  });    });



  // ============================================================================    it('should handle withdraw error', async () => {

  // UPDATE PROPOSAL      (global.fetch as jest.Mock).mockResolvedValueOnce({

  // ============================================================================        ok: false,

        json: async () => ({ message: 'Cannot withdraw' }),

  describe('updateProposal', () => {      });

    it('should update a proposal successfully', async () => {

      const updateData: UpdateProposalRequest = {      await expect(withdrawProposal('proposal-123')).rejects.toThrow(

        coverLetter: 'Updated cover letter',        'Cannot withdraw'

        proposedBudget: 5500,      );

      };    });

  });

      const updatedProposal = { ...mockProposal, ...updateData };

      (apiClient.put as jest.Mock).mockResolvedValue(updatedProposal);  describe('deleteProposal', () => {

    it('should delete proposal successfully', async () => {

      const result = await updateProposal('proposal-123', updateData);      (global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: true,

      expect(apiClient.put).toHaveBeenCalledWith(        json: async () => ({}),

        '/proposals/proposal-123',      });

        updateData

      );      await deleteProposal('proposal-123');

      expect(result.proposedBudget).toBe(5500);

    });      expect(global.fetch).toHaveBeenCalledWith(

  });        `${API_BASE_URL}/api/v1/proposals/proposal-123`,

        {

  // ============================================================================          method: 'DELETE',

  // STATE CHANGES          credentials: 'include',

  // ============================================================================          headers: { 'Content-Type': 'application/json' },

        }

  describe('withdrawProposal', () => {      );

    it('should withdraw a proposal', async () => {    });

      const withdrawnProposal = { ...mockProposal, status: 'WITHDRAWN' as const };  });

      (apiClient.post as jest.Mock).mockResolvedValue(withdrawnProposal);

  describe('acceptProposal', () => {

      const result = await withdrawProposal('proposal-123');    it('should accept proposal successfully', async () => {

      const acceptedProposal = {

      expect(apiClient.post).toHaveBeenCalledWith(        ...mockProposal,

        '/proposals/proposal-123/withdraw',        status: 'ACCEPTED' as ProposalStatus,

        {}      };

      );      (global.fetch as jest.Mock).mockResolvedValueOnce({

      expect(result.status).toBe('WITHDRAWN');        ok: true,

    });        json: async () => ({ data: acceptedProposal }),

  });      });



  describe('deleteProposal', () => {      const result = await acceptProposal('proposal-123', {

    it('should delete a proposal', async () => {        message: 'Accepted!',

      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);      });



      await deleteProposal('proposal-123');      expect(global.fetch).toHaveBeenCalledWith(

        `${API_BASE_URL}/api/v1/proposals/proposal-123/accept`,

      expect(apiClient.delete).toHaveBeenCalledWith('/proposals/proposal-123');        {

    });          method: 'POST',

  });          credentials: 'include',

          headers: { 'Content-Type': 'application/json' },

  describe('acceptProposal', () => {          body: JSON.stringify({ message: 'Accepted!' }),

    it('should accept a proposal with optional message', async () => {        }

      const acceptedProposal = { ...mockProposal, status: 'ACCEPTED' as const };      );

      (apiClient.post as jest.Mock).mockResolvedValue(acceptedProposal);      expect(result.data.status).toBe('ACCEPTED');

    });

      const result = await acceptProposal('proposal-123', 'Great proposal!');

    it('should accept without message', async () => {

      expect(apiClient.post).toHaveBeenCalledWith(      (global.fetch as jest.Mock).mockResolvedValueOnce({

        '/proposals/proposal-123/accept',        ok: true,

        { message: 'Great proposal!' }        json: async () => ({ data: mockProposal }),

      );      });

      expect(result.status).toBe('ACCEPTED');

    });      await acceptProposal('proposal-123');

  });

      expect(global.fetch).toHaveBeenCalledWith(

  describe('rejectProposal', () => {        expect.any(String),

    it('should reject a proposal with reason', async () => {        expect.objectContaining({

      const rejectedProposal = { ...mockProposal, status: 'REJECTED' as const };          body: undefined,

      (apiClient.post as jest.Mock).mockResolvedValue(rejectedProposal);        })

      );

      const result = await rejectProposal('proposal-123', 'Not a good fit');    });

  });

      expect(apiClient.post).toHaveBeenCalledWith(

        '/proposals/proposal-123/reject',  describe('rejectProposal', () => {

        { reason: 'Not a good fit' }    it('should reject proposal successfully', async () => {

      );      const rejectedProposal = {

      expect(result.status).toBe('REJECTED');        ...mockProposal,

    });        status: 'REJECTED' as ProposalStatus,

  });      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({

  describe('shortlistProposal', () => {        ok: true,

    it('should shortlist a proposal', async () => {        json: async () => ({ data: rejectedProposal }),

      const shortlistedProposal = {      });

        ...mockProposal,

        status: 'SHORTLISTED' as const,      const result = await rejectProposal('proposal-123', {

      };        reason: 'Not suitable',

      (apiClient.post as jest.Mock).mockResolvedValue(shortlistedProposal);      });



      const result = await shortlistProposal('proposal-123');      expect(result.data.status).toBe('REJECTED');

    });

      expect(apiClient.post).toHaveBeenCalledWith(  });

        '/proposals/proposal-123/shortlist',

        {}  describe('getMyProposals', () => {

      );    it('should fetch my proposals with filters', async () => {

      expect(result.status).toBe('SHORTLISTED');      const mockResponse = {

    });        data: {

  });          content: [mockProposal],

          page: 0,

  // ============================================================================          size: 20,

  // LIST OPERATIONS          totalElements: 1,

  // ============================================================================          totalPages: 1,

        },

  describe('getProposalsByJob', () => {      };

    it('should fetch proposals for a job', async () => {

      const mockResponse: PageResponse<ProposalResponse> = {      (global.fetch as jest.Mock).mockResolvedValueOnce({

        content: [mockProposal],        ok: true,

        page: 0,        json: async () => mockResponse,

        size: 10,      });

        totalElements: 1,

        totalPages: 1,      const result = await getMyProposals({

        first: true,        status: 'PENDING',

        last: true,        page: 0,

        numberOfElements: 1,        size: 20,

        empty: false,      });

      };

      expect(global.fetch).toHaveBeenCalledWith(

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);        `${API_BASE_URL}/api/v1/proposals/me?status=PENDING&page=0&size=20`,

        expect.any(Object)

      const result = await getProposalsByJob('job-456', {      );

        status: 'PENDING',      expect(result.data.content).toHaveLength(1);

        page: 0,    });

        size: 10,

      });    it('should handle multiple statuses', async () => {

      (global.fetch as jest.Mock).mockResolvedValueOnce({

      expect(apiClient.get).toHaveBeenCalledWith('/jobs/job-456/proposals', {        ok: true,

        params: { status: 'PENDING', page: 0, size: 10 },        json: async () => ({ data: { content: [] } }),

      });      });

      expect(result.content).toHaveLength(1);

      expect(result.empty).toBe(false);      await getMyProposals({ status: ['PENDING', 'ACCEPTED'] });

    });

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];

    it('should handle empty results', async () => {      expect(callUrl).toContain('status=PENDING');

      const emptyResponse: PageResponse<ProposalResponse> = {      expect(callUrl).toContain('status=ACCEPTED');

        content: [],    });

        page: 0,  });

        size: 10,

        totalElements: 0,  describe('getProposalsByJob', () => {

        totalPages: 0,    it('should fetch proposals for a job', async () => {

        first: true,      const mockResponse = {

        last: true,        data: {

        numberOfElements: 0,          content: [mockProposal],

        empty: true,          totalElements: 1,

      };        },

      };

      (apiClient.get as jest.Mock).mockResolvedValue(emptyResponse);

      (global.fetch as jest.Mock).mockResolvedValueOnce({

      const result = await getProposalsByJob('job-456');        ok: true,

        json: async () => mockResponse,

      expect(result.content).toHaveLength(0);      });

      expect(result.empty).toBe(true);

    });      const result = await getProposalsByJob('job-456', {

  });        status: 'PENDING',

        minAmount: 500,

  describe('getMyProposals', () => {        maxAmount: 2000,

    it('should fetch my proposals with filters', async () => {      });

      const mockResponse: PageResponse<ProposalResponse> = {

        content: [mockProposal],      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];

        page: 0,      expect(callUrl).toContain('/jobs/job-456/proposals');

        size: 10,      expect(callUrl).toContain('status=PENDING');

        totalElements: 1,      expect(callUrl).toContain('minAmount=500');

        totalPages: 1,      expect(callUrl).toContain('maxAmount=2000');

        first: true,      expect(result.data.content).toHaveLength(1);

        last: true,    });

        numberOfElements: 1,  });

        empty: false,

      };  describe('Utility Functions', () => {

    describe('canEditProposal', () => {

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);      it('should return true for PENDING proposals', () => {

        expect(canEditProposal(mockProposal)).toBe(true);

      const result = await getMyProposals({      });

        status: 'PENDING',

        page: 0,      it('should return false for ACCEPTED proposals', () => {

        size: 10,        const acceptedProposal = {

      });          ...mockProposal,

          status: 'ACCEPTED' as ProposalStatus,

      expect(apiClient.get).toHaveBeenCalledWith('/proposals/me', {        };

        params: { status: 'PENDING', page: 0, size: 10 },        expect(canEditProposal(acceptedProposal)).toBe(false);

      });      });

      expect(result.content).toHaveLength(1);

    });      it('should return false for REJECTED proposals', () => {

  });        const rejectedProposal = {

          ...mockProposal,

  describe('Status-specific fetching', () => {          status: 'REJECTED' as ProposalStatus,

    const mockResponse: PageResponse<ProposalResponse> = {        };

      content: [mockProposal],        expect(canEditProposal(rejectedProposal)).toBe(false);

      page: 0,      });

      size: 10,    });

      totalElements: 1,

      totalPages: 1,    describe('canWithdrawProposal', () => {

      first: true,      it('should return true for PENDING proposals', () => {

      last: true,        expect(canWithdrawProposal(mockProposal)).toBe(true);

      numberOfElements: 1,      });

      empty: false,

    };      it('should return true for SHORTLISTED proposals', () => {

        const shortlistedProposal = {

    it('getMyPendingProposals', async () => {          ...mockProposal,

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);          status: 'SHORTLISTED' as ProposalStatus,

        };

      const result = await getMyPendingProposals();        expect(canWithdrawProposal(shortlistedProposal)).toBe(true);

      });

      expect(apiClient.get).toHaveBeenCalledWith('/proposals/me/pending', {

        params: {},      it('should return false for ACCEPTED proposals', () => {

      });        const acceptedProposal = {

      expect(result.content).toHaveLength(1);          ...mockProposal,

    });          status: 'ACCEPTED' as ProposalStatus,

        };

    it('getMyAcceptedProposals', async () => {        expect(canWithdrawProposal(acceptedProposal)).toBe(false);

      const acceptedProposal = { ...mockProposal, status: 'ACCEPTED' as const };      });

      const response = { ...mockResponse, content: [acceptedProposal] };    });

      (apiClient.get as jest.Mock).mockResolvedValue(response);

    describe('getProposalStatusColor', () => {

      const result = await getMyAcceptedProposals();      it('should return correct colors for each status', () => {

        expect(getProposalStatusColor('PENDING')).toBe('yellow');

      expect(apiClient.get).toHaveBeenCalledWith('/proposals/me/accepted', {        expect(getProposalStatusColor('ACCEPTED')).toBe('green');

        params: {},        expect(getProposalStatusColor('REJECTED')).toBe('red');

      });        expect(getProposalStatusColor('WITHDRAWN')).toBe('gray');

      expect(result.content[0].status).toBe('ACCEPTED');        expect(getProposalStatusColor('SHORTLISTED')).toBe('blue');

    });      });



    it('getMyRejectedProposals', async () => {      it('should return gray for unknown status', () => {

      const rejectedProposal = { ...mockProposal, status: 'REJECTED' as const };        expect(getProposalStatusColor('UNKNOWN' as ProposalStatus)).toBe(

      const response = { ...mockResponse, content: [rejectedProposal] };          'gray'

      (apiClient.get as jest.Mock).mockResolvedValue(response);        );

      });

      const result = await getMyRejectedProposals();    });



      expect(apiClient.get).toHaveBeenCalledWith('/proposals/me/rejected', {    describe('getProposalStatusLabel', () => {

        params: {},      it('should return Turkish labels for each status', () => {

      });        expect(getProposalStatusLabel('PENDING')).toBe('Beklemede');

      expect(result.content[0].status).toBe('REJECTED');        expect(getProposalStatusLabel('ACCEPTED')).toBe('Kabul Edildi');

    });        expect(getProposalStatusLabel('REJECTED')).toBe('Reddedildi');

        expect(getProposalStatusLabel('WITHDRAWN')).toBe('Geri Çekildi');

    it('getMyActiveProposals', async () => {        expect(getProposalStatusLabel('SHORTLISTED')).toBe(

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);          'Kısa Listeye Alındı'

        );

      const result = await getMyActiveProposals();      });



      expect(apiClient.get).toHaveBeenCalledWith('/proposals/me/active', {      it('should return status as-is for unknown status', () => {

        params: {},        expect(getProposalStatusLabel('UNKNOWN' as ProposalStatus)).toBe(

      });          'UNKNOWN'

      expect(result.content).toHaveLength(1);        );

    });      });

  });    });

  });

  // ============================================================================

  // UTILITY FUNCTIONS  describe('Error Handling', () => {

  // ============================================================================    it('should handle network errors gracefully', async () => {

      (global.fetch as jest.Mock).mockRejectedValueOnce(

  describe('Utility Functions', () => {        new Error('Network error')

    describe('canEditProposal', () => {      );

      it('should return true for PENDING proposals', () => {

        expect(canEditProposal(mockProposal)).toBe(true);      await expect(getProposalById('proposal-123')).rejects.toThrow(

      });        'Network error'

      );

      it('should return false for ACCEPTED proposals', () => {    });

        const accepted = { ...mockProposal, status: 'ACCEPTED' as const };

        expect(canEditProposal(accepted)).toBe(false);    it('should handle malformed JSON in error response', async () => {

      });      (global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: false,

      it('should return false for REJECTED proposals', () => {        json: async () => {

        const rejected = { ...mockProposal, status: 'REJECTED' as const };          throw new Error('Invalid JSON');

        expect(canEditProposal(rejected)).toBe(false);        },

      });      });

    });

      await expect(getProposalById('proposal-123')).rejects.toThrow(

    describe('canWithdrawProposal', () => {        'Failed to fetch proposal'

      it('should return true for PENDING proposals', () => {      );

        expect(canWithdrawProposal(mockProposal)).toBe(true);    });

      });  });

});

      it('should return true for SHORTLISTED proposals', () => {
        const shortlisted = { ...mockProposal, status: 'SHORTLISTED' as const };
        expect(canWithdrawProposal(shortlisted)).toBe(true);
      });

      it('should return false for ACCEPTED proposals', () => {
        const accepted = { ...mockProposal, status: 'ACCEPTED' as const };
        expect(canWithdrawProposal(accepted)).toBe(false);
      });
    });

    describe('canRespondToProposal', () => {
      it('should return true for PENDING proposals', () => {
        expect(canRespondToProposal(mockProposal)).toBe(true);
      });

      it('should return true for SHORTLISTED proposals', () => {
        const shortlisted = { ...mockProposal, status: 'SHORTLISTED' as const };
        expect(canRespondToProposal(shortlisted)).toBe(true);
      });

      it('should return false for ACCEPTED proposals', () => {
        const accepted = { ...mockProposal, status: 'ACCEPTED' as const };
        expect(canRespondToProposal(accepted)).toBe(false);
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
    });

    describe('getProposalStatusLabel', () => {
      it('should return Turkish labels for each status', () => {
        expect(getProposalStatusLabel('PENDING')).toBe('Beklemede');
        expect(getProposalStatusLabel('ACCEPTED')).toBe('Kabul Edildi');
        expect(getProposalStatusLabel('REJECTED')).toBe('Reddedildi');
        expect(getProposalStatusLabel('WITHDRAWN')).toBe('Geri Çekildi');
        expect(getProposalStatusLabel('SHORTLISTED')).toBe('Kısa Listede');
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (apiClient.get as jest.Mock).mockRejectedValue(timeoutError);

      await expect(getProposalById('proposal-123')).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      (apiClient.post as jest.Mock).mockRejectedValue(serverError);

      await expect(
        createProposal({
          jobId: 'job-456',
          coverLetter: 'Test',
          proposedBudget: 5000,
          deliveryDays: 28,
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.name = 'RateLimitError';
      (apiClient.post as jest.Mock).mockRejectedValue(rateLimitError);

      await expect(
        createProposal({
          jobId: 'job-456',
          coverLetter: 'Test',
          proposedBudget: 5000,
          deliveryDays: 28,
        })
      ).rejects.toThrow('Too many requests');
    });
  });
});
