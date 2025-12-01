import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Order,
  OrderTimeline,
  OrdersResponse,
  OrderUpdate,
  OrderDispute,
  PaginationMeta,
} from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

interface OrderFilters {
  status?: string;
  buyerId?: string;
  freelancerId?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface OrderState {
  // Data
  orders: Order[];
  currentOrder: Order | null;
  orderTimelines: Record<string, OrderTimeline[]>;
  timeline: OrderTimeline[];

  // UI State
  isLoadingOrders: boolean;
  isLoadingTimeline: boolean;
  isLoadingOrder: boolean;
  isUpdatingOrder: boolean;
  filters: OrderFilters;

  // Pagination
  pagination: PaginationMeta | null;

  // Statistics
  statistics: {
    total: number;
    active: number;
    completed: number;
    disputed: number;
    cancelled: number;
    totalValue: number;
    avgCompletionTime: number;
    successRate: number;
  } | null;

  // Errors
  error: string | null;
}

interface OrderActions {
  // Order management
  loadOrders: (filters?: OrderFilters) => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  loadOrder: (orderId: string) => Promise<void>;
  refreshOrder: (orderId: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;

  // Order updates
  updateOrderStatus: (
    orderId: string,
    status: string,
    note?: string
  ) => Promise<void>;
  addOrderUpdate: (orderId: string, update: OrderUpdate) => Promise<void>;
  updateMilestone: (
    orderId: string,
    milestoneId: string,
    status: string,
    note?: string
  ) => Promise<void>;

  // Timeline
  loadOrderTimeline: (orderId: string) => Promise<void>;
  addTimelineEntry: (orderId: string, entry: Omit<OrderTimeline, 'id'>) => void;

  // Disputes
  createDispute: (
    orderId: string,
    dispute: Omit<OrderDispute, 'id' | 'createdAt' | 'status'>
  ) => Promise<void>;

  // Statistics
  loadStatistics: (
    userId?: string,
    role?: 'employer' | 'freelancer'
  ) => Promise<void>;

  // Filters
  setFilters: (filters: OrderFilters) => void;
  clearFilters: () => void;

  // Utility
  clearError: () => void;
  resetState: () => void;

  // Real-time updates
  handleOrderUpdate: (order: Order) => void;
  handleTimelineUpdate: (orderId: string, timeline: OrderTimeline) => void;
  handleStatusChange: (orderId: string, status: string) => void;
  updateOrderMilestone: (
    milestoneId: string,
    data: { status?: string; feedback?: string }
  ) => Promise<void>;
}

type OrderStore = OrderState & OrderActions;

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  orderTimelines: {},
  timeline: [],
  isLoadingOrders: false,
  isLoadingOrder: false,
  isLoadingTimeline: false,
  isUpdatingOrder: false,
  filters: {},
  pagination: null,
  statistics: null,
  error: null,
};

export const useOrderStore = create<OrderStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Order management
      loadOrders: async (filters = {}) => {
        set((state) => {
          state.isLoadingOrders = true;
          state.error = null;
          state.filters = filters;
        });

        try {
          const searchParams = new URLSearchParams();

          // Add filters to search params
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (key === 'dateRange' && typeof value === 'object') {
                searchParams.append('startDate', value.start);
                searchParams.append('endDate', value.end);
              } else {
                searchParams.append(key, String(value));
              }
            }
          });

          // Build the URL with params
          const queryString = searchParams.toString();
          const url = queryString
            ? `/api/orders?${queryString}`
            : '/api/orders';

          logger.debug('Orders Store: Loading orders', { url, filters });

          // Authorization token will be sent via httpOnly cookie automatically
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          const response = await fetch(url, {
            headers,
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData?.error?.message ||
                `Failed to load orders: ${response.status}`
            );
          }

          const data: OrdersResponse = await response.json();

          logger.debug('Orders Store: Orders loaded', {
            count: data.data?.length ?? 0,
          });

          set((state) => {
            state.orders = data.data || [];
            state.pagination = data.meta || null;
            state.isLoadingOrders = false;
          });
        } catch (error) {
          logger.error('Orders Store: Load orders error', error as Error, {
            store: 'OrdersStore',
            operation: 'loadOrders',
          });
          set((state) => {
            // Set empty data instead of keeping old data on error
            state.orders = [];
            state.error =
              error instanceof Error
                ? error.message
                : 'Failed to fetch orders from backend';
            state.isLoadingOrders = false;
          });
          // Don't throw - let the UI handle the error state gracefully
        }
      },

      loadMoreOrders: async () => {
        const { pagination, filters } = get();
        if (!pagination?.hasNext) return;

        set((state) => {
          state.isLoadingOrders = true;
        });

        try {
          const searchParams = new URLSearchParams();
          searchParams.append('page', String(pagination.page + 1));
          searchParams.append('pageSize', String(pagination.pageSize));

          // Add existing filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (key === 'dateRange' && typeof value === 'object') {
                searchParams.append('startDate', value.start);
                searchParams.append('endDate', value.end);
              } else {
                searchParams.append(key, String(value));
              }
            }
          });

          const response = await fetch(
            `/api/orders?${searchParams.toString()}`
          );
          if (!response.ok) throw new Error('Failed to load more orders');

          const data: OrdersResponse = await response.json();

          set((state) => {
            if (data.data) {
              state.orders.push(...data.data);
            }
            state.pagination = data.meta || null;
            state.isLoadingOrders = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingOrders = false;
          });
        }
      },

      loadOrder: async (orderId) => {
        set((state) => {
          state.isLoadingOrder = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) throw new Error('Failed to load order');

          const { data: order } = await response.json();

          set((state) => {
            state.currentOrder = order;

            // Update order in list if it exists
            const orderIndex = state.orders.findIndex((o) => o.id === orderId);
            if (orderIndex !== -1) {
              state.orders[orderIndex] = order;
            }

            // Store timeline if available
            if (order.timeline) {
              state.orderTimelines[orderId] = order.timeline;
            }

            state.isLoadingOrder = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isLoadingOrder = false;
          });
        }
      },

      refreshOrder: async (orderId) => {
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) throw new Error('Failed to refresh order');

          const { data: order } = await response.json();

          set((state) => {
            // Update current order if it matches
            if (state.currentOrder?.id === orderId) {
              state.currentOrder = order;
            }

            // Update order in list
            const orderIndex = state.orders.findIndex((o) => o.id === orderId);
            if (orderIndex !== -1) {
              state.orders[orderIndex] = order;
            }

            // Update timeline
            if (order.timeline) {
              state.orderTimelines[orderId] = order.timeline;
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },

      setCurrentOrder: (order) => {
        set((state) => {
          state.currentOrder = order;
        });
      },

      // Order updates
      updateOrderStatus: async (orderId, status, note) => {
        set((state) => {
          state.isUpdatingOrder = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, note }),
          });

          if (!response.ok) throw new Error('Failed to update order status');

          const { data: updatedOrder } = await response.json();

          set((state) => {
            // Update current order
            if (state.currentOrder?.id === orderId) {
              state.currentOrder = updatedOrder;
            }

            // Update order in list
            const orderIndex = state.orders.findIndex((o) => o.id === orderId);
            if (orderIndex !== -1) {
              state.orders[orderIndex] = updatedOrder;
            }

            // Update timeline
            if (updatedOrder.timeline) {
              state.orderTimelines[orderId] = updatedOrder.timeline;
            }

            state.isUpdatingOrder = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isUpdatingOrder = false;
          });
        }
      },

      addOrderUpdate: async (orderId, update) => {
        set((state) => {
          state.isUpdatingOrder = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/orders/${orderId}/updates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
          });

          if (!response.ok) throw new Error('Failed to add order update');

          // Refresh the order to get latest state
          await get().refreshOrder(orderId);

          set((state) => {
            state.isUpdatingOrder = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isUpdatingOrder = false;
          });
        }
      },

      updateMilestone: async (orderId, milestoneId, status, note) => {
        set((state) => {
          state.isUpdatingOrder = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/orders/${orderId}/milestones/${milestoneId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, note }),
            }
          );

          if (!response.ok) throw new Error('Failed to update milestone');

          const { data: updatedOrder } = await response.json();

          set((state) => {
            // Update current order
            if (state.currentOrder?.id === orderId) {
              state.currentOrder = updatedOrder;
            }

            // Update order in list
            const orderIndex = state.orders.findIndex((o) => o.id === orderId);
            if (orderIndex !== -1) {
              state.orders[orderIndex] = updatedOrder;
            }

            // Update timeline
            if (updatedOrder.timeline) {
              state.orderTimelines[orderId] = updatedOrder.timeline;
            }

            state.isUpdatingOrder = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isUpdatingOrder = false;
          });
        }
      },

      // Timeline
      loadOrderTimeline: async (orderId) => {
        try {
          const response = await fetch(`/api/orders/${orderId}/timeline`);
          if (!response.ok) throw new Error('Failed to load timeline');

          const { data: timeline } = await response.json();

          set((state) => {
            state.orderTimelines[orderId] = timeline;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },

      addTimelineEntry: (orderId, entry) => {
        set((state) => {
          if (!state.orderTimelines[orderId]) {
            state.orderTimelines[orderId] = [];
          }

          const newEntry: OrderTimeline = {
            ...entry,
            id: `timeline-${Date.now()}-${Math.random()}`,
          };

          state.orderTimelines[orderId].push(newEntry);

          // Sort by timestamp (newest first)
          state.orderTimelines[orderId].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      },

      // Disputes
      createDispute: async (orderId, dispute) => {
        set((state) => {
          state.isUpdatingOrder = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/orders/${orderId}/dispute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dispute),
          });

          if (!response.ok) throw new Error('Failed to create dispute');

          // Refresh the order to get latest state
          await get().refreshOrder(orderId);

          set((state) => {
            state.isUpdatingOrder = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
            state.isUpdatingOrder = false;
          });
        }
      },

      // Statistics
      loadStatistics: async (userId, role) => {
        try {
          const searchParams = new URLSearchParams();
          if (userId) searchParams.append('userId', userId);
          if (role) searchParams.append('role', role);

          const response = await fetch(
            `/api/orders/statistics?${searchParams.toString()}`
          );
          if (!response.ok) throw new Error('Failed to load statistics');

          const { data: statistics } = await response.json();

          set((state) => {
            state.statistics = statistics;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Unknown error';
          });
        }
      },

      // Filters
      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },

      // Utility
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      resetState: () => {
        set(() => ({ ...initialState }));
      },

      // Real-time updates
      handleOrderUpdate: (order) => {
        set((state) => {
          // Update current order if it matches
          if (state.currentOrder?.id === order.id) {
            state.currentOrder = order;
          }

          // Update order in list
          const orderIndex = state.orders.findIndex((o) => o.id === order.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = order;
          } else {
            // Add new order if not found (e.g., new order created)
            state.orders.unshift(order);
          }

          // Update timeline if available
          if (order.timeline) {
            state.orderTimelines[order.id] = order.timeline;
          }
        });
      },

      handleTimelineUpdate: (orderId, timeline) => {
        set((state) => {
          if (!state.orderTimelines[orderId]) {
            state.orderTimelines[orderId] = [];
          }

          // Check if timeline entry already exists
          const existingIndex = state.orderTimelines[orderId].findIndex(
            (t) => t.id === timeline.id
          );
          if (existingIndex !== -1) {
            state.orderTimelines[orderId][existingIndex] = timeline;
          } else {
            state.orderTimelines[orderId].push(timeline);
          }

          // Sort by timestamp (newest first)
          state.orderTimelines[orderId].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      },

      handleStatusChange: (orderId, status) => {
        set((state) => {
          const validStatuses = [
            'pending',
            'processing',
            'completed',
            'canceled',
            'refunded',
            'in_progress',
            'under_review',
            'disputed',
          ] as const;
          const orderStatus = validStatuses.includes(
            status as (typeof validStatuses)[number]
          )
            ? (status as (typeof validStatuses)[number])
            : 'pending';

          // Update current order status
          if (state.currentOrder?.id === orderId) {
            state.currentOrder.status = orderStatus;
          }

          // Update order in list
          const orderIndex = state.orders.findIndex((o) => o.id === orderId);
          if (orderIndex !== -1) {
            state.orders[orderIndex].status = orderStatus;
          }
        });
      },

      updateOrderMilestone: async (
        milestoneId: string,
        data: { status?: string; feedback?: string }
      ) => {
        try {
          // Real API call to update milestone
          const response = await fetch(
            `/api/v1/orders/milestones/${milestoneId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(data),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update milestone');
          }

          await response.json();

          // Update milestone in current order
          set((state) => {
            if (state.currentOrder?.milestones) {
              const milestoneIndex = state.currentOrder.milestones.findIndex(
                (m) => m.id === milestoneId
              );
              if (milestoneIndex !== -1 && data.status) {
                state.currentOrder.milestones[milestoneIndex].status =
                  data.status as
                    | 'pending'
                    | 'in_progress'
                    | 'completed'
                    | 'cancelled'
                    | 'requires_approval'
                    | 'rejected';
              }
            }
          });
        } catch (error) {
          logger.error(
            'Error updating milestone',
            error instanceof Error ? error : new Error(String(error))
          );
          throw error;
        }
      },
    })),
    {
      name: 'order-store',
      partialize: (state) => ({
        orders: state.orders,
        orderTimelines: state.orderTimelines,
        filters: state.filters,
        statistics: state.statistics,
      }),
    }
  )
);
