import React, { useCallback } from 'react';
import { useSupportStore } from '@/lib/core/store/support';
import type { SupportTicket, PaginationMeta } from '@/types';
import type {
  CreateTicketFormData,
  TicketResponseFormData,
  TicketSearchFormData,
} from '@/lib/core/validations/support';

export interface UseSupportReturn {
  // Tickets
  tickets: SupportTicket[];
  ticketsLoading: boolean;
  ticketsError: string | null;
  ticketsPagination: PaginationMeta | null;

  // Current Ticket
  currentTicket: SupportTicket | null;
  currentTicketLoading: boolean;
  currentTicketError: string | null;

  // Form Actions
  createTicketLoading: boolean;
  createTicketError: string | null;
  responseSubmissionLoading: boolean;
  responseSubmissionError: string | null;

  // Actions
  fetchTickets: (params?: TicketSearchFormData) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (
    data: CreateTicketFormData
  ) => Promise<{ success: boolean; ticketId?: string }>;
  addTicketResponse: (data: TicketResponseFormData) => Promise<void>;
  closeTicket: (ticketId: string) => Promise<void>;
  refreshCurrentTicket: () => Promise<void>;
  clearCurrentTicket: () => void;
  clearError: (
    type: 'tickets' | 'currentTicket' | 'createTicket' | 'responseSubmission'
  ) => void;
}

/**
 * Custom hook for managing support ticket operations
 *
 * Provides a clean interface to the support store with:
 * - Ticket CRUD operations
 * - Response management
 * - Search functionality
 * - File upload handling
 * - Error management
 *
 * @example
 * ```tsx
 * function SupportDashboard() {
 *   const {
 *     tickets,
 *     ticketsLoading,
 *     fetchTickets,
 *     createTicket
 *   } = useSupport();
 *
 *   useEffect(() => {
 *     fetchTickets();
 *   }, [fetchTickets]);
 *
 *   const handleCreateTicket = async (data: CreateTicketFormData) => {
 *     const result = await createTicket(data);
 *     if (result.success) {
 *       console.log('Ticket created:', result.ticketId);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {tickets.map(ticket => (
 *         <TicketCard key={ticket.id} ticket={ticket} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useSupport = (): UseSupportReturn => {
  const store = useSupportStore();

  const fetchTickets = useCallback(
    async (params?: TicketSearchFormData) => {
      await store.fetchTickets(params);
    },
    [store]
  );

  const fetchTicketById = useCallback(
    async (ticketId: string) => {
      await store.fetchTicketById(ticketId);
    },
    [store]
  );

  const createTicket = useCallback(
    async (data: CreateTicketFormData) => {
      return await store.createTicket(data);
    },
    [store]
  );

  const addTicketResponse = useCallback(
    async (data: TicketResponseFormData) => {
      await store.addTicketResponse(data);
    },
    [store]
  );

  const closeTicket = useCallback(
    async (ticketId: string) => {
      await store.closeTicket(ticketId);
    },
    [store]
  );

  const refreshCurrentTicket = useCallback(async () => {
    await store.refreshCurrentTicket();
  }, [store]);

  const clearCurrentTicket = useCallback(() => {
    store.clearCurrentTicket();
  }, [store]);

  const clearError = useCallback(
    (
      type: 'tickets' | 'currentTicket' | 'createTicket' | 'responseSubmission'
    ) => {
      store.clearError(type);
    },
    [store]
  );

  return {
    // Tickets
    tickets: store.tickets,
    ticketsLoading: store.ticketsLoading,
    ticketsError: store.ticketsError,
    ticketsPagination: store.ticketsPagination,

    // Current Ticket
    currentTicket: store.currentTicket,
    currentTicketLoading: store.currentTicketLoading,
    currentTicketError: store.currentTicketError,

    // Form Actions
    createTicketLoading: store.createTicketLoading,
    createTicketError: store.createTicketError,
    responseSubmissionLoading: store.responseSubmissionLoading,
    responseSubmissionError: store.responseSubmissionError,

    // Actions
    fetchTickets,
    fetchTicketById,
    createTicket,
    addTicketResponse,
    closeTicket,
    refreshCurrentTicket,
    clearCurrentTicket,
    clearError,
  };
};

/**
 * Hook for managing a specific support ticket
 * Automatically fetches and manages a single ticket
 *
 * @param ticketId - The ID of the ticket to manage
 * @param autoFetch - Whether to automatically fetch the ticket on mount
 */
export const useSupportTicket = (ticketId: string, autoFetch = true) => {
  const {
    currentTicket,
    currentTicketLoading,
    currentTicketError,
    fetchTicketById,
    addTicketResponse,
    closeTicket,
    clearCurrentTicket,
    clearError,
  } = useSupport();

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    await fetchTicketById(ticketId);
  }, [ticketId, fetchTicketById]);

  // Auto-fetch on mount or ticketId change
  React.useEffect(() => {
    if (autoFetch && ticketId) {
      loadTicket();
    }

    // Cleanup on unmount
    return () => {
      clearCurrentTicket();
    };
  }, [ticketId, autoFetch, loadTicket, clearCurrentTicket]);

  return {
    ticket: currentTicket,
    loading: currentTicketLoading,
    error: currentTicketError,
    reload: loadTicket,
    addResponse: addTicketResponse,
    closeTicket: () => closeTicket(ticketId),
    clearError: () => clearError('currentTicket'),
  };
};

/**
 * Hook for support ticket search functionality
 * Provides advanced filtering and search capabilities
 */
export const useSupportSearch = () => {
  const {
    tickets,
    ticketsLoading,
    ticketsError,
    ticketsPagination,
    fetchTickets,
    clearError,
  } = useSupport();

  const [filters, setFilters] = React.useState<Partial<TicketSearchFormData>>(
    {}
  );

  const search = useCallback(
    async (searchData: TicketSearchFormData) => {
      setFilters(searchData);
      await fetchTickets(searchData);
    },
    [fetchTickets]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<TicketSearchFormData>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      // Convert partial filters to full search data with defaults
      const searchData: TicketSearchFormData = {
        page: 1,
        limit: 20,
        sortBy: 'created',
        ...updatedFilters,
      };

      fetchTickets(searchData);
    },
    [filters, fetchTickets]
  );

  const resetFilters = useCallback(() => {
    setFilters({});
    fetchTickets();
  }, [fetchTickets]);

  return {
    results: tickets,
    loading: ticketsLoading,
    error: ticketsError,
    pagination: ticketsPagination,
    filters,
    search,
    updateFilters,
    resetFilters,
    clearError: () => clearError('tickets'),
  };
};

/**
 * Hook for file upload functionality in support context
 * Handles file validation without actual upload
 */
export const useSupportFileUpload = () => {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Array<{
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }>
  >([]);

  const validateFile = useCallback((file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: "Dosya boyutu 10MB'dan büyük olamaz" };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Desteklenmeyen dosya formatı' };
    }

    return { valid: true };
  }, []);

  const simulateUpload = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setUploadProgress(0);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      const fileId = Date.now().toString();
      const uploadedFile = {
        id: fileId,
        name: file.name,
        url: `/uploads/${fileId}-${file.name}`,
        size: file.size,
        type: file.type,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      return { success: true, url: uploadedFile.url, fileId };
    },
    [validateFile]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setUploadedFiles([]);
  }, []);

  return {
    upload: simulateUpload,
    validateFile,
    removeFile,
    resetUpload,
    uploadProgress,
    uploadedFiles,
    loading: uploadProgress > 0 && uploadProgress < 100,
    error: null,
  };
};
