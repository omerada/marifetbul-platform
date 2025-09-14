// ================================================
// CENTRALIZED ERROR MESSAGES - I18N READY
// ================================================
// Single source of truth for all validation error messages

export type SupportedLocale = 'tr' | 'en';

export interface ValidationMessages {
  // Common validation messages
  required: string;
  invalid: string;
  tooShort: (min: number) => string;
  tooLong: (max: number) => string;
  mustBePositive: string;
  mustBeNonNegative: string;
  invalidFormat: string;

  // Field-specific messages
  email: {
    invalid: string;
    required: string;
  };
  password: {
    tooShort: (min: number) => string;
    weak: string;
    mismatch: string;
    required: string;
  };
  phone: {
    invalid: string;
    required: string;
  };
  url: {
    invalid: string;
    required: string;
  };
  name: {
    tooShort: (min: number) => string;
    tooLong: (max: number) => string;
    invalid: string;
    required: string;
  };
  date: {
    invalid: string;
    required: string;
    mustBeAfter: (date: string) => string;
    mustBeBefore: (date: string) => string;
  };
  price: {
    invalid: string;
    mustBePositive: string;
    tooHigh: (max: number) => string;
    required: string;
  };
  file: {
    tooLarge: (maxSize: string) => string;
    invalidType: (allowedTypes: string[]) => string;
    required: string;
  };

  // Business-specific messages
  freelancer: {
    skillsRequired: string;
    portfolioRequired: string;
    experienceInvalid: string;
    rateInvalid: string;
  };
  job: {
    titleRequired: string;
    descriptionTooShort: (min: number) => string;
    budgetRequired: string;
    deadlineRequired: string;
    skillsRequired: string;
  };
  review: {
    ratingRequired: string;
    ratingInvalid: string;
    commentTooShort: (min: number) => string;
  };
  payment: {
    amountRequired: string;
    amountInvalid: string;
    cardNumberInvalid: string;
    expiryInvalid: string;
    cvvInvalid: string;
  };
}

// Turkish messages
export const turkishMessages: ValidationMessages = {
  // Common
  required: 'Bu alan zorunludur',
  invalid: 'Geçersiz değer',
  tooShort: (min: number) => `En az ${min} karakter olmalıdır`,
  tooLong: (max: number) => `En fazla ${max} karakter olmalıdır`,
  mustBePositive: 'Pozitif bir sayı olmalıdır',
  mustBeNonNegative: 'Sıfır veya pozitif bir sayı olmalıdır',
  invalidFormat: 'Geçersiz format',

  // Email
  email: {
    invalid: 'Geçerli bir e-posta adresi giriniz',
    required: 'E-posta adresi gereklidir',
  },

  // Password
  password: {
    tooShort: (min: number) => `Şifre en az ${min} karakter olmalıdır`,
    weak: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir',
    mismatch: 'Şifreler eşleşmiyor',
    required: 'Şifre gereklidir',
  },

  // Phone
  phone: {
    invalid: 'Geçerli bir telefon numarası giriniz',
    required: 'Telefon numarası gereklidir',
  },

  // URL
  url: {
    invalid: 'Geçerli bir URL giriniz',
    required: 'URL gereklidir',
  },

  // Name
  name: {
    tooShort: (min: number) => `İsim en az ${min} karakter olmalıdır`,
    tooLong: (max: number) => `İsim en fazla ${max} karakter olmalıdır`,
    invalid: 'Geçerli bir isim giriniz',
    required: 'İsim gereklidir',
  },

  // Date
  date: {
    invalid: 'Geçerli bir tarih giriniz',
    required: 'Tarih gereklidir',
    mustBeAfter: (date: string) => `${date} tarihinden sonra olmalıdır`,
    mustBeBefore: (date: string) => `${date} tarihinden önce olmalıdır`,
  },

  // Price
  price: {
    invalid: 'Geçerli bir fiyat giriniz',
    mustBePositive: 'Fiyat pozitif olmalıdır',
    tooHigh: (max: number) => `Fiyat ${max} TL\'den fazla olamaz`,
    required: 'Fiyat gereklidir',
  },

  // File
  file: {
    tooLarge: (maxSize: string) =>
      `Dosya boyutu ${maxSize}\'dan küçük olmalıdır`,
    invalidType: (allowedTypes: string[]) =>
      `Sadece ${allowedTypes.join(', ')} dosya türleri kabul edilir`,
    required: 'Dosya gereklidir',
  },

  // Freelancer
  freelancer: {
    skillsRequired: 'En az bir yetenek seçmelisiniz',
    portfolioRequired: 'Portföy örnekleri gereklidir',
    experienceInvalid: 'Geçerli bir deneyim süresi giriniz',
    rateInvalid: 'Geçerli bir saatlik ücret giriniz',
  },

  // Job
  job: {
    titleRequired: 'İş başlığı gereklidir',
    descriptionTooShort: (min: number) =>
      `İş açıklaması en az ${min} karakter olmalıdır`,
    budgetRequired: 'Bütçe gereklidir',
    deadlineRequired: 'Teslim tarihi gereklidir',
    skillsRequired: 'En az bir yetenek seçmelisiniz',
  },

  // Review
  review: {
    ratingRequired: 'Puan vermeniz gereklidir',
    ratingInvalid: 'Puan 1-5 arasında olmalıdır',
    commentTooShort: (min: number) => `Yorum en az ${min} karakter olmalıdır`,
  },

  // Payment
  payment: {
    amountRequired: 'Tutar gereklidir',
    amountInvalid: 'Geçerli bir tutar giriniz',
    cardNumberInvalid: 'Geçerli bir kart numarası giriniz',
    expiryInvalid: 'Geçerli bir son kullanma tarihi giriniz',
    cvvInvalid: 'Geçerli bir CVV giriniz',
  },
};

// English messages
export const englishMessages: ValidationMessages = {
  // Common
  required: 'This field is required',
  invalid: 'Invalid value',
  tooShort: (min: number) => `Must be at least ${min} characters`,
  tooLong: (max: number) => `Must be at most ${max} characters`,
  mustBePositive: 'Must be a positive number',
  mustBeNonNegative: 'Must be zero or a positive number',
  invalidFormat: 'Invalid format',

  // Email
  email: {
    invalid: 'Please enter a valid email address',
    required: 'Email address is required',
  },

  // Password
  password: {
    tooShort: (min: number) => `Password must be at least ${min} characters`,
    weak: 'Password must contain at least 1 lowercase, 1 uppercase and 1 number',
    mismatch: 'Passwords do not match',
    required: 'Password is required',
  },

  // Phone
  phone: {
    invalid: 'Please enter a valid phone number',
    required: 'Phone number is required',
  },

  // URL
  url: {
    invalid: 'Please enter a valid URL',
    required: 'URL is required',
  },

  // Name
  name: {
    tooShort: (min: number) => `Name must be at least ${min} characters`,
    tooLong: (max: number) => `Name must be at most ${max} characters`,
    invalid: 'Please enter a valid name',
    required: 'Name is required',
  },

  // Date
  date: {
    invalid: 'Please enter a valid date',
    required: 'Date is required',
    mustBeAfter: (date: string) => `Must be after ${date}`,
    mustBeBefore: (date: string) => `Must be before ${date}`,
  },

  // Price
  price: {
    invalid: 'Please enter a valid price',
    mustBePositive: 'Price must be positive',
    tooHigh: (max: number) => `Price cannot exceed ${max}`,
    required: 'Price is required',
  },

  // File
  file: {
    tooLarge: (maxSize: string) => `File size must be smaller than ${maxSize}`,
    invalidType: (allowedTypes: string[]) =>
      `Only ${allowedTypes.join(', ')} file types are allowed`,
    required: 'File is required',
  },

  // Freelancer
  freelancer: {
    skillsRequired: 'You must select at least one skill',
    portfolioRequired: 'Portfolio samples are required',
    experienceInvalid: 'Please enter a valid experience duration',
    rateInvalid: 'Please enter a valid hourly rate',
  },

  // Job
  job: {
    titleRequired: 'Job title is required',
    descriptionTooShort: (min: number) =>
      `Job description must be at least ${min} characters`,
    budgetRequired: 'Budget is required',
    deadlineRequired: 'Deadline is required',
    skillsRequired: 'You must select at least one skill',
  },

  // Review
  review: {
    ratingRequired: 'You must provide a rating',
    ratingInvalid: 'Rating must be between 1-5',
    commentTooShort: (min: number) =>
      `Comment must be at least ${min} characters`,
  },

  // Payment
  payment: {
    amountRequired: 'Amount is required',
    amountInvalid: 'Please enter a valid amount',
    cardNumberInvalid: 'Please enter a valid card number',
    expiryInvalid: 'Please enter a valid expiry date',
    cvvInvalid: 'Please enter a valid CVV',
  },
};

// Message collections by locale
export const validationMessages = {
  tr: turkishMessages,
  en: englishMessages,
} as const;

// Current locale (can be dynamically set)
let currentLocale: SupportedLocale = 'tr';

// Utility functions
export const setValidationLocale = (locale: SupportedLocale) => {
  currentLocale = locale;
};

export const getCurrentLocale = (): SupportedLocale => currentLocale;

export const getValidationMessages = (
  locale?: SupportedLocale
): ValidationMessages => {
  return validationMessages[locale || currentLocale];
};

// Shorthand getter for current locale messages
export const vm = () => getValidationMessages();

// Helper function to create localized error messages for Zod
export const createLocalizedErrorMap = (locale?: SupportedLocale) => {
  const messages = getValidationMessages(locale);

  return (
    issue: {
      code: string;
      type?: string;
      minimum?: number;
      maximum?: number;
      validation?: string;
    },
    ctx: { defaultError: string }
  ) => {
    switch (issue.code) {
      case 'invalid_type':
        return { message: messages.required };

      case 'too_small':
        if (issue.type === 'string' && issue.minimum) {
          return { message: messages.tooShort(issue.minimum) };
        }
        if (issue.type === 'number') {
          return { message: messages.mustBePositive };
        }
        break;

      case 'too_big':
        if (issue.type === 'string' && issue.maximum) {
          return { message: messages.tooLong(issue.maximum) };
        }
        break;

      case 'invalid_string':
        if (issue.validation === 'email') {
          return { message: messages.email.invalid };
        }
        if (issue.validation === 'url') {
          return { message: messages.url.invalid };
        }
        return { message: messages.invalidFormat };

      default:
        return { message: ctx.defaultError };
    }
  };
};

const validationMessagesExport = {
  messages: validationMessages,
  setLocale: setValidationLocale,
  getLocale: getCurrentLocale,
  getMessages: getValidationMessages,
  vm,
  createErrorMap: createLocalizedErrorMap,
};

export default validationMessagesExport;
