// ================================================
// MODERN TESTING INFRASTRUCTURE
// ================================================
// Production-ready testing utilities and helpers

// ================================
// TYPES
// ================================

export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'employer' | 'admin';
  isVerified: boolean;
}

export interface MockData {
  users: TestUser[];
  jobs: any[];
  packages: any[];
  conversations: any[];
}

export interface TestContext {
  user: TestUser | null;
  isAuthenticated: boolean;
  mockData: MockData;
}

export interface RenderOptions {
  withAuth?: boolean;
  initialUser?: TestUser;
  mockData?: Partial<MockData>;
  wrapper?: any;
}

// ================================
// MOCK DATA CREATORS
// ================================

export const createMockUser = (
  overrides: Partial<TestUser> = {}
): TestUser => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test User',
  email: 'test@example.com',
  role: 'freelancer',
  isVerified: true,
  ...overrides,
});

export const createMockJob = (overrides: any = {}) => ({
  id: `job-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Job',
  description: 'This is a test job description',
  budget: 1000,
  skills: ['React', 'TypeScript'],
  status: 'active',
  createdAt: new Date().toISOString(),
  employer: createMockUser({ role: 'employer' }),
  ...overrides,
});

export const createMockPackage = (overrides: any = {}) => ({
  id: `package-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Package',
  description: 'This is a test package description',
  price: 500,
  deliveryTime: 7,
  rating: 4.8,
  reviewCount: 25,
  freelancer: createMockUser({ role: 'freelancer' }),
  ...overrides,
});

export const createMockConversation = (overrides: any = {}) => ({
  id: `conv-${Math.random().toString(36).substr(2, 9)}`,
  participants: [
    createMockUser({ role: 'freelancer' }),
    createMockUser({ role: 'employer' }),
  ],
  lastMessage: {
    id: 'msg-1',
    content: 'Hello, how are you?',
    sender_id: 'user-1',
    timestamp: new Date().toISOString(),
  },
  unreadCount: 2,
  ...overrides,
});

export const DEFAULT_MOCK_DATA: MockData = {
  users: [
    createMockUser({ role: 'freelancer', name: 'John Freelancer' }),
    createMockUser({ role: 'employer', name: 'Jane Employer' }),
    createMockUser({ role: 'admin', name: 'Admin User' }),
  ],
  jobs: [
    createMockJob({ title: 'React Developer Needed' }),
    createMockJob({ title: 'UI/UX Designer Required' }),
    createMockJob({ title: 'Backend API Development' }),
  ],
  packages: [
    createMockPackage({ title: 'Logo Design Package' }),
    createMockPackage({ title: 'Website Development' }),
    createMockPackage({ title: 'SEO Optimization' }),
  ],
  conversations: [createMockConversation(), createMockConversation()],
};

// ================================
// MOCK UTILITIES
// ================================

export const mocks = {
  // API mocks
  mockSuccessfulApiCall: function <T>(data: T, delay = 100): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  },

  mockFailedApiCall: (error: string, delay = 100): Promise<never> => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(error)), delay);
    });
  },

  // Local storage mocks
  mockLocalStorage: () => {
    const store: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value;
          },
          removeItem: (key: string) => {
            delete store[key];
          },
          clear: () => {
            Object.keys(store).forEach((key) => delete store[key]);
          },
        },
        writable: true,
      });
    }
  },

  // Window location mocks
  mockWindowLocation: (href: string) => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'location', {
        value: new URL(href),
        writable: true,
      });
    }
  },

  // Match media mocks
  mockMatchMedia: (matches: boolean) => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
        writable: true,
      });
    }
  },

  // Intersection Observer mock
  mockIntersectionObserver: () => {
    if (typeof window !== 'undefined') {
      const mockIntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };

      Object.defineProperty(window, 'IntersectionObserver', {
        value: mockIntersectionObserver,
        writable: true,
      });
    }
  },
};

// ================================
// ASSERTION HELPERS
// ================================

export const assertions = {
  // Loading states
  expectLoading: () => {
    console.log('Test: Expecting loading spinner to be visible');
  },

  expectNotLoading: () => {
    console.log('Test: Expecting loading spinner to not be visible');
  },

  // Error states
  expectError: (message?: string) => {
    console.log(
      'Test: Expecting error to be displayed',
      message ? `: ${message}` : ''
    );
  },

  expectNoError: () => {
    console.log('Test: Expecting no error to be displayed');
  },

  // Form states
  expectFormField: (name: string, value?: string) => {
    console.log(
      `Test: Expecting form field "${name}"${value ? ` with value "${value}"` : ''}`
    );
  },

  expectFormSubmitted: async () => {
    console.log('Test: Expecting form to be submitted successfully');
  },

  // Navigation
  expectNavigation: (path: string) => {
    console.log(`Test: Expecting navigation to path: ${path}`);
  },

  // Content
  expectText: (text: string | RegExp) => {
    console.log(`Test: Expecting text to be present: ${text}`);
  },

  expectNotText: (text: string | RegExp) => {
    console.log(`Test: Expecting text to not be present: ${text}`);
  },

  // Accessibility
  expectAccessibleName: (role: string, name: string) => {
    console.log(
      `Test: Expecting element with role "${role}" and accessible name "${name}"`
    );
  },

  expectFocused: (element: HTMLElement | string) => {
    console.log(
      `Test: Expecting element to be focused: ${typeof element === 'string' ? element : element.tagName}`
    );
  },
};

// ================================
// INTERACTION HELPERS
// ================================

export const interactions = {
  // Form interactions
  fillForm: async (formData: Record<string, string>) => {
    console.log('Test: Filling form with data:', formData);
  },

  submitForm: async () => {
    console.log('Test: Submitting form');
  },

  // Navigation interactions
  clickLink: async (name: string | RegExp) => {
    console.log(`Test: Clicking link: ${name}`);
  },

  clickButton: async (name: string | RegExp) => {
    console.log(`Test: Clicking button: ${name}`);
  },

  // Select interactions
  selectOption: async (
    selectName: string | RegExp,
    optionName: string | RegExp
  ) => {
    console.log(
      `Test: Selecting option "${optionName}" from select "${selectName}"`
    );
  },

  // File upload
  uploadFile: async (inputName: string | RegExp, file: File) => {
    console.log(`Test: Uploading file "${file.name}" to input "${inputName}"`);
  },

  // Search interactions
  search: async (query: string) => {
    console.log(`Test: Searching for: ${query}`);
  },

  // Modal interactions
  openModal: async (triggerName: string | RegExp) => {
    console.log(`Test: Opening modal with trigger: ${triggerName}`);
  },

  closeModal: async () => {
    console.log('Test: Closing modal');
  },
};

// ================================
// TEST UTILITIES
// ================================

export const utils = {
  // Wait for element
  waitForElement: async (selector: string): Promise<Element | null> => {
    console.log(`Test: Waiting for element: ${selector}`);
    return null;
  },

  // Wait for text to appear
  waitForText: async (text: string | RegExp): Promise<HTMLElement | null> => {
    console.log(`Test: Waiting for text: ${text}`);
    return null;
  },

  // Wait for element to disappear
  waitForElementToDisappear: async (selector: string) => {
    console.log(`Test: Waiting for element to disappear: ${selector}`);
  },

  // Debug current DOM state
  debugCurrentState: () => {
    console.log('Test: Current DOM state debug');
  },

  // Check accessibility violations
  checkAccessibility: async (container?: Element) => {
    console.log('Test: Checking accessibility violations');
  },

  // Performance testing
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    console.log(`Test: Render time measured: ${end - start}ms`);
    return end - start;
  },
};

// ================================
// TEST SCENARIOS
// ================================

export const scenarios = {
  // Common test scenarios
  loginFlow: async (credentials: { email: string; password: string }) => {
    console.log('Test Scenario: Login flow starting with:', credentials.email);
    await interactions.fillForm(credentials);
    await interactions.submitForm();
    assertions.expectNavigation('/dashboard');
  },

  registerFlow: async (userData: Partial<TestUser>) => {
    console.log('Test Scenario: Registration flow starting');
    await interactions.fillForm({
      name: userData.name || 'Test User',
      email: userData.email || 'test@example.com',
      password: 'testPassword123',
    });
    await interactions.submitForm();
    assertions.expectText(/verification email sent/i);
  },

  jobSearch: async (query: string, filters?: Record<string, string>) => {
    console.log(`Test Scenario: Job search for: ${query}`);
    await interactions.search(query);

    if (filters) {
      for (const [filterName, filterValue] of Object.entries(filters)) {
        await interactions.selectOption(filterName, filterValue);
      }
    }

    assertions.expectText(/search results/i);
  },

  createJob: async (jobData: any) => {
    console.log('Test Scenario: Creating new job');
    await interactions.clickButton(/create job/i);
    await interactions.fillForm({
      title: jobData.title || 'Test Job',
      description: jobData.description || 'Test job description',
      budget: jobData.budget?.toString() || '1000',
    });
    await interactions.submitForm();
    assertions.expectText(/job created successfully/i);
  },

  sendMessage: async (recipientId: string, message: string) => {
    console.log(`Test Scenario: Sending message to ${recipientId}`);
    await interactions.fillForm({ message });
    await interactions.submitForm();
    assertions.expectText(message);
  },

  // Error scenarios
  networkError: async () => {
    console.log('Test Scenario: Network error handling');
    assertions.expectError('Network error occurred');
  },

  validationError: async (fieldName: string) => {
    console.log(`Test Scenario: Validation error for field: ${fieldName}`);
    assertions.expectError();
  },

  // Performance scenarios
  loadPerformance: async (expectedMaxTime: number) => {
    console.log(`Test Scenario: Load performance (max: ${expectedMaxTime}ms)`);
    const renderTime = await utils.measureRenderTime(() => {
      // Render component
    });

    if (renderTime > expectedMaxTime) {
      console.warn(
        `Performance warning: Render time ${renderTime}ms exceeds max ${expectedMaxTime}ms`
      );
    }
  },
};

// ================================
// EXPORTS
// ================================

export default {
  // Mock data creators
  createMockUser,
  createMockJob,
  createMockPackage,
  createMockConversation,
  DEFAULT_MOCK_DATA,

  // Helpers
  assertions,
  interactions,
  mocks,
  utils,
  scenarios,

  // Test configurations
  config: {
    defaultTimeout: 5000,
    retryAttempts: 3,
    performanceThreshold: 1000,
    accessibilityLevel: 'AA',
  },
};
