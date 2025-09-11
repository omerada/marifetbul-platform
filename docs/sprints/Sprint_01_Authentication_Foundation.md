# Sprint 1: Authentication & Foundation - 2 hafta

## 🎯 Sprint Hedefleri

- Kullanıcı kimlik doğrulama sisteminin temel altyapısını oluşturmak
- Rol bazlı (Employer/Freelancer) kayıt sistemi geliştirmek
- Temel layout ve navigation yapısını kurmak
- MSW ile auth API'lerini mock'lamak
- TypeScript type sistemini güçlendirmek

## 📱 Geliştirilecek Ekranlar

### Login Ekranı

**Rol**: Both (Employer/Freelancer)  
**Özellikler**:

- Email/Password girişi
- "Beni Hatırla" checkbox seçeneği
- Sosyal medya login (Google, LinkedIn) placeholder'ları
- "Şifremi Unuttum" link'i
- Kayıt sayfasına yönlendirme
- Form validation ile gerçek zamanlı hata gösterimi
- Loading states ve başarı mesajları

### Register Ekranı

**Rol**: Both (Employer/Freelancer)
**Özellikler**:

- Multi-step form (3 adım) - Progress indicator ile
- Adım 1: Temel bilgiler (email, şifre, ad/soyad, telefon)
- Adım 2: Rol seçimi (Employer/Freelancer) - Card'lar ile görsel seçim
- Adım 3: Rol bazlı ek bilgiler (Employer: şirket adı, sektör / Freelancer: uzmanlık alanı)
- Email verification flow simulation
- Şartlar ve koşullar onay checkbox'ı
- Şifre güçlülük göstergesi

### Email Verification Ekranı

**Rol**: Both
**Özellikler**:

- Email gönderildi confirmation
- Resend email butonu (cooldown timer ile)
- Manual kod girişi alanı
- Success/error states

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `AuthLayout` - Auth sayfaları için özel layout
  - `StepIndicator` - Multi-step form progress
  - `RoleSelectionCard` - Rol seçimi için özel kart bileşeni
  - `PasswordStrengthMeter` - Şifre güçlülük göstergesi
  - `FormInput` - Enhanced input component with validation
  - `AuthButton` - Auth işlemleri için özel buton
  - `SocialLoginButton` - Sosyal medya giriş butonları

- **Güncellenecek Component'lar**:
  - `Button` - Loading states ekleme
  - `Input` - Validation states ekleme
  - `Card` - Selection variant ekleme

- **UI Library Integration**:
  - Shadcn/ui Dialog, Form, Input, Button, Card, Badge, Alert

### User Flow

- **Employer Flow**:
  1. Landing page'den "İş Ver" →
  2. Register'a yönlendirme →
  3. Basic info (ad, email, şifre) →
  4. Role selection (Employer seçimi) →
  5. Company info (şirket adı, sektör, çalışan sayısı) →
  6. Email verification →
  7. Welcome dashboard

- **Freelancer Flow**:
  1. Landing page'den "Freelancer Ol" →
  2. Register'a yönlendirme →
  3. Basic info (ad, email, şifre) →
  4. Role selection (Freelancer seçimi) →
  5. Skill info (ana uzmanlık, deneyim yılı, saatlik ücret) →
  6. Email verification →
  7. Profile completion wizard

### States & Interactions

- **Loading States**:
  - Form submission loading (button'da spinner)
  - Email verification sending (resend button disable)
  - Social login redirects (overlay loading)

- **Error Handling**:
  - Email already exists hatası
  - Zayıf şifre hatası
  - Email format validation
  - Required field validations
  - Network error handling

- **Empty States**:
  - Email verification pending durumu
  - Form başlangıç durumu

- **Success States**:
  - Registration success animation
  - Email sent confirmation
  - Login success ve redirect

### Accessibility

- Form'larda proper label-input associations
- ARIA labels for multi-step progress
- Keyboard navigation (Tab order)
- Screen reader announcements for state changes
- Focus management between steps
- High contrast support

## ⚙️ Fonksiyonel Özellikler

### Authentication System

**Açıklama**: JWT tabanlı kimlik doğrulama sistemi
**Employer Perspective**: Şirket bilgileri ile kayıt olup işlerini yönetebilir
**Freelancer Perspective**: Kişisel bilgiler ile kayıt olup hizmet sunabilir
**Acceptance Criteria**:

- [ ] Kullanıcı email/şifre ile kayıt olabilir
- [ ] Rol seçimi (Employer/Freelancer) çalışır
- [ ] Email verification simülasyonu çalışır
- [ ] Login/logout işlemleri çalışır
- [ ] JWT token'ları doğru şekilde yönetilir
- [ ] Protected routes middleware çalışır

### Role-based Registration

**Açıklama**: Kullanıcı rolüne göre farklı onboarding süreçleri
**Employer Perspective**: Şirket bilgileri, sektör, bütçe bilgisi ister
**Freelancer Perspective**: Beceriler, deneyim, saatlik ücret bilgisi ister
**Acceptance Criteria**:

- [ ] Rol seçimi ekranı çalışır
- [ ] Her rol için farklı form alanları gösterilir
- [ ] Rol bilgisi veritabanında doğru saklanır
- [ ] Role-based dashboard yönlendirmesi çalışır

### Form Validation System

**Açıklama**: Zod schema'ları ile comprehensive form validation
**Employer Perspective**: Şirket email formatı, vergi no validasyonu
**Freelancer Perspective**: Portfolio URL validasyonu, skill sınırları
**Acceptance Criteria**:

- [ ] Real-time validation çalışır
- [ ] Türkçe hata mesajları gösterilir
- [ ] Password strength meter çalışır
- [ ] Email format validation çalışır
- [ ] Required field validations çalışır

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/auth`

#### POST /api/v1/auth/register

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'employer' | 'freelancer';
  additionalData: {
    // Employer için
    companyName?: string;
    industry?: string;
    employeeCount?: string;
    // Freelancer için
    specialization?: string;
    experienceYears?: number;
    hourlyRate?: number;
  };
  termsAccepted: boolean;
}

interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'employer' | 'freelancer';
      isEmailVerified: boolean;
      createdAt: string;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

// Örnek mock data
const mockRegisterData = {
  success: true,
  data: {
    user: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employer',
      isEmailVerified: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    token: 'jwt_token_here',
    refreshToken: 'refresh_token_here',
  },
  message: 'Kayıt işlemi başarılı! Email adresinizi kontrol edin.',
};
```

#### POST /api/v1/auth/login

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'employer' | 'freelancer';
      isEmailVerified: boolean;
      profileComplete: boolean;
      avatar?: string;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

// Örnek mock data
const mockLoginData = {
  success: true,
  data: {
    user: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employer',
      isEmailVerified: true,
      profileComplete: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
    token: 'jwt_token_here',
    refreshToken: 'refresh_token_here',
  },
  message: 'Giriş başarılı! Hoş geldiniz.',
};
```

#### POST /api/v1/auth/verify-email

```typescript
interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

// Örnek mock data
const mockVerifyEmailData = {
  success: true,
  message: 'Email adresiniz başarıyla doğrulandı!',
};
```

#### POST /api/v1/auth/forgot-password

```typescript
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}
```

#### POST /api/v1/auth/logout

```typescript
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

### MSW Handler Implementation

```typescript
// handlers/auth.ts
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;

    // Email validation
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Bu email adresi zaten kullanımda.',
          errors: { email: 'Email adresi zaten kayıtlı' },
        },
        { status: 400 }
      );
    }

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return HttpResponse.json(mockRegisterData, { status: 201 });
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    // Mock user credentials
    const validUsers = {
      'john@employer.com': { password: '123456', role: 'employer' },
      'jane@freelancer.com': { password: '123456', role: 'freelancer' },
    };

    const user = validUsers[body.email];
    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Email veya şifre hatalı.',
          errors: { general: 'Giriş bilgileri doğrulanamadı' },
        },
        { status: 401 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      ...mockLoginData,
      data: {
        ...mockLoginData.data,
        user: {
          ...mockLoginData.data.user,
          role: user.role,
        },
      },
    });
  }),

  http.post('/api/v1/auth/verify-email', async ({ request }) => {
    const body = (await request.json()) as VerifyEmailRequest;

    // Mock verification code
    if (body.code === '123456') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return HttpResponse.json(mockVerifyEmailData);
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Doğrulama kodu hatalı.',
        errors: { code: 'Geçersiz kod' },
      },
      { status: 400 }
    );
  }),

  http.post('/api/v1/auth/forgot-password', async ({ request }) => {
    const body = (await request.json()) as ForgotPasswordRequest;

    await new Promise((resolve) => setTimeout(resolve, 1200));

    return HttpResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi.',
    });
  }),

  http.post('/api/v1/auth/logout', async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json({
      success: true,
      message: 'Çıkış işlemi başarılı.',
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
// lib/store/authStore.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employer' | 'freelancer';
  isEmailVerified: boolean;
  profileComplete: boolean;
  avatar?: string;
}

interface AuthStore {
  // State properties
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<RegisterResponse>(
        '/auth/register',
        data
      );
      set({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store tokens
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    } catch (error: any) {
      set({
        error: error.message || 'Kayıt işlemi başarısız',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      set({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store tokens
      if (data.rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      } else {
        sessionStorage.setItem('token', response.data.token);
      }
    } catch (error: any) {
      set({
        error: error.message || 'Giriş işlemi başarısız',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/verify-email', { email, code });
      set((state) => ({
        user: state.user ? { ...state.user, isEmailVerified: true } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Email doğrulama başarısız',
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/forgot-password', { email });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Şifre sıfırlama başarısız',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshAuth: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;

    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });

      set({
        token: response.data.token,
        user: response.data.user,
        isAuthenticated: true,
      });

      localStorage.setItem('token', response.data.token);
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));
```

### Custom Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Check for stored tokens on mount
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && !store.isAuthenticated) {
      store.refreshAuth();
    }
  }, []);

  return {
    user: store.user,
    isLoading: store.isLoading,
    error: store.error,
    isAuthenticated: store.isAuthenticated,
    register: store.register,
    login: store.login,
    logout: store.logout,
    verifyEmail: store.verifyEmail,
    forgotPassword: store.forgotPassword,
    clearError: store.clearError,
  };
}

// hooks/useAuthGuard.ts
export function useAuthGuard(requiredRole?: 'employer' | 'freelancer') {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

    if (!user?.isEmailVerified) {
      router.push('/verify-email');
      return;
    }
  }, [isAuthenticated, user, requiredRole]);

  return {
    user,
    isAuthenticated,
    canAccess:
      isAuthenticated && (!requiredRole || user?.role === requiredRole),
  };
}
```

### Form Validation (Zod)

```typescript
// lib/validations/auth.ts
export const registerSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi giriniz')
    .min(1, 'Email adresi zorunludur'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  phone: z
    .string()
    .regex(
      /^(\+90|0)?[5][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/,
      'Geçerli bir telefon numarası giriniz'
    ),
  role: z.enum(['employer', 'freelancer'], {
    required_error: 'Lütfen bir rol seçiniz',
  }),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'Şartları kabul etmelisiniz'),
});

// Employer için ek alanlar
export const employerAdditionalSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Şirket adı en az 2 karakter olmalıdır')
    .max(100, 'Şirket adı en fazla 100 karakter olabilir'),
  industry: z.string().min(1, 'Sektör seçimi zorunludur'),
  employeeCount: z.string().min(1, 'Çalışan sayısı seçimi zorunludur'),
});

// Freelancer için ek alanlar
export const freelancerAdditionalSchema = z.object({
  specialization: z.string().min(1, 'Uzmanlık alanı seçimi zorunludur'),
  experienceYears: z
    .number()
    .min(0, 'Deneyim yılı 0 veya daha fazla olmalıdır')
    .max(50, "Deneyim yılı 50'den fazla olamaz"),
  hourlyRate: z
    .number()
    .min(1, 'Saatlik ücret en az 1 TL olmalıdır')
    .max(10000, 'Saatlik ücret en fazla 10.000 TL olabilir'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi giriniz')
    .min(1, 'Email adresi zorunludur'),
  password: z.string().min(1, 'Şifre zorunludur'),
  rememberMe: z.boolean().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  code: z
    .string()
    .length(6, 'Doğrulama kodu 6 karakter olmalıdır')
    .regex(/^\d{6}$/, 'Doğrulama kodu sadece rakamlardan oluşmalıdır'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi giriniz')
    .min(1, 'Email adresi zorunludur'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmployerAdditionalData = z.infer<typeof employerAdditionalSchema>;
export type FreelancerAdditionalData = z.infer<
  typeof freelancerAdditionalSchema
>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
```

### Component Structure

```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      onSuccess?.();
      router.push(redirectTo);
    } catch {
      // Error handled by store
    }
  };

  useEffect(() => {
    clearError();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapın ve işe başlayın
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormInput
            label="Email Adresi"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="ornek@email.com"
          />

          <FormInput
            label="Şifre"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm">
                Beni Hatırla
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Şifremi Unuttum
            </Link>
          </div>

          <AuthButton
            type="submit"
            isLoading={isLoading}
            disabled={!isValid}
            className="w-full"
          >
            Giriş Yap
          </AuthButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Login sayfası completely implemented
- [ ] Register sayfası (3-step) completely implemented
- [ ] Email verification flow completely implemented
- [ ] Forgot password flow completely implemented
- [ ] Role-based registration completely implemented
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation with user-friendly Turkish messages
- [ ] Error handling and loading states
- [ ] Mock API integration completed

### Technical Deliverables

- [ ] AuthStore (Zustand) implemented
- [ ] useAuth, useAuthGuard hooks created
- [ ] TypeScript auth types defined
- [ ] Zod validation schemas implemented
- [ ] MSW auth handlers implemented
- [ ] Auth component library created
- [ ] JWT token management system
- [ ] Middleware for protected routes

### Quality Deliverables

- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser compatibility tested
- [ ] Performance optimized (Lighthouse >90)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Employer Journey**:
  1. Ana sayfaya gel → "İş Ver" tıkla → Register sayfası açılsın
  2. Email/şifre/bilgiler gir → Role "Employer" seç → Company bilgileri gir
  3. Email verification simüle et → Dashboard'a yönlendir

- **Freelancer Journey**:
  1. Ana sayfaya gel → "Freelancer Ol" tıkla → Register sayfası açılsın
  2. Email/şifre/bilgiler gir → Role "Freelancer" seç → Skill bilgileri gir
  3. Email verification simüle et → Profile wizard'a yönlendir

### Edge Cases

- **Email zaten var**: Kayıt sırasında "existing@example.com" girildiğinde uygun hata mesajı
- **Zayıf şifre**: Şifre kriterlerini karşılamayan durumlar için real-time feedback
- **Network hatası**: API'ler erişilemez olduğunda graceful degradation
- **Token expiry**: JWT süresi dolduğunda automatic refresh attempt

### Performance Tests

- Login form submission < 1 saniye
- Register flow completion < 3 saniye
- Page load time < 2 saniye
- Memory usage < 50MB

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Kullanıcı employer rolü ile kayıt olabiliyor
- [ ] Kullanıcı freelancer rolü ile kayıt olabiliyor
- [ ] Email/şifre ile giriş yapabiliyor
- [ ] "Beni hatırla" seçeneği çalışıyor
- [ ] Email verification flow simüle ediliyor
- [ ] Forgot password flow simüle ediliyor
- [ ] Rol bazlı dashboard yönlendirmeleri çalışıyor

### Design Acceptance

- [ ] Design system tutarlılığı sağlandı
- [ ] Mobile-first responsive tasarım
- [ ] Loading states görsel olarak tatmin edici
- [ ] Error states kullanıcı dostu
- [ ] Form step transitions smooth
- [ ] Accessibility standartları karşılandı

### Technical Acceptance

- [ ] TypeScript strict mode hatası yok
- [ ] ESLint/Prettier kurallarına uygun
- [ ] JWT tokens güvenli şekilde store ediliyor
- [ ] Protected routes middleware çalışıyor
- [ ] Console error/warning yok
- [ ] All MSW handlers working properly

## 📊 Definition of Done

- [ ] Feature requirements %100 tamamlandı
- [ ] Responsive design test edildi (Chrome, Firefox, Safari)
- [ ] Cross-browser compatibility doğrulandı
- [ ] Accessibility audit passed (axe-core)
- [ ] Form validation comprehensive
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Performance requirements met (Lighthouse > 90)
- [ ] MSW integration working
- [ ] TypeScript types complete
