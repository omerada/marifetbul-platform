import { useEffect } from 'react';
import { usePackageDetailStore } from '@/lib/store';
import { useAuth } from './useAuth';

export function usePackageDetail(packageId: string) {
  const store = usePackageDetailStore();
  const { user } = useAuth();

  useEffect(() => {
    if (packageId) {
      store.fetchPackageDetail(packageId);
      store.fetchReviews(packageId);
    }

    // Cleanup when unmounting or packageId changes
    return () => {
      store.clearPackageDetail();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  // Derived state
  const isPackageOwner = user?.id === store.currentPackage?.freelancer.id;
  const canOrder = user?.userType === 'employer' && !isPackageOwner;

  return {
    // State
    currentPackage: store.currentPackage,
    reviews: store.reviews,
    isLoading: store.isLoading,
    isOrdering: store.isOrdering,
    error: store.error,
    selectedTier: store.selectedTier,
    selectedAddOns: store.selectedAddOns,
    customizations: store.customizations,

    // Derived state
    isPackageOwner,
    canOrder,
    totalPrice: store.calculateTotal(),
    deliveryTime: store.calculateDeliveryTime(),

    // Actions
    setSelectedTier: store.setSelectedTier,
    toggleAddOn: store.toggleAddOn,
    updateCustomizations: store.updateCustomizations,
    createOrder: store.createOrder,
    clearError: store.clearError,
    refreshPackageDetail: () => store.fetchPackageDetail(packageId),
    loadMoreReviews: (page: number) => store.fetchReviews(packageId, page),
  };
}
