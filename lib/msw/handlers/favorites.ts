import { http, HttpResponse } from 'msw';

// Mock favorites data
const mockFavorites = {
  freelancers: [
    {
      id: 'f1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      title: 'Senior React Developer',
      hourlyRate: { min: 250, max: 400, currency: 'TRY' },
      rating: 4.9,
      location: { city: 'İstanbul' },
      avatar: '/avatars/ahmet.jpg',
      addedAt: '2024-09-01T10:00:00Z',
      folderId: null,
    },
    {
      id: 'f2',
      firstName: 'Zeynep',
      lastName: 'Kaya',
      title: 'UI/UX Designer',
      hourlyRate: { min: 200, max: 350, currency: 'TRY' },
      rating: 4.8,
      location: { city: 'İzmir' },
      avatar: '/avatars/zeynep.jpg',
      addedAt: '2024-09-02T14:30:00Z',
      folderId: 'folder_1',
    },
  ],
  jobs: [
    {
      id: 'j1',
      title: 'Frontend Developer',
      company: 'Tech Startup',
      budget: { min: 50000, max: 80000, currency: 'TRY' },
      location: { city: 'İstanbul' },
      addedAt: '2024-09-01T15:20:00Z',
      folderId: null,
    },
  ],
  services: [
    {
      id: 's1',
      title: 'E-ticaret Web Sitesi',
      provider: 'Ahmet Yılmaz',
      price: { amount: 25000, currency: 'TRY' },
      deliveryTime: 30,
      rating: 4.9,
      addedAt: '2024-09-03T09:15:00Z',
      folderId: 'folder_2',
    },
  ],
  folders: [
    {
      id: 'folder_1',
      name: 'UI/UX Uzmanları',
      description: "Tasarım alanında uzman freelancer'lar",
      itemCount: 1,
      createdAt: '2024-08-30T12:00:00Z',
      updatedAt: '2024-09-02T14:30:00Z',
    },
    {
      id: 'folder_2',
      name: 'Web Geliştirme Servisleri',
      description: 'E-ticaret ve web sitesi geliştirme hizmetleri',
      itemCount: 1,
      createdAt: '2024-08-31T16:45:00Z',
      updatedAt: '2024-09-03T09:15:00Z',
    },
  ],
};

export const favoritesHandlers = [
  // Get all favorites
  http.get('/api/favorites', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const folderId = url.searchParams.get('folderId');

    let response = { ...mockFavorites };

    if (type) {
      // Filter by type
      response = {
        freelancers: type === 'freelancers' ? mockFavorites.freelancers : [],
        jobs: type === 'jobs' ? mockFavorites.jobs : [],
        services: type === 'services' ? mockFavorites.services : [],
        folders: mockFavorites.folders,
      };
    }

    if (folderId) {
      // Filter by folder
      response = {
        freelancers: mockFavorites.freelancers.filter(
          (f) => f.folderId === folderId
        ),
        jobs: mockFavorites.jobs.filter((j) => j.folderId === folderId),
        services: mockFavorites.services.filter((s) => s.folderId === folderId),
        folders: mockFavorites.folders,
      };
    }

    return HttpResponse.json({
      success: true,
      data: response,
    });
  }),

  // Add to favorites
  http.post('/api/favorites', async ({ request }) => {
    const body = (await request.json()) as {
      itemType: 'freelancer' | 'job' | 'service';
      itemId: string;
      folderId?: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      message: 'Favorilere eklendi',
      data: {
        id: `fav_${Date.now()}`,
        itemType: body.itemType,
        itemId: body.itemId,
        folderId: body.folderId || null,
        addedAt: new Date().toISOString(),
      },
    });
  }),

  // Remove from favorites
  http.delete('/api/favorites/:itemId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Favorilerden kaldırıldı',
      data: {
        removedItemId: params.itemId,
      },
    });
  }),

  // Create folder
  http.post('/api/favorites/folders', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Klasör oluşturuldu',
      data: {
        id: `folder_${Date.now()}`,
        name: body.name,
        description: body.description || '',
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Update folder
  http.put('/api/favorites/folders/:folderId', async ({ params, request }) => {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Klasör güncellendi',
      data: {
        id: params.folderId,
        name: body.name || 'Updated Folder',
        description: body.description || '',
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // Delete folder
  http.delete('/api/favorites/folders/:folderId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Klasör silindi',
      data: {
        deletedFolderId: params.folderId,
      },
    });
  }),

  // Move item to folder
  http.patch('/api/favorites/:itemId/move', async ({ params, request }) => {
    const body = (await request.json()) as {
      folderId: string | null;
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Öğe taşındı',
      data: {
        itemId: params.itemId,
        newFolderId: body.folderId,
        movedAt: new Date().toISOString(),
      },
    });
  }),

  // Get favorites statistics
  http.get('/api/favorites/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalFavorites: 3,
        freelancersCount: 2,
        jobsCount: 1,
        servicesCount: 1,
        foldersCount: 2,
        recentlyAdded: [
          {
            type: 'service',
            title: 'E-ticaret Web Sitesi',
            addedAt: '2024-09-03T09:15:00Z',
          },
          {
            type: 'freelancer',
            title: 'Zeynep Kaya - UI/UX Designer',
            addedAt: '2024-09-02T14:30:00Z',
          },
        ],
      },
    });
  }),
];
