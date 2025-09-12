'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useFavoritesStore } from '@/lib/store';
import {
  FavoriteFolder,
  AddToFavoritesRequest,
  Freelancer,
  Job,
  ServicePackage,
} from '@/types';

export function useFavorites() {
  const store = useFavoritesStore();

  // Add item to favorites
  const addToFavorites = useCallback(
    async (request: AddToFavoritesRequest) => {
      await store.addToFavorites(request);
    },
    [store]
  );

  // Remove from favorites
  const removeFromFavorites = useCallback(
    async (itemId: string, itemType: 'freelancer' | 'job' | 'service') => {
      await store.removeFromFavorites(itemId, itemType);
    },
    [store]
  );

  // Create new folder
  const createFolder = useCallback(
    async (
      folder: Omit<
        FavoriteFolder,
        'id' | 'itemCount' | 'createdAt' | 'updatedAt'
      >
    ) => {
      await store.createFolder(folder);
    },
    [store]
  );

  // Update folder
  const updateFolder = useCallback(
    async (folderId: string, updates: Partial<FavoriteFolder>) => {
      await store.updateFolder(folderId, updates);
    },
    [store]
  );

  // Delete folder
  const deleteFolder = useCallback(
    async (folderId: string) => {
      await store.deleteFolder(folderId);
    },
    [store]
  );

  // Move item to folder
  const moveToFolder = useCallback(
    async (itemId: string, folderId: string | null) => {
      await store.moveToFolder(itemId, folderId);
    },
    [store]
  );

  // Toggle favorite status for freelancer
  const toggleFreelancerFavorite = useCallback(
    async (freelancer: Freelancer) => {
      const isFavorited = store.favorites.freelancers.some(
        (f) => f.id === freelancer.id
      );

      if (isFavorited) {
        await removeFromFavorites(freelancer.id, 'freelancer');
        return false;
      } else {
        await addToFavorites({
          itemType: 'freelancer',
          itemId: freelancer.id,
          folderId: store.selectedFolderId || undefined,
        });
        return true;
      }
    },
    [
      store.favorites.freelancers,
      store.selectedFolderId,
      addToFavorites,
      removeFromFavorites,
    ]
  );

  // Toggle favorite status for job
  const toggleJobFavorite = useCallback(
    async (job: Job) => {
      const isFavorited = store.favorites.jobs.some((j) => j.id === job.id);

      if (isFavorited) {
        await removeFromFavorites(job.id, 'job');
        return false;
      } else {
        await addToFavorites({
          itemType: 'job',
          itemId: job.id,
          folderId: store.selectedFolderId || undefined,
        });
        return true;
      }
    },
    [
      store.favorites.jobs,
      store.selectedFolderId,
      addToFavorites,
      removeFromFavorites,
    ]
  );

  // Toggle favorite status for service
  const toggleServiceFavorite = useCallback(
    async (service: ServicePackage) => {
      const isFavorited = store.favorites.services.some(
        (s) => s.id === service.id
      );

      if (isFavorited) {
        await removeFromFavorites(service.id, 'service');
        return false;
      } else {
        await addToFavorites({
          itemType: 'service',
          itemId: service.id,
          folderId: store.selectedFolderId || undefined,
        });
        return true;
      }
    },
    [
      store.favorites.services,
      store.selectedFolderId,
      addToFavorites,
      removeFromFavorites,
    ]
  );

  // Check if item is favorited
  const isFreelancerFavorited = useCallback(
    (freelancerId: string) => {
      return store.favorites.freelancers.some((f) => f.id === freelancerId);
    },
    [store.favorites.freelancers]
  );

  const isJobFavorited = useCallback(
    (jobId: string) => {
      return store.favorites.jobs.some((j) => j.id === jobId);
    },
    [store.favorites.jobs]
  );

  const isServiceFavorited = useCallback(
    (serviceId: string) => {
      return store.favorites.services.some((s) => s.id === serviceId);
    },
    [store.favorites.services]
  );

  // Search favorites
  const searchFreelancers = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return store.favorites.freelancers.filter(
        (freelancer) =>
          freelancer.firstName.toLowerCase().includes(lowerQuery) ||
          freelancer.lastName.toLowerCase().includes(lowerQuery) ||
          (freelancer.title &&
            freelancer.title.toLowerCase().includes(lowerQuery))
      );
    },
    [store.favorites.freelancers]
  );

  const searchJobs = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return store.favorites.jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.description.toLowerCase().includes(lowerQuery)
      );
    },
    [store.favorites.jobs]
  );

  const searchServices = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return store.favorites.services.filter(
        (service) =>
          service.title.toLowerCase().includes(lowerQuery) ||
          service.description.toLowerCase().includes(lowerQuery)
      );
    },
    [store.favorites.services]
  );

  // Get statistics
  const stats = useMemo(() => {
    const freelancersCount = store.favorites.freelancers.length;
    const jobsCount = store.favorites.jobs.length;
    const servicesCount = store.favorites.services.length;
    const foldersCount = store.favorites.folders.length;
    const totalFavorites = freelancersCount + jobsCount + servicesCount;

    return {
      totalFavorites,
      freelancersCount,
      jobsCount,
      servicesCount,
      foldersCount,
    };
  }, [store.favorites]);

  // Load favorites on mount if empty
  useEffect(() => {
    const hasNoFavorites =
      store.favorites.freelancers.length === 0 &&
      store.favorites.jobs.length === 0 &&
      store.favorites.services.length === 0;

    if (hasNoFavorites && !store.isLoading) {
      store.fetchFavorites();
    }
  }, [store.favorites, store.isLoading, store]);

  return {
    // State
    favoriteFreelancers: store.favorites.freelancers,
    favoriteJobs: store.favorites.jobs,
    favoriteServices: store.favorites.services,
    favoriteFolders: store.favorites.folders,
    favoriteItems: store.favoriteItems,
    isLoading: store.isLoading,
    error: store.error,
    selectedFolderId: store.selectedFolderId,

    // Statistics
    stats,

    // Toggle actions
    toggleFreelancerFavorite,
    toggleJobFavorite,
    toggleServiceFavorite,

    // Check actions
    isFreelancerFavorited,
    isJobFavorited,
    isServiceFavorited,

    // Folder management
    createFolder,
    updateFolder,
    deleteFolder,
    moveToFolder,
    setSelectedFolder: store.setSelectedFolder,

    // Search actions
    searchFreelancers,
    searchJobs,
    searchServices,

    // Utility actions
    fetchFavorites: store.fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    clearError: store.clearError,
    reset: store.reset,
  };
}
