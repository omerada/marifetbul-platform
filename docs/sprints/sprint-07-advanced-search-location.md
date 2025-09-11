# Sprint 7: Gelişmiş Arama & Lokasyon Tabanlı Filtreleme - 2 hafta

## 🎯 Sprint Hedefleri

- Gelişmiş arama algoritması ve autocomplete
- Lokasyon tabanlı filtreleme ve harita entegrasyonu
- Skill-based matching ve recommendation sistemi
- Performance optimizasyonu ve cache stratejileri
- SEO iyileştirmeleri ve meta tag yönetimi
- Favoriler ve saved searches özelliği

## 📱 Geliştirilecek Ekranlar

### Gelişmiş Arama Ekranı

**Rol**: Both  
**Özellikler**:

- Autocomplete ile arama önerileri
- Kategori, beceri, lokasyon bazlı instant search
- Recent searches ve saved searches
- Search filters (fiyat, rating, lokasyon, availability)
- Search result analytics ve trending
- Responsive (mobile, tablet, desktop)

### Lokasyon Filtreleme

**Rol**: Both
**Özellikler**:

- Harita entegrasyonu (Google Maps/Mapbox)
- Şehir, ilçe, mahalle bazlı filtreleme
- Remote work option filtering
- Distance-based search (5km, 10km, 25km radius)
- Location picker ve autocomplete
- Nearby freelancers/jobs gösterimi

### Recommendation Center

**Rol**: Both
**Özellikler**:

- AI-powered job/freelancer recommendations
- Skill-based matching algoritması
- Personalized feed (based on activity)
- "Similar to what you viewed" önerileri
- Trending jobs/freelancers
- Custom recommendation lists

### Favoriler ve Kayıtlı Aramalar

**Rol**: Both
**Özellikler**:

- Freelancer/job favorilere ekleme
- Saved search queries ve alerts
- Watchlist ve notification preferences
- Favorites organization (folders, tags)
- Export favorites functionality

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `AdvancedSearch` - Gelişmiş arama bileşeni
  - `LocationPicker` - Lokasyon seçimi
  - `MapView` - Harita görünümü
  - `LocationSearch` - Lokasyon arama
  - `RecommendationCard` - Öneri kartları
  - `SearchSuggestions` - Arama önerileri
  - `SavedSearches` - Kayıtlı aramalar
  - `FavoritesList` - Favoriler listesi
  - `TrendingSection` - Trend bölümü

- **Güncellenecek Component'lar**:
  - `SearchBar` - Autocomplete ve advanced features
  - `FilterPanel` - Location ve advanced filters
  - `Card` - Favorite, recommendation varyantları
  - `Badge` - Location, trending, recommendation badges

- **UI Library Integration**:
  - `Combobox`, `Command`, `Popover` (Shadcn/ui)
  - `Separator`, `ScrollArea`, `Toggle`
  - `Calendar`, `DatePicker` (advanced filters için)

### User Flow

- **Freelancer Flow**: Search → Location Filter → Skills Match → Recommendations → Save Search
- **Employer Flow**: Search → Advanced Filters → Map View → Recommendations → Favorites

### States & Interactions

- **Loading States**: Search processing, map loading, recommendations
- **Error Handling**: Location access denied, search timeout
- **Empty States**: No search results, no recommendations
- **Success States**: Search completed, location found, saved
- **Interactive Elements**: Map zoom/pan, autocomplete dropdown

### Accessibility

- ARIA labels for search inputs ve map
- Keyboard navigation for search suggestions
- Screen reader support for location info
- Focus management in search modals

## ⚙️ Fonksiyonel Özellikler

### Advanced Search System

**Açıklama**: AI-powered arama ve filtreleme sistemi
**Employer Perspective**: Freelancer arama, skill matching, location filtering
**Freelancer Perspective**: Job arama, advanced filtering, saved searches
**Acceptance Criteria**:

- [ ] Autocomplete ve instant search çalışıyor
- [ ] Multi-criteria filtering (skill, location, price, rating)
- [ ] Search history ve saved searches
- [ ] Search analytics ve trending

### Location-Based Features

**Açıklama**: Lokasyon tabanlı filtreleme ve harita entegrasyonu
**Employer Perspective**: Nearby freelancers, location radius search
**Freelancer Perspective**: Local jobs, remote work filtering
**Acceptance Criteria**:

- [ ] Harita entegrasyonu ve location picker
- [ ] Distance-based search ve filtering
- [ ] City, district, neighborhood filtering
- [ ] Remote work option clearly displayed
- [ ] Location autocomplete ve validation

### Recommendation Engine

**Açıklama**: AI-based personalized recommendations
**Employer Perspective**: Freelancer recommendations based on history
**Freelancer Perspective**: Job recommendations based on skills
**Acceptance Criteria**:

- [ ] Skill-based matching algoritması
- [ ] Personalized recommendations
- [ ] Trending content identification
- [ ] Similar items önerileri
- [ ] Recommendation feedback loop

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/search`, `/api/v1/recommendations`

#### GET /api/v1/search/suggestions

```typescript
interface SearchSuggestionsRequest {
  query: string;
  type: 'freelancers' | 'jobs' | 'skills' | 'locations';
  limit?: number;
}

interface SearchSuggestionsResponse {
  success: boolean;
  data?: {
    suggestions: string[];
    trending: string[];
    recent: string[];
  };
  error?: string;
}

const mockSearchSuggestions = {
  success: true,
  data: {
    suggestions: [
      'React Developer',
      'React Native',
      'ReactJS Frontend',
      'React + TypeScript',
    ],
    trending: ['AI Development', 'Mobile App', 'E-commerce'],
    recent: ['Web Developer', 'Logo Design', 'Content Writing'],
  },
};
```

#### POST /api/v1/search/advanced

```typescript
interface AdvancedSearchRequest {
  query?: string;
  category?: string;
  skills?: string[];
  location?: {
    city?: string;
    district?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    radius?: number; // km
  };
  budget?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  availability?: 'available' | 'busy' | 'any';
  remoteOk?: boolean;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance';
  page?: number;
  pageSize?: number;
}

interface AdvancedSearchResponse {
  success: boolean;
  data?: {
    results: (Freelancer | Job)[];
    pagination: PaginationMeta;
    facets: {
      categories: { name: string; count: number }[];
      locations: { name: string; count: number }[];
      skills: { name: string; count: number }[];
      priceRanges: { range: string; count: number }[];
    };
    searchId: string; // For analytics
  };
  error?: string;
}

const mockAdvancedSearchResults = {
  success: true,
  data: {
    results: [
      {
        id: 'freelancer-123',
        name: 'Ahmet Yılmaz',
        title: 'Senior React Developer',
        skills: ['React', 'TypeScript', 'Node.js'],
        location: {
          city: 'İstanbul',
          district: 'Beşiktaş',
          coordinates: { lat: 41.0422, lng: 29.007 },
        },
        hourlyRate: 85,
        rating: 4.9,
        availability: 'available',
        distance: 2.5, // km from search center
        remoteOk: true,
      },
      // More results...
    ],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 156,
      totalPages: 8,
    },
    facets: {
      categories: [
        { name: 'Web Development', count: 45 },
        { name: 'Mobile Development', count: 23 },
      ],
      locations: [
        { name: 'İstanbul', count: 78 },
        { name: 'Ankara', count: 34 },
      ],
      skills: [
        { name: 'React', count: 67 },
        { name: 'Node.js', count: 45 },
      ],
      priceRanges: [
        { range: '0-50', count: 23 },
        { range: '51-100', count: 89 },
      ],
    },
    searchId: 'search-789',
  },
};
```

#### GET /api/v1/recommendations

```typescript
interface RecommendationsRequest {
  type: 'freelancers' | 'jobs';
  userId?: string;
  basedOn?: 'profile' | 'activity' | 'similar';
  limit?: number;
}

interface RecommendationsResponse {
  success: boolean;
  data?: {
    recommendations: (Freelancer | Job)[];
    reason: string; // Why recommended
    confidence: number; // 0-1
  }[];
  error?: string;
}

const mockRecommendations = {
  success: true,
  data: [
    {
      recommendations: [
        {
          id: 'freelancer-456',
          name: 'Zeynep Demir',
          title: 'UI/UX Designer',
          // ... other fields
        },
      ],
      reason: 'Based on your recent project history',
      confidence: 0.87,
    },
    {
      recommendations: [
        {
          id: 'job-789',
          title: 'React Native App Development',
          // ... other fields
        },
      ],
      reason: 'Matches your skills perfectly',
      confidence: 0.92,
    },
  ],
};
```

#### POST /api/v1/search/save

```typescript
interface SaveSearchRequest {
  query: string;
  filters: AdvancedSearchRequest;
  name: string;
  alertEnabled?: boolean;
  alertFrequency?: 'immediate' | 'daily' | 'weekly';
}

interface SaveSearchResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    savedAt: string;
  };
  error?: string;
}
```

#### GET /api/v1/favorites

```typescript
interface FavoritesResponse {
  success: boolean;
  data?: {
    freelancers: Freelancer[];
    jobs: Job[];
    folders: {
      id: string;
      name: string;
      itemCount: number;
    }[];
  };
  error?: string;
}
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/advanced-search.ts
export const advancedSearchHandlers = [
  http.get('/api/v1/search/suggestions', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';

    // Filter suggestions based on query
    const filteredSuggestions = mockSearchSuggestions.data.suggestions.filter(
      (s) => s.toLowerCase().includes(query.toLowerCase())
    );

    return HttpResponse.json({
      ...mockSearchSuggestions,
      data: {
        ...mockSearchSuggestions.data,
        suggestions: filteredSuggestions,
      },
    });
  }),

  http.post('/api/v1/search/advanced', async ({ request }) => {
    const searchData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Apply filters to mock data
    let filteredResults = mockAdvancedSearchResults.data.results;

    if (searchData.location?.city) {
      filteredResults = filteredResults.filter(
        (item) => item.location?.city === searchData.location.city
      );
    }

    if (searchData.skills?.length) {
      filteredResults = filteredResults.filter((item) =>
        searchData.skills.some((skill) => item.skills?.includes(skill))
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...mockAdvancedSearchResults.data,
        results: filteredResults,
        pagination: {
          ...mockAdvancedSearchResults.data.pagination,
          total: filteredResults.length,
        },
      },
    });
  }),

  http.get('/api/v1/recommendations', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    return HttpResponse.json(mockRecommendations);
  }),

  http.post('/api/v1/search/save', async ({ request }) => {
    const saveData = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json({
      success: true,
      data: {
        id: `saved-search-${Date.now()}`,
        name: saveData.name,
        savedAt: new Date().toISOString(),
      },
    });
  }),

  http.get('/api/v1/favorites', () => {
    return HttpResponse.json({
      success: true,
      data: mockFavorites,
    });
  }),

  http.post('/api/v1/favorites', async ({ request }) => {
    const { itemId, itemType, folderId } = await request.json();

    return HttpResponse.json({
      success: true,
      message: 'Favorilere eklendi',
    });
  }),

  http.delete('/api/v1/favorites/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Favorilerden kaldırıldı',
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface AdvancedSearchStore {
  // State properties
  searchQuery: string;
  searchResults: (Freelancer | Job)[];
  suggestions: string[];
  recentSearches: string[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  facets: SearchFacets | null;
  searchId: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  getSuggestions: (query: string) => Promise<void>;
  performAdvancedSearch: (filters: AdvancedSearchRequest) => Promise<void>;
  saveSearch: (name: string, filters: AdvancedSearchRequest) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  addToRecentSearches: (query: string) => void;
  clearSearchResults: () => void;
  clearError: () => void;
}

interface RecommendationStore {
  // State properties
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRecommendations: (
    type: 'freelancers' | 'jobs',
    basedOn?: 'profile' | 'activity' | 'similar'
  ) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  provideFeedback: (
    recommendationId: string,
    feedback: 'like' | 'dislike'
  ) => Promise<void>;
  clearError: () => void;
}

interface FavoritesStore {
  // State properties
  favorites: {
    freelancers: Freelancer[];
    jobs: Job[];
    folders: FavoriteFolder[];
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  addToFavorites: (
    itemId: string,
    itemType: 'freelancer' | 'job',
    folderId?: string
  ) => Promise<void>;
  removeFromFavorites: (
    itemId: string,
    itemType: 'freelancer' | 'job'
  ) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  moveToFolder: (itemId: string, folderId: string) => Promise<void>;
  clearError: () => void;
}

const useAdvancedSearchStore = create<AdvancedSearchStore>((set, get) => ({
  searchQuery: '',
  searchResults: [],
  suggestions: [],
  recentSearches: [],
  savedSearches: [],
  isLoading: false,
  isLoadingSuggestions: false,
  error: null,
  facets: null,
  searchId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  getSuggestions: async (query: string) => {
    if (query.length < 2) {
      set({ suggestions: [] });
      return;
    }

    set({ isLoadingSuggestions: true, error: null });

    try {
      const response = await fetch(
        `/api/v1/search/suggestions?query=${encodeURIComponent(query)}&type=freelancers`
      );
      const data = await response.json();

      if (data.success) {
        set({
          suggestions: data.data.suggestions,
          isLoadingSuggestions: false,
        });
      } else {
        set({ error: data.error, isLoadingSuggestions: false });
      }
    } catch (error) {
      set({ error: 'Öneriler yüklenemedi', isLoadingSuggestions: false });
    }
  },

  performAdvancedSearch: async (filters: AdvancedSearchRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/v1/search/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data = await response.json();

      if (data.success) {
        set({
          searchResults: data.data.results,
          facets: data.data.facets,
          searchId: data.data.searchId,
          isLoading: false,
        });

        // Add to recent searches
        if (filters.query) {
          get().addToRecentSearches(filters.query);
        }
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Arama yapılamadı', isLoading: false });
    }
  },

  saveSearch: async (name: string, filters: AdvancedSearchRequest) => {
    try {
      const response = await fetch('/api/v1/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filters, query: filters.query }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh saved searches
        // Implementation for fetching saved searches
      } else {
        set({ error: data.error });
      }
    } catch (error) {
      set({ error: 'Arama kaydedilemedi' });
    }
  },

  addToRecentSearches: (query: string) => {
    const { recentSearches } = get();
    const updatedRecent = [
      query,
      ...recentSearches.filter((q) => q !== query),
    ].slice(0, 10); // Keep last 10

    set({ recentSearches: updatedRecent });
  },
}));
```

### Custom Hooks

```typescript
// hooks/useAdvancedSearch.ts
export function useAdvancedSearch() {
  const store = useAdvancedSearchStore();

  const debouncedGetSuggestions = useMemo(
    () => debounce(store.getSuggestions, 300),
    [store.getSuggestions]
  );

  useEffect(() => {
    return () => {
      debouncedGetSuggestions.cancel();
    };
  }, [debouncedGetSuggestions]);

  return {
    ...store,
    getSuggestions: debouncedGetSuggestions,
  };
}

// hooks/useLocationSearch.ts
export function useLocationSearch() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocations([]);
      return;
    }

    setIsLoading(true);

    try {
      // Mock location search - in real app would use Google Places API
      const mockLocations = [
        { id: '1', name: 'İstanbul', type: 'city' },
        { id: '2', name: 'İstanbul, Beşiktaş', type: 'district' },
        { id: '3', name: 'İstanbul, Şişli', type: 'district' },
      ].filter((loc) => loc.name.toLowerCase().includes(query.toLowerCase()));

      setLocations(mockLocations);
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(searchLocations, 300),
    [searchLocations]
  );

  return {
    locations,
    isLoading,
    searchLocations: debouncedSearch,
  };
}

// hooks/useRecommendations.ts
export function useRecommendations(
  type: 'freelancers' | 'jobs',
  basedOn: 'profile' | 'activity' | 'similar' = 'profile'
) {
  const store = useRecommendationStore();

  useEffect(() => {
    store.fetchRecommendations(type, basedOn);
  }, [type, basedOn]);

  return store;
}

// hooks/useFavorites.ts
export function useFavorites() {
  const store = useFavoritesStore();

  useEffect(() => {
    store.fetchFavorites();
  }, []);

  const toggleFavorite = useCallback(
    async (itemId: string, itemType: 'freelancer' | 'job') => {
      const { favorites } = store;
      const isFavorited =
        itemType === 'freelancer'
          ? favorites.freelancers.some((f) => f.id === itemId)
          : favorites.jobs.some((j) => j.id === itemId);

      if (isFavorited) {
        await store.removeFromFavorites(itemId, itemType);
      } else {
        await store.addToFavorites(itemId, itemType);
      }
    },
    [store]
  );

  return {
    ...store,
    toggleFavorite,
  };
}
```

### Form Validation (Zod)

```typescript
// lib/validations/advanced-search.ts
export const advancedSearchSchema = z.object({
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
});

export const saveSearchSchema = z.object({
  name: z
    .string()
    .min(3, 'Arama adı en az 3 karakter olmalıdır')
    .max(50, 'Arama adı en fazla 50 karakter olabilir'),
  filters: advancedSearchSchema,
  alertEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
});

export type AdvancedSearchFormData = z.infer<typeof advancedSearchSchema>;
export type SaveSearchFormData = z.infer<typeof saveSearchSchema>;
```

### Component Structure

```typescript
// components/features/AdvancedSearch.tsx
interface AdvancedSearchProps {
  onResults?: (results: (Freelancer | Job)[]) => void;
  defaultFilters?: Partial<AdvancedSearchFormData>;
}

export function AdvancedSearch({ onResults, defaultFilters }: AdvancedSearchProps) {
  const {
    searchQuery,
    searchResults,
    suggestions,
    isLoading,
    performAdvancedSearch,
    getSuggestions,
    setSearchQuery,
  } = useAdvancedSearch();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdvancedSearchFormData>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: defaultFilters,
  });

  const query = watch('query');

  useEffect(() => {
    if (query) {
      getSuggestions(query);
      setSearchQuery(query);
    }
  }, [query, getSuggestions, setSearchQuery]);

  const onSubmit = async (data: AdvancedSearchFormData) => {
    await performAdvancedSearch(data);
    if (onResults) {
      onResults(searchResults);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex">
          <Input
            {...register('query')}
            placeholder="Ne arıyorsunuz? (örn: React Developer, Logo Tasarım)"
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="ml-2"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtreler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} className="ml-2">
            <Search className="h-4 w-4 mr-2" />
            Ara
          </Button>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg">
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    // Clear suggestions
                  }}
                >
                  <Search className="h-4 w-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <Label>Kategori</Label>
              <Select {...register('category')}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="mobile-development">Mobile Development</SelectItem>
                  <SelectItem value="design">Tasarım</SelectItem>
                  <SelectItem value="writing">Yazı & İçerik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <Label>Lokasyon</Label>
              <LocationPicker
                onLocationSelect={(location) => {
                  // Set location in form
                }}
              />
            </div>

            {/* Budget Range */}
            <div>
              <Label>Bütçe Aralığı</Label>
              <div className="flex space-x-2">
                <Input
                  {...register('budget.min', { valueAsNumber: true })}
                  type="number"
                  placeholder="Min"
                />
                <Input
                  {...register('budget.max', { valueAsNumber: true })}
                  type="number"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <Label>Minimum Rating</Label>
              <Select {...register('rating', { valueAsNumber: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.5">4.5+ Yıldız</SelectItem>
                  <SelectItem value="4.0">4.0+ Yıldız</SelectItem>
                  <SelectItem value="3.5">3.5+ Yıldız</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label>Müsaitlik</Label>
              <Select {...register('availability')}>
                <SelectTrigger>
                  <SelectValue placeholder="Müsaitlik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Müsait</SelectItem>
                  <SelectItem value="busy">Meşgul</SelectItem>
                  <SelectItem value="any">Hepsi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remote Work */}
            <div className="flex items-center space-x-2">
              <Checkbox {...register('remoteOk')} id="remoteOk" />
              <Label htmlFor="remoteOk">Uzaktan Çalışma OK</Label>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Aranıyor...</span>
        </div>
      )}
    </div>
  );
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Gelişmiş arama sistemi autocomplete ile implemented
- [ ] Lokasyon tabanlı filtreleme ve harita entegrasyonu
- [ ] AI-powered recommendation engine çalışıyor
- [ ] Favoriler ve saved searches sistemi
- [ ] Search analytics ve trending detection
- [ ] Responsive design (mobile, tablet, desktop) tested

### Technical Deliverables

- [ ] AdvancedSearchStore, RecommendationStore, FavoritesStore
- [ ] useAdvancedSearch, useRecommendations, useFavorites hooks
- [ ] TypeScript interfaces ve Zod validation schemas
- [ ] MSW handlers for search/recommendations/favorites
- [ ] Performance optimization ve caching strategies
- [ ] Unit tests for search/recommendation components
- [ ] Integration tests for search flows

### Quality Deliverables

- [ ] Accessibility (WCAG 2.1 AA) for search interfaces
- [ ] Cross-browser compatibility tested
- [ ] Performance optimized (search response <1s)
- [ ] SEO optimization implemented
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Advanced Search → Location Filter → Skills Match → Save Search
  2. Recommendations → View Details → Add to Favorites
  3. Saved Searches → Edit → Delete

- **Employer Journey**:
  1. Search → Map View → Distance Filter → Contact
  2. Favorites → Organize Folders → Export
  3. Trending → Recommendations → Save

### Edge Cases

- **Location permission denied**: Fallback to manual location entry
- **No search results**: Show suggestions, trending, recommendations
- **Slow network**: Progressive loading, cached suggestions
- **Invalid location**: Validation, error messages
- **Large result sets**: Pagination, virtual scrolling

### Performance Tests

- Search autocomplete response time <200ms
- Advanced search complete response <1s
- Map rendering ve interaction smooth 60fps
- Recommendation generation <500ms
- Favorites operations <300ms

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Autocomplete ve instant search smooth ve accurate
- [ ] Location filtering ve map integration seamless
- [ ] Recommendations relevant ve personalized
- [ ] Saved searches ve favorites well organized
- [ ] Search analytics ve trending working

### Design Acceptance

- [ ] Search interface intuitive ve responsive
- [ ] Map integration smooth ve accessible
- [ ] Recommendation cards engaging ve informative
- [ ] Loading states ve transitions smooth
- [ ] Error states clear ve actionable

### Technical Acceptance

- [ ] TypeScript strict mode compliance
- [ ] Zero console errors/warnings
- [ ] Performance benchmarks met
- [ ] Caching strategies effective
- [ ] API optimization ve rate limiting
- [ ] Security best practices implemented

## 📊 Definition of Done

- [ ] All functional requirements implemented ve thoroughly tested
- [ ] Mobile responsiveness verified across devices
- [ ] Browser compatibility confirmed
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance optimization completed (search <1s)
- [ ] SEO optimization implemented
- [ ] Unit ve integration tests passing (%80+ coverage)
- [ ] Security review completed
- [ ] Code review approved
- [ ] Technical documentation updated
- [ ] User acceptance testing completed
