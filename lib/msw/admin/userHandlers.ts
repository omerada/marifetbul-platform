import { http, HttpResponse } from 'msw';
import type { AdminUserData, PaginatedResponse } from '@/types';

// Define filter types
interface UserFilters {
  search?: string;
  userType?: string;
  accountStatus?: string;
  verificationStatus?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  riskLevel?: string;
}

// Mock user data generator
const generateMockUsers = (): AdminUserData[] => {
  const userTypes = ['freelancer', 'employer'] as const;
  const accountStatuses = ['active', 'suspended', 'banned'] as const;
  const verificationStatuses = ['verified', 'pending', 'unverified'] as const;
  const locations = [
    'İstanbul, Türkiye',
    'Ankara, Türkiye',
    'İzmir, Türkiye',
    'Bursa, Türkiye',
    'Antalya, Türkiye',
    'Adana, Türkiye',
    'Konya, Türkiye',
    'Gaziantep, Türkiye',
    'Kayseri, Türkiye',
    'Mersin, Türkiye',
  ];

  const firstNames = [
    'Ahmet',
    'Mehmet',
    'Mustafa',
    'Ali',
    'Hüseyin',
    'İbrahim',
    'İsmail',
    'Hasan',
    'Hakan',
    'Fatma',
    'Ayşe',
    'Emine',
    'Hatice',
    'Zeynep',
    'Elif',
    'Özlem',
    'Merve',
    'Seda',
    'Burcu',
    'Esra',
    'Burak',
    'Emre',
    'Ömer',
    'Cem',
    'Deniz',
    'Kemal',
    'Serkan',
    'Murat',
    'Volkan',
    'Oğuz',
  ];

  const lastNames = [
    'Yılmaz',
    'Kaya',
    'Demir',
    'Şahin',
    'Çelik',
    'Özkan',
    'Aydın',
    'Özdemir',
    'Arslan',
    'Doğan',
    'Kılıç',
    'Aslan',
    'Çetin',
    'Kara',
    'Koç',
    'Kurt',
    'Özturk',
    'Şimşek',
    'Polat',
    'Korkmaz',
  ];

  const domains = [
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com',
    'icloud.com',
  ];

  return Array.from({ length: 150 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
    const joinDate = new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString();
    const lastActiveAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const lastLoginAt = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `user_${index + 1}`,
      email,
      name: `${firstName} ${lastName}`, // Added required name field
      firstName,
      lastName,
      userType,
      profileCompletion: Math.floor(Math.random() * 40) + 60, // Added required field: 60-99%
      avatar: `https://images.unsplash.com/photo-${1500000000000 + index}?w=150&h=150&fit=crop&crop=face`,
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: joinDate,
      updatedAt: lastActiveAt,

      // Admin specific fields
      accountStatus:
        accountStatuses[Math.floor(Math.random() * accountStatuses.length)],
      verificationStatus:
        verificationStatuses[
          Math.floor(Math.random() * verificationStatuses.length)
        ],
      verificationBadges: [
        'email', // Always verified email
        ...(Math.random() > 0.3 ? ['phone'] : []), // 70% chance of phone verification
        ...(Math.random() > 0.7 ? ['identity'] : []), // 30% chance of identity verification
      ],
      joinDate,
      lastActiveAt,
      lastLoginAt,
      loginCount: Math.floor(Math.random() * 500) + 10,
      totalOrders: Math.floor(Math.random() * 50),
      totalEarnings:
        userType === 'freelancer' ? Math.floor(Math.random() * 100000) : 0,
      totalSpent:
        userType === 'employer' ? Math.floor(Math.random() * 50000) : 0,
      successRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      disputeCount: Math.floor(Math.random() * 5),
      warningCount: Math.floor(Math.random() * 3),
      reputationScore: Math.floor(Math.random() * 40) + 60, // 60-100
      riskScore: Math.floor(Math.random() * 50), // 0-50
      notes: [],
      suspensionHistory: [],
    };
  });
};

const mockUsers = generateMockUsers();

// Helper function to filter and paginate users
function filterAndPaginateUsers(
  users: AdminUserData[],
  filters: UserFilters,
  page: number,
  limit: number,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): PaginatedResponse<AdminUserData> {
  let filteredUsers = [...users];

  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        (user.firstName?.toLowerCase().includes(searchTerm) ?? false) ||
        (user.lastName?.toLowerCase().includes(searchTerm) ?? false) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.userType && filters.userType !== 'all') {
    filteredUsers = filteredUsers.filter(
      (user) => user.userType === filters.userType
    );
  }

  if (filters.accountStatus && filters.accountStatus !== 'all') {
    filteredUsers = filteredUsers.filter(
      (user) => user.accountStatus === filters.accountStatus
    );
  }

  if (filters.verificationStatus && filters.verificationStatus !== 'all') {
    filteredUsers = filteredUsers.filter(
      (user) => user.verificationStatus === filters.verificationStatus
    );
  }

  if (filters.location) {
    filteredUsers = filteredUsers.filter((user) =>
      user.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters.dateFrom) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.joinDate && new Date(user.joinDate) >= new Date(filters.dateFrom!)
    );
  }

  if (filters.dateTo) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.joinDate && new Date(user.joinDate) <= new Date(filters.dateTo!)
    );
  }

  if (filters.riskLevel) {
    const riskThreshold =
      filters.riskLevel === 'high'
        ? 70
        : filters.riskLevel === 'medium'
          ? 30
          : 0;
    filteredUsers = filteredUsers.filter(
      (user) => (user.riskScore ?? 0) >= riskThreshold
    );
  }

  // Apply sorting
  filteredUsers.sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'joinDate':
        aValue = a.joinDate ? new Date(a.joinDate).getTime() : 0;
        bValue = b.joinDate ? new Date(b.joinDate).getTime() : 0;
        break;
      case 'lastActiveAt':
        aValue = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        bValue = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        break;
      case 'totalOrders':
        aValue = a.totalOrders ?? 0;
        bValue = b.totalOrders ?? 0;
        break;
      case 'riskScore':
        aValue = a.riskScore ?? 0;
        bValue = b.riskScore ?? 0;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
    },
  };
}

export const userHandlers = [
  // Get users list with filters and pagination
  http.get('/api/v1/admin/users', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const userType = url.searchParams.get('userType') || 'all';
    const accountStatus = url.searchParams.get('accountStatus') || 'all';
    const verificationStatus =
      url.searchParams.get('verificationStatus') || 'all';
    const location = url.searchParams.get('location') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const riskLevel = url.searchParams.get('riskLevel') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filters = {
      search,
      userType,
      accountStatus,
      verificationStatus,
      location,
      dateFrom,
      dateTo,
      riskLevel,
    };

    const result = filterAndPaginateUsers(
      mockUsers,
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    );

    return HttpResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Users retrieved successfully',
    });
  }),

  // Get single user details
  http.get('/api/v1/admin/users/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = mockUsers.find((u) => u.id === params.id);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: user,
      message: 'User details retrieved successfully',
    });
  }),

  // Update user
  http.put('/api/v1/admin/users/:id', async ({ params, request }) => {
    const updates = (await request.json()) as Partial<AdminUserData>;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const userIndex = mockUsers.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'User updated successfully',
    });
  }),

  // Delete user (soft delete)
  http.delete('/api/v1/admin/users/:id', async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userIndex = mockUsers.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Soft delete: mark as banned instead of actual deletion
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      accountStatus: 'banned',
      updatedAt: new Date().toISOString(),
      // Note: deletedAt added in types but avoiding it here to prevent type errors
    };

    return HttpResponse.json({
      success: true,
      data: {
        id: mockUsers[userIndex].id,
        deleted: true,
      },
      message: 'User deleted successfully',
    });
  }),

  // Bulk actions on users
  http.post('/api/v1/admin/users/bulk-action', async ({ request }) => {
    const { action, userIds } = (await request.json()) as {
      action: 'activate' | 'suspend' | 'ban' | 'verify' | 'delete';
      userIds: string[];
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const affectedUsers = mockUsers.filter((user) => userIds.includes(user.id));

    if (affectedUsers.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          message: 'No users found with provided IDs',
        },
        { status: 404 }
      );
    }

    // Apply bulk action
    affectedUsers.forEach((user) => {
      const userIndex = mockUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        switch (action) {
          case 'activate':
            mockUsers[userIndex].accountStatus = 'active';
            break;
          case 'suspend':
            mockUsers[userIndex].accountStatus = 'suspended';
            break;
          case 'ban':
            mockUsers[userIndex].accountStatus = 'banned';
            break;
          case 'verify':
            mockUsers[userIndex].verificationStatus = 'verified';
            break;
          case 'delete':
            // In real app, this would soft delete
            mockUsers[userIndex].accountStatus = 'banned';
            break;
        }
        mockUsers[userIndex].updatedAt = new Date().toISOString();
      }
    });

    return HttpResponse.json({
      success: true,
      data: {
        affectedCount: affectedUsers.length,
        action,
      },
      message: `Bulk ${action} completed successfully on ${affectedUsers.length} users`,
    });
  }),

  // Get user statistics
  http.get('/api/v1/admin/users/stats', async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(
      (u) => u.accountStatus === 'active'
    ).length;
    const suspendedUsers = mockUsers.filter(
      (u) => u.accountStatus === 'suspended'
    ).length;
    const bannedUsers = mockUsers.filter(
      (u) => u.accountStatus === 'banned'
    ).length;
    const pendingVerification = mockUsers.filter(
      (u) => u.verificationStatus === 'pending'
    ).length;
    const verifiedUsers = mockUsers.filter(
      (u) => u.verificationStatus === 'verified'
    ).length;
    const freelancers = mockUsers.filter(
      (u) => u.userType === 'freelancer'
    ).length;
    const employers = mockUsers.filter((u) => u.userType === 'employer').length;
    const highRiskUsers = mockUsers.filter(
      (u) => (u.riskScore ?? 0) > 70
    ).length;

    // New users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = mockUsers.filter(
      (u) => u.joinDate && new Date(u.joinDate) >= thirtyDaysAgo
    ).length;

    // Active users in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersThisWeek = mockUsers.filter(
      (u) => u.lastActiveAt && new Date(u.lastActiveAt) >= sevenDaysAgo
    ).length;

    return HttpResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        bannedUsers,
        pendingVerification,
        verifiedUsers,
        freelancers,
        employers,
        highRiskUsers,
        newUsersThisMonth,
        activeUsersThisWeek,
        userGrowthRate: ((newUsersThisMonth / totalUsers) * 100).toFixed(1),
        verificationRate: ((verifiedUsers / totalUsers) * 100).toFixed(1),
      },
      message: 'User statistics retrieved successfully',
    });
  }),

  // Export users data
  http.post('/api/v1/admin/users/export', async ({ request }) => {
    const { format } = (await request.json()) as {
      format: 'csv' | 'excel' | 'pdf';
      filters?: UserFilters;
    };

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real application, this would generate and return the actual file
    return HttpResponse.json({
      success: true,
      data: {
        downloadUrl: `/downloads/users-export-${Date.now()}.${format}`,
        fileName: `users-export-${new Date().toISOString().split('T')[0]}.${format}`,
        recordCount: mockUsers.length,
      },
      message: `Users data exported successfully as ${format.toUpperCase()}`,
    });
  }),
];
