import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { SupportTicket, PaginationMeta } from '@/types';
import type {
  CreateTicketFormData,
  TicketSearchFormData,
  TicketResponseFormData,
} from '@/lib/core/validations/support';

interface SupportState {
  // Tickets
  tickets: SupportTicket[];
  ticketsLoading: boolean;
  ticketsError: string | null;
  ticketsPagination: PaginationMeta | null;

  // Current Ticket
  currentTicket: SupportTicket | null;
  currentTicketLoading: boolean;
  currentTicketError: string | null;

  // Ticket Creation
  createTicketLoading: boolean;
  createTicketError: string | null;

  // Ticket Response
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

export const useSupportStore = create<SupportState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tickets: [],
      ticketsLoading: false,
      ticketsError: null,
      ticketsPagination: null,

      currentTicket: null,
      currentTicketLoading: false,
      currentTicketError: null,

      createTicketLoading: false,
      createTicketError: null,

      responseSubmissionLoading: false,
      responseSubmissionError: null,

      // Actions
      fetchTickets: async (params) => {
        set({ ticketsLoading: true, ticketsError: null });

        try {
          const searchParams = new URLSearchParams();

          if (params?.status && params.status.length > 0) {
            params.status.forEach((status) =>
              searchParams.append('status', status)
            );
          }
          if (params?.category && params.category.length > 0) {
            params.category.forEach((category) =>
              searchParams.append('category', category)
            );
          }
          if (params?.priority && params.priority.length > 0) {
            params.priority.forEach((priority) =>
              searchParams.append('priority', priority)
            );
          }
          if (params?.dateFrom)
            searchParams.append('dateFrom', params.dateFrom);
          if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
          if (params?.search) searchParams.append('search', params.search);
          if (params?.assignedAgent)
            searchParams.append('assignedAgent', params.assignedAgent);
          if (params?.page) searchParams.append('page', String(params.page));
          if (params?.limit) searchParams.append('limit', String(params.limit));
          if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

          const response = await fetch(
            `/api/v1/support/tickets?${searchParams}`
          );
          const result = await response.json();

          if (result.success) {
            set({
              tickets: result.data,
              ticketsPagination: result.pagination,
              ticketsLoading: false,
            });
          } else {
            set({
              ticketsError:
                result.error || 'Destek talepleri yüklenirken hata oluştu',
              ticketsLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch tickets', error instanceof Error ? error : new Error(String(error)));
          set({
            ticketsError: 'Ağ hatası: Destek talepleri yüklenemedi',
            ticketsLoading: false,
          });
        }
      },

      fetchTicketById: async (id: string) => {
        set({ currentTicketLoading: true, currentTicketError: null });

        try {
          const response = await fetch(`/api/v1/support/tickets/${id}`);
          const result = await response.json();

          if (result.success) {
            set({
              currentTicket: result.data,
              currentTicketLoading: false,
            });
          } else {
            set({
              currentTicketError: result.error || 'Destek talebi bulunamadı',
              currentTicketLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch ticket by ID', error instanceof Error ? error : new Error(String(error)));
          set({
            currentTicketError: 'Ağ hatası: Destek talebi yüklenemedi',
            currentTicketLoading: false,
          });
        }
      },

      createTicket: async (data: CreateTicketFormData) => {
        set({ createTicketLoading: true, createTicketError: null });

        try {
          // Convert file attachments to the expected format
          const attachments = data.attachments
            ? await Promise.all(
                Array.from(data.attachments).map(async (file) => ({
                  name: file.name,
                  url: `/temp/${file.name}`, // In real app, upload to server first
                  size: file.size,
                }))
              )
            : undefined;

          const requestData = {
            subject: data.subject,
            description: data.description,
            category: data.category,
            priority: data.priority,
            attachments,
          };

          const response = await fetch('/api/v1/support/tickets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          const result = await response.json();

          if (result.success) {
            set({
              createTicketLoading: false,
            });

            // Refresh tickets list
            await get().fetchTickets();

            return { success: true, ticketId: result.data.id };
          } else {
            set({
              createTicketError:
                result.error || 'Destek talebi oluşturulurken hata oluştu',
              createTicketLoading: false,
            });
            return { success: false };
          }
        } catch (error) {
          logger.error(
            'Failed to create ticket', error instanceof Error ? error : new Error(String(error)));
          set({
            createTicketError: 'Ağ hatası: Destek talebi oluşturulamadı',
            createTicketLoading: false,
          });
          return { success: false };
        }
      },

      addTicketResponse: async (data: TicketResponseFormData) => {
        if (!get().currentTicket) return;

        set({ responseSubmissionLoading: true, responseSubmissionError: null });

        try {
          // Convert file attachments if any
          const attachments = data.attachments
            ? await Promise.all(
                Array.from(data.attachments).map(async (file) => ({
                  name: file.name,
                  url: `/temp/${file.name}`,
                  size: file.size,
                }))
              )
            : undefined;

          const requestData = {
            content: data.content,
            attachments,
            isPublic: data.isPublic,
          };

          const response = await fetch(
            `/api/v1/support/tickets/${data.ticketId}/responses`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            }
          );

          const result = await response.json();

          if (result.success) {
            set({
              responseSubmissionLoading: false,
            });

            // Refresh current ticket to get updated responses
            await get().refreshCurrentTicket();
          } else {
            set({
              responseSubmissionError:
                result.error || 'Yanıt gönderilirken hata oluştu',
              responseSubmissionLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to add ticket response', error instanceof Error ? error : new Error(String(error)));
          set({
            responseSubmissionError: 'Ağ hatası: Yanıt gönderilemedi',
            responseSubmissionLoading: false,
          });
        }
      },

      closeTicket: async (ticketId: string) => {
        try {
          const response = await fetch(
            `/api/v1/support/tickets/${ticketId}/close`,
            {
              method: 'POST',
            }
          );

          const result = await response.json();

          if (result.success) {
            // Update ticket status in current state
            set((state) => ({
              currentTicket:
                state.currentTicket?.id === ticketId
                  ? { ...state.currentTicket, status: 'closed' }
                  : state.currentTicket,
              tickets: state.tickets.map((ticket) =>
                ticket.id === ticketId
                  ? { ...ticket, status: 'closed' }
                  : ticket
              ),
            }));
          }
        } catch (error) {
          logger.error(
            'Failed to close ticket', error instanceof Error ? error : new Error(String(error)));
        }
      },

      refreshCurrentTicket: async () => {
        const currentTicket = get().currentTicket;
        if (currentTicket) {
          await get().fetchTicketById(currentTicket.id);
        }
      },

      clearCurrentTicket: () => {
        set({
          currentTicket: null,
          currentTicketError: null,
        });
      },

      clearError: (type) => {
        switch (type) {
          case 'tickets':
            set({ ticketsError: null });
            break;
          case 'currentTicket':
            set({ currentTicketError: null });
            break;
          case 'createTicket':
            set({ createTicketError: null });
            break;
          case 'responseSubmission':
            set({ responseSubmissionError: null });
            break;
        }
      },
    }),
    {
      name: 'support-store',
    }
  )
);
