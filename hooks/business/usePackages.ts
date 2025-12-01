import useSWR from 'swr/immutable';
import {
  ServicePackage,
  PackageFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types';
import { apiClient } from '@/lib/infrastructure/api/client';

// Typed fetchers for packages
const packageFetcher = async (
  url: string
): Promise<ApiResponse<ServicePackage>> => {
  return apiClient.get<ApiResponse<ServicePackage>>(url);
};

const packagesFetcherWithParams = async ([url, params]: readonly [
  string,
  Record<string, string>,
]): Promise<ApiResponse<PaginatedResponse<ServicePackage>>> => {
  return apiClient.get<ApiResponse<PaginatedResponse<ServicePackage>>>(
    url,
    params
  );
};

// Hook for fetching packages with pagination and filters
export function usePackages(
  page = 1,
  limit = 10,
  filters: PackageFilters = {}
) {
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    ...Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== ''
      )
    ),
  };

  const { data, error, mutate, isLoading } = useSWR(
    ['/packages', params] as const,
    packagesFetcherWithParams,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    packages: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching a single package
export function usePackage(id: string) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? `/packages/${id}` : null,
    packageFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    package: data?.data,
    isLoading,
    error,
    mutate,
  };
}

// Hook for creating a new package
export function useCreatePackage() {
  const createPackage = async (packageData: Partial<ServicePackage>) => {
    try {
      const response = await apiClient.post<ApiResponse<ServicePackage>>(
        '/packages',
        packageData
      );
      return response;
    } catch {
      throw new Error('Failed to create package');
    }
  };

  return { createPackage };
}

// Hook for updating a package
export function useUpdatePackage() {
  const updatePackage = async (
    id: string,
    packageData: Partial<ServicePackage>
  ) => {
    try {
      const response = await apiClient.put<ApiResponse<ServicePackage>>(
        `/packages/${id}`,
        packageData
      );
      return response;
    } catch {
      throw new Error('Failed to update package');
    }
  };

  return { updatePackage };
}

// Hook for deleting a package
export function useDeletePackage() {
  const deletePackage = async (id: string) => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/packages/${id}`
      );
      return response;
    } catch {
      throw new Error('Failed to delete package');
    }
  };

  return { deletePackage };
}

// Hook for freelancer's own packages
export function useMyPackages() {
  const myPackagesFetcher = async (
    url: string
  ): Promise<ApiResponse<ServicePackage[]>> => {
    return apiClient.get<ApiResponse<ServicePackage[]>>(url);
  };

  const { data, error, mutate, isLoading } = useSWR(
    '/packages/my',
    myPackagesFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    packages: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
