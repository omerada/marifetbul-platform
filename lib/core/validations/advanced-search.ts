import { z } from 'zod';

// Location validation schema
export const locationSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  radius: z.number().min(1).max(100).optional(),
});

// Budget validation schema
export const budgetSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
});

// Advanced search validation schema
export const advancedSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: locationSchema.optional(),
  budget: budgetSchema.optional(),
  rating: z.number().min(1).max(5).optional(),
  availability: z.enum(['available', 'busy', 'any']).optional(),
  remoteOk: z.boolean().optional(),
  sortBy: z.enum(['relevance', 'rating', 'price', 'distance']).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  deliveryTime: z.number().min(1).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});

// Search suggestions validation schema
export const searchSuggestionsSchema = z.object({
  query: z.string().min(1, 'Arama sorgusu gereklidir'),
  type: z.enum(['freelancers', 'jobs', 'services', 'skills', 'locations']),
  limit: z.number().min(1).max(50).optional(),
});

// Save search validation schema
export const saveSearchSchema = z.object({
  name: z
    .string()
    .min(3, 'Arama adı en az 3 karakter olmalıdır')
    .max(50, 'Arama adı en fazla 50 karakter olabilir'),
  query: z.string().optional(),
  filters: advancedSearchSchema,
  alertEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
});

// Location search validation schema
export const locationSearchSchema = z.object({
  query: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  radius: z.number().min(1).max(100).optional(),
  bounds: z
    .object({
      north: z.number().min(-90).max(90),
      south: z.number().min(-90).max(90),
      east: z.number().min(-180).max(180),
      west: z.number().min(-180).max(180),
    })
    .optional(),
  types: z.array(z.enum(['city', 'district', 'neighborhood'])).optional(),
  limit: z.number().min(1).max(50).optional(),
  language: z.enum(['tr', 'en']).optional(),
});

// Location autocomplete validation schema
export const locationAutocompleteSchema = z.object({
  input: z.string().min(1, 'Giriş metni gereklidir'),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  radius: z.number().min(1).max(100).optional(),
  types: z.array(z.string()).optional(),
  language: z.enum(['tr', 'en']).optional(),
});

// Geocode validation schema
export const geocodeSchema = z.object({
  address: z.string().optional(),
  placeId: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

// Recommendations validation schema
export const recommendationsSchema = z.object({
  type: z.enum(['freelancers', 'jobs', 'services']),
  userId: z.string().optional(),
  basedOn: z
    .enum(['profile', 'activity', 'similar', 'collaborative'])
    .optional(),
  targetItemId: z.string().optional(),
  limit: z.number().min(1).max(50).optional(),
  excludeIds: z.array(z.string()).optional(),
});

// Recommendation feedback validation schema
export const recommendationFeedbackSchema = z.object({
  recommendationId: z.string().min(1, 'Öneri ID gereklidir'),
  feedback: z.enum([
    'like',
    'dislike',
    'not_relevant',
    'already_contacted',
    'too_expensive',
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Add to favorites validation schema
export const addToFavoritesSchema = z.object({
  itemId: z.string().min(1, 'Öğe ID gereklidir'),
  itemType: z.enum(['freelancer', 'job', 'service']),
  folderId: z.string().optional(),
  note: z.string().max(500, 'Not en fazla 500 karakter olabilir').optional(),
});

// Create favorite folder validation schema
export const createFavoriteFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Klasör adı gereklidir')
    .max(50, 'Klasör adı en fazla 50 karakter olabilir'),
  description: z
    .string()
    .max(200, 'Açıklama en fazla 200 karakter olabilir')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir renk kodu giriniz')
    .optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Map search validation schema
export const mapSearchSchema = z.object({
  bounds: z.object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
  }),
  zoom: z.number().min(1).max(20),
  center: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  type: z.enum(['freelancers', 'jobs', 'services']),
  filters: advancedSearchSchema.optional(),
});

// Location picker form validation schema
export const locationPickerFormSchema = z.object({
  query: z.string().min(1, 'Lokasyon sorgusu gereklidir'),
  selectedLocation: z.any().optional(),
  useCurrentLocation: z.boolean().optional(),
  radius: z.number().min(1).max(100).optional(),
});

// Favorite folder form validation schema
export const favoriteFolderFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Klasör adı gereklidir')
    .max(50, 'Klasör adı en fazla 50 karakter olabilir'),
  description: z
    .string()
    .max(200, 'Açıklama en fazla 200 karakter olabilir')
    .optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Advanced search form validation schema with refined validation
export const advancedSearchFormSchema = z
  .object({
    query: z.string().optional(),
    category: z.string().optional(),
    skills: z.array(z.string()).optional(),
    location: z
      .object({
        city: z.string().optional(),
        district: z.string().optional(),
        coordinates: z
          .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
          })
          .optional(),
        radius: z.number().min(1).max(100).optional(),
      })
      .optional(),
    budget: z
      .object({
        min: z.number().min(0).optional(),
        max: z.number().min(0).optional(),
      })
      .optional(),
    rating: z.number().min(1).max(5).optional(),
    availability: z.enum(['available', 'busy', 'any']).optional(),
    remoteOk: z.boolean().optional(),
    sortBy: z.enum(['relevance', 'rating', 'price', 'distance']).optional(),
    deliveryTime: z.number().min(1).optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  })
  .refine(
    (data) => {
      // If budget is provided, ensure min is not greater than max
      if (data.budget?.min && data.budget?.max) {
        return data.budget.min <= data.budget.max;
      }
      return true;
    },
    {
      message: 'Minimum bütçe maksimum bütçeden büyük olamaz',
      path: ['budget'],
    }
  )
  .refine(
    (data) => {
      // If location coordinates are provided, radius should be provided too
      if (data.location?.coordinates && !data.location?.radius) {
        return false;
      }
      return true;
    },
    {
      message: 'Koordinat bilgisi verildiğinde yarıçap da belirtilmelidir',
      path: ['location', 'radius'],
    }
  );

// Type exports
export type AdvancedSearchFormData = z.infer<typeof advancedSearchFormSchema>;
export type SaveSearchFormData = z.infer<typeof saveSearchSchema>;
export type LocationSearchFormData = z.infer<typeof locationSearchSchema>;
export type LocationPickerFormData = z.infer<typeof locationPickerFormSchema>;
export type FavoriteFolderFormData = z.infer<typeof favoriteFolderFormSchema>;
export type RecommendationFeedbackData = z.infer<
  typeof recommendationFeedbackSchema
>;
export type AddToFavoritesData = z.infer<typeof addToFavoritesSchema>;
