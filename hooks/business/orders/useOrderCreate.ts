'use client';

/**
 * ================================================
 * USE ORDER CREATE HOOK
 * ================================================
 * Complete order creation hook with API integration
 *
 * Sprint 2 - Task 2.1: Order Management System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ API integration (POST /api/v1/orders/{type})
 * ✅ Payment mode selection (ESCROW_PROTECTED / MANUAL_IBAN)
 * ✅ Draft save/load (localStorage)
 * ✅ Form validation (Zod)
 * ✅ Multi-step state management
 * ✅ Error handling
 * ✅ Success callback with redirect
 * ✅ Supports: Package, Custom, Job orders
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createPackageOrder,
  createCustomOrder,
  createJobOrder,
  type CreatePackageOrderRequest,
  type CreateCustomOrderRequest,
  type CreateJobOrderRequest,
} from '@/lib/api/orders';
import { PaymentMode } from '@/types/business/features/order';
import useToast from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// CONSTANTS
// ================================================

const DRAFT_STORAGE_PREFIX = 'marifetbul_order_draft_';
const DRAFT_EXPIRY_DAYS = 7;

// ================================================
// VALIDATION SCHEMAS
// ================================================

const baseOrderSchema = z.object({
  paymentMode: z.nativeEnum(PaymentMode),
  amount: z.number().min(100, 'Tutar en az 100 TRY olmalıdır'),
  requirements: z.string().optional(),
  deadline: z.string().min(1, 'Teslim tarihi gereklidir'),
});

const packageOrderSchema = baseOrderSchema.extend({
  packageId: z.string().min(1, 'Paket ID gereklidir'),
  tier: z.string().optional(),
  customizations: z.string().optional(),
  notes: z.string().optional(),
});

const customOrderSchema = baseOrderSchema.extend({
  sellerId: z.string().min(1, 'Satıcı ID gereklidir'),
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
  requirements: z
    .string()
    .min(10, 'Gereksinimler en az 10 karakter olmalıdır')
    .max(5000, 'Gereksinimler en fazla 5000 karakter olabilir'),
});

const jobOrderSchema = baseOrderSchema.extend({
  jobId: z.string().min(1, 'İş ilanı ID gereklidir'),
  sellerId: z.string().min(1, 'Freelancer ID gereklidir'),
});

export type PackageOrderFormData = z.infer<typeof packageOrderSchema>;
export type CustomOrderFormData = z.infer<typeof customOrderSchema>;
export type JobOrderFormData = z.infer<typeof jobOrderSchema>;

export type OrderFormData =
  | PackageOrderFormData
  | CustomOrderFormData
  | JobOrderFormData;

// ================================================
// TYPES
// ================================================

export type OrderType = 'package' | 'custom' | 'job';
export type OrderCreationStep =
  | 'details'
  | 'requirements'
  | 'payment'
  | 'review';

export interface UseOrderCreateOptions {
  /** Order type to create */
  orderType: OrderType;
  /** Auto-load draft on mount */
  autoLoadDraft?: boolean;
  /** Redirect path after success (default: /dashboard/orders/{orderId}) */
  redirectPath?: string;
  /** Callback on successful creation */
  onSuccess?: (orderId: string, orderNumber?: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Default form values */
  defaultValues?: Record<string, unknown>;
}

export interface UseOrderCreateReturn {
  // Form state
  form: ReturnType<typeof useForm>;
  isDirty: boolean;
  isValid: boolean;

  // Step management
  currentStep: OrderCreationStep;
  setCurrentStep: (step: OrderCreationStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Payment mode
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;

  // Fee calculation
  platformFee: number;
  sellerAmount: number;
  totalAmount: number;

  // Draft management
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
  hasDraft: boolean;
  draftLastSaved: Date | null;

  // Form actions
  submitOrder: () => Promise<void>;
  reset: () => void;

  // State
  isSubmitting: boolean;
  error: string | null;

  // Computed values
  canProceedToNextStep: boolean;
  completionPercentage: number;
}

const STEPS: OrderCreationStep[] = [
  'details',
  'requirements',
  'payment',
  'review',
];

// ================================================
// HELPER FUNCTIONS
// ================================================

const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * 0.05); // 5% platform fee
};

const calculateSellerAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};

const getDraftKey = (orderType: OrderType): string => {
  return `${DRAFT_STORAGE_PREFIX}${orderType}`;
};

const getSchema = (orderType: OrderType) => {
  const schemas = {
    package: packageOrderSchema,
    custom: customOrderSchema,
    job: jobOrderSchema,
  };
  return schemas[orderType];
};

// ================================================
// HOOK
// ================================================

export function useOrderCreate({
  orderType,
  autoLoadDraft = true,
  redirectPath,
  onSuccess,
  onError,
  defaultValues,
}: UseOrderCreateOptions): UseOrderCreateReturn {
  const router = useRouter();
  const toast = useToast();

  // ==================== STATE ====================

  const [currentStep, setCurrentStep] = useState<OrderCreationStep>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftLastSaved, setDraftLastSaved] = useState<Date | null>(null);

  // ==================== FORM ====================

  const schema = getSchema(orderType);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
    mode: 'onChange' as const,
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid, errors },
    setValue,
    watch,
    reset: resetForm,
  } = form;

  // Watch specific fields
  const formValues = watch();
  const amount = (formValues.amount as number) || 0;
  const paymentMode =
    (formValues.paymentMode as PaymentMode) || PaymentMode.ESCROW_PROTECTED;

  // ==================== COMPUTED VALUES ====================

  const platformFee = calculatePlatformFee(amount);
  const sellerAmount = calculateSellerAmount(amount);
  const totalAmount = amount;

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const completionPercentage = Math.round(
    ((currentStepIndex + 1) / STEPS.length) * 100
  );

  // Step-specific validation
  const canProceedToNextStep = (() => {
    const hasNoErrors = Object.keys(errors).length === 0;

    switch (currentStep) {
      case 'details':
        return hasNoErrors || isValid;

      case 'requirements':
        return hasNoErrors || (!errors.requirements && !errors.deadline);

      case 'payment':
        return hasNoErrors || !errors.paymentMode;

      case 'review':
        return isValid;

      default:
        return false;
    }
  })();

  // ==================== STEP NAVIGATION ====================

  const nextStep = useCallback(() => {
    if (!isLastStep && canProceedToNextStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(STEPS[nextIndex]);
    }
  }, [isLastStep, canProceedToNextStep, currentStepIndex]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(STEPS[prevIndex]);
    }
  }, [isFirstStep, currentStepIndex]);

  // ==================== PAYMENT MODE ====================

  const setPaymentMode = useCallback(
    (mode: PaymentMode) => {
      setValue('paymentMode', mode);
    },
    [setValue]
  );

  // ==================== DRAFT MANAGEMENT ====================

  const saveDraft = useCallback(() => {
    try {
      const formData = form.getValues();
      const draftData = {
        formData,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
        orderType,
      };

      const draftKey = getDraftKey(orderType);
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setHasDraft(true);
      setDraftLastSaved(new Date());

      logger.debug('[useOrderCreate] Draft saved', { orderType, draftKey });
    } catch (err) {
      logger.error('[useOrderCreate] Failed to save draft', err as Error);
    }
  }, [form, orderType]);

  const loadDraft = useCallback(() => {
    try {
      const draftKey = getDraftKey(orderType);
      const savedDraft = localStorage.getItem(draftKey);

      if (!savedDraft) {
        setHasDraft(false);
        return;
      }

      const draftData = JSON.parse(savedDraft);

      // Check expiry
      if (new Date(draftData.expiresAt) < new Date()) {
        localStorage.removeItem(draftKey);
        setHasDraft(false);
        toast.warning(
          'Taslak Süresi Doldu',
          'Kaydedilen taslak süresi dolduğu için silindi.'
        );
        return;
      }

      // Load draft data
      resetForm(draftData.formData);
      setHasDraft(true);
      setDraftLastSaved(new Date(draftData.savedAt));

      toast.info(
        'Taslak Yüklendi',
        `${new Date(draftData.savedAt).toLocaleString('tr-TR')} tarihinde kaydedilen taslak yüklendi.`
      );

      logger.info('[useOrderCreate] Draft loaded', { orderType, draftKey });
    } catch (err) {
      logger.error('[useOrderCreate] Failed to load draft', err as Error);
      setHasDraft(false);
    }
  }, [orderType, resetForm, toast]);

  const clearDraft = useCallback(() => {
    try {
      const draftKey = getDraftKey(orderType);
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      setDraftLastSaved(null);

      toast.success('Taslak Silindi', 'Kaydedilen taslak başarıyla silindi.');

      logger.info('[useOrderCreate] Draft cleared', { orderType, draftKey });
    } catch (err) {
      logger.error('[useOrderCreate] Failed to clear draft', err as Error);
    }
  }, [orderType, toast]);

  // ==================== AUTO-LOAD DRAFT ====================

  useEffect(() => {
    if (autoLoadDraft) {
      const draftKey = getDraftKey(orderType);
      const savedDraft = localStorage.getItem(draftKey);
      setHasDraft(!!savedDraft);

      // Don't auto-load if default values provided
      if (!defaultValues && savedDraft) {
        loadDraft();
      }
    }
  }, [autoLoadDraft, orderType, defaultValues, loadDraft]);

  // ==================== FORM SUBMISSION ====================

  const submitOrder = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = form.getValues();

      logger.info('[useOrderCreate] Submitting order', { orderType, formData });

      let response;

      // Call appropriate API based on order type
      if (orderType === 'package') {
        const request = formData as unknown as CreatePackageOrderRequest;
        response = await createPackageOrder(request);
      } else if (orderType === 'custom') {
        const request = formData as unknown as CreateCustomOrderRequest;
        response = await createCustomOrder(request);
      } else if (orderType === 'job') {
        const request = formData as unknown as CreateJobOrderRequest;
        response = await createJobOrder(request);
      } else {
        throw new Error(`Unknown order type: ${orderType}`);
      }

      const order = response.data;
      const orderId = order.id;
      const orderNumber = order.orderNumber;

      logger.info('[useOrderCreate] Order created successfully', {
        orderId,
        orderNumber,
        orderType,
      });

      // Clear draft after successful creation
      clearDraft();

      // Show success toast
      toast.success(
        'Sipariş Oluşturuldu! 🎉',
        `Sipariş #${orderNumber} başarıyla oluşturuldu.`
      );

      // Call success callback
      if (onSuccess) {
        onSuccess(orderId, orderNumber);
      }

      // Redirect
      const finalRedirectPath = redirectPath || `/dashboard/orders/${orderId}`;
      router.push(finalRedirectPath);
    } catch (err) {
      const error = err as Error;
      const errorMessage =
        error.message || 'Sipariş oluşturulurken bir hata oluştu.';

      setError(errorMessage);

      logger.error('[useOrderCreate] Order creation failed', error instanceof Error ? error : new Error(String(error)));

      toast.error('Sipariş Oluşturulamadı', errorMessage);

      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    form,
    orderType,
    clearDraft,
    toast,
    onSuccess,
    onError,
    redirectPath,
    router,
  ]);

  // ==================== FORM HELPERS ====================

  const reset = useCallback(() => {
    resetForm();
    setCurrentStep('details');
    setError(null);
  }, [resetForm]);

  // ==================== RETURN ====================

  return {
    // Form state
    form,
    isDirty,
    isValid,

    // Step management
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,

    // Payment mode
    paymentMode,
    setPaymentMode,

    // Fee calculation
    platformFee,
    sellerAmount,
    totalAmount,

    // Draft management
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    draftLastSaved,

    // Form actions
    submitOrder: handleSubmit(submitOrder),
    reset,

    // State
    isSubmitting,
    error,

    // Computed values
    canProceedToNextStep,
    completionPercentage,
  };
}
