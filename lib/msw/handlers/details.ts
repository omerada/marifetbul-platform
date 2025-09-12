import { http, HttpResponse } from 'msw';
import {
  mockJobDetail,
  mockPackageDetail,
  mockProposals,
} from '../data/details';

export const detailHandlers = [
  // Get job detail
  http.get('/api/v1/jobs/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (id === 'job-123') {
      return HttpResponse.json({
        success: true,
        data: mockJobDetail,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'İş ilanı bulunamadı' },
      { status: 404 }
    );
  }),

  // Get package detail
  http.get('/api/v1/packages/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (id === 'pkg-789') {
      return HttpResponse.json({
        success: true,
        data: mockPackageDetail,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Paket bulunamadı' },
      { status: 404 }
    );
  }),

  // Submit proposal
  http.post('/api/v1/jobs/:id/proposals', async ({ params, request }) => {
    const jobId = params.id;
    const proposalData = (await request.json()) as {
      coverLetter: string;
      budget: { amount: number; type: string };
      timeline: { value: number; unit: string };
    };

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validation
    if (!proposalData.coverLetter || proposalData.coverLetter.length < 50) {
      return HttpResponse.json(
        { success: false, error: 'Kapak mektubu en az 50 karakter olmalıdır' },
        { status: 400 }
      );
    }

    if (!proposalData.budget || proposalData.budget.amount <= 0) {
      return HttpResponse.json(
        { success: false, error: 'Geçerli bir teklif tutarı giriniz' },
        { status: 400 }
      );
    }

    // Simulate success
    return HttpResponse.json({
      success: true,
      data: {
        id: `proposal-${Date.now()}`,
        jobId: jobId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    });
  }),

  // Get job proposals (for employers)
  http.get('/api/v1/jobs/:id/proposals', async ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (id === 'job-123') {
      return HttpResponse.json({
        success: true,
        data: mockProposals,
        meta: {
          total: mockProposals.length,
          pending: mockProposals.filter((p) => p.status === 'pending').length,
          accepted: mockProposals.filter((p) => p.status === 'accepted').length,
        },
      });
    }

    return HttpResponse.json({
      success: true,
      data: [],
      meta: { total: 0, pending: 0, accepted: 0 },
    });
  }),

  // Create order for package
  http.post('/api/v1/packages/:id/orders', async ({ params, request }) => {
    const { id } = params;
    const orderData = (await request.json()) as {
      tier: 'basic' | 'standard' | 'premium';
      addOns?: string[];
      customizations?: {
        requirements: string;
        additionalInfo: string;
      };
    };

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (id !== 'pkg-789') {
      return HttpResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    // Calculate total based on tier and add-ons
    let totalAmount = mockPackageDetail.pricing[orderData.tier].price;

    if (orderData.addOns?.length) {
      const addOnCosts = orderData.addOns.reduce(
        (sum: number, addonId: string) => {
          const addon = mockPackageDetail.addOns.find((a) => a.id === addonId);
          return sum + (addon?.price || 0);
        },
        0
      );
      totalAmount += addOnCosts;
    }

    const estimatedDelivery = new Date(
      Date.now() +
        mockPackageDetail.pricing[orderData.tier].deliveryTime *
          24 *
          60 *
          60 *
          1000
    );

    return HttpResponse.json({
      success: true,
      data: {
        id: `order-${Date.now()}`,
        orderNumber: `ORD-2025-${Math.random().toString().substring(2, 8)}`,
        totalAmount,
        estimatedDelivery: estimatedDelivery.toISOString(),
        paymentRequired: true,
        paymentUrl: `/payment/order-${Date.now()}`,
      },
    });
  }),

  // Update proposal status (accept/reject)
  http.patch('/api/v1/proposals/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = (await request.json()) as {
      status: 'accepted' | 'rejected';
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!['accepted', 'rejected'].includes(status)) {
      return HttpResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        status,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Get package reviews
  http.get('/api/v1/packages/:id/reviews', async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (id === 'pkg-789') {
      const startIndex = (page - 1) * limit;
      const reviews = mockPackageDetail.detailedReviews.slice(
        startIndex,
        startIndex + limit
      );

      return HttpResponse.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total: mockPackageDetail.detailedReviews.length,
          totalPages: Math.ceil(
            mockPackageDetail.detailedReviews.length / limit
          ),
        },
      });
    }

    return HttpResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
    });
  }),

  // File upload simulation
  http.post('/api/v1/upload', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random upload success/failure
    if (Math.random() > 0.1) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      return HttpResponse.json({
        success: true,
        data: {
          id: `file-${Date.now()}`,
          name: file?.name || 'uploaded-file',
          url: `/uploads/${file?.name || 'file.pdf'}`,
          type: file?.type || 'application/octet-stream',
          size: file?.size || 1024,
          uploadedAt: new Date().toISOString(),
        },
      });
    } else {
      return HttpResponse.json(
        { success: false, error: 'Dosya yüklenemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }
  }),
];
