'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackageDetailStore } from '@/lib/core/store';
import { OrderFormData, orderSchema } from '@/lib/core/validations/details';
import { useRouter } from 'next/navigation';
import type { PackageDetail, ServicePackage } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

export function usePackageOrder(packageId: string) {
  const router = useRouter();
  const store = usePackageDetailStore();
  const [step, setStep] = useState<'customize' | 'review' | 'payment'>(
    'customize'
  );

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      packageId,
      tier: store.selectedTier,
      customizations: {
        requirements: '',
        additionalInfo: '',
      },
      addOns: [],
      urgentDelivery: false,
    },
  });

  // Sync form with store state
  const syncFormWithStore = useCallback(() => {
    form.setValue('tier', store.selectedTier);
    form.setValue('addOns', store.selectedAddOns);
    form.setValue('customizations', store.customizations);
  }, [form, store.selectedTier, store.selectedAddOns, store.customizations]);

  const goToStep = useCallback((targetStep: typeof step) => {
    setStep(targetStep);
  }, []);

  const nextStep = useCallback(() => {
    if (step === 'customize') {
      setStep('review');
    } else if (step === 'review') {
      setStep('payment');
    }
  }, [step]);

  const prevStep = useCallback(() => {
    if (step === 'review') {
      setStep('customize');
    } else if (step === 'payment') {
      setStep('review');
    }
  }, [step]);

  const validateCurrentStep = useCallback((): boolean => {
    switch (step) {
      case 'customize':
        // Always valid for customize step
        return true;
      case 'review':
        // Validate required customizations if any
        const tier = form.getValues('tier');
        if (tier === 'premium') {
          const requirements = form.getValues('customizations.requirements');
          return requirements ? requirements.length >= 10 : false;
        }
        return true;
      case 'payment':
        // Payment validation will be handled by payment component
        return true;
      default:
        return true;
    }
  }, [step, form]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      syncFormWithStore();
      const orderId = await store.createOrder(data);

      // Navigate to payment page or order confirmation
      router.push(`/orders/${orderId}/payment`);
    } catch (error) {
      logger.error(
        'Order creation error', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Calculate order summary
  const getOrderSummary = useCallback(() => {
    const { currentPackage } = store;
    if (!currentPackage) return null;

    // Type guard to check if the package has pricing (PackageDetail)
    const isPackageDetail = (
      pkg: ServicePackage | PackageDetail
    ): pkg is PackageDetail => {
      return 'pricing' in pkg && 'addOns' in pkg;
    };

    if (!isPackageDetail(currentPackage)) return null;

    const tier = form.watch('tier');
    const addOns = form.watch('addOns') || [];

    const tierPrice = currentPackage.pricing?.[tier];
    const addOnCosts = addOns
      .map((addOnId) => {
        const addOn = currentPackage.addOns?.find((a) => a.id === addOnId);
        return addOn
          ? { id: addOn.id, title: addOn.title, price: addOn.price }
          : null;
      })
      .filter(Boolean);

    if (!tierPrice) {
      return {
        tier: null,
        addOns: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        estimatedDelivery: new Date(),
      };
    }

    const subtotal =
      tierPrice.price +
      addOnCosts.reduce((sum, addOn) => sum + (addOn?.price || 0), 0);
    const tax = subtotal * 0.18; // 18% KDV
    const total = subtotal + tax;

    return {
      tier: {
        name: tierPrice.title,
        price: tierPrice.price,
        features: tierPrice.features,
        deliveryTime: tierPrice.deliveryTime,
        revisions: tierPrice.revisions,
      },
      addOns: addOnCosts,
      subtotal,
      tax,
      total,
      estimatedDelivery: new Date(
        Date.now() + store.calculateDeliveryTime() * 24 * 60 * 60 * 1000
      ),
    };
  }, [form, store]);

  return {
    // State
    currentPackage: store.currentPackage,
    isOrdering: store.isOrdering,
    error: store.error,
    step,

    // Form
    form,

    // Store actions (pass through)
    selectedTier: store.selectedTier,
    selectedAddOns: store.selectedAddOns,
    customizations: store.customizations,
    setSelectedTier: store.setSelectedTier,
    toggleAddOn: store.toggleAddOn,
    updateCustomizations: store.updateCustomizations,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canGoNext: validateCurrentStep(),

    // Actions
    handleSubmit: form.handleSubmit(onSubmit),
    syncFormWithStore,
    getOrderSummary,
    clearError: store.clearError,

    // Calculations
    totalPrice: store.calculateTotal(),
    deliveryTime: store.calculateDeliveryTime(),
  };
}
