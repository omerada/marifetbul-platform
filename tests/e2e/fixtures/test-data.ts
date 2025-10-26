/**
 * Test fixtures - Reusable test data
 */

export const TEST_USERS = {
  buyer: {
    email: 'buyer@test.com',
    password: 'Test@1234Pass!',
    username: 'test_buyer',
    firstName: 'John',
    lastName: 'Buyer',
  },
  seller: {
    email: 'seller@test.com',
    password: 'Test@1234Pass!',
    username: 'test_seller',
    firstName: 'Jane',
    lastName: 'Seller',
  },
  admin: {
    email: 'admin@test.com',
    password: 'Admin@1234Pass!',
    username: 'test_admin',
    firstName: 'Admin',
    lastName: 'User',
  },
};

export const TEST_PACKAGES = {
  basic: {
    title: 'Logo Tasarımı - Test Paketi',
    description:
      'Profesyonel logo tasarımı hizmeti. Modern ve etkileyici logoları sizin için tasarlıyorum.',
    category: 'graphic_design',
    subcategory: 'logo_design',
    basicPrice: '500',
    standardPrice: '1000',
    premiumPrice: '2000',
    deliveryTime: 3,
    revisions: 2,
    tags: ['logo', 'tasarım', 'grafik'],
  },
  webDevelopment: {
    title: 'Web Sitesi Geliştirme - Test Paketi',
    description:
      'Modern ve responsive web siteleri geliştiriyorum. React, Next.js, TypeScript ile profesyonel çözümler.',
    category: 'programming',
    subcategory: 'web_development',
    basicPrice: '3000',
    standardPrice: '6000',
    premiumPrice: '12000',
    deliveryTime: 7,
    revisions: 3,
    tags: ['web', 'react', 'nextjs'],
  },
  contentWriting: {
    title: 'İçerik Yazarlığı - Test Paketi',
    description:
      'SEO uyumlu, özgün ve etkileyici içerikler yazıyorum. Blog yazıları, ürün açıklamaları ve daha fazlası.',
    category: 'writing',
    subcategory: 'content_writing',
    basicPrice: '300',
    standardPrice: '600',
    premiumPrice: '1200',
    deliveryTime: 2,
    revisions: 2,
    tags: ['yazı', 'içerik', 'seo'],
  },
};

export const TEST_REVIEWS = {
  positive: {
    rating: 5,
    title: 'Mükemmel Hizmet!',
    comment:
      'Harika bir deneyimdi. Profesyonel, hızlı ve kaliteli. Kesinlikle tavsiye ederim!',
    pros: ['Hızlı teslimat', 'Kaliteli iş', 'İyi iletişim'],
    cons: [],
    wouldRecommend: true,
  },
  negative: {
    rating: 2,
    title: 'Beklentimi karşılamadı',
    comment: 'Maalesef beklediğim kalitede değildi. İletişim de zayıftı.',
    pros: ['Zamanında teslim'],
    cons: ['Kalite düşük', 'İletişim zayıf', 'Revizyon yetersiz'],
    wouldRecommend: false,
  },
  neutral: {
    rating: 3,
    title: 'İdare eder',
    comment: 'Ortalama bir deneyimdi. İyi tarafları ve kötü tarafları var.',
    pros: ['Uygun fiyat'],
    cons: ['Geç teslimat'],
    wouldRecommend: true,
  },
};

export const TEST_MESSAGES = {
  inquiry: 'Merhaba, paketiniz hakkında bilgi alabilir miyim?',
  negotiation: 'Fiyat konusunda indirim yapabilir misiniz?',
  order_update: 'Siparişim ne durumda?',
  revision_request: 'Bazı değişiklikler yapılabilir mi?',
  thank_you: 'Çok teşekkür ederim, harika bir iş çıkardınız!',
};

export const TEST_ORDERS = {
  basic: {
    tier: 'BASIC',
    packageTitle: 'Logo Tasarımı - Test Paketi',
    price: 500,
    deliveryTime: 3,
  },
  standard: {
    tier: 'STANDARD',
    packageTitle: 'Logo Tasarımı - Test Paketi',
    price: 1000,
    deliveryTime: 5,
  },
  premium: {
    tier: 'PREMIUM',
    packageTitle: 'Logo Tasarımı - Test Paketi',
    price: 2000,
    deliveryTime: 7,
  },
};

export const TEST_PAYMENT_METHODS = {
  validCard: {
    number: '4242424242424242',
    expMonth: '12',
    expYear: '2034',
    cvc: '123',
    zip: '12345',
  },
  declinedCard: {
    number: '4000000000000002',
    expMonth: '12',
    expYear: '2034',
    cvc: '123',
    zip: '12345',
  },
  requiresAuthentication: {
    number: '4000002500003155',
    expMonth: '12',
    expYear: '2034',
    cvc: '123',
    zip: '12345',
  },
};

export const TEST_FILTERS = {
  priceRange: {
    min: 100,
    max: 5000,
  },
  rating: {
    min: 4,
  },
  deliveryTime: {
    max: 7,
  },
  categories: ['graphic_design', 'programming', 'writing'],
};

export const TEST_SEARCH_QUERIES = {
  valid: ['logo tasarım', 'web geliştirme', 'içerik yazarlığı'],
  noResults: ['qwerty12345xyz', 'nonexistent service'],
  withFilters: {
    query: 'tasarım',
    category: 'graphic_design',
    minPrice: 100,
    maxPrice: 1000,
  },
};

export const TIMEOUT = {
  short: 5000,
  medium: 10000,
  long: 30000,
  api: 15000,
};

export const SELECTORS = {
  // Auth
  loginForm: 'form[data-testid="login-form"]',
  registerForm: 'form[data-testid="register-form"]',
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  submitButton: 'button[type="submit"]',

  // Navigation
  userMenu: '[data-testid="user-menu-trigger"]',
  logoutButton: '[data-testid="logout-button"]',
  dashboardLink: 'a[href="/dashboard"]',
  marketplaceLink: 'a[href="/marketplace"]',

  // Package
  packageCard: '[data-testid="package-card"]',
  packageTitle: '[data-testid="package-title"]',
  packagePrice: '[data-testid="package-price"]',
  buyButton: '[data-testid="buy-button"]',

  // Review
  reviewCard: '[data-testid="review-card"]',
  reviewForm: '[data-testid="review-form"]',
  ratingStars: '[data-testid="rating-stars"]',
  submitReview: '[data-testid="submit-review"]',

  // Message
  messageInput: '[data-testid="message-input"]',
  sendMessage: '[data-testid="send-message"]',
  conversationList: '[data-testid="conversation-list"]',

  // Payment
  checkoutForm: '[data-testid="checkout-form"]',
  cardElement: 'iframe[name^="__privateStripeFrame"]',
  payButton: '[data-testid="pay-button"]',

  // Toast
  toast: '[data-testid="toast"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',
};

export const ERROR_MESSAGES = {
  invalidEmail: 'Geçerli bir email adresi giriniz',
  weakPassword:
    'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, sayı ve özel karakter içermelidir',
  passwordMismatch: 'Şifreler eşleşmiyor',
  requiredField: 'Bu alan zorunludur',
  emailExists: 'Bu email adresi zaten kullanılıyor',
  invalidCredentials: 'Email veya şifre hatalı',
  paymentFailed: 'Ödeme başarısız oldu',
  insufficientBalance: 'Yetersiz bakiye',
};

export const SUCCESS_MESSAGES = {
  loginSuccess: 'Giriş başarılı',
  registerSuccess: 'Kayıt başarılı',
  packageCreated: 'Paket başarıyla oluşturuldu',
  orderPlaced: 'Sipariş başarıyla oluşturuldu',
  reviewSubmitted: 'Değerlendirme başarıyla gönderildi',
  messageSent: 'Mesaj gönderildi',
  paymentSuccess: 'Ödeme başarılı',
};
