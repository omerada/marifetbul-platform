'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getApiUrl } from '@/lib/config/api-config';

/**
 * Server action to release payment from escrow
 *
 * Story 2.1: Escrow Payment Release Flow
 *
 * @param orderId - Order ID containing the payment
 * @returns Success or error message
 */
export async function releasePaymentFromEscrow(orderId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return {
        success: false,
        message: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
      };
    }

    // Call backend API
    const response = await fetch(
      `${getApiUrl()}/api/v1/wallet/escrow/release/${orderId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Ödeme serbest bırakılamadı',
      };
    }

    // Revalidate relevant paths to update UI
    revalidatePath(`/dashboard/wallet/escrow/${orderId}`);
    revalidatePath('/dashboard/wallet');
    revalidatePath('/dashboard/orders');

    return {
      success: true,
      message: data.message || 'Ödeme başarıyla serbest bırakıldı',
    };
  } catch (error) {
    console.error('Error releasing payment from escrow:', error);
    return {
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}
