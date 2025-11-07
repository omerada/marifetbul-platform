/**
 * ================================================
 * JOB DETAIL - UNIT TESTS
 * ================================================
 * Test suite for JobDetail component
 *
 * Sprint 7: Component Testing Coverage
 * Test Coverage: Component rendering, hook integration, user interactions,
 *               owner actions, proposal management, loading/error states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 7: Component Testing
 * @since 2025-11-07
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobDetail } from '@/components/domains/jobs/JobDetail';

// Mock dependencies
jest.mock('@/hooks', () => ({
  useJobDetail: jest.fn(),
}));

jest.mock('@/components/domains/jobs/JobProposalButton', () => ({
  JobProposalButton: ({ jobId }: { jobId: string }) => (
    <button>Teklif Ver - {jobId}</button>
  ),
}));

jest.mock('@/components/domains/jobs/ProposalCard', () => ({
  ProposalCard: ({
    proposal,
    onAccept,
    onReject,
  }: {
    proposal: { id: string; freelancerName: string };
    onAccept: () => void;
    onReject: () => void;
  }) => (
    <div>
      <span>{proposal.freelancerName}</span>
      <button onClick={onAccept}>Kabul Et</button>
      <button onClick={onReject}>Reddet</button>
    </div>
  ),
}));

jest.mock('@/components/shared/social/SocialShare', () => ({
  SocialShare: () => <button>Paylaş</button>,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useJobDetail } = require('@/hooks');

// Mock data
const mockJob = {
  id: 'job-1',
  title: 'Senior React Developer Needed',
  description:
    'We are looking for an experienced React developer to build a modern web application with Next.js and TypeScript.',
  category: 'Web Development',
  subcategory: 'Frontend Development',
  budget: {
    type: 'fixed',
    amount: 5000,
    currency: 'TRY',
  },
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  location: 'İstanbul',
  isRemote: true,
  experienceLevel: 'expert',
  urgency: 'high',
  timeline: '2-3 ay',
  deadline: '2025-12-31T23:59:59Z',
  expiresAt: '2025-12-31T23:59:59Z',
  tags: ['react', 'nextjs', 'frontend'],
  requirements: [
    '5+ years React experience',
    'Strong TypeScript skills',
    'Portfolio required',
  ],
  attachments: [],
  proposalsCount: 12,
  createdAt: '2025-11-01T10:00:00Z',
  updatedAt: '2025-11-07T10:00:00Z',
  employer: {
    id: 'employer-1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet@example.com',
    avatar: '/avatars/ahmet.jpg',
    companyName: 'Tech Solutions Ltd.',
    rating: 4.8,
    totalJobs: 25,
    location: 'İstanbul',
    createdAt: '2024-01-15T10:00:00Z',
  },
};

const mockProposals = [
  {
    id: 'proposal-1',
    jobId: 'job-1',
    freelancerId: 'freelancer-1',
    freelancerName: 'Mehmet Kaya',
    freelancerAvatar: '/avatars/mehmet.jpg',
    coverLetter: 'I am very interested in this position...',
    proposedBudget: 4500,
    proposedTimeline: '2 ay',
    status: 'pending',
    createdAt: '2025-11-02T10:00:00Z',
    updatedAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 'proposal-2',
    jobId: 'job-1',
    freelancerId: 'freelancer-2',
    freelancerName: 'Ayşe Demir',
    freelancerAvatar: '/avatars/ayse.jpg',
    coverLetter: 'With 7 years of React experience...',
    proposedBudget: 5500,
    proposedTimeline: '3 ay',
    status: 'pending',
    createdAt: '2025-11-03T10:00:00Z',
    updatedAt: '2025-11-03T10:00:00Z',
  },
];

const mockUseJobDetail = useJobDetail as jest.MockedFunction<
  typeof useJobDetail
>;

describe('JobDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseJobDetail.mockReturnValue({
      currentJob: mockJob,
      proposals: [],
      isLoading: false,
      error: null,
      isJobOwner: false,
      canPropose: true,
      isSubmittingProposal: false,
      submitProposal: jest.fn(),
      updateProposalStatus: jest.fn(),
      clearError: jest.fn(),
      fetchProposals: jest.fn(),
      refreshJobDetail: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render job detail with all information', () => {
      render(<JobDetail jobId="job-1" />);

      // Check title and basic info
      expect(
        screen.getByText('Senior React Developer Needed')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We are looking for an experienced React developer/i)
      ).toBeInTheDocument();

      // Check budget
      expect(screen.getByText(/5\.000/)).toBeInTheDocument();
      expect(screen.getByText('Sabit fiyat')).toBeInTheDocument();

      // Check experience level
      expect(screen.getByText(/Uzman seviye/i)).toBeInTheDocument();

      // Check location
      expect(screen.getByText('İstanbul')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <JobDetail jobId="job-1" className="custom-class" />
      );

      const mainDiv = container.querySelector('.custom-class');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should display urgency badge for high priority jobs', () => {
      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Acil')).toBeInTheDocument();
    });

    it('should display skills tags', () => {
      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    });

    it('should display requirements list', () => {
      render(<JobDetail jobId="job-1" />);

      expect(
        screen.getByText(/5\+ years React experience/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Strong TypeScript skills/i)).toBeInTheDocument();
      expect(screen.getByText(/Portfolio required/i)).toBeInTheDocument();
    });

    it('should display employer information', () => {
      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions Ltd.')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: null,
        proposals: [],
        isLoading: true,
        error: null,
        isJobOwner: false,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText(/İş detayları yükleniyor/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      const mockRefresh = jest.fn();
      mockUseJobDetail.mockReturnValue({
        currentJob: null,
        proposals: [],
        isLoading: false,
        error: 'İş ilanı bulunamadı',
        isJobOwner: false,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: mockRefresh,
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('İş ilanı bulunamadı')).toBeInTheDocument();
    });

    it('should call refresh when retry button clicked', async () => {
      const mockRefresh = jest.fn();
      mockUseJobDetail.mockReturnValue({
        currentJob: null,
        proposals: [],
        isLoading: false,
        error: 'Network error',
        isJobOwner: false,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: mockRefresh,
      });

      render(<JobDetail jobId="job-1" />);

      const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
      await userEvent.click(retryButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show error when job is null', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: null,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('İş ilanı bulunamadı')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should toggle favorite state when favorite button clicked', async () => {
      render(<JobDetail jobId="job-1" />);

      const favoriteButton = screen.getByRole('button', {
        name: /Favorilere Ekle/i,
      });

      // Initially not favorited
      expect(favoriteButton).toHaveTextContent('Favorilere Ekle');

      // Click to favorite
      await userEvent.click(favoriteButton);

      // Should now show favorited state
      await waitFor(() => {
        expect(favoriteButton).toHaveTextContent('Favorilerde');
      });

      // Click again to unfavorite
      await userEvent.click(favoriteButton);

      await waitFor(() => {
        expect(favoriteButton).toHaveTextContent('Favorilere Ekle');
      });
    });

    it('should show proposal button for freelancers', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // JobProposalButton should be rendered
      expect(screen.getByText(/Teklif Ver/i)).toBeInTheDocument();
    });

    it('should hide proposal button for job owner', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: true,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // JobProposalButton should NOT be rendered
      expect(screen.queryByText(/Teklif Ver/i)).not.toBeInTheDocument();
    });
  });

  describe('Owner Actions - Proposals', () => {
    it('should display proposals for job owner', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: mockProposals,
        isLoading: false,
        error: null,
        isJobOwner: true,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Check proposals section
      expect(screen.getByText(/Gelen Teklifler \(2\)/i)).toBeInTheDocument();

      // Check proposal details
      expect(screen.getByText('Mehmet Kaya')).toBeInTheDocument();
      expect(screen.getByText('Ayşe Demir')).toBeInTheDocument();
    });

    it('should call updateProposalStatus when accept clicked', async () => {
      const mockUpdateProposal = jest.fn().mockResolvedValue(undefined);

      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: mockProposals,
        isLoading: false,
        error: null,
        isJobOwner: true,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: mockUpdateProposal,
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Find accept button for first proposal
      const acceptButtons = screen.getAllByRole('button', {
        name: /kabul et/i,
      });
      await userEvent.click(acceptButtons[0]);

      await waitFor(() => {
        expect(mockUpdateProposal).toHaveBeenCalledWith(
          'proposal-1',
          'accepted'
        );
      });
    });

    it('should call updateProposalStatus when reject clicked', async () => {
      const mockUpdateProposal = jest.fn().mockResolvedValue(undefined);

      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: mockProposals,
        isLoading: false,
        error: null,
        isJobOwner: true,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: mockUpdateProposal,
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Find reject button for first proposal
      const rejectButtons = screen.getAllByRole('button', { name: /reddet/i });
      await userEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(mockUpdateProposal).toHaveBeenCalledWith(
          'proposal-1',
          'rejected'
        );
      });
    });

    it('should not display proposals section for non-owners', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: mockProposals,
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Proposals section should NOT be visible
      expect(screen.queryByText(/Gelen Teklifler/i)).not.toBeInTheDocument();
    });
  });

  describe('Budget Display', () => {
    it('should display fixed budget correctly', () => {
      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText(/5\.000/)).toBeInTheDocument();
      expect(screen.getByText('Sabit fiyat')).toBeInTheDocument();
    });

    it('should display hourly budget correctly', () => {
      const hourlyJob = {
        ...mockJob,
        budget: {
          type: 'hourly' as const,
          hourlyRate: 250,
          currency: 'TRY',
        },
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: hourlyJob,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText(/250/)).toBeInTheDocument();
      expect(screen.getByText('Saatlik')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show remote work indicator', () => {
      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Uzaktan')).toBeInTheDocument();
    });

    it('should show on-site when not remote', () => {
      const onsiteJob = {
        ...mockJob,
        isRemote: false,
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: onsiteJob,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Yerinde')).toBeInTheDocument();
    });

    it('should display deadline when available', () => {
      render(<JobDetail jobId="job-1" />);

      // Check for deadline text
      expect(screen.getByText(/kaldı/i)).toBeInTheDocument();
    });

    it('should display "no skills specified" when skills array is empty', () => {
      const jobWithoutSkills = {
        ...mockJob,
        skills: [],
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: jobWithoutSkills,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Beceri belirtilmemiş')).toBeInTheDocument();
    });

    it('should hide attachments section when no attachments', () => {
      render(<JobDetail jobId="job-1" />);

      // Attachments section should not be rendered
      expect(screen.queryByText('Ekler')).not.toBeInTheDocument();
    });

    it('should display attachments section when attachments exist', () => {
      const jobWithAttachments = {
        ...mockJob,
        attachments: [
          {
            id: 'att-1',
            filename: 'requirements.pdf',
            url: '/files/requirements.pdf',
            type: 'application/pdf',
          },
        ],
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: jobWithAttachments,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      expect(screen.getByText('Ekler')).toBeInTheDocument();
      expect(screen.getByText('requirements.pdf')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing employer avatar', () => {
      const jobWithoutAvatar = {
        ...mockJob,
        employer: {
          ...mockJob.employer,
          avatar: null,
        },
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: jobWithoutAvatar,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      const { container } = render(<JobDetail jobId="job-1" />);

      // Avatar fallback should be rendered
      const avatarFallback = container.querySelector('[class*="avatar"]');
      expect(avatarFallback).toBeInTheDocument();
    });

    it('should handle job with no tags', () => {
      const jobWithoutTags = {
        ...mockJob,
        tags: [],
      };

      mockUseJobDetail.mockReturnValue({
        currentJob: jobWithoutTags,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: false,
        canPropose: true,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Should render without errors
      expect(
        screen.getByText('Senior React Developer Needed')
      ).toBeInTheDocument();
    });

    it('should handle empty proposals array for owner', () => {
      mockUseJobDetail.mockReturnValue({
        currentJob: mockJob,
        proposals: [],
        isLoading: false,
        error: null,
        isJobOwner: true,
        canPropose: false,
        isSubmittingProposal: false,
        submitProposal: jest.fn(),
        updateProposalStatus: jest.fn(),
        clearError: jest.fn(),
        fetchProposals: jest.fn(),
        refreshJobDetail: jest.fn(),
      });

      render(<JobDetail jobId="job-1" />);

      // Proposals section should not be rendered when empty
      expect(screen.queryByText(/Gelen Teklifler/i)).not.toBeInTheDocument();
    });
  });
});
