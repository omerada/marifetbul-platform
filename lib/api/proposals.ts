/**
 * ================================================
 * PROPOSAL API CLIENT
 * ================================================
 * API client for job proposal management
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: API Standardization with Validation
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, ProposalSchema } from './validators';
import type { Proposal as ValidatedProposal } from './validators';
import {
  PageResponse,
  ProposalResponse as Proposal,
  ProposalStatus,
  ProposalMilestone,
  ProposalQuestion,
} from '@/types/backend-aligned';
import { PROPOSAL_ENDPOINTS } from './endpoints';

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
 * @throws {ValidationError} Invalid proposal data
 * @throws {AuthenticationError} Not authenticated
 */
export async function createProposal(
  data: CreateProposalRequest
): Promise<ValidatedProposal> {
  const response = await apiClient.post<Proposal>(
    PROPOSAL_ENDPOINTS.CREATE,
    data
  );
  return validateResponse(ProposalSchema, response, 'Proposal');
}

/**
 * Get proposal by ID
 * @throws {NotFoundError} Proposal not found
 * @throws {AuthorizationError} Not authorized to view
 */
export async function getProposalById(
  proposalId: string
): Promise<ValidatedProposal> {
  const response = await apiClient.get<Proposal>(
    PROPOSAL_ENDPOINTS.GET_BY_ID(proposalId)
  );
  return validateResponse(ProposalSchema, response, 'Proposal');
}

/**
 * Update proposal (freelancer only, must be PENDING status)
 * @throws {ValidationError} Invalid proposal data
 * @throws {NotFoundError} Proposal not found
 * @throws {AuthorizationError} Not proposal owner or wrong status
 */
export async function updateProposal(
  proposalId: string,
  data: UpdateProposalRequest
): Promise<ValidatedProposal> {
  const response = await apiClient.put<Proposal>(
    PROPOSAL_ENDPOINTS.UPDATE(proposalId),
    data
  );
  return validateResponse(ProposalSchema, response, 'Proposal');
}

/**
 * Withdraw proposal (freelancer only, must be PENDING status)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be proposal owner)
 * @throws {ValidationError} Proposal not in PENDING status
 */
export async function withdrawProposal(proposalId: string): Promise<void> {
  await apiClient.post<void>(PROPOSAL_ENDPOINTS.WITHDRAW(proposalId), {});
}

/**
 * Delete proposal (hard delete)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be proposal owner)
 * @throws {NotFoundError} Proposal not found
 */
export async function deleteProposal(proposalId: string): Promise<void> {
  await apiClient.delete<void>(PROPOSAL_ENDPOINTS.DELETE(proposalId));
}

/**
 * Accept proposal (employer only)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be job owner)
 * @throws {NotFoundError} Proposal not found
 */
export async function acceptProposal(
  proposalId: string,
  data?: AcceptProposalRequest
): Promise<Proposal> {
  return apiClient.post<Proposal>(
    PROPOSAL_ENDPOINTS.ACCEPT(proposalId),
    data || {}
  );
}

/**
 * Reject proposal (employer only)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be job owner)
 * @throws {NotFoundError} Proposal not found
 */
export async function rejectProposal(
  proposalId: string,
  data?: RejectProposalRequest
): Promise<Proposal> {
  return apiClient.post<Proposal>(
    PROPOSAL_ENDPOINTS.REJECT(proposalId),
    data || {}
  );
}

/**
 * Shortlist proposal (employer only)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be job owner)
 * @throws {NotFoundError} Proposal not found
 */
export async function shortlistProposal(proposalId: string): Promise<Proposal> {
  return apiClient.post<Proposal>(PROPOSAL_ENDPOINTS.SHORTLIST(proposalId), {});
}

/**
 * Get all proposals for a specific job (employer only)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (must be job owner)
 * @throws {NotFoundError} Job not found
 */
export async function getProposalsByJob(
  jobId: string,
  filters?: ProposalFilters
): Promise<PageResponse<Proposal>> {
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
  const url = `${PROPOSAL_ENDPOINTS.BY_JOB(jobId)}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<Proposal>>(url);
}

/**
 * Get all my proposals (freelancer)
 * @throws {AuthenticationError} Not authenticated
 */
export async function getMyProposals(
  filters?: ProposalFilters
): Promise<PageResponse<Proposal>> {
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
  const url = `${PROPOSAL_ENDPOINTS.MY_PROPOSALS}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<Proposal>>(url);
}

/**
 * Get my pending proposals (freelancer)
 * @throws {AuthenticationError} Not authenticated
 */
export async function getMyPendingProposals(
  page = 0,
  size = 20
): Promise<PageResponse<Proposal>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const url = `${PROPOSAL_ENDPOINTS.MY_PENDING}?${params}`;
  return apiClient.get<PageResponse<Proposal>>(url);
}

/**
 * Get my accepted proposals (freelancer)
 * @throws {AuthenticationError} Not authenticated
 */
export async function getMyAcceptedProposals(
  page = 0,
  size = 20
): Promise<PageResponse<Proposal>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const url = `${PROPOSAL_ENDPOINTS.MY_ACCEPTED}?${params}`;
  return apiClient.get<PageResponse<Proposal>>(url);
}

/**
 * Get my rejected proposals (freelancer)
 * @throws {AuthenticationError} Not authenticated
 */
export async function getMyRejectedProposals(
  page = 0,
  size = 20
): Promise<PageResponse<Proposal>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const url = `${PROPOSAL_ENDPOINTS.MY_REJECTED}?${params}`;
  return apiClient.get<PageResponse<Proposal>>(url);
}

/**
 * Get my active proposals (freelancer)
 * @throws {AuthenticationError} Not authenticated
 */
export async function getMyActiveProposals(
  page = 0,
  size = 20
): Promise<PageResponse<Proposal>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const url = `${PROPOSAL_ENDPOINTS.MY_ACTIVE}?${params}`;
  return apiClient.get<PageResponse<Proposal>>(url);
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
