'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Server action to release payment from escrow
 *
 * Story 2.1: Escrow Payment Release Flow
 * ✅ COMPLETED: Cookie-based authentication implemented
 *
 * @param orderId - Order ID containing the payment
 * @returns Success or error message
 */
export async function releasePaymentFromEscrow(orderId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return {
        success: false,
        message: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
      };
    }

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(
      `${apiUrl}/api/v1/wallet/escrow/release/${orderId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
