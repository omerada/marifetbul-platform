'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { Badge } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import { useToast } from '@/hooks/useToast';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Tags,
  X,
  AlertCircle,
} from 'lucide-react';

// Form validasyon şeması
const jobSchema = z.object({
  title: z
    .string()
    .min(10, 'Başlık en az 10 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  description: z
    .string()
    .min(100, 'Açıklama en az 100 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),

  category: z.string().min(1, 'Kategori seçimi zorunludur'),
  subcategory: z.string().min(1, 'Alt kategori seçimi zorunludur'),

  budgetType: z.enum(['fixed', 'hourly'] as const),

  budgetMin: z.number().min(50, 'Minimum bütçe 50 TL olmalıdır'),

  budgetMax: z.number().min(50, 'Maximum bütçe 50 TL olmalıdır'),

  deadline: z.string().min(1, 'Teslim tarihi zorunludur'),

  location: z.string().min(1, 'Konum bilgisi zorunludur'),

  experience: z
    .enum(['entry', 'intermediate', 'expert'] as const)
    .refine((val) => val, {
      message: 'Deneyim seviyesi seçimi zorunludur',
    }),

  skills: z
    .array(z.string())
    .min(2, 'En az 2 yetenek seçmelisiniz')
    .max(15, 'En fazla 15 yetenek seçebilirsiniz'),
});

type JobFormData = z.infer<typeof jobSchema>;

const categories = [
  {
    id: 'web-dev',
    name: 'Web Geliştirme',
    subcategories: [
      'Frontend',
      'Backend',
      'Full Stack',
      'WordPress',
      'E-ticaret',
    ],
  },
  {
    id: 'mobile-dev',
    name: 'Mobil Uygulama',
    subcategories: ['iOS', 'Android', 'React Native', 'Flutter', 'Hybrid'],
  },
  {
    id: 'design',
    name: 'Tasarım',
    subcategories: [
      'UI/UX',
      'Logo Tasarım',
      'Web Tasarım',
      'Grafik Tasarım',
      'İllüstrasyon',
    ],
  },
  {
    id: 'content',
    name: 'İçerik Yazımı',
    subcategories: [
      'Blog Yazımı',
      'Copywriting',
      'Teknik Yazım',
      'SEO İçerik',
      'Çeviri',
    ],
  },
  {
    id: 'marketing',
    name: 'Dijital Pazarlama',
    subcategories: [
      'SEO',
      'SEM',
      'Sosyal Medya',
      'İçerik Pazarlama',
      'Email Pazarlama',
    ],
  },
  {
    id: 'data',
    name: 'Veri Analizi',
    subcategories: ['Excel', 'Python', 'R', 'SQL', 'Business Intelligence'],
  },
];

const skillsPool = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'PHP',
  'Laravel',
  'Vue.js',
  'Angular',
  'WordPress',
  'Shopify',
  'UI/UX Design',
  'Figma',
  'Adobe Photoshop',
  'Adobe Illustrator',
  'HTML/CSS',
  'TypeScript',
  'MongoDB',
  'MySQL',
  'PostgreSQL',
  'Firebase',
  'SEO',
  'Google Ads',
  'Facebook Ads',
  'Content Writing',
  'Copywriting',
  'Data Analysis',
  'Excel',
  'Power BI',
  'Tableau',
  'Machine Learning',
];

export default function CreateJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      budgetType: 'fixed',
      experience: 'intermediate',
      skills: [],
    },
  });

  // Auth kontrolü
  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'employer') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const selectedCategory = watch('category');
  const budgetType = watch('budgetType');
  const budgetMin = watch('budgetMin');
  const budgetMax = watch('budgetMax');

  // Budget validation
  useEffect(() => {
    if (budgetMin && budgetMax && budgetMax <= budgetMin) {
      setValue('budgetMax', budgetMin + 50);
    }
  }, [budgetMin, budgetMax, setValue]);

  // Skills yönetimi
  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 15) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      setValue('skills', newSkills);
      setSkillSearch('');
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const filteredSkills = skillsPool.filter(
    (skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);

    try {
      // API çağrısı simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Job creation data:', data);

      showToast('İş ilanı başarıyla oluşturuldu!', 'success');

      router.push('/marketplace?view=jobs');
    } catch {
      showToast('İş ilanı oluşturulurken bir hata oluştu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.userType !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Yeni İş İlanı Oluştur
          </h1>
          <p className="text-gray-600">
            Projeniz için en uygun freelancerları bulun
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Ana Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Temel Bilgiler */}
              <Card className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Temel Bilgiler</h2>
                </div>

                <div className="space-y-6">
                  {/* Başlık */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      İş İlanı Başlığı *
                    </label>
                    <Input
                      {...register('title')}
                      placeholder="Örn: React ile E-ticaret Sitesi Geliştirilmesi"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Kategori */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Kategori *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Kategori seçin</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Alt Kategori *
                      </label>
                      <select
                        {...register('subcategory')}
                        disabled={!selectedCategory}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Alt kategori seçin</option>
                        {selectedCategory &&
                          categories
                            .find((cat) => cat.name === selectedCategory)
                            ?.subcategories.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                      </select>
                      {errors.subcategory && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.subcategory.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Proje Açıklaması *
                    </label>
                    <Textarea
                      {...register('description')}
                      rows={6}
                      placeholder="Projenizi detaylı olarak açıklayın. Ne tür bir çözüm aradığınızı, beklentilerinizi ve gereksinimlerinizi belirtin..."
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Bütçe ve Timeline */}
              <Card className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Bütçe ve Timeline</h2>
                </div>

                <div className="space-y-6">
                  {/* Bütçe Tipi */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      Bütçe Tipi *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('budgetType')}
                          value="fixed"
                          className="text-blue-600"
                        />
                        <span>Sabit Fiyat</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('budgetType')}
                          value="hourly"
                          className="text-blue-600"
                        />
                        <span>Saatlik Ücret</span>
                      </label>
                    </div>
                  </div>

                  {/* Bütçe Aralığı */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Minimum Bütçe (₺) *
                      </label>
                      <Input
                        type="number"
                        {...register('budgetMin', { valueAsNumber: true })}
                        placeholder="500"
                        className={errors.budgetMin ? 'border-red-500' : ''}
                      />
                      {errors.budgetMin && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.budgetMin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Maximum Bütçe (₺) *
                      </label>
                      <Input
                        type="number"
                        {...register('budgetMax', { valueAsNumber: true })}
                        placeholder="2000"
                        className={errors.budgetMax ? 'border-red-500' : ''}
                      />
                      {errors.budgetMax && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.budgetMax.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teslim Tarihi */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Teslim Tarihi *
                    </label>
                    <Input
                      type="date"
                      {...register('deadline')}
                      min={new Date().toISOString().split('T')[0]}
                      className={errors.deadline ? 'border-red-500' : ''}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deadline.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Gereksinimler */}
              <Card className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Tags className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">Gereksinimler</h2>
                </div>

                <div className="space-y-6">
                  {/* Deneyim Seviyesi */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      Deneyim Seviyesi *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('experience')}
                          value="entry"
                          className="text-blue-600"
                        />
                        <span>Başlangıç</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('experience')}
                          value="intermediate"
                          className="text-blue-600"
                        />
                        <span>Orta</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('experience')}
                          value="expert"
                          className="text-blue-600"
                        />
                        <span>Uzman</span>
                      </label>
                    </div>
                  </div>

                  {/* Konum */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Konum *
                    </label>
                    <Input
                      {...register('location')}
                      placeholder="Uzaktan, İstanbul, Ankara vb."
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Yetenekler */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Gerekli Yetenekler * (En az 2, en fazla 15)
                    </label>

                    {/* Seçili Yetenekler */}
                    {selectedSkills.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Yetenek Arama */}
                    <Input
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Yetenek arayın..."
                      className="mb-3"
                    />

                    {/* Yetenek Önerileri */}
                    {skillSearch && (
                      <div className="max-h-32 overflow-y-auto rounded-md border">
                        {filteredSkills.slice(0, 10).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.skills && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.skills.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar - Önizleme */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 p-6">
                <h3 className="mb-4 text-lg font-semibold">İlan Önizleme</h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {budgetMin && budgetMax
                        ? `₺${budgetMin.toLocaleString()} - ₺${budgetMax.toLocaleString()}`
                        : 'Bütçe belirtilmedi'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Teslim tarihi: {watch('deadline') || 'Belirtilmedi'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {budgetType === 'fixed' ? 'Sabit fiyat' : 'Saatlik ücret'}
                    </span>
                  </div>

                  {selectedSkills.length > 0 && (
                    <div>
                      <p className="mb-2 font-medium">Gerekli Yetenekler:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSkills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {selectedSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedSkills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t pt-6">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        İlan Yayınlandıktan Sonra:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• Freelancerlar tekliflerini gönderecek</li>
                        <li>
                          • Profilleri inceleyip en uygununu seçebilirsiniz
                        </li>
                        <li>
                          • Güvenli ödeme sistemi ile işlemi tamamlayabilirsiniz
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/marketplace?view=jobs')}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
