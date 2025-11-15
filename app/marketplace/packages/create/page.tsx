'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
} from '@/components/ui';
import { useToast } from '@/hooks';
import { CreateMilestoneForm } from '@/components/domains/milestones';
import type { CreateOrderMilestoneRequest } from '@/types/business/features/milestone';
import { Info, Package } from 'lucide-react';

// Zod validation schema
const packageSchema = z.object({
  title: z
    .string()
    .min(10, 'Başlık en az 10 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  description: z
    .string()
    .min(50, 'Açıklama en az 50 karakter olmalıdır')
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir'),

  category: z.string().min(1, 'Kategori seçimi zorunludur'),
  subcategory: z.string().min(1, 'Alt kategori seçimi zorunludur'),

  price: z
    .number()
    .min(50, 'Minimum fiyat 50 TL olmalıdır')
    .max(50000, 'Maximum fiyat 50.000 TL olabilir'),

  deliveryDays: z
    .number()
    .min(1, 'Teslimat süresi en az 1 gün olmalıdır')
    .max(30, 'Teslimat süresi en fazla 30 gün olabilir'),

  features: z.string().min(1, 'Paket özelliklerini listeleyin'),

  skills: z.string().min(1, 'Yeteneklerinizi girin (virgülle ayırın)'),
});

type PackageFormData = z.infer<typeof packageSchema>;

const categories = [
  'Web Geliştirme',
  'Mobil Geliştirme',
  'Grafik Tasarım',
  'İçerik Yazımı',
  'Dijital Pazarlama',
  'Video Düzenleme',
  'Fotoğraf',
  'Çeviri',
  'Ses Düzenleme',
  'Veri Girişi',
];

const subcategories: Record<string, string[]> = {
  'Web Geliştirme': [
    'Frontend',
    'Backend',
    'Full Stack',
    'WordPress',
    'E-ticaret',
  ],
  'Mobil Geliştirme': ['iOS', 'Android', 'React Native', 'Flutter'],
  'Grafik Tasarım': [
    'Logo Tasarım',
    'Kurumsal Kimlik',
    'Web Tasarım',
    'Sosyal Medya',
  ],
  'İçerik Yazımı': [
    'Blog Yazısı',
    'Ürün Açıklaması',
    'SEO İçerik',
    'Sosyal Medya İçeriği',
  ],
  'Dijital Pazarlama': ['SEO', 'SEM', 'Sosyal Medya', 'Email Marketing'],
  'Video Düzenleme': [
    'Tanıtım Videosu',
    'YouTube',
    'Sosyal Medya',
    'Kurumsal Video',
  ],
  Fotoğraf: ['Ürün Fotoğrafı', 'Portre', 'Etkinlik', 'Mimari'],
  Çeviri: ['İngilizce', 'Almanca', 'Fransızca', 'Teknik Çeviri'],
  'Ses Düzenleme': ['Podcast', 'Müzik', 'Seslendirme', 'Ses Efekti'],
  'Veri Girişi': ['Excel', 'CRM', 'Web Scraping', 'Araştırma'],
};

export default function CreatePackagePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [enableMilestones, setEnableMilestones] = useState(false);
  const [milestones, setMilestones] = useState<CreateOrderMilestoneRequest[]>(
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  const selectedCategory = watch('category');
  const currentPrice = watch('price');

  const onSubmit = async (data: PackageFormData) => {
    try {
      // Milestone validation
      if (enableMilestones) {
        if (milestones.length === 0) {
          error('En az bir milestone tanımlamalısınız');
          return;
        }

        const totalMilestoneAmount = milestones.reduce(
          (sum, m) => sum + m.amount,
          0
        );

        if (totalMilestoneAmount !== currentPrice) {
          error(
            `Milestone tutarları toplamı (${totalMilestoneAmount} TL) paket fiyatına (${currentPrice} TL) eşit olmalıdır`
          );
          return;
        }
      }

      // TODO: Backend integration - save package with milestones
      // const packageData = {
      //   ...data,
      //   images: uploadedImages,
      //   milestones: enableMilestones ? milestones : undefined,
      // };

      await new Promise((resolve) => setTimeout(resolve, 2000));

      success('Paket başarıyla oluşturuldu!');
      router.push('/marketplace?view=packages');
    } catch {
      error('Paket oluşturulurken bir hata oluştu');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Yeni Paket Oluştur
          </h1>
          <p className="text-center text-gray-600">
            Hizmetlerinizi paket haline getirin ve satışa sunun
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Temel Bilgiler</h2>
              <p className="text-gray-600">
                Paketinizin temel bilgilerini girin
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Paket Başlığı *
                </label>
                <Input
                  {...register('title')}
                  placeholder="Paketinizin başlığını girin"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Paket Açıklaması *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Paketinizin detaylı açıklamasını yazın"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Kategori *
                  </label>
                  <select
                    {...register('category')}
                    className={`w-full rounded-lg border px-3 py-2 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Alt Kategori *
                  </label>
                  <select
                    {...register('subcategory')}
                    className={`w-full rounded-lg border px-3 py-2 ${errors.subcategory ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={!selectedCategory}
                  >
                    <option value="">Alt kategori seçin</option>
                    {selectedCategory &&
                      subcategories[selectedCategory]?.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                  </select>
                  {errors.subcategory && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subcategory.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fiyat ve Teslimat */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Fiyat & Teslimat</h2>
              <p className="text-gray-600">
                Paket fiyatı ve teslimat süresini belirleyin
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Fiyat (TL) *
                  </label>
                  <Input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="50"
                    min="50"
                    max="50000"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Teslimat Süresi (Gün) *
                  </label>
                  <Input
                    type="number"
                    {...register('deliveryDays', { valueAsNumber: true })}
                    placeholder="7"
                    min="1"
                    max="30"
                    className={errors.deliveryDays ? 'border-red-500' : ''}
                  />
                  {errors.deliveryDays && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.deliveryDays.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Paket Özellikleri *
                </label>
                <Textarea
                  {...register('features')}
                  placeholder="Paketinizde neler dahil? Her satıra bir özellik yazın"
                  rows={4}
                  className={errors.features ? 'border-red-500' : ''}
                />
                {errors.features && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.features.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Yetenekler *
                </label>
                <Input
                  {...register('skills')}
                  placeholder="JavaScript, React, Node.js (virgülle ayırın)"
                  className={errors.skills ? 'border-red-500' : ''}
                />
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.skills.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Milestone Tabanlı Ödeme - STORY 1.2 */}
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Package className="h-5 w-5" />
                Milestone Tabanlı Ödeme
              </h2>
              <p className="text-gray-600">
                İşi aşamalara bölerek her aşamada ödeme alın (opsiyonel)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-medium">
                    Milestone sistemi nasıl çalışır?
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-blue-700">
                    <li>İşi aşamalara (milestone) bölersiniz</li>
                    <li>Her aşamayı teslim ettikçe ödeme alırsınız</li>
                    <li>Alıcı her aşamayı onaylar veya revizyon talep eder</li>
                    <li>
                      Tüm milestone tutarları toplamı paket fiyatına eşit
                      olmalıdır
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="enableMilestones"
                  checked={enableMilestones}
                  onCheckedChange={(checked) =>
                    setEnableMilestones(checked === true)
                  }
                />
                <label
                  htmlFor="enableMilestones"
                  className="cursor-pointer text-sm font-medium"
                >
                  Bu paket için milestone tabanlı ödeme kullan
                </label>
              </div>

              {enableMilestones && (
                <div className="mt-6 border-t pt-6">
                  <CreateMilestoneForm
                    totalAmount={watch('price') || 0}
                    milestones={milestones}
                    onChange={setMilestones}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Görsel Yükleme */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Paket Görselleri</h2>
              <p className="text-gray-600">
                Paketinizi temsil eden görseller ekleyin (opsiyonel)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Görsel Yükle (En fazla 5 adet)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  disabled={uploadedImages.length >= 5}
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-gray-600">
                    Yüklenen görseller ({uploadedImages.length}/5):
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={imageUrl}
                          alt={`Paket görseli ${index + 1}`}
                          width={200}
                          height={150}
                          className="h-32 w-full rounded-lg object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-3 text-lg"
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Paketi Yayınla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
