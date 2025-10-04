'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import {
  Search,
  ChevronRight,
  Code,
  Palette,
  Megaphone,
  Home,
  GraduationCap,
  Heart,
} from 'lucide-react';

const categories = [
  {
    id: 'teknoloji',
    title: 'Teknoloji & Yazılım',
    icon: Code,
    description: 'Web ve mobil geliştirme',
  },
  {
    id: 'tasarim',
    title: 'Tasarım & Kreatif',
    icon: Palette,
    description: 'Grafik tasarım ve logo',
  },
  {
    id: 'pazarlama',
    title: 'Pazarlama & Reklam',
    icon: Megaphone,
    description: 'Dijital pazarlama',
  },
  {
    id: 'ev',
    title: 'Ev & Yaşam',
    icon: Home,
    description: 'Ev tadilatı ve temizlik',
  },
  {
    id: 'egitim',
    title: 'Eğitim & Danışmanlık',
    icon: GraduationCap,
    description: 'Özel ders ve kurs',
  },
  {
    id: 'saglik',
    title: 'Sağlık & Bakım',
    icon: Heart,
    description: 'Güzellik ve sağlık',
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Hizmet Kategorileri
            </h1>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              İhtiyacınız olan hizmeti bulun veya uzmanlık alanınızda projeler
              keşfedin.
            </p>
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Kategori, hizmet veya beceri arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pr-4 pl-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group p-6 transition-all hover:shadow-xl"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/marketplace/categories/${category.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Hizmetleri Görüntüle
                    </Button>
                  </Link>
                  <Link href="/marketplace/jobs/create" className="flex-1">
                    <Button size="sm" className="w-full">
                      İş İlanı Ver
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Aradığınız hizmeti bulamadınız mı?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600">
            Özel ihtiyacınız için doğrudan iş ilanı verin.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/marketplace/jobs/create">
              <Button size="lg">İş İlanı Ver</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Destek Al
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
