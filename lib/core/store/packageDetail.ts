import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PackageDetail, ServicePackage, Review } from '@/types';
import { OrderFormData } from '@/lib/core/validations/details';
import { logger } from '@/lib/shared/utils/logger';

interface PackageDetailStore {
  // State properties
  currentPackage: PackageDetail | ServicePackage | null;
  reviews: Review[];
  isLoading: boolean;
  isOrdering: boolean;
  error: string | null;
  selectedTier: 'basic' | 'standard' | 'premium';
  selectedAddOns: string[];
  customizations: {
    requirements: string;
    additionalInfo: string;
  };

  // Actions
  fetchPackageDetail: (packageId: string) => Promise<void>;
  fetchReviews: (
    packageId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  createOrder: (orderData: OrderFormData) => Promise<string>; // Returns order ID
  setSelectedTier: (tier: 'basic' | 'standard' | 'premium') => void;
  toggleAddOn: (addOnId: string) => void;
  updateCustomizations: (
    customizations: Partial<{
      requirements: string;
      additionalInfo: string;
    }>
  ) => void;
  calculateTotal: () => number;
  calculateDeliveryTime: () => number;
  clearError: () => void;
  clearPackageDetail: () => void;
}

// Type guard to check if package is PackageDetail
function isPackageDetail(
  pkg: PackageDetail | ServicePackage
): pkg is PackageDetail {
  return 'pricing' in pkg && 'addOns' in pkg;
}

export const usePackageDetailStore = create<PackageDetailStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentPackage: null,
      reviews: [],
      isLoading: false,
      isOrdering: false,
      error: null,
      selectedTier: 'basic',
      selectedAddOns: [],
      customizations: {
        requirements: '',
        additionalInfo: '',
      },

      // Actions
      fetchPackageDetail: async (packageId: string) => {
        set(
          { isLoading: true, error: null },
          false,
          'packageDetail/fetchStart'
        );

        try {
          const response = await fetch(`/api/packages/${packageId}`);
          const data = await response.json();

          if (data.success) {
            set(
              {
                currentPackage: data.data,
                reviews: data.data.detailedReviews || [],
                isLoading: false,
              },
              false,
              'packageDetail/fetchSuccess'
            );
          } else {
            set(
              {
                error: data.error || 'Paket detayları yüklenemedi',
                isLoading: false,
              },
              false,
              'packageDetail/fetchError'
            );
          }
        } catch (error) {
          logger.error(
            'Package detail fetch error',
            error instanceof Error ? error : new Error(String(error))
          );
          set(
            { error: 'Paket detayları yüklenemedi', isLoading: false },
            false,
            'packageDetail/fetchError'
          );
        }
      },

      fetchReviews: async (packageId: string, page = 1, limit = 5) => {
        try {
          const response = await fetch(
            `/api/packages/${packageId}/reviews?page=${page}&limit=${limit}`
          );
          const data = await response.json();

          if (data.success) {
            set(
              { reviews: data.data },
              false,
              'packageDetail/reviewsFetchSuccess'
            );
          } else {
            logger.error(
              'Failed to fetch reviews',
              new Error(data.error || 'Unknown error')
            );
          }
        } catch (error) {
          logger.error(
            'Reviews fetch error',
            error instanceof Error ? error : new Error(String(error))
          );
        }
      },

      createOrder: async (orderData: OrderFormData) => {
        set(
          { isOrdering: true, error: null },
          false,
          'packageDetail/orderStart'
        );

        try {
          const token =
            typeof window !== 'undefined'
              ? localStorage.getItem('auth_token')
              : null;
          const response = await fetch(
            `/api/packages/${orderData.packageId}/orders`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(orderData),
            }
          );

          const data = await response.json();

          if (data.success) {
            set({ isOrdering: false }, false, 'packageDetail/orderSuccess');

            logger.info('Order created successfully', {
              orderId: data.data.id,
            });
            return data.data.id;
          } else {
            set(
              {
                error: data.error || 'Sipariş oluşturulamadı',
                isOrdering: false,
              },
              false,
              'packageDetail/orderError'
            );
            throw new Error(data.error);
          }
        } catch (error) {
          logger.error(
            'Order creation error',
            error instanceof Error ? error : new Error(String(error))
          );
          set(
            { error: 'Sipariş oluşturulamadı', isOrdering: false },
            false,
            'packageDetail/orderError'
          );
          throw error;
        }
      },

      setSelectedTier: (tier: 'basic' | 'standard' | 'premium') => {
        set({ selectedTier: tier }, false, 'packageDetail/setTier');
      },

      toggleAddOn: (addOnId: string) => {
        const { selectedAddOns } = get();
        const newAddOns = selectedAddOns.includes(addOnId)
          ? selectedAddOns.filter((id) => id !== addOnId)
          : [...selectedAddOns, addOnId];

        set({ selectedAddOns: newAddOns }, false, 'packageDetail/toggleAddOn');
      },

      updateCustomizations: (
        customizations: Partial<{
          requirements: string;
          additionalInfo: string;
        }>
      ) => {
        set(
          (state) => ({
            customizations: { ...state.customizations, ...customizations },
          }),
          false,
          'packageDetail/updateCustomizations'
        );
      },

      calculateTotal: () => {
        const { currentPackage, selectedTier, selectedAddOns } = get();

        if (!currentPackage) return 0;

        // Handle both PackageDetail and ServicePackage types
        let total = 0;
        if (isPackageDetail(currentPackage)) {
          // PackageDetail type with pricing tiers
          const pricing = currentPackage.pricing;
          if (pricing && pricing[selectedTier]) {
            total = pricing[selectedTier].price;
          }
        } else {
          // ServicePackage type with simple price
          total = currentPackage.price;
        }

        // Add selected add-ons (only for PackageDetail)
        if (isPackageDetail(currentPackage)) {
          selectedAddOns.forEach((addOnId) => {
            const addOn = currentPackage.addOns?.find((a) => a.id === addOnId);
            if (addOn) {
              total += addOn.price;
            }
          });
        }

        return total;
      },

      calculateDeliveryTime: () => {
        const { currentPackage, selectedTier, selectedAddOns } = get();

        if (!currentPackage) return 0;

        // Handle both PackageDetail and ServicePackage types
        let deliveryTime = 0;
        if (isPackageDetail(currentPackage)) {
          // PackageDetail type with pricing tiers
          const pricing = currentPackage.pricing;
          if (pricing && pricing[selectedTier]) {
            deliveryTime = pricing[selectedTier].deliveryTime;
          }
        } else {
          // ServicePackage type with simple deliveryTime
          deliveryTime = currentPackage.deliveryTime;
        }

        // Add selected add-ons delivery time (only for PackageDetail)
        if (isPackageDetail(currentPackage)) {
          selectedAddOns.forEach((addOnId) => {
            const addOn = currentPackage.addOns?.find((a) => a.id === addOnId);
            if (addOn && addOn.deliveryTime > 0) {
              deliveryTime += addOn.deliveryTime;
            } else if (addOn && addOn.deliveryTime < 0) {
              // Negative delivery time means faster delivery
              deliveryTime += addOn.deliveryTime;
            }
          });
        }

        return Math.max(1, deliveryTime); // Minimum 1 day
      },

      clearError: () => {
        set({ error: null }, false, 'packageDetail/clearError');
      },

      clearPackageDetail: () => {
        set(
          {
            currentPackage: null,
            reviews: [],
            error: null,
            isLoading: false,
            isOrdering: false,
            selectedTier: 'basic',
            selectedAddOns: [],
            customizations: {
              requirements: '',
              additionalInfo: '',
            },
          },
          false,
          'packageDetail/clear'
        );
      },
    }),
    {
      name: 'package-detail-store',
    }
  )
);
