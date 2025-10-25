import { PortfolioItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface CreatePortfolioRequest {
  title: string;
  description: string;
  url?: string;
  completedAt: string; // ISO date string
  category?: string;
  client?: string;
  skills?: string[];
  isPublic?: boolean;
}

export interface UpdatePortfolioRequest {
  title?: string;
  description?: string;
  url?: string;
  completedAt?: string;
  category?: string;
  client?: string;
  skills?: string[];
  isPublic?: boolean;
}

export interface PortfolioImageResponse {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface PortfolioResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  url?: string;
  completedAt: string;
  category?: string;
  client?: string;
  skills?: string[];
  images: PortfolioImageResponse[];
  displayOrder: number;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new portfolio item
 */
export async function createPortfolio(
  data: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/portfolios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send httpOnly cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create portfolio');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update an existing portfolio item
 */
export async function updatePortfolio(
  portfolioId: string,
  data: UpdatePortfolioRequest
): Promise<PortfolioResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/${portfolioId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update portfolio');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a portfolio item
 */
export async function deletePortfolio(portfolioId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/${portfolioId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete portfolio');
  }
}

/**
 * Get portfolio item by ID
 */
export async function getPortfolio(
  portfolioId: string
): Promise<PortfolioResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/${portfolioId}`,
    {
      cache: 'no-cache',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch portfolio');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get user's portfolio items
 */
export async function getUserPortfolio(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: PortfolioResponse[]; totalElements: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/user/${userId}?page=${page}&size=${size}`,
    {
      cache: 'no-cache',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch portfolio');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get my portfolio items (authenticated user)
 */
export async function getMyPortfolio(): Promise<PortfolioResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/my-portfolio`,
    {
      cache: 'no-cache',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch portfolio');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Reorder portfolio items
 */
export async function reorderPortfolio(portfolioIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(portfolioIds),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reorder portfolio');
  }
}

/**
 * Upload image to portfolio
 */
export async function uploadPortfolioImage(
  portfolioId: string,
  file: File,
  isPrimary: boolean = false
): Promise<PortfolioImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPrimary', isPrimary.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/${portfolioId}/images`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete portfolio image
 */
export async function deletePortfolioImage(
  portfolioId: string,
  imageId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/portfolios/${portfolioId}/images/${imageId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete image');
  }
}

/**
 * Convert PortfolioResponse to PortfolioItem type
 */
export function convertToPortfolioItem(
  response: PortfolioResponse
): PortfolioItem {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    images: response.images.map((img) => img.imageUrl),
    url: response.url,
    skills: response.skills || [],
    completedAt: response.completedAt,
    imageUrl: response.images[0]?.imageUrl,
    image: response.images[0]?.imageUrl,
    tags: response.skills,
    category: response.category,
    client: response.client,
    createdAt: response.createdAt,
    techStack: response.skills,
    isPrivate: !response.isPublic,
    isArchived: false,
  };
}
