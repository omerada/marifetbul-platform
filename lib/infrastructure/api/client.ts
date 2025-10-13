// Base API client for making HTTP requests
class ApiClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    // Use environment variable or fallback to Next.js proxy in development
    this.baseURL =
      baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
        ? '/api/v1'
        : 'http://localhost:8080/api/v1');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // IMPORTANT: Include httpOnly cookies in all requests
      ...options,
    };

    // NOTE: Authentication is now handled by httpOnly cookies
    // No need to manually add Authorization header
    // Cookies are automatically sent with credentials: 'include'

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Generic fetcher for SWR
export const fetcher = async (url: string) => {
  return apiClient.get(url);
};

// Fetcher with params
export const fetcherWithParams = async ([url, params]: [
  string,
  Record<string, string>,
]) => {
  return apiClient.get(url, params);
};
