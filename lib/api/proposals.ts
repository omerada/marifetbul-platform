import {
  ApiResponse,
  PageResponse,
  ProposalResponse as Proposal,
  ProposalStatus,
  ProposalMilestone,
  ProposalQuestion,
} from '@/types/backend-aligned';
import { PROPOSAL_ENDPOINTS } from './endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ================================================
// TYPES
// ================================================

export interface CreateProposalRequest {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  deliveryTime: number;
  milestones?: ProposalMilestone[];
  questions?: ProposalQuestion[];
  attachments?: string[];
}

export interface UpdateProposalRequest {
  coverLetter?: string;
  bidAmount?: number;
  deliveryTime?: number;
  milestones?: ProposalMilestone[];
  attachments?: string[];
}

export interface ProposalFilters {
  status?: ProposalStatus | ProposalStatus[];
  jobId?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AcceptProposalRequest {
  message?: string;
}

export interface RejectProposalRequest {
  reason?: string;
  message?: string;
}

// ================================================
// PROPOSAL API SERVICE
// ================================================

/**
 * Create a new proposal for a job
 */
export async function createProposal(
  data: CreateProposalRequest
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.CREATE}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to create proposal',
    }));
    throw new Error(error.message || 'Failed to create proposal');
  }

  return response.json();
}

/**
 * Get proposal by ID
 */
export async function getProposalById(
  proposalId: string
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.GET_BY_ID(proposalId)}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch proposal',
    }));
    throw new Error(error.message || 'Failed to fetch proposal');
  }

  return response.json();
}

/**
 * Update proposal (freelancer only, must be PENDING status)
 */
export async function updateProposal(
  proposalId: string,
  data: UpdateProposalRequest
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.UPDATE(proposalId)}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to update proposal',
    }));
    throw new Error(error.message || 'Failed to update proposal');
  }

  return response.json();
}

/**
 * Withdraw proposal (freelancer only, must be PENDING status)
 */
export async function withdrawProposal(
  proposalId: string
): Promise<ApiResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.WITHDRAW(proposalId)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to withdraw proposal',
    }));
    throw new Error(error.message || 'Failed to withdraw proposal');
  }

  return response.json();
}

/**
 * Delete proposal (hard delete)
 */
export async function deleteProposal(
  proposalId: string
): Promise<ApiResponse<void>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.DELETE(proposalId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to delete proposal',
    }));
    throw new Error(error.message || 'Failed to delete proposal');
  }

  return response.json();
}

/**
 * Accept proposal (employer only)
 */
export async function acceptProposal(
  proposalId: string,
  data?: AcceptProposalRequest
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.ACCEPT(proposalId)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to accept proposal',
    }));
    throw new Error(error.message || 'Failed to accept proposal');
  }

  return response.json();
}

/**
 * Reject proposal (employer only)
 */
export async function rejectProposal(
  proposalId: string,
  data?: RejectProposalRequest
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.REJECT(proposalId)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to reject proposal',
    }));
    throw new Error(error.message || 'Failed to reject proposal');
  }

  return response.json();
}

/**
 * Shortlist proposal (employer only)
 */
export async function shortlistProposal(
  proposalId: string
): Promise<ApiResponse<Proposal>> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.SHORTLIST(proposalId)}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to shortlist proposal',
    }));
    throw new Error(error.message || 'Failed to shortlist proposal');
  }

  return response.json();
}

/**
 * Get all proposals for a specific job (employer only)
 */
export async function getProposalsByJob(
  jobId: string,
  filters?: ProposalFilters
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters?.minAmount !== undefined) {
    params.set('minAmount', filters.minAmount.toString());
  }

  if (filters?.maxAmount !== undefined) {
    params.set('maxAmount', filters.maxAmount.toString());
  }

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters?.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.BY_JOB(jobId)}${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch job proposals',
    }));
    throw new Error(error.message || 'Failed to fetch job proposals');
  }

  return response.json();
}

/**
 * Get all my proposals (freelancer)
 */
export async function getMyProposals(
  filters?: ProposalFilters
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters?.jobId) {
    params.set('jobId', filters.jobId);
  }

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters?.sort) {
    params.set('sort', filters.sort);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.MY_PROPOSALS}${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch my proposals',
    }));
    throw new Error(error.message || 'Failed to fetch my proposals');
  }

  return response.json();
}

/**
 * Get my pending proposals (freelancer)
 */
export async function getMyPendingProposals(
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.MY_PENDING}?${params}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch pending proposals',
    }));
    throw new Error(error.message || 'Failed to fetch pending proposals');
  }

  return response.json();
}

/**
 * Get my accepted proposals (freelancer)
 */
export async function getMyAcceptedProposals(
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.MY_ACCEPTED}?${params}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch accepted proposals',
    }));
    throw new Error(error.message || 'Failed to fetch accepted proposals');
  }

  return response.json();
}

/**
 * Get my rejected proposals (freelancer)
 */
export async function getMyRejectedProposals(
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.MY_REJECTED}?${params}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch rejected proposals',
    }));
    throw new Error(error.message || 'Failed to fetch rejected proposals');
  }

  return response.json();
}

/**
 * Get my active proposals (freelancer)
 */
export async function getMyActiveProposals(
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<Proposal>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1${PROPOSAL_ENDPOINTS.MY_ACTIVE}?${params}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to fetch active proposals',
    }));
    throw new Error(error.message || 'Failed to fetch active proposals');
  }

  return response.json();
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Check if proposal can be edited
 */
export function canEditProposal(proposal: Proposal): boolean {
  return proposal.status === 'PENDING';
}

/**
 * Check if proposal can be withdrawn
 */
export function canWithdrawProposal(proposal: Proposal): boolean {
  return proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED';
}

/**
 * Check if proposal can be accepted/rejected
 */
export function canRespondToProposal(proposal: Proposal): boolean {
  return proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED';
}

/**
 * Get proposal status color
 */
export function getProposalStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'WITHDRAWN':
      return 'gray';
    case 'SHORTLISTED':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get proposal status label
 */
export function getProposalStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'ACCEPTED':
      return 'Kabul Edildi';
    case 'REJECTED':
      return 'Reddedildi';
    case 'WITHDRAWN':
      return 'Geri Çekildi';
    case 'SHORTLISTED':
      return 'Kısa Listeye Alındı';
    default:
      return status;
  }
}
