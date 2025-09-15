import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  FavoritesRequest,
  FavoritesResponse,
  AddToFavoritesRequest,
  FavoriteFolder,
  FavoriteItem,
  Freelancer,
  Job,
  ServicePackage,
} from '@/types';

interface FavoritesStore {
  // State properties
  favorites: {
    freelancers: Freelancer[];
    jobs: Job[];
    services: ServicePackage[];
    folders: FavoriteFolder[];
  };
  favoriteItems: FavoriteItem[];
  selectedFolderId: string | null;

  // Base async state
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;

  // Actions
  fetchFavorites: (request?: FavoritesRequest) => Promise<void>;
  addToFavorites: (request: AddToFavoritesRequest) => Promise<void>;
  removeFromFavorites: (
    itemId: string,
    itemType: 'freelancer' | 'job' | 'service'
  ) => Promise<void>;
  createFolder: (
    folder: Omit<FavoriteFolder, 'id' | 'itemCount' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateFolder: (id: string, updates: Partial<FavoriteFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveToFolder: (itemId: string, folderId: string | null) => Promise<void>;
  setSelectedFolder: (folderId: string | null) => void;

  // Base actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  favorites: {
    freelancers: [],
    jobs: [],
    services: [],
    folders: [],
  },
  favoriteItems: [],
  selectedFolderId: null,
  isLoading: false,
  error: null,
  lastFetch: null,
};

export const useFavoritesStore = create<FavoritesStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Base actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },

      fetchFavorites: async (request?: FavoritesRequest) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (request?.type) params.append('type', request.type);
          if (request?.folderId) params.append('folderId', request.folderId);
          if (request?.page) params.append('page', request.page.toString());
          if (request?.limit) params.append('limit', request.limit.toString());

          const response = await fetch(
            `/api/v1/favorites?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: FavoritesResponse = await response.json();

          if (data.success && data.data) {
            set({
              favorites: {
                freelancers:
                  data.data
                    ?.filter((item) => item.type === 'freelancer')
                    .map((item) => item.item as Freelancer)
                    .filter(Boolean) || [],
                jobs:
                  data.data
                    ?.filter((item) => item.type === 'job')
                    .map((item) => item.item as Job)
                    .filter(Boolean) || [],
                services:
                  data.data
                    ?.filter((item) => item.type === 'package')
                    .map((item) => item.item as ServicePackage)
                    .filter(Boolean) || [],
                folders: [],
              },
              isLoading: false,
              lastFetch: new Date().toISOString(),
            });
          } else {
            throw new Error(data.error || 'Favoriler yüklenemedi');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Favoriler yüklenemedi',
            isLoading: false,
          });
        }
      },

      addToFavorites: async (request: AddToFavoritesRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/v1/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set({ isLoading: false });
            // Refresh favorites to get updated list
            await get().fetchFavorites();
          } else {
            throw new Error(data.error || 'Favorilere eklenemedi');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Favorilere eklenemedi',
            isLoading: false,
          });
        }
      },

      removeFromFavorites: async (
        itemId: string,
        itemType: 'freelancer' | 'job' | 'service'
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/favorites/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemType }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            // Update state immediately for better UX
            set((state) => {
              const updatedFavorites = { ...state.favorites };

              if (itemType === 'freelancer') {
                updatedFavorites.freelancers =
                  updatedFavorites.freelancers.filter((f) => f.id !== itemId);
              } else if (itemType === 'job') {
                updatedFavorites.jobs = updatedFavorites.jobs.filter(
                  (j) => j.id !== itemId
                );
              } else if (itemType === 'service') {
                updatedFavorites.services = updatedFavorites.services.filter(
                  (s) => s.id !== itemId
                );
              }

              return { favorites: updatedFavorites, isLoading: false };
            });
          } else {
            throw new Error(data.error || 'Favorilerden kaldırılamadı');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Favorilerden kaldırılamadı',
            isLoading: false,
          });
        }
      },

      createFolder: async (folder) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/v1/favorites/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(folder),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            // Add new folder to state
            set((state) => ({
              favorites: {
                ...state.favorites,
                folders: [...state.favorites.folders, data.data],
              },
              isLoading: false,
            }));
          } else {
            throw new Error(data.error || 'Klasör oluşturulamadı');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Klasör oluşturulamadı',
            isLoading: false,
          });
        }
      },

      updateFolder: async (id: string, updates: Partial<FavoriteFolder>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/favorites/folders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            // Update folder in state
            set((state) => ({
              favorites: {
                ...state.favorites,
                folders: state.favorites.folders.map((folder) =>
                  folder.id === id ? { ...folder, ...data.data } : folder
                ),
              },
              isLoading: false,
            }));
          } else {
            throw new Error(data.error || 'Klasör güncellenemedi');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Klasör güncellenemedi',
            isLoading: false,
          });
        }
      },

      deleteFolder: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/favorites/folders/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            // Remove folder from state
            set((state) => ({
              favorites: {
                ...state.favorites,
                folders: state.favorites.folders.filter(
                  (folder) => folder.id !== id
                ),
              },
              selectedFolderId:
                state.selectedFolderId === id ? null : state.selectedFolderId,
              isLoading: false,
            }));
          } else {
            throw new Error(data.error || 'Klasör silinemedi');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Klasör silinemedi',
            isLoading: false,
          });
        }
      },

      moveToFolder: async (itemId: string, folderId: string | null) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/favorites/${itemId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set({ isLoading: false });
            // Refresh favorites to get updated folder counts
            await get().fetchFavorites();
          } else {
            throw new Error(data.error || 'Öğe taşınamadı');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Öğe taşınamadı',
            isLoading: false,
          });
        }
      },

      setSelectedFolder: (folderId: string | null) => {
        set({ selectedFolderId: folderId });
      },
    }),
    {
      name: 'favorites-store',
    }
  )
);
