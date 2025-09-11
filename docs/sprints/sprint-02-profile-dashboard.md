# Sprint 2: Profil Yönetimi ve Kullanıcı Dashboard'u - 2 hafta

## 🎯 Sprint Hedefleri

- Kullanıcı profil yönetimi sisteminin geliştirilmesi
- Role-based dashboard ekranlarının oluşturulması
- Avatar yükleme ve profil düzenleme işlevselliği
- Freelancer portföy yönetimi
- Employer şirket profili yönetimi

## 📱 Geliştirilecek Ekranlar

### Freelancer Dashboard

**Rol**: Freelancer  
**Özellikler**:

- Kazanç özeti ve istatistikleri
- Aktif sipariş ve teklifler görüntüleme
- Hızlı eylem kartları (Paket Ekle, İş Ara, Mesajlar)
- Son aktivite timeline'ı
- Profil tamamlanma progress bar'ı
- Performance metrikleri (response rate, order completion)

### Employer Dashboard

**Rol**: Employer
**Özellikler**:

- Aktif iş ilanları ve başvuru sayıları
- Harcama özeti ve bütçe takibi
- Favori freelancer'lar listesi
- Son mesajlar ve bildirimler
- İş ilanı performans analitikleri
- Hızlı freelancer arama

### Freelancer Profil Görüntüleme

**Rol**: Both
**Özellikler**:

- Kapsamlı profil bilgileri (bio, beceriler, deneyim)
- Portföy galerisi ile modal görüntüleme
- Paket hizmetleri sergileme
- İnceleme ve puanlama sistemi
- Contact/Message butonu
- Social media linkleri
- Availability status indicator

### Profil Düzenleme Ekranı

**Rol**: Both
**Özellikler**:

- Multi-section form (Kişisel Bilgiler, Beceriler, Portfolio)
- Avatar upload ve crop özelliği
- Real-time preview
- Auto-save functionality
- Progress indicator
- Validation feedback

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `FreelancerDashboard` - Freelancer ana dashboard
  - `EmployerDashboard` - Employer ana dashboard
  - `ProfileViewCard` - Profil görüntüleme kartı
  - `ProfileEditForm` - Profil düzenleme formu
  - `AvatarUpload` - Avatar yükleme bileşeni
  - `PortfolioGallery` - Portföy galeri bileşeni
  - `SkillsSelector` - Beceri seçimi bileşeni
  - `StatsCard` - İstatistik kartları
  - `ActivityTimeline` - Aktivite zaman çizelgesi
  - `QuickActions` - Hızlı eylem kartları

- **Güncellenecek Component'lar**:
  - `Card` - Dashboard için yeni variant'lar
  - `Button` - Icon button ve size variant'ları
  - `Badge` - Status badge'leri için
  - `Progress` - Profil tamamlanma için

- **UI Library Integration**:
  - `Avatar`, `Badge`, `Progress`, `Tabs` (Shadcn/ui)
  - `Separator`, `ScrollArea`, `Tooltip`
  - `Sheet` - Mobile profil düzenleme için

### User Flow

- **Employer Flow**: Dashboard → View Stats → Browse Freelancers → View Profile → Contact
- **Freelancer Flow**: Dashboard → Check Earnings → Update Profile → View Portfolio → Add New Package

### States & Interactions

- **Loading States**: Dashboard data fetching, profile updates, image uploads
- **Error Handling**: Upload failures, network errors, validation errors
- **Empty States**: No portfolio items, no active orders, first-time dashboard
- **Success States**: Profile updated, image uploaded, data saved

### Accessibility

- Alt text for portfolio images
- Keyboard navigation for profile sections
- Screen reader support for statistics
- Focus management in modal dialogs
- High contrast mode compatibility

## ⚙️ Fonksiyonel Özellikler

### Profile Management System

**Açıklama**: Kapsamlı kullanıcı profil yönetimi ile avatar upload
**Employer Perspective**: Şirket bilgileri, sektör, team size yönetimi
**Freelancer Perspective**: Bio, skills, experience, portfolio yönetimi
**Acceptance Criteria**:

- [ ] Kullanıcı profil bilgilerini düzenleyebilir
- [ ] Avatar upload ve crop functionality çalışır
- [ ] Real-time validation ve preview çalışır
- [ ] Auto-save özelliği aktif
- [ ] Profile completion progress gösterilir

### Dashboard Analytics

**Açıklama**: Role-based dashboard ile kişiselleştirilmiş istatistikler
**Employer Perspective**: Job posting performance, spending analytics
**Freelancer Perspective**: Earning trends, order completion rates
**Acceptance Criteria**:

- [ ] Role-specific dashboard widgets gösterilir
- [ ] Real-time data updates çalışır
- [ ] Responsive chart ve grafik gösterimi
- [ ] Quick action buttons functional
- [ ] Performance metrics accuracy

### Portfolio System

**Açıklama**: Freelancer portföy yönetimi ve galeri sistemi
**Employer Perspective**: Freelancer portfolio'larını görüntüleme
**Freelancer Perspective**: Portfolio item ekleme, düzenleme, silme
**Acceptance Criteria**:

- [ ] Portfolio items CRUD operations
- [ ] Image upload ve optimization
- [ ] Modal gallery görüntüleme
- [ ] Portfolio item categorization
- [ ] External link management

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/users/*`

#### GET /api/users/:id

```typescript
interface UserProfileRequest {
  id: string;
}

interface UserProfileResponse {
  success: boolean;
  data?: FreelancerProfile | EmployerProfile;
  error?: string;
}

// Örnek mock data - Freelancer Profile
const mockFreelancerProfile = {
  id: 'freelancer-123',
  email: 'ahmet@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  userType: 'freelancer',
  avatar: '/avatars/freelancer-1.jpg',
  title: 'Full Stack Developer',
  bio: 'Modern web teknolojileri ile 5+ yıllık deneyimim var...',
  location: 'İstanbul, Türkiye',
  skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
  hourlyRate: 75,
  experience: 'expert',
  rating: 4.9,
  totalReviews: 127,
  completedJobs: 89,
  responseTime: '2 saat',
  availability: 'available',
  languages: ['Türkçe', 'İngilizce'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/ahmetyilmaz',
    github: 'https://github.com/ahmetyilmaz',
    website: 'https://ahmetyilmaz.dev',
  },
  portfolio: [
    {
      id: 'port-1',
      title: 'E-ticaret Web Uygulaması',
      description: 'Modern React ve Node.js ile geliştirildi',
      images: ['/portfolio/ecommerce-1.jpg', '/portfolio/ecommerce-2.jpg'],
      url: 'https://demo-ecommerce.com',
      skills: ['React', 'Node.js', 'MongoDB'],
      completedAt: '2024-01-15',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon',
      issueDate: '2023-06-15',
      url: 'https://aws.amazon.com/verify',
    },
  ],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

// Örnek mock data - Employer Profile
const mockEmployerProfile = {
  id: 'employer-456',
  email: 'info@techcorp.com',
  firstName: 'Mehmet',
  lastName: 'Kaya',
  userType: 'employer',
  avatar: '/avatars/employer-1.jpg',
  companyName: 'TechCorp Solutions',
  companySize: '11-50',
  industry: 'Software Development',
  location: 'Ankara, Türkiye',
  bio: 'Yenilikçi teknoloji çözümleri geliştiren bir şirketiz...',
  website: 'https://techcorp.com',
  totalSpent: 45000,
  activeJobs: 3,
  completedJobs: 15,
  rating: 4.7,
  totalReviews: 28,
  memberSince: '2022-08-01',
  verificationStatus: 'verified',
  paymentMethods: ['credit_card', 'bank_transfer'],
  createdAt: '2022-08-01T00:00:00Z',
  updatedAt: '2024-01-15T14:20:00Z',
};
```

#### PUT /api/users/:id

```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  title?: string; // Freelancer için
  skills?: string[]; // Freelancer için
  hourlyRate?: number; // Freelancer için
  companyName?: string; // Employer için
  industry?: string; // Employer için
  location?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
}

const mockUpdateResponse = {
  success: true,
  data: updatedUserData,
  message: 'Profil başarıyla güncellendi',
};
```

#### POST /api/users/avatar

```typescript
interface AvatarUploadRequest {
  file: File; // FormData
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AvatarUploadResponse {
  success: boolean;
  data?: {
    url: string;
    thumbnailUrl: string;
    originalUrl: string;
  };
  error?: string;
}

const mockAvatarResponse = {
  success: true,
  data: {
    url: '/uploads/avatars/user-123/avatar-processed.jpg',
    thumbnailUrl: '/uploads/avatars/user-123/avatar-thumb.jpg',
    originalUrl: '/uploads/avatars/user-123/avatar-original.jpg',
  },
};
```

### Dashboard Endpoints

#### GET /api/dashboard/freelancer

```typescript
interface FreelancerDashboardResponse {
  success: boolean;
  data?: {
    stats: {
      totalEarnings: number;
      currentMonthEarnings: number;
      activeOrders: number;
      completedJobs: number;
      responseRate: number;
      rating: number;
      profileViews: number;
    };
    recentOrders: Order[];
    recentProposals: Proposal[];
    notifications: Notification[];
    quickStats: {
      pendingProposals: number;
      messagesWaiting: number;
      reviewsPending: number;
    };
  };
}

const mockFreelancerDashboard = {
  success: true,
  data: {
    stats: {
      totalEarnings: 125000,
      currentMonthEarnings: 8500,
      activeOrders: 3,
      completedJobs: 89,
      responseRate: 96,
      rating: 4.9,
      profileViews: 247
    },
    recentOrders: [...],
    recentProposals: [...],
    notifications: [...],
    quickStats: {
      pendingProposals: 5,
      messagesWaiting: 2,
      reviewsPending: 1
    }
  }
};
```

#### GET /api/dashboard/employer

```typescript
interface EmployerDashboardResponse {
  success: boolean;
  data?: {
    stats: {
      totalSpent: number;
      currentMonthSpending: number;
      activeJobs: number;
      completedJobs: number;
      avgProjectCost: number;
      savedFreelancers: number;
    };
    activeJobs: Job[];
    recentHires: {
      freelancerId: string;
      jobTitle: string;
      amount: number;
      startDate: string;
    }[];
    notifications: Notification[];
    quickStats: {
      proposalsReceived: number;
      messagesWaiting: number;
      jobsExpiringSoon: number;
    };
  };
}
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/profile.ts
export const profileHandlers = [
  http.get('/api/users/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'Profil başarıyla güncellendi',
    });
  }),

  http.post('/api/users/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const timestamp = Date.now();
    return HttpResponse.json({
      success: true,
      data: {
        url: `/uploads/avatars/processed-${timestamp}.jpg`,
        thumbnailUrl: `/uploads/avatars/thumb-${timestamp}.jpg`,
        originalUrl: `/uploads/avatars/original-${timestamp}.jpg`,
      },
    });
  }),

  http.get('/api/dashboard/freelancer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    return HttpResponse.json({
      success: true,
      data: mockFreelancerDashboard,
    });
  }),

  http.get('/api/dashboard/employer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    return HttpResponse.json({
      success: true,
      data: mockEmployerDashboard,
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface ProfileStore {
  // State properties
  currentProfile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  uploadProgress: number;
  isDirty: boolean;

  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File, cropData?: CropData) => Promise<void>;
  addPortfolioItem: (item: PortfolioItem) => Promise<void>;
  updatePortfolioItem: (
    id: string,
    item: Partial<PortfolioItem>
  ) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;
  clearError: () => void;
  setDirty: (dirty: boolean) => void;
}

const useProfileStore = create<ProfileStore>((set, get) => ({
  currentProfile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  uploadProgress: 0,
  isDirty: false,

  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        set({
          currentProfile: data.data,
          isLoading: false,
          isDirty: false,
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Profil yüklenemedi', isLoading: false });
    }
  },

  updateProfile: async (userData: Partial<User>) => {
    set({ isUpdating: true, error: null });

    try {
      const currentProfile = get().currentProfile;
      if (!currentProfile) throw new Error('Profil bulunamadı');

      const response = await fetch(`/api/users/${currentProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        set({
          currentProfile: data.data,
          isUpdating: false,
          isDirty: false,
        });

        // Update auth store if current user
        const authStore = useAuthStore.getState();
        if (authStore.user?.id === currentProfile.id) {
          authStore.updateUser(data.data);
        }
      } else {
        set({ error: data.error, isUpdating: false });
      }
    } catch (error) {
      set({ error: 'Profil güncellenemedi', isUpdating: false });
    }
  },

  uploadAvatar: async (file: File, cropData?: CropData) => {
    set({ uploadProgress: 0, error: null });

    const formData = new FormData();
    formData.append('file', file);
    if (cropData) {
      formData.append('cropData', JSON.stringify(cropData));
    }

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const currentProfile = get().currentProfile;
        if (currentProfile) {
          set({
            currentProfile: {
              ...currentProfile,
              avatar: data.data.url,
            },
            uploadProgress: 100,
          });
        }
      } else {
        set({ error: data.error, uploadProgress: 0 });
      }
    } catch (error) {
      set({ error: 'Avatar yüklenemedi', uploadProgress: 0 });
    }
  },
}));
```

### Dashboard Store

```typescript
interface DashboardStore {
  // State
  dashboardData: FreelancerDashboard | EmployerDashboard | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;

  // Actions
  fetchDashboard: (userType: 'freelancer' | 'employer') => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
}

const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboardData: null,
  isLoading: false,
  error: null,
  lastRefresh: null,

  fetchDashboard: async (userType: 'freelancer' | 'employer') => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/dashboard/${userType}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        set({
          dashboardData: data.data,
          isLoading: false,
          lastRefresh: new Date(),
        });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Dashboard yüklenemedi', isLoading: false });
    }
  },

  refreshDashboard: async () => {
    const { user } = useAuthStore.getState();
    if (user?.userType) {
      await get().fetchDashboard(user.userType);
    }
  },
}));
```

### Custom Hooks

```typescript
// hooks/useProfile.ts
export function useProfile(userId?: string) {
  const store = useProfileStore();
  const { user } = useAuth();

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId && targetUserId !== store.currentProfile?.id) {
      store.fetchProfile(targetUserId);
    }
  }, [targetUserId]);

  const isOwnProfile = user?.id === store.currentProfile?.id;

  return {
    ...store,
    isOwnProfile,
    canEdit: isOwnProfile,
  };
}

// hooks/useDashboard.ts
export function useDashboard() {
  const store = useDashboardStore();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.userType) {
      store.fetchDashboard(user.userType);
    }
  }, [isAuthenticated, user?.userType]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      () => {
        store.refreshDashboard();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return store;
}

// hooks/useAvatarUpload.ts
export function useAvatarUpload() {
  const { uploadAvatar, uploadProgress, error } = useProfile();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (file: File, cropData?: CropData) => {
      setIsUploading(true);
      await uploadAvatar(file, cropData);
      setIsUploading(false);
    },
    [uploadAvatar]
  );

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    error,
  };
}
```

### Form Validation (Zod)

```typescript
// lib/validations/profile.ts
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(30, 'Ad en fazla 30 karakter olabilir'),
  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(30, 'Soyad en fazla 30 karakter olabilir'),
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .optional(),
  bio: z.string().max(1000, 'Bio en fazla 1000 karakter olabilir').optional(),
  location: z
    .string()
    .max(100, 'Lokasyon en fazla 100 karakter olabilir')
    .optional(),
  hourlyRate: z
    .number()
    .min(5, 'Saatlik ücret en az 5 TL olmalıdır')
    .max(1000, 'Saatlik ücret en fazla 1000 TL olabilir')
    .optional(),
  skills: z
    .array(z.string())
    .min(1, 'En az bir beceri seçmelisiniz')
    .max(20, 'En fazla 20 beceri seçebilirsiniz')
    .optional(),
  socialLinks: z
    .object({
      website: z
        .string()
        .url('Geçerli bir URL giriniz')
        .optional()
        .or(z.literal('')),
      linkedin: z
        .string()
        .url("Geçerli bir LinkedIn URL'si giriniz")
        .optional()
        .or(z.literal('')),
      github: z
        .string()
        .url("Geçerli bir GitHub URL'si giriniz")
        .optional()
        .or(z.literal('')),
    })
    .optional(),
});

export const portfolioItemSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir'),
  url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  skills: z
    .array(z.string())
    .min(1, 'En az bir teknoloji seçmelisiniz')
    .max(10, 'En fazla 10 teknoloji seçebilirsiniz'),
  images: z
    .array(z.string())
    .min(1, 'En az bir görsel eklemelisiniz')
    .max(5, 'En fazla 5 görsel ekleyebilirsiniz'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PortfolioItemFormData = z.infer<typeof portfolioItemSchema>;
```

### Component Structure

```typescript
// components/dashboard/FreelancerDashboard.tsx
interface FreelancerDashboardProps {
  userId?: string;
}

export function FreelancerDashboard({ userId }: FreelancerDashboardProps) {
  const { dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const data = dashboardData as FreelancerDashboard;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Kazanç"
          value={`₺${data.stats.totalEarnings.toLocaleString()}`}
          change="+12%"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Bu Ay"
          value={`₺${data.stats.currentMonthEarnings.toLocaleString()}`}
          change="+8%"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Aktif Siparişler"
          value={data.stats.activeOrders}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatsCard
          title="Tamamlanan İşler"
          value={data.stats.completedJobs}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Yeni Paket Ekle', href: '/packages/create', icon: <Plus /> },
          { label: 'İş İlanlarını Gör', href: '/jobs', icon: <Search /> },
          { label: 'Mesajlarım', href: '/messages', icon: <MessageCircle /> }
        ]}
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={data.recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Teklifler</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline items={data.recentProposals} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Freelancer Dashboard completely implemented with real-time stats
- [ ] Employer Dashboard ile job management functionality
- [ ] Profile viewing system working for both user types
- [ ] Profile editing form with auto-save functionality
- [ ] Avatar upload system with crop feature implemented
- [ ] Portfolio management system fully functional
- [ ] Responsive design (mobile, tablet, desktop) tested

### Technical Deliverables

- [ ] ProfileStore ve DashboardStore Zustand stores implemented
- [ ] useProfile, useDashboard, useAvatarUpload custom hooks
- [ ] Profile ve dashboard TypeScript types defined
- [ ] Zod validation schemas for profile forms
- [ ] MSW handlers for profile ve dashboard endpoints
- [ ] Dashboard component system created
- [ ] Unit tests for profile components

### Quality Deliverables

- [ ] Accessibility compliance for dashboard ve profile screens
- [ ] Cross-browser compatibility tested
- [ ] Performance optimized (dashboard load <2s)
- [ ] Code review completed for profile system
- [ ] Image optimization ve upload security implemented

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Login → Dashboard load → View stats
  2. Edit profile → Upload avatar → Save changes
  3. Add portfolio item → View public profile
  4. Check earnings → Quick action navigation

- **Employer Journey**:
  1. Login → Dashboard → View active jobs
  2. Browse freelancer profiles → View portfolios
  3. Edit company profile → Update industry info
  4. Dashboard analytics → Spending overview

### Edge Cases

- **Large image upload**: Progress indication, file size validation
- **Slow network**: Loading states, timeout handling
- **Profile completeness**: Progress bar accuracy
- **Concurrent edits**: Auto-save conflict resolution
- **Empty states**: First-time user dashboard

### Performance Tests

- Dashboard load time: <2 seconds with full data
- Profile edit auto-save: <500ms response time
- Avatar upload: Progress feedback, <10s complete
- Image optimization: Proper size/format conversion

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Dashboard data real-time güncelleniyor
- [ ] Profile edit changes immediately reflected
- [ ] Avatar upload ve crop functionality perfect
- [ ] Portfolio CRUD operations working smoothly
- [ ] Role-based dashboard content accurate
- [ ] Auto-save preventing data loss

### Design Acceptance

- [ ] Dashboard responsive tüm device'larda
- [ ] Profile pages visually consistent
- [ ] Loading states smooth ve informative
- [ ] Image galleries responsive ve accessible
- [ ] Stats cards ve charts readable

### Technical Acceptance

- [ ] TypeScript strict mode compliance
- [ ] Zero console errors/warnings
- [ ] Profile update API calls optimized
- [ ] Image upload security implemented
- [ ] Component reusability maintained
- [ ] Store state management efficient

## 📊 Definition of Done

- [ ] All functional requirements implemented ve tested
- [ ] Mobile responsiveness verified across devices
- [ ] Browser compatibility confirmed
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Unit ve integration tests passing (%80+ coverage)
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] Security review for file uploads completed
- [ ] Documentation updated
- [ ] User acceptance testing completed
