'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  Eye,
  Grid,
  List,
  Code,
  Palette,
  Megaphone,
  Home,
  Car,
  GraduationCap,
  Heart,
  Calculator,
  Baby,
  Activity,
  Leaf,
  UtensilsCrossed,
  PartyPopper,
  Plane,
  Scale,
} from 'lucide-react';

// Complete category data structure based on comprehensive Armut/Bionluk analysis
const categoryData = [
  {
    id: 'teknoloji-yazilim',
    title: 'Teknoloji & Yazılım',
    icon: Code,
    color: 'bg-blue-500',
    description: 'Web, mobil ve yazılım geliştirme hizmetleri',
    count: '12,450',
    trending: true,
    popularity: 20,
    subcategories: [
      {
        id: 'web-gelistirme',
        title: 'Web Geliştirme',
        services: [
          'WordPress Web Sitesi',
          'E-ticaret Sitesi',
          'Kurumsal Web Sitesi',
          'Landing Page',
          'Web Uygulaması',
          'Frontend Geliştirme (React, Vue, Angular)',
          'Backend Geliştirme (Node.js, PHP, Python)',
          'Full Stack Geliştirme',
        ],
        priceRange: '₺500 - ₺15,000',
        averageRating: 4.8,
        count: '3,200',
      },
      {
        id: 'mobil-uygulama',
        title: 'Mobil Uygulama',
        services: [
          'iOS App Geliştirme (Swift)',
          'Android App Geliştirme (Kotlin)',
          'React Native',
          'Flutter',
          'Xamarin & Ionic',
          'Progressive Web App (PWA)',
          'App Store Optimizasyonu (ASO)',
        ],
        priceRange: '₺1,000 - ₺25,000',
        averageRating: 4.7,
        count: '1,850',
      },
      {
        id: 'yazilim-gelistirme',
        title: 'Yazılım Geliştirme',
        services: [
          'Desktop Uygulama (.NET, Electron)',
          'API Geliştirme (REST, GraphQL)',
          'Database Tasarımı (MySQL, MongoDB)',
          'Cloud Solutions (AWS, Azure)',
          'DevOps & CI/CD',
          'Mikroservis Mimarisi',
          'Blockchain Geliştirme',
        ],
        priceRange: '₺1,500 - ₺50,000',
        averageRating: 4.9,
        count: '2,100',
      },
      {
        id: 'siber-guvenlik',
        title: 'Siber Güvenlik',
        services: [
          'Penetrasyon Testi',
          'Güvenlik Denetimi',
          'Web Güvenliği',
          'SSL Sertifikası Kurulumu',
          'GDPR Uyumluluk',
          'Veri Koruma Çözümleri',
        ],
        priceRange: '₺800 - ₺12,000',
        averageRating: 4.8,
        count: '420',
      },
      {
        id: 'oyun-gelistirme',
        title: 'Oyun Geliştirme',
        services: [
          'Unity 2D/3D Oyun',
          'Mobile Game Development',
          'HTML5 Web Oyunları',
          'Game Mechanics Design',
          'PC/Console Game',
        ],
        priceRange: '₺1,200 - ₺30,000',
        averageRating: 4.6,
        count: '380',
      },
      {
        id: 'blockchain-kripto',
        title: 'Blockchain & Kripto',
        services: [
          'Smart Contract (Solidity)',
          'DeFi Uygulamaları',
          'NFT Marketplace',
          'Kripto Wallet',
          'Blockchain Consulting',
        ],
        priceRange: '₺2,000 - ₺40,000',
        averageRating: 4.7,
        count: '280',
      },
    ],
  },
  {
    id: 'tasarim-kreatif',
    title: 'Tasarım & Kreatif',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'Grafik tasarım, logo ve kreatif çözümler',
    count: '8,750',
    trending: true,
    popularity: 15,
    subcategories: [
      {
        id: 'grafik-tasarim',
        title: 'Grafik Tasarım',
        services: [
          'Logo Tasarımı',
          'Kurumsal Kimlik',
          'Baskı Tasarımı (Broşür, Flyer)',
          'Ambalaj Tasarımı',
          'Kartvizit Tasarımı',
          'İllüstrasyon & İkon',
          'Infografik Tasarımı',
        ],
        priceRange: '₺150 - ₺3,000',
        averageRating: 4.6,
        count: '4,200',
      },
      {
        id: 'web-ui-ux-tasarim',
        title: 'Web & UI/UX Tasarımı',
        services: [
          'UI Design',
          'UX Design & User Research',
          'Web Tasarımı',
          'Mobil App UI Tasarımı',
          'Wireframe & Prototyping',
          'Design System',
        ],
        priceRange: '₺300 - ₺8,000',
        averageRating: 4.7,
        count: '2,100',
      },
      {
        id: 'video-animasyon',
        title: 'Video & Animasyon',
        services: [
          'Motion Graphics',
          '2D/3D Animasyon',
          'Video Editing',
          'Logo Animasyonu',
          'Explainer Video',
          'Whiteboard Animation',
          'Stop Motion',
        ],
        priceRange: '₺500 - ₺12,000',
        averageRating: 4.5,
        count: '1,650',
      },
      {
        id: 'fotograf-video-produksiyon',
        title: 'Fotoğraf & Video Prodüksiyon',
        services: [
          'Ürün Fotoğrafçılığı',
          'Portre & Etkinlik Fotoğrafçılığı',
          'Video Çekimi & Prodüksiyon',
          'Drone Çekimi',
          'Post-Production & Retouching',
          'Düğün Fotoğraf/Video',
        ],
        priceRange: '₺200 - ₺5,000',
        averageRating: 4.4,
        count: '800',
      },
      {
        id: 'ic-mimarlik-3d',
        title: 'İç Mimarlık & 3D Tasarım',
        services: [
          'İç Mimari Tasarım',
          '3D Modelleme & Rendering',
          'Teknik Çizim (AutoCAD)',
          'Mimari Görselleştirme',
          'Peyzaj Tasarımı',
        ],
        priceRange: '₺800 - ₺15,000',
        averageRating: 4.6,
        count: '950',
      },
    ],
  },
  {
    id: 'pazarlama-reklam',
    title: 'Pazarlama & Reklam',
    icon: Megaphone,
    color: 'bg-green-500',
    description: 'Dijital pazarlama ve reklam çözümleri',
    count: '6,320',
    trending: true,
    popularity: 12,
    subcategories: [
      {
        id: 'dijital-pazarlama',
        title: 'Dijital Pazarlama',
        services: [
          'SEO (Arama Motoru Optimizasyonu)',
          'SEM (Google Ads, Bing Ads)',
          'Social Media Advertising',
          'Content Marketing',
          'Email Marketing',
          'Analytics & Reporting',
        ],
        priceRange: '₺300 - ₺10,000',
        averageRating: 4.6,
        count: '3,100',
      },
      {
        id: 'sosyal-medya',
        title: 'Sosyal Medya',
        services: [
          'Sosyal Medya Yönetimi',
          'İçerik Üretimi',
          'Community Management',
          'Influencer Marketing',
          'Sosyal Medya Reklamları',
        ],
        priceRange: '₺500 - ₺8,000',
        averageRating: 4.5,
        count: '2,200',
      },
      {
        id: 'metin-icerik',
        title: 'Metin & İçerik',
        services: [
          'Copywriting',
          'Blog Yazarlığı',
          'SEO Makale Yazımı',
          'Çeviri Hizmetleri',
          'Editörlük & Proofreading',
          'Ürün Açıklaması',
        ],
        priceRange: '₺50 - ₺2,000',
        averageRating: 4.4,
        count: '1,020',
      },
      {
        id: 'pr-iletisim',
        title: 'PR & İletişim',
        services: [
          'Basın Bülteni',
          'Medya İlişkileri',
          'Crisis Communication',
          'Event Marketing',
          'Brand Communication',
        ],
        priceRange: '₺800 - ₺5,000',
        averageRating: 4.3,
        count: '450',
      },
    ],
  },
  {
    id: 'ev-yasam',
    title: 'Ev & Yaşam Hizmetleri',
    icon: Home,
    color: 'bg-orange-500',
    description: 'Ev tadilatı, temizlik ve yaşam hizmetleri',
    count: '15,680',
    trending: false,
    popularity: 35,
    subcategories: [
      {
        id: 'tadilat-dekorasyon',
        title: 'Tadilat & Dekorasyon',
        services: [
          'Boyacı',
          'Elektrikçi',
          'Tesisatçi',
          'Döşeme & Zemin (Parke, Laminat)',
          'Duvar & Tavan (Alçıpan)',
          'Mutfak Tadilat',
          'Banyo Tadilat',
        ],
        priceRange: '₺200 - ₺25,000',
        averageRating: 4.3,
        count: '8,500',
      },
      {
        id: 'temizlik-hizmetleri',
        title: 'Temizlik Hizmetleri',
        services: [
          'Ev Temizliği',
          'Ofis Temizliği',
          'Özel Temizlik (Halı, Koltuk)',
          'Post-Construction Cleaning',
          'Dezenfeksiyon',
          'Cam Silme',
        ],
        priceRange: '₺80 - ₺1,500',
        averageRating: 4.2,
        count: '4,200',
      },
      {
        id: 'nakliye-tasima',
        title: 'Nakliye & Taşıma',
        services: [
          'Evden Eve Nakliye',
          'Ofis Taşıma',
          'Özel Eşya Taşıma',
          'Kurye Hizmetleri',
          'Uluslararası Taşıma',
        ],
        priceRange: '₺150 - ₺5,000',
        averageRating: 4.1,
        count: '2,980',
      },
      {
        id: 'bahce-peyzaj',
        title: 'Bahçe & Peyzaj',
        services: [
          'Bahçe Düzenleme',
          'Peyzaj Tasarımı',
          'Bahçe Bakımı',
          'Havuz Bakımı',
          'Sulama Sistemi',
        ],
        priceRange: '₺300 - ₺8,000',
        averageRating: 4.4,
        count: '1,200',
      },
      {
        id: 'guvenlik-sistemleri',
        title: 'Güvenlik Sistemleri',
        services: [
          'Alarm Sistemi',
          'Kamera Sistemi',
          'Intercom Sistemi',
          'Smart Lock',
          'Smart Home Installation',
        ],
        priceRange: '₺500 - ₺6,000',
        averageRating: 4.5,
        count: '800',
      },
    ],
  },
  {
    id: 'egitim-danismanlik',
    title: 'Eğitim & Danışmanlık',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    description: 'Özel ders, kurs ve danışmanlık hizmetleri',
    count: '4,560',
    trending: false,
    popularity: 8,
    subcategories: [
      {
        id: 'ozel-ders-akademik',
        title: 'Özel Ders & Akademik Destek',
        services: [
          'İlkokul Dersleri (Türkçe, Matematik)',
          'Ortaokul & Lise Dersleri',
          'Üniversite Hazırlık (YKS)',
          'Yabancı Dil (İngilizce, Almanca)',
          'Sanat & Müzik Dersleri',
          'Teknik Beceriler (Programlama)',
        ],
        priceRange: '₺50 - ₺300',
        averageRating: 4.7,
        count: '2,100',
      },
      {
        id: 'is-kariyer-danismanligi',
        title: 'İş & Kariyer Danışmanlığı',
        services: [
          'CV Hazırlama',
          'İş Görüşmesi Koçluğu',
          'Kariyer Danışmanlığı',
          'LinkedIn Optimizasyonu',
          'İş Planı Hazırlama',
        ],
        priceRange: '₺200 - ₺3,000',
        averageRating: 4.5,
        count: '1,200',
      },
      {
        id: 'hukuki-danismanlik',
        title: 'Hukuki Danışmanlık',
        services: [
          'Genel Hukuk & Müşavirlik',
          'İş Hukuku',
          'Aile Hukuku',
          'Gayrimenkul Hukuku',
          'Ticaret Hukuku',
          'Miras Hukuku',
        ],
        priceRange: '₺300 - ₺10,000',
        averageRating: 4.8,
        count: '1,260',
      },
      {
        id: 'mali-musavirlik',
        title: 'Mali Müşavirlik',
        services: [
          'Muhasebe Hizmetleri',
          'Vergi Danışmanlığı',
          'Bordro & SGK İşlemleri',
          'Mali Müşavirlik',
        ],
        priceRange: '₺400 - ₺5,000',
        averageRating: 4.6,
        count: '800',
      },
      {
        id: 'psikolojik-danismanlik',
        title: 'Psikolojik Danışmanlık',
        services: [
          'Bireysel Terapi',
          'Çift Terapisi',
          'Aile Terapisi',
          'Çocuk Psikolojisi',
        ],
        priceRange: '₺150 - ₺800',
        averageRating: 4.9,
        count: '600',
      },
    ],
  },
  {
    id: 'saglik-kisisel-bakim',
    title: 'Sağlık & Kişisel Bakım',
    icon: Heart,
    color: 'bg-pink-500',
    description: 'Güzellik, sağlık ve kişisel bakım hizmetleri',
    count: '3,240',
    trending: false,
    popularity: 5,
    subcategories: [
      {
        id: 'guzellik-estetik',
        title: 'Güzellik & Estetik',
        services: [
          'Kuaförlük (Kadın/Erkek)',
          'Makyaj & Güzellik',
          'Nail Art & Manicure',
          'Cilt Bakımı & Facial',
          'Epilasyon (Lazer/Ağda)',
          'Masaj Terapisi',
        ],
        priceRange: '₺50 - ₺1,000',
        averageRating: 4.4,
        count: '2,100',
      },
      {
        id: 'fitness-saglik',
        title: 'Fitness & Sağlık',
        services: [
          'Personal Training',
          'Yoga & Pilates',
          'Beslenme Koçluğu',
          'Fizyoterapi',
          'Alternatif Tıp',
        ],
        priceRange: '₺100 - ₺2,000',
        averageRating: 4.6,
        count: '1,140',
      },
      {
        id: 'wellness-spa',
        title: 'Wellness & SPA',
        services: [
          'SPA Hizmetleri',
          'Meditasyon & Mindfulness',
          'Stress Management',
          'Holistic Therapy',
        ],
        priceRange: '₺200 - ₺1,500',
        averageRating: 4.5,
        count: '400',
      },
    ],
  },
  {
    id: 'otomotiv',
    title: 'Otomotiv',
    icon: Car,
    color: 'bg-gray-600',
    description: 'Araç bakım, onarım ve hizmetleri',
    count: '2,180',
    trending: false,
    popularity: 3,
    subcategories: [
      {
        id: 'arac-bakim-onarim',
        title: 'Araç Bakım & Onarım',
        services: [
          'Genel Bakım (Yağ, Filtre)',
          'Motor Bakımı',
          'Elektrik & Elektronik',
          'Klima Bakımı',
          'Detailing & Car Wash',
        ],
        priceRange: '₺50 - ₺3,000',
        averageRating: 4.2,
        count: '1,500',
      },
      {
        id: 'arac-kiralama-satis',
        title: 'Araç Kiralama & Satış',
        services: [
          'Günlük/Aylık Kiralama',
          'Özel Araçlar',
          'İkinci El Araç Değerlendirme',
          'Araç Finansmanı',
        ],
        priceRange: '₺100 - ₺5,000',
        averageRating: 4.0,
        count: '680',
      },
    ],
  },
  {
    id: 'finans-muhasebe',
    title: 'Finans & Muhasebe',
    icon: Calculator,
    color: 'bg-emerald-600',
    description: 'Finansal danışmanlık ve muhasebe hizmetleri',
    count: '1,850',
    trending: false,
    popularity: 2,
    subcategories: [
      {
        id: 'muhasebe-hizmetleri',
        title: 'Muhasebe Hizmetleri',
        services: [
          'Defter Tutma',
          'Vergi İşlemleri',
          'Bordro & SGK',
          'Mali Müşavirlik',
        ],
        priceRange: '₺300 - ₺5,000',
        averageRating: 4.7,
        count: '900',
      },
      {
        id: 'yatirim-danismanligi',
        title: 'Yatırım Danışmanlığı',
        services: [
          'Portföy Yönetimi',
          'Borsa Analizi',
          'Gayrimenkul Yatırımı',
          'Kripto Para Danışmanlığı',
        ],
        priceRange: '₺500 - ₺10,000',
        averageRating: 4.5,
        count: '650',
      },
      {
        id: 'sigorta',
        title: 'Sigorta',
        services: [
          'Hayat Sigortası',
          'Sağlık Sigortası',
          'Kasko Sigortası',
          'Konut Sigortası',
        ],
        priceRange: '₺200 - ₺3,000',
        averageRating: 4.3,
        count: '300',
      },
    ],
  },
  {
    id: 'cevre-enerji',
    title: 'Çevre & Enerji',
    icon: Leaf,
    color: 'bg-green-600',
    description: 'Sürdürülebilirlik ve enerji çözümleri',
    count: '680',
    trending: true,
    popularity: 1,
    subcategories: [
      {
        id: 'gunes-enerjisi',
        title: 'Güneş Enerjisi',
        services: [
          'Solar Panel Installation',
          'Energy Audit',
          'Grid-tie Systems',
        ],
        priceRange: '₺2,000 - ₺50,000',
        averageRating: 4.6,
        count: '420',
      },
      {
        id: 'cevre-danismanligi',
        title: 'Çevre Danışmanlığı',
        services: [
          'Environmental Impact Assessment',
          'Waste Management',
          'Sustainability Consulting',
        ],
        priceRange: '₺1,000 - ₺15,000',
        averageRating: 4.7,
        count: '260',
      },
    ],
  },
  {
    id: 'gida-icecek',
    title: 'Gıda & İçecek',
    icon: UtensilsCrossed,
    color: 'bg-yellow-600',
    description: 'Catering ve yemek hizmetleri',
    count: '920',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'catering-yemek',
        title: 'Catering & Yemek',
        services: [
          'Event Catering',
          'Corporate Catering',
          'Wedding Catering',
          'Home Chef Services',
        ],
        priceRange: '₺300 - ₺8,000',
        averageRating: 4.4,
        count: '650',
      },
      {
        id: 'kahve-pastane',
        title: 'Kahve & Pastane',
        services: ['Coffee Shop Setup', 'Barista Training', 'Pastry Making'],
        priceRange: '₺200 - ₺3,000',
        averageRating: 4.3,
        count: '270',
      },
    ],
  },
  {
    id: 'etkinlik-eglence',
    title: 'Etkinlik & Eğlence',
    icon: PartyPopper,
    color: 'bg-purple-600',
    description: 'Event organizasyon ve eğlence hizmetleri',
    count: '1,450',
    trending: false,
    popularity: 2,
    subcategories: [
      {
        id: 'etkinlik-organizasyonu',
        title: 'Etkinlik Organizasyonu',
        services: [
          'Düğün Organizasyonu',
          'Doğum Günü Partisi',
          'Kurumsal Etkinlik',
          'Konser Organizasyonu',
        ],
        priceRange: '₺1,000 - ₺25,000',
        averageRating: 4.5,
        count: '800',
      },
      {
        id: 'muzik-sahne',
        title: 'Müzik & Sahne',
        services: [
          'DJ Services',
          'Live Music',
          'Sound Equipment Rental',
          'Lighting Services',
        ],
        priceRange: '₺500 - ₺5,000',
        averageRating: 4.3,
        count: '450',
      },
      {
        id: 'fotograf-video-etkinlik',
        title: 'Fotoğraf & Video',
        services: [
          'Wedding Photography',
          'Event Photography',
          'Corporate Videos',
          'Social Media Content',
        ],
        priceRange: '₺300 - ₺3,000',
        averageRating: 4.4,
        count: '200',
      },
    ],
  },
  {
    id: 'spor-rekreasyon',
    title: 'Spor & Rekreasyon',
    icon: Activity,
    color: 'bg-orange-600',
    description: 'Spor antrenörlüğü ve aktivite hizmetleri',
    count: '840',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'spor-antrenorlugu',
        title: 'Spor Antrenörlüğü',
        services: [
          'Football Coaching',
          'Basketball Coaching',
          'Tennis Lessons',
          'Swimming Lessons',
        ],
        priceRange: '₺100 - ₺1,000',
        averageRating: 4.6,
        count: '520',
      },
      {
        id: 'outdoor-aktiviteler',
        title: 'Outdoor Aktiviteler',
        services: ['Hiking Tours', 'Camping Services', 'Adventure Sports'],
        priceRange: '₺200 - ₺2,000',
        averageRating: 4.4,
        count: '320',
      },
    ],
  },
  {
    id: 'cocuk-bebek',
    title: 'Çocuk & Bebek',
    icon: Baby,
    color: 'bg-pink-400',
    description: 'Çocuk bakımı ve eğitim hizmetleri',
    count: '650',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'cocuk-bakimi',
        title: 'Çocuk Bakımı',
        services: [
          'Bebek Bakıcısı',
          'Çocuk Bakıcısı',
          'After School Care',
          'Nanny Services',
        ],
        priceRange: '₺50 - ₺500',
        averageRating: 4.7,
        count: '400',
      },
      {
        id: 'cocuk-egitimi',
        title: 'Çocuk Eğitimi',
        services: [
          'Early Childhood Education',
          'Montessori Teaching',
          'Language Classes for Kids',
        ],
        priceRange: '₺100 - ₺800',
        averageRating: 4.8,
        count: '250',
      },
    ],
  },
  {
    id: 'yasli-bakim',
    title: 'Yaşlı Bakım',
    icon: Heart,
    color: 'bg-blue-400',
    description: 'Yaşlı ve hasta bakım hizmetleri',
    count: '380',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'hasta-yasli-bakimi',
        title: 'Hasta & Yaşlı Bakımı',
        services: [
          'Elder Care',
          'Home Nursing',
          'Companion Care',
          'Medical Assistance',
        ],
        priceRange: '₺100 - ₺1,000',
        averageRating: 4.9,
        count: '380',
      },
    ],
  },
  {
    id: 'hukuk-kamu',
    title: 'Hukuk & Kamu',
    icon: Scale,
    color: 'bg-gray-700',
    description: 'Resmi işlemler ve hukuki hizmetler',
    count: '520',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'resmi-islemler',
        title: 'Resmi İşlemler',
        services: [
          'Document Translation',
          'Notary Services',
          'Government Applications',
          'Visa Applications',
        ],
        priceRange: '₺50 - ₺2,000',
        averageRating: 4.5,
        count: '520',
      },
    ],
  },
  {
    id: 'turizm-seyahat',
    title: 'Turizm & Seyahat',
    icon: Plane,
    color: 'bg-sky-600',
    description: 'Seyahat planlama ve rehberlik hizmetleri',
    count: '730',
    trending: false,
    popularity: 1,
    subcategories: [
      {
        id: 'seyahat-planlama',
        title: 'Seyahat Planlama',
        services: [
          'Travel Planning',
          'Tour Guide Services',
          'Hotel Booking',
          'Transportation Services',
        ],
        priceRange: '₺200 - ₺5,000',
        averageRating: 4.4,
        count: '450',
      },
      {
        id: 'rehberlik',
        title: 'Rehberlik',
        services: ['Local Tour Guide', 'Cultural Tours', 'Historical Tours'],
        priceRange: '₺150 - ₺1,500',
        averageRating: 4.6,
        count: '280',
      },
    ],
  },
];

const filterOptions = [
  { value: 'all', label: 'Tüm Kategoriler' },
  { value: 'trending', label: 'Trend Kategoriler' },
  { value: 'most-popular', label: 'En Popüler' },
  { value: 'newest', label: 'En Yeni' },
];

const sortOptions = [
  { value: 'default', label: 'Varsayılan' },
  { value: 'name', label: 'İsim (A-Z)' },
  { value: 'count', label: 'Proje Sayısı' },
  { value: 'rating', label: 'Değerlendirme' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    let filtered = categoryData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          category.subcategories.some(
            (sub) =>
              sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.services.some((service) =>
                service.toLowerCase().includes(searchTerm.toLowerCase())
              )
          )
      );
    }

    // Category filter
    if (selectedFilter === 'trending') {
      filtered = filtered.filter((category) => category.trending);
    }

    // Sort
    if (selectedSort === 'name') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'count') {
      filtered = [...filtered].sort(
        (a, b) =>
          parseInt(b.count.replace(/,/g, '')) -
          parseInt(a.count.replace(/,/g, ''))
      );
    }

    return filtered;
  }, [searchTerm, selectedFilter, selectedSort]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Hizmet Kategorileri
            </h1>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              Türkiye&apos;nin en kapsamlı freelance platform kategorileri.
              İhtiyacınız olan hizmeti bulun veya uzmanlık alanınızda projeler
              keşfedin.
            </p>

            {/* Search Bar */}
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

      {/* Statistics Section */}
      <div className="border-b bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600">16</div>
              <div className="text-sm text-gray-600">Ana Kategori</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-purple-600">89</div>
              <div className="text-sm text-gray-600">Alt Kategori</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-600">800+</div>
              <div className="text-sm text-gray-600">Hizmet Türü</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-orange-600">
                45,000+
              </div>
              <div className="text-sm text-gray-600">Aktif Freelancer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Categories Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-900">
                🔥 2025 Trend Kategorileri
              </h3>
              <p className="text-gray-600">
                AI & Machine Learning, Blockchain Development, Sustainability
                Consulting
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                Yapay Zeka
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                Blockchain
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Sürdürülebilirlik
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="border-b bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredCategories.length} kategori bulundu
              </span>

              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div
            className={`grid gap-8 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          >
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  viewMode === 'list' ? 'p-0' : 'p-6'
                }`}
              >
                {/* Category Header */}
                <div className={`${viewMode === 'list' ? 'p-6' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.color} text-white`}
                      >
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {category.title}
                          </h2>
                          {category.trending && (
                            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                              <TrendingUp className="h-3 w-3" />
                              Trend
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.id ? null : category.id
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <Users className="h-4 w-4" />
                      {category.count}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedCategory === category.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Subcategories */}
                {expandedCategory === category.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/marketplace/categories/${category.id}/${subcategory.id}`}
                          className="group/sub"
                        >
                          <Card className="p-4 transition-all hover:border-blue-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover/sub:text-blue-600">
                                  {subcategory.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {subcategory.priceRange}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {subcategory.averageRating}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {subcategory.count}
                                  </span>
                                </div>

                                {/* Popular Services */}
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {subcategory.services
                                      .slice(0, 4)
                                      .map((service, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600"
                                        >
                                          {service}
                                        </span>
                                      ))}
                                    {subcategory.services.length > 4 && (
                                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        +{subcategory.services.length - 4} daha
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover/sub:text-blue-600" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Link href={`/marketplace/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Tüm {category.title} Hizmetlerini Gör
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                {expandedCategory !== category.id && (
                  <div
                    className={`flex gap-2 ${viewMode === 'list' ? 'p-6 pt-0' : 'mt-4'}`}
                  >
                    <Link
                      href={`/marketplace/categories/${category.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Hizmetleri Görüntüle
                      </Button>
                    </Link>
                    <Link
                      href={`/marketplace/jobs/create?category=${category.id}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        İş İlanı Ver
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* No results */}
          {filteredCategories.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Aradığınız kategori bulunamadı
              </h3>
              <p className="text-gray-600">
                Lütfen arama teriminizi değiştirip tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Categories CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Aradığınız hizmeti bulamadınız mı?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Özel ihtiyaçlarınız için doğrudan iş ilanı verin, sizin için en
            uygun freelancer&apos;ları bulalım.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/marketplace/jobs/create">
              <Button size="lg" className="w-full sm:w-auto">
                İş İlanı Ver
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Destek Al
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
