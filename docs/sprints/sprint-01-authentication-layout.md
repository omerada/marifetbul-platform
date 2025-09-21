# Sprint 1: Kimlik Doğrulama ve Temel Layout Sistemi - 2 hafta

## 🎯 Sprint Hedefleri

- Kullanıcı kayıt/giriş sistemi tamamlanması
- Rol bazlı route yönlendirme ve middleware entegrasyonu
- Responsive layout bileşenlerinin oluşturulması
- PWA manager entegrasyonu
- Mobile-first navigation sistemi

## 📱 Geliştirilecek Ekranlar

### Login Ekranı

**Rol**: Both  
**Özellikler**:

- Email/Password girişi ile form validation
- "Beni Hatırla" checkbox ile remember me özelliği
- Responsive tasarım (mobile-first)
- Loading states ve error handling
- Forgot password link integration

### Register Ekranı

**Rol**: Both
**Özellikler**:

- Multi-step form (3 adım: Kişisel Bilgiler → Rol Seçimi → Tamamlama)
- Real-time form validation ile instant feedback
- Rol seçimi için görsel kart tasarımı
- Email verification workflow
- Terms & conditions acceptance

### Ana Layout Bileşenleri

**Rol**: Both
**Özellikler**:

- Header ile navigation menüsü
- Mobile hamburger menu
- Footer bileşeni
- Sidebar navigation (dashboard için)
- Breadcrumb navigation

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `AuthLayout` - Kimlik doğrulama sayfaları için
  - `MainLayout` - Ana uygulama layout'u
  - `MobileNavigation` - Mobil navigasyon menüsü
  - `Header` - Üst navigation bar
  - `Footer` - Alt footer bileşeni
  - `MultiStepForm` - Çok adımlı form bileşeni
  - `RoleSelectionCard` - Rol seçimi kartları

- **Güncellenecek Component'lar**:
  - `Input` - Gelişmiş validation desteği
  - `Button` - Loading states ekleme
  - `Toast` - Bildirim sistemi

- **UI Library Integration**:
  - `Card`, `Button`, `Input`, `Checkbox` (Shadcn/ui)
  - `Progress` - Multi-step form için
  - `Dialog` - Modal component'ler için

### User Flow

- **Employer Flow**: Landing → Login/Register → Role Selection (Employer) → Company Info → Dashboard
- **Freelancer Flow**: Landing → Login/Register → Role Selection (Freelancer) → Profile Setup → Dashboard

### States & Interactions

- **Loading States**: Form submission, login, register süreçleri
- **Error Handling**: Invalid credentials, validation errors, network errors
- **Empty States**: First-time user dashboard states
- **Success States**: Successful registration, login completion

### Accessibility

- ARIA labels for form inputs and buttons
- Keyboard navigation for multi-step forms
- Screen reader support for error messages
- Focus management between form steps

## ⚙️ Fonksiyonel Özellikler

### Authentication System

**Açıklama**: Kullanıcı kimlik doğrulama sistemi ile JWT token yönetimi
**Employer Perspective**: İşveren hesabı oluşturma, şirket bilgileri ekleme
**Freelancer Perspective**: Freelancer hesabı oluşturma, beceri/deneyim bilgileri
**Acceptance Criteria**:

- [ ] Kullanıcı email/password ile giriş yapabilir
- [ ] Kayıt sırasında rol seçimi yapılabilir
- [ ] JWT token güvenli şekilde saklanır
- [ ] Middleware ile route protection çalışır
- [ ] Remember me özelliği çalışır

### Role-based Navigation

**Açıklama**: Kullanıcı rolüne göre farklı navigasyon menüsü gösterimi
**Employer Perspective**: İş ilanları, freelancer keşfi, mesajlaşma menüleri
**Freelancer Perspective**: İş ara, paketlerim, siparişlerim menüleri
**Acceptance Criteria**:

- [ ] Role-based menu items gösterilir
- [ ] Unauthorized sayfalara erişim engellenir
- [ ] Mobile navigation responsive çalışır
- [ ] Active page highlighting çalışır
- [ ] Logout functionality tamamen functional

### PWA Integration

**Açıklama**: Progressive Web App özellikleri ile offline destek
**Employer Perspective**: Offline iş ilanlarını görüntüleyebilme
**Freelancer Perspective**: Offline mesajları ve bildirimleri görebilme
**Acceptance Criteria**:

- [ ] Service worker registration
- [ ] App manifest dosyası konfigürasyonu
- [ ] Offline sayfa gösterimi
- [ ] Push notification permission isteme
- [ ] Install prompt gösterimi

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/auth/*`

#### POST /api/auth/login

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    expiresAt: string;
  };
  error?: string;
}

// Örnek mock data
const mockLoginData = {
  success: true,
  data: {
    user: {
      id: 'user-123',
      email: 'ahmet@example.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      userType: 'freelancer',
      avatar: '/avatars/freelancer-1.jpg',
      location: 'İstanbul, Türkiye',
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    expiresAt: '2024-02-15T12:00:00Z',
  },
};
```

#### POST /api/auth/register

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
  agreeToTerms: boolean;
  companyName?: string; // Employer için
  skills?: string[]; // Freelancer için
}

interface RegisterResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    emailVerificationRequired: boolean;
  };
  error?: string;
}

// Örnek mock data
const mockRegisterData = {
  success: true,
  data: {
    user: {
      id: 'user-456',
      email: 'yeni@kullanici.com',
      firstName: 'Yeni',
      lastName: 'Kullanıcı',
      userType: 'employer',
      createdAt: new Date().toISOString(),
    },
    token: 'new-jwt-token-here',
    emailVerificationRequired: true,
  },
};
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/auth.ts
export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password, rememberMe } = await request.json();

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          token: `mock-token-${Date.now()}`,
          expiresAt: new Date(
            Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Geçersiz email veya şifre' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const userData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user exists
    if (userData.email === 'exists@example.com') {
      return HttpResponse.json(
        { success: false, error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: { ...userData, id: `user-${Date.now()}` },
        token: `token-${Date.now()}`,
        emailVerificationRequired: true,
      },
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface AuthStore {
  // State properties
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              rememberMe,
              isLoading: false,
            });
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Bağlantı hatası', isLoading: false });
        }
      },

      register: async (userData: RegisterFormData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data.user,
              token: data.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ error: data.error, isLoading: false });
          }
        } catch (error) {
          set({ error: 'Kayıt sırasında hata oluştu', isLoading: false });
        }
      },
    }),
    {
      name: 'marifetbul-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
```

### Custom Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const store = useAuthStore();

  const isEmployer = useMemo(
    () => store.user?.userType === 'employer',
    [store.user]
  );

  const isFreelancer = useMemo(
    () => store.user?.userType === 'freelancer',
    [store.user]
  );

  return {
    ...store,
    isEmployer,
    isFreelancer,
  };
}

// hooks/useAuthGuard.ts
export function useAuthGuard(requiredRole?: 'employer' | 'freelancer') {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.userType !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, isLoading, requiredRole]);

  return { isLoading: isLoading || !isAuthenticated };
}
```

### Form Validation (Zod)

```typescript
// lib/validations/auth.ts
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email adresi gereklidir')
    .email('Geçerli bir email adresi giriniz'),
  password: z
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(50, 'Şifre en fazla 50 karakter olabilir'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(30, 'Ad en fazla 30 karakter olabilir')
      .regex(/^[a-zA-ZğĞıİöÖüÜşŞçÇ\s]+$/, 'Geçersiz karakter kullanıldı'),
    lastName: z
      .string()
      .min(2, 'Soyad en az 2 karakter olmalıdır')
      .max(30, 'Soyad en fazla 30 karakter olabilir'),
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Şifre büyük harf, küçük harf ve rakam içermelidir'
      ),
    confirmPassword: z.string(),
    userType: z.enum(['freelancer', 'employer'], {
      errorMap: () => ({ message: 'Bir rol seçmelisiniz' }),
    }),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'Hizmet şartlarını kabul etmelisiniz'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Component Structure

```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.email, data.password, data.rememberMe);

    if (onSuccess) {
      onSuccess();
    } else if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        placeholder="Email adresiniz"
        error={errors.email?.message}
        disabled={isLoading}
      />

      <Input
        {...register('password')}
        type="password"
        placeholder="Şifreniz"
        error={errors.password?.message}
        disabled={isLoading}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          {...register('rememberMe')}
          id="rememberMe"
          disabled={isLoading}
        />
        <label htmlFor="rememberMe">Beni hatırla</label>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  );
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Login sayfası completely implemented ve functional
- [ ] Register sayfası multi-step form ile implemented
- [ ] Role-based authentication completely working
- [ ] Responsive design (mobile, tablet, desktop) tested
- [ ] Form validation with user-friendly Turkish messages
- [ ] Error handling and loading states implemented
- [ ] PWA features (manifest, service worker) integrated

### Technical Deliverables

- [ ] AuthStore Zustand store implemented ve tested
- [ ] useAuth, useAuthGuard custom hooks created
- [ ] TypeScript auth types updated ve comprehensive
- [ ] Zod validation schemas with Turkish messages
- [ ] MSW auth handlers fully implemented
- [ ] Layout component system created
- [ ] Component unit tests for auth forms

### Quality Deliverables

- [ ] Accessibility compliance (WCAG 2.1 AA) için auth forms
- [ ] Cross-browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Performance optimized (Lighthouse >90 for login/register pages)
- [ ] Code review completed for all auth components
- [ ] Authentication security review completed

## ✅ Test Scenarios

### User Journey Tests

- **Employer Journey**:
  1. Landing page → Click "Kayıt Ol"
  2. Email/password entry → Role selection (Employer)
  3. Company info entry → Dashboard redirect
  4. Logout → Login back successfully

- **Freelancer Journey**:
  1. Landing page → Click "Kayıt Ol"
  2. Personal info → Role selection (Freelancer)
  3. Skills entry → Dashboard redirect
  4. Browser refresh → Still authenticated

### Edge Cases

- **Invalid credentials**: Proper error message displayed, form not reset
- **Network failure**: Loading state maintained, retry button shown
- **Token expiration**: Auto-logout, redirect to login with message
- **Simultaneous login attempts**: Proper race condition handling
- **Browser back button**: Navigation handled correctly

### Performance Tests

- Login form submission: <2 seconds response time
- Registration complete flow: <3 seconds total time
- JWT token validation: <100ms response time
- Page load with authentication check: <1.5 seconds

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Kullanıcı valid credentials ile login olabiliyor
- [ ] Kayıt süreci 3 adımda tamamlanabiliyor
- [ ] Role-based redirect after login çalışıyor
- [ ] Remember me checkbox functionality working
- [ ] Password reset link navigation working
- [ ] Form validation messages Türkçe ve user-friendly

### Design Acceptance

- [ ] Mobile-first responsive design implemented
- [ ] Design system tutarlılığı (colors, typography, spacing)
- [ ] Loading states smooth animations ile
- [ ] Error states visual feedback ile clear
- [ ] Accessibility standards (ARIA labels, keyboard nav)

### Technical Acceptance

- [ ] TypeScript strict mode no errors
- [ ] ESLint/Prettier kurallarına %100 uygun
- [ ] Test coverage minimum %80 for auth components
- [ ] No console errors veya warnings
- [ ] JWT token securely stored ve managed
- [ ] Middleware route protection working

## 📊 Definition of Done

- [ ] Feature requirements %100 tamamlandı ve tested
- [ ] Mobile, tablet, desktop responsive tested
- [ ] Chrome, Firefox, Safari, Edge compatibility doğrulandı
- [ ] WCAG 2.1 AA accessibility audit passed
- [ ] Unit tests implemented ve passing (%80+ coverage)
- [ ] Integration tests for auth flow implemented
- [ ] Code review approved by senior developer
- [ ] Technical documentation updated
- [ ] Performance requirements met (Lighthouse >90)
- [ ] Security review completed for authentication
