'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MessageCircle,
  FileText,
  Book,
  Users,
  Settings,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';

export function HelpCenterMain() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Arama geçici olarak devre dışı
      alert(
        'Arama özelliği geçici olarak bakımda. Lütfen daha sonra tekrar deneyin.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Yardım Merkezi
            </h1>
            <p className="mb-8 text-xl opacity-90">
              MarifetBul platformunu kullanırken ihtiyacınız olan tüm yardım
              burada. Hızlıca cevap bulun veya destek ekibimizle iletişime
              geçin.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Neyle ilgili yardıma ihtiyacınız var?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 rounded-xl border-0 pr-20 pl-12 text-lg shadow-lg"
                />
                <Button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-blue-600 px-6 hover:bg-blue-700"
                >
                  Ara
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Quick Actions */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Hızlı İşlemler
              </h2>
              <p className="text-gray-600">
                İhtiyacınıza uygun desteği hemen alın
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  E-posta Desteği
                </h3>
                <p className="mb-4 text-gray-600">
                  Sorularınızı e-posta ile gönderin, en kısa sürede
                  yanıtlayalım.
                </p>
                <Button
                  onClick={() => router.push('/contact')}
                  className="w-full"
                >
                  E-posta Gönder
                </Button>
              </Card>

              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Destek Talebi
                </h3>
                <p className="mb-4 text-gray-600">
                  Detaylı destek için ticket oluşturun ve takip edin.
                </p>
                <Button
                  onClick={() => router.push('/support/create')}
                  variant="outline"
                  className="w-full"
                >
                  Talep Oluştur
                </Button>
              </Card>

              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Book className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  SSS
                </h3>
                <p className="mb-4 text-gray-600">
                  Sık sorulan sorular ve detaylı yanıtlar.
                </p>
                <Button
                  onClick={() => router.push('/faq')}
                  variant="outline"
                  className="w-full"
                >
                  SSS&apos;yi Gör
                </Button>
              </Card>
            </div>
          </div>

          {/* Statik Yardım Kategorileri */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Yardım Kategorileri
              </h2>
              <p className="text-gray-600">
                İhtiyaç duyduğunuz konuya göre yardım alın
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/faq')}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                    <Users className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hesap Yönetimi
                    </h3>
                    <div className="text-sm text-gray-500">Genel sorular</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-gray-600">
                  Hesap oluşturma, profil düzenleme ve güvenlik ayarları
                </p>
              </Card>

              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/how-it-works')}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                    <Settings className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Platform Kullanımı
                    </h3>
                    <div className="text-sm text-gray-500">Nasıl çalışır</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-gray-600">
                  Platform özelliklerini öğrenin ve en iyi şekilde kullanın
                </p>
              </Card>

              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/contact')}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                    <Shield className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Güvenlik ve Gizlilik
                    </h3>
                    <div className="text-sm text-gray-500">
                      Güvenlik konuları
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-gray-600">
                  Hesap güvenliği, gizlilik ayarları ve veri koruma
                </p>
              </Card>
            </div>
          </div>

          {/* Statik Önerilen Konular */}
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Popüler Konular
              </h2>
              <p className="text-gray-600">
                En çok merak edilen konular ve çözümler
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/faq')}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-blue-600">
                    Popüler
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Hesap Oluşturma ve Giriş Sorunları
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Hesap oluştururken yaşanan sorunlar ve çözüm yolları
                </p>
              </Card>

              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/how-it-works')}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-blue-600">
                    Popüler
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Platform Nasıl Kullanılır?
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  MarifetBul platformunu etkili şekilde kullanma rehberi
                </p>
              </Card>

              <Card
                className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                onClick={() => router.push('/contact')}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-blue-600">
                    Popüler
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Güvenlik ve Gizlilik Ayarları
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Hesabınızı güvende tutmak için önemli güvenlik ayarları
                </p>
              </Card>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Aradığınızı bulamadınız mı?
            </h2>
            <p className="mb-8 text-xl opacity-90">
              7/24 destek ekibimiz size yardımcı olmaya hazır
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={() => router.push('/contact')}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                E-posta Desteği
              </Button>
              <Button
                onClick={() => router.push('/faq')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                <FileText className="mr-2 h-4 w-4" />
                Sık Sorulan Sorular
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
