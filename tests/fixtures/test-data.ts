/**
 * ================================================
 * TEST FIXTURES
 * ================================================
 * Reusable test data for E2E tests
 */

export const TEST_USERS = {
  admin: {
    email: 'admin@marifetbul.com',
    password: 'Admin123!',
    role: 'ADMIN',
    name: 'Test Admin',
  },
  freelancer: {
    email: 'freelancer@test.com',
    password: 'Freelancer123!',
    role: 'FREELANCER',
    name: 'Test Freelancer',
    username: 'testfreelancer',
  },
  employer: {
    email: 'employer@test.com',
    password: 'Employer123!',
    role: 'EMPLOYER',
    name: 'Test Employer',
    username: 'testemployer',
  },
} as const;

export const TEST_PACKAGES = {
  logoDesign: {
    id: '1',
    title: 'Professional Logo Design',
    description: 'Custom logo design with unlimited revisions',
    price: 500,
    deliveryTime: 3,
    category: 'Design',
    sellerId: TEST_USERS.freelancer.username,
  },
  webDevelopment: {
    id: '2',
    title: 'React Web Development',
    description: 'Full-stack web development with React and Node.js',
    price: 2000,
    deliveryTime: 14,
    category: 'Development',
    sellerId: TEST_USERS.freelancer.username,
  },
} as const;

export const TEST_REVIEWS = {
  positive: {
    rating: 5,
    text: 'Excellent work! Very professional and delivered on time. Highly recommended!',
    quality: 5,
    communication: 5,
    delivery: 5,
    value: 5,
  },
  negative: {
    rating: 2,
    text: 'Not satisfied with the quality. Had to request multiple revisions.',
    quality: 2,
    communication: 3,
    delivery: 2,
    value: 2,
  },
  neutral: {
    rating: 3,
    text: 'Average experience. Work was acceptable but nothing special.',
    quality: 3,
    communication: 3,
    delivery: 3,
    value: 3,
  },
} as const;

export const TEST_COMMENTS = {
  pending: [
    {
      id: 1,
      content: 'Great article! Very informative.',
      author: 'user1@test.com',
      postId: 1,
      status: 'PENDING',
    },
    {
      id: 2,
      content: 'Thanks for sharing this helpful content.',
      author: 'user2@test.com',
      postId: 1,
      status: 'PENDING',
    },
    {
      id: 3,
      content: 'I disagree with this perspective.',
      author: 'user3@test.com',
      postId: 2,
      status: 'PENDING',
    },
  ],
  spam: [
    {
      id: 10,
      content: 'Click here for free money!!!',
      author: 'spammer@spam.com',
      postId: 1,
      status: 'SPAM',
    },
  ],
} as const;

export const TEST_ORDERS = {
  completed: {
    id: 'order-001',
    packageId: TEST_PACKAGES.logoDesign.id,
    status: 'COMPLETED',
    amount: TEST_PACKAGES.logoDesign.price,
    customerId: TEST_USERS.employer.username,
    freelancerId: TEST_USERS.freelancer.username,
  },
  inProgress: {
    id: 'order-002',
    packageId: TEST_PACKAGES.webDevelopment.id,
    status: 'IN_PROGRESS',
    amount: TEST_PACKAGES.webDevelopment.price,
    customerId: TEST_USERS.employer.username,
    freelancerId: TEST_USERS.freelancer.username,
  },
} as const;

export const TEST_BLOG_POSTS = {
  published: {
    id: 1,
    slug: 'test-blog-post-1',
    title: 'Test Blog Post 1',
    content: '<p>This is a test blog post content.</p>',
    status: 'PUBLISHED',
    authorId: TEST_USERS.admin.email,
  },
  draft: {
    id: 2,
    slug: 'test-blog-post-2',
    title: 'Test Blog Post 2 (Draft)',
    content: '<p>This is a draft blog post.</p>',
    status: 'DRAFT',
    authorId: TEST_USERS.admin.email,
  },
} as const;

/**
 * TEST PAYOUTS - Story 1.2
 */
export const TEST_PAYOUTS = {
  pending: {
    id: 'payout-001',
    userId: TEST_USERS.freelancer.username,
    amount: 1500.0,
    method: 'BANK_TRANSFER',
    status: 'PENDING',
    bankAccount: {
      accountHolder: 'Test Freelancer',
      iban: 'TR330006100519786457841326',
      bankName: 'Test Bank',
    },
  },
  approved: {
    id: 'payout-002',
    userId: TEST_USERS.freelancer.username,
    amount: 2000.0,
    method: 'BANK_TRANSFER',
    status: 'APPROVED',
    approvedBy: TEST_USERS.admin.email,
    approvedAt: new Date().toISOString(),
  },
  rejected: {
    id: 'payout-003',
    userId: TEST_USERS.freelancer.username,
    amount: 500.0,
    method: 'BANK_TRANSFER',
    status: 'REJECTED',
    rejectedBy: TEST_USERS.admin.email,
    rejectedAt: new Date().toISOString(),
    rejectionReason: 'Insufficient balance verification',
  },
} as const;

/**
 * TEST ANALYTICS DATA - Story 1.3
 */
export const TEST_ANALYTICS = {
  earnings: {
    period: 7,
    data: [
      {
        date: '2024-01-15',
        earnings: 1200,
        orderCount: 3,
        averageOrderValue: 400,
      },
      {
        date: '2024-01-16',
        earnings: 800,
        orderCount: 2,
        averageOrderValue: 400,
      },
      {
        date: '2024-01-17',
        earnings: 1500,
        orderCount: 4,
        averageOrderValue: 375,
      },
    ],
    totalEarnings: 3500,
    totalOrders: 9,
    averageOrderValue: 388.89,
    growthPercentage: 15.5,
  },
  revenue: {
    items: [
      {
        category: 'Grafik Tasarım',
        amount: 5000,
        orderCount: 12,
        percentage: 45,
      },
      {
        category: 'Web Geliştirme',
        amount: 3500,
        orderCount: 5,
        percentage: 31.8,
      },
      { category: 'Yazılım', amount: 2500, orderCount: 8, percentage: 22.7 },
    ],
    totalRevenue: 11000,
  },
  transactions: {
    totalIncome: 15000,
    totalExpenses: 3500,
    netBalance: 11500,
    incomeBreakdown: {
      orders: 12000,
      bonuses: 2000,
      refunds: 1000,
    },
    expenseBreakdown: {
      orders: 0,
      payouts: 2500,
      fees: 1000,
      refunds: 0,
    },
    walletBalances: {
      availableBalance: 8000,
      pendingBalance: 2500,
      escrowBalance: 1000,
    },
    previousPeriodGrowth: 12.5,
  },
} as const;

// Helper to get random user
export function getRandomUser() {
  const users = Object.values(TEST_USERS);
  return users[Math.floor(Math.random() * users.length)];
}

// Helper to get random comment
export function getRandomComment() {
  return {
    id: Math.floor(Math.random() * 1000),
    content: `Test comment ${Date.now()}`,
    author: getRandomUser().email,
    postId: Math.floor(Math.random() * 10) + 1,
    status: 'PENDING' as const,
  };
}

/**
 * ================================================
 * ERROR & SUCCESS MESSAGES
 * ================================================
 */

export const ERROR_MESSAGES = {
  invalidEmail: /email.*geçersiz|invalid.*email/i,
  weakPassword: /şifre.*en az.*8|password.*at least.*8/i,
  passwordMismatch: /şifreler.*eşleşmiyor|passwords.*not.*match/i,
  requiredField: /zorunlu|required/i,
  invalidCredentials: /email.*şifre.*hatalı|invalid.*credentials/i,
  termsRequired: /şartları.*kabul|accept.*terms/i,
} as const;

export const SUCCESS_MESSAGES = {
  registrationSuccess: /kayıt.*başarılı|registration.*successful/i,
  loginSuccess: /giriş.*başarılı|login.*successful/i,
  logoutSuccess: /çıkış.*başarılı|logout.*successful/i,
  passwordResetSent: /email.*gönderildi|email.*sent/i,
  passwordChanged: /şifre.*değiştirildi|password.*changed/i,
} as const;

/**
 * ================================================
 * SELECTORS
 * ================================================
 */

export const SELECTORS = {
  forms: {
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    confirmPasswordInput: 'input[name="confirmPassword"]',
    usernameInput: 'input[name="username"]',
    firstNameInput: 'input[name="firstName"]',
    lastNameInput: 'input[name="lastName"]',
    termsCheckbox: 'input[name="acceptTerms"]',
    submitButton: 'button[type="submit"]',
  },
  navigation: {
    userMenu: '[data-testid="user-menu"], button:has-text("Profil")',
    logoutButton: '[data-testid="logout-button"], button:has-text("Çıkış")',
    loginLink: 'a[href="/login"]',
    registerLink: 'a[href="/register"]',
    forgotPasswordLink: 'a[href="/forgot-password"]',
  },
  messages: {
    toast: '[data-testid="toast"], [role="alert"], .toast',
    errorMessage:
      '[data-testid="error-message"], .error-message, .text-red-600',
    successMessage:
      '[data-testid="success-message"], .success-message, .text-green-600',
  },
} as const;
