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
  isLoading: boolean;
  error: string | null;
  selectedFolderId: string | null;

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
  isLoading: false,
  error: null,
  selectedFolderId: null,
};

export const useFavoritesStore = create<FavoritesStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchFavorites: async (request?: FavoritesRequest) => {
        set({ isLoading: true, error: null }, false, 'fetchFavorites/start');

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
            set(
              (state) => ({
                ...state,
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
                folders: [], // Initialize empty folders for now
                isLoading: false,
              }),
              false,
              'fetchFavorites/success'
            );
          } else {
            throw new Error(data.error || 'Favoriler yüklenemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Favoriler yüklenemedi',
              isLoading: false,
            },
            false,
            'fetchFavorites/error'
          );
        }
      },

      addToFavorites: async (request: AddToFavoritesRequest) => {
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
            // Refresh favorites to get updated list
            await get().fetchFavorites();
          } else {
            throw new Error(data.error || 'Favorilere eklenemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Favorilere eklenemedi',
            },
            false,
            'addToFavorites/error'
          );
        }
      },

      removeFromFavorites: async (
        itemId: string,
        itemType: 'freelancer' | 'job' | 'service'
      ) => {
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
            set(
              (state) => {
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

                return { favorites: updatedFavorites };
              },
              false,
              'removeFromFavorites/success'
            );
          } else {
            throw new Error(data.error || 'Favorilerden kaldırılamadı');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Favorilerden kaldırılamadı',
            },
            false,
            'removeFromFavorites/error'
          );
        }
      },

      createFolder: async (folder) => {
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
            set(
              (state) => ({
                favorites: {
                  ...state.favorites,
                  folders: [...state.favorites.folders, data.data],
                },
              }),
              false,
              'createFolder/success'
            );
          } else {
            throw new Error(data.error || 'Klasör oluşturulamadı');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Klasör oluşturulamadı',
            },
            false,
            'createFolder/error'
          );
        }
      },

      updateFolder: async (id: string, updates: Partial<FavoriteFolder>) => {
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
            set(
              (state) => ({
                favorites: {
                  ...state.favorites,
                  folders: state.favorites.folders.map((folder) =>
                    folder.id === id ? { ...folder, ...data.data } : folder
                  ),
                },
              }),
              false,
              'updateFolder/success'
            );
          } else {
            throw new Error(data.error || 'Klasör güncellenemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Klasör güncellenemedi',
            },
            false,
            'updateFolder/error'
          );
        }
      },

      deleteFolder: async (id: string) => {
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
            set(
              (state) => ({
                favorites: {
                  ...state.favorites,
                  folders: state.favorites.folders.filter(
                    (folder) => folder.id !== id
                  ),
                },
                selectedFolderId:
                  state.selectedFolderId === id ? null : state.selectedFolderId,
              }),
              false,
              'deleteFolder/success'
            );
          } else {
            throw new Error(data.error || 'Klasör silinemedi');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Klasör silinemedi',
            },
            false,
            'deleteFolder/error'
          );
        }
      },

      moveToFolder: async (itemId: string, folderId: string | null) => {
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
            // Refresh favorites to get updated folder counts
            await get().fetchFavorites();
          } else {
            throw new Error(data.error || 'Öğe taşınamadı');
          }
        } catch (error) {
          set(
            {
              error: error instanceof Error ? error.message : 'Öğe taşınamadı',
            },
            false,
            'moveToFolder/error'
          );
        }
      },

      setSelectedFolder: (folderId: string | null) => {
        set({ selectedFolderId: folderId }, false, 'setSelectedFolder');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'favorites-store',
    }
  )
);
