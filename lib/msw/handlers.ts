import { http, HttpResponse } from 'msw';
import {
  Job,
  JobDetail,
  ServicePackage,
  PackageDetail,
  User,
  PaginatedResponse,
  ApiResponse,
  Employer,
  Freelancer,
  Message,
  Conversation,
} from '@/types';
import { detailHandlers } from './handlers/details';
import { generateCategoryPlaceholder } from '@/lib/utils/image-fallback';

// Mock employer data
const mockEmployer: Employer = {
  id: 'employer-1',
  email: 'isveren@example.com',
  firstName: 'Fatma',
  lastName: 'Kaya',
  userType: 'employer',
  avatar:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
  location: 'Ankara, Türkiye',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  companyName: 'Teknoloji Çözümleri Ltd.',
  industry: 'Teknoloji',
  totalSpent: 15000,
  activeJobs: 3,
  completedJobs: 12,
  rating: 4.7,
  totalReviews: 15,
  reviewsCount: 15,
  totalJobs: 15,
};

// Mock freelancer data
const mockFreelancer: Freelancer = {
  id: 'freelancer-1',
  email: 'freelancer@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  userType: 'freelancer',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  location: 'İstanbul, Türkiye',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  title: 'Full Stack Geliştirici',
  skills: ['React', 'Node.js', 'TypeScript', 'Next.js'],
  hourlyRate: 50,
  experience: 'expert',
  rating: 4.9,
  totalReviews: 127,
  totalEarnings: 45000,
  completedJobs: 89,
  responseTime: '2 saat',
  availability: 'available',
  portfolio: [],
};

// Mock data - İş İlanları (Türkçe)
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'React.js Geliştirici Aranıyor',
    description:
      'Modern bir e-ticaret platformu geliştirmek için deneyimli React geliştirici arıyoruz. Next.js, TypeScript ve Tailwind CSS deneyimi gereklidir. Responsive tasarım ve performans optimizasyonu konularında uzman olan adaylar tercih edilecektir.',
    category: 'Web Geliştirme',
    subcategory: 'Frontend Geliştirme',
    budget: { type: 'fixed', amount: 3500 },
    timeline: '2-3 ay',
    duration: '2-3 ay',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 12,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    title: 'Mobil Uygulama UI/UX Tasarımı',
    description:
      'Yemek sipariş uygulaması için modern ve kullanıcı dostu UI/UX tasarımı yapılacaktır. Figma ve Adobe XD bilgisi gereklidir. Material Design ve iOS Human Interface Guidelines hakkında bilgi sahibi olunmalıdır.',
    category: 'Tasarım',
    subcategory: 'UI/UX Tasarım',
    budget: { type: 'fixed', amount: 2200 },
    timeline: '4-6 hafta',
    duration: '1-2 ay',
    skills: ['Figma', 'Adobe XD', 'UI/UX Tasarım', 'Mobil Tasarım'],
    experienceLevel: 'expert',
    location: 'İstanbul, Türkiye',
    isRemote: false,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 8,
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
  },
  {
    id: '3',
    title: 'WordPress E-ticaret Sitesi',
    description:
      'WooCommerce kullanarak kapsamlı e-ticaret sitesi geliştirme projesi. Ödeme entegrasyonları, kargo sistemleri ve stok yönetimi dahil.',
    category: 'Web Geliştirme',
    subcategory: 'E-ticaret',
    budget: { type: 'fixed', amount: 5000 },
    timeline: '3-4 ay',
    duration: '3-4 ay',
    skills: ['WordPress', 'WooCommerce', 'PHP', 'MySQL'],
    experienceLevel: 'expert',
    location: 'Ankara, Türkiye',
    isRemote: false,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 15,
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
  },
  {
    id: '4',
    title: 'React Native Mobil Uygulama',
    description:
      'Cross-platform mobil uygulama geliştirme. iOS ve Android için aynı anda yayınlanacak. Firebase entegrasyonu ve push notification sistemi gerekli.',
    category: 'Mobil Uygulama',
    subcategory: 'React Native',
    budget: { type: 'fixed', amount: 8000 },
    timeline: '4-5 ay',
    duration: '4-5 ay',
    skills: ['React Native', 'Firebase', 'JavaScript', 'Mobile Development'],
    experienceLevel: 'expert',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 23,
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
  },
  {
    id: '5',
    title: 'SEO İçerik Yazarı',
    description:
      'Blog yazıları ve web sitesi içerikleri için SEO uyumlu Türkçe içerik yazımı. Günlük 2-3 makale üretimi beklenmektedir.',
    category: 'İçerik Yazımı',
    subcategory: 'SEO İçerik',
    budget: { type: 'hourly', amount: 25 },
    timeline: 'Devam eden',
    duration: 'Devam eden',
    skills: ['SEO', 'İçerik Yazımı', 'Türkçe', 'Blog Yazımı'],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 31,
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
  {
    id: '6',
    title: 'Python Veri Analiz Projesi',
    description:
      'Büyük veri setleri üzerinde analiz yaparak raporlama. Pandas, NumPy ve Matplotlib kullanımı gerekli. Machine learning modeli geliştirme.',
    category: 'Veri Bilimi',
    subcategory: 'Veri Analizi',
    budget: { type: 'fixed', amount: 4500 },
    timeline: '2-3 ay',
    duration: '2-3 ay',
    skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Data Science'],
    experienceLevel: 'expert',
    location: 'İzmir, Türkiye',
    isRemote: false,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 18,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '7',
    title: 'Social Media Manager',
    description:
      'Instagram, Facebook ve LinkedIn hesaplarının yönetimi. İçerik planlaması, gönderi hazırlama ve community management.',
    category: 'Dijital Pazarlama',
    subcategory: 'Sosyal Medya',
    budget: { type: 'hourly', amount: 35 },
    timeline: '6 ay',
    duration: '6 ay',
    skills: [
      'Social Media Marketing',
      'Content Creation',
      'Instagram',
      'Facebook',
    ],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 27,
    createdAt: new Date('2024-01-09').toISOString(),
    updatedAt: new Date('2024-01-09').toISOString(),
  },
  {
    id: '8',
    title: 'Flutter Mobil Oyun Geliştirme',
    description:
      'Casual mobil oyun geliştirme projesi. 2D grafikleri ve animasyonlar dahil. Google Play Store ve App Store yayınlama süreci.',
    category: 'Oyun Geliştirme',
    subcategory: 'Mobil Oyun',
    budget: { type: 'fixed', amount: 12000 },
    timeline: '6-8 ay',
    duration: '6-8 ay',
    skills: ['Flutter', 'Dart', 'Game Development', '2D Animation'],
    experienceLevel: 'expert',
    location: 'Bursa, Türkiye',
    isRemote: false,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 9,
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
  },
];

// Mock data - Hizmet Paketleri (Türkçe)
export const mockPackages: ServicePackage[] = [
  {
    id: '1',
    title: 'Profesyonel Web Sitesi Geliştirme',
    description:
      'React ve Next.js kullanarak modern, responsive web sitesi oluşturacağım. İşletmenizin online varlığını güçlendirmek için mükemmel çözüm.',
    category: 'Web Geliştirme',
    subcategory: 'Frontend Geliştirme',
    price: 1500,
    deliveryTime: 14,
    revisions: 3,
    features: [
      'Responsive Tasarım',
      'SEO Optimizasyonu',
      'Yönetim Paneli',
      'İletişim Formları',
      'Performans Optimizasyonu',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 89,
    rating: 4.9,
    reviews: 127,
    isActive: true,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    images: [
      generateCategoryPlaceholder('Web Geliştirme', 'Web Development 1'),
      generateCategoryPlaceholder('Web Geliştirme', 'Web Development 2'),
    ],
  },
  {
    id: '2',
    title: 'Logo Tasarım & Marka Kimliği',
    description:
      'İşletmeniz için benzersiz logo ve eksiksiz marka kimliği tasarlayacağım. Öne çıkan profesyonel görünüm elde edin.',
    category: 'Tasarım',
    subcategory: 'Logo Tasarım',
    price: 300,
    deliveryTime: 5,
    revisions: 5,
    features: [
      'Logo Tasarımı',
      'Marka Rehberi',
      'Kartvizit Tasarımı',
      'Antetli Kağıt Tasarımı',
      'Sosyal Medya Kiti',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 156,
    rating: 4.8,
    reviews: 203,
    isActive: true,
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
    images: [
      generateCategoryPlaceholder('Tasarım', 'Logo Design 1'),
      generateCategoryPlaceholder('Tasarım', 'Logo Design 2'),
    ],
  },
  {
    id: '3',
    title: 'WordPress Web Sitesi Kurulumu',
    description:
      'Sıfırdan WordPress web sitesi kurulumu ve özelleştirme. Theme seçimi, plugin kurulumu ve içerik yönetimi dahil.',
    category: 'Web Geliştirme',
    subcategory: 'WordPress',
    price: 800,
    deliveryTime: 7,
    revisions: 3,
    features: [
      'WordPress Kurulumu',
      'Premium Theme Kurulumu',
      'Plugin Konfigürasyonu',
      'İçerik Girişi',
      'Temel SEO Ayarları',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 234,
    rating: 4.7,
    reviews: 156,
    isActive: true,
    createdAt: new Date('2024-01-09').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
    images: [generateCategoryPlaceholder('İçerik Yazımı', 'Content Writing')],
  },
  {
    id: '4',
    title: 'Sosyal Medya Grafik Tasarımı',
    description:
      'Instagram, Facebook ve LinkedIn için profesyonel görsel tasarımları. Post, story ve banner tasarımları dahil.',
    category: 'Tasarım',
    subcategory: 'Sosyal Medya Tasarım',
    price: 250,
    deliveryTime: 3,
    revisions: 4,
    features: [
      '10 Instagram Post Tasarımı',
      '5 Instagram Story Tasarımı',
      '3 Facebook Banner',
      'LinkedIn Cover Tasarımı',
      'Kaynak Dosyalar',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 345,
    rating: 4.9,
    reviews: 278,
    isActive: true,
    createdAt: new Date('2024-01-07').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
    images: [
      generateCategoryPlaceholder('Dijital Pazarlama', 'Marketing 1'),
      generateCategoryPlaceholder('Dijital Pazarlama', 'Marketing 2'),
    ],
  },
  {
    id: '5',
    title: 'SEO Optimizasyon Paketi',
    description:
      'Web sitenizin arama motorlarında üst sıralarda yer alması için kapsamlı SEO optimizasyonu ve analiz.',
    category: 'Dijital Pazarlama',
    subcategory: 'SEO',
    price: 600,
    deliveryTime: 10,
    revisions: 2,
    features: [
      'Anahtar Kelime Araştırması',
      'On-Page SEO Optimizasyonu',
      'Teknik SEO Analizi',
      'Google Analytics Kurulumu',
      'Aylık Rapor',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 78,
    rating: 4.6,
    reviews: 92,
    isActive: true,
    createdAt: new Date('2024-01-06').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
    images: [
      generateCategoryPlaceholder('Dijital Pazarlama', 'SEO Optimization'),
    ],
  },
  {
    id: '6',
    title: 'React Native Mobil Uygulama Geliştirme',
    description:
      'Cross-platform mobil uygulama geliştirme hizmeti. iOS ve Android için tek kod ile yayınlama.',
    category: 'Mobil Uygulama',
    subcategory: 'React Native',
    price: 3500,
    deliveryTime: 30,
    revisions: 3,
    features: [
      'Cross-Platform Geliştirme',
      'Firebase Entegrasyonu',
      'Push Notification',
      'App Store Yayınlama',
      '3 Ay Ücretsiz Destek',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 23,
    rating: 4.8,
    reviews: 34,
    isActive: true,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    images: [
      generateCategoryPlaceholder('Mobil Uygulama', 'Mobile App 1'),
      generateCategoryPlaceholder('Mobil Uygulama', 'Mobile App 2'),
    ],
  },
  {
    id: '7',
    title: 'İçerik Yazımı ve Blog Yönetimi',
    description:
      'SEO uyumlu blog yazıları ve web sitesi içerikleri. Türkçe ve İngilizce içerik üretimi.',
    category: 'İçerik Yazımı',
    subcategory: 'Blog Yazımı',
    price: 150,
    deliveryTime: 5,
    revisions: 2,
    features: [
      '5 Blog Yazısı (500+ kelime)',
      'SEO Optimizasyonu',
      'Anahtar Kelime Araştırması',
      'Görsel Önerisi',
      'İçerik Planlaması',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 167,
    rating: 4.7,
    reviews: 134,
    isActive: true,
    createdAt: new Date('2024-01-04').toISOString(),
    updatedAt: new Date('2024-01-09').toISOString(),
    images: [
      generateCategoryPlaceholder('İçerik Yazımı', 'Content Management'),
    ],
  },
  {
    id: '8',
    title: 'E-ticaret Mağaza Kurulumu',
    description:
      'Shopify veya WooCommerce ile profesyonel e-ticaret mağazası kurulumu. Ödeme sistemleri ve kargo entegrasyonları dahil.',
    category: 'E-ticaret',
    subcategory: 'Mağaza Kurulumu',
    price: 1200,
    deliveryTime: 12,
    revisions: 3,
    features: [
      'E-ticaret Platform Kurulumu',
      'Ödeme Sistemi Entegrasyonu',
      'Kargo Entegrasyonu',
      'Ürün Yükleme (50 ürün)',
      'Mobil Uyumlu Tasarım',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 45,
    rating: 4.9,
    reviews: 67,
    isActive: true,
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString(),
    images: [
      generateCategoryPlaceholder('Veri Bilimi', 'Data Analysis 1'),
      generateCategoryPlaceholder('Veri Bilimi', 'Data Analysis 2'),
    ],
  },
];

// Mock data - Kullanıcılar
const mockUsers: User[] = [
  {
    id: 'freelancer-1',
    email: 'freelancer@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    userType: 'freelancer',
    avatar: '/avatars/freelancer-1.jpg',
    location: 'İstanbul, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-1',
    email: 'isveren@example.com',
    firstName: 'Fatma',
    lastName: 'Kaya',
    userType: 'employer',
    avatar: '/avatars/employer-1.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-2',
    email: 'zeynep@example.com',
    firstName: 'Zeynep',
    lastName: 'Demir',
    userType: 'employer',
    avatar: '/avatars/employer-2.jpg',
    location: 'İzmir, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-3',
    email: 'mehmet@example.com',
    firstName: 'Mehmet',
    lastName: 'Özkan',
    userType: 'employer',
    avatar: '/avatars/employer-3.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Mock Messages & Conversations Data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], mockUsers[1]], // freelancer-1, employer-1
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    unreadCount: 2,
    jobId: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv-2',
    participants: [mockUsers[0], mockUsers[2]], // freelancer-1, employer-2
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    unreadCount: 0,
    packageId: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'conv-3',
    participants: [mockUsers[0], mockUsers[3]], // freelancer-1, employer-3
    lastMessage: {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Merhaba Ahmet! React projesi için teklifinizi inceledim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Merhaba Fatma Hanım! Teklifimi incelediğiniz için teşekkürler.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content:
        'Projeyi 2 hafta içinde teslim edebilirim. Responsive tasarım ve performans optimizasyonu dahil.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Süre uygun. SEO optimizasyonu da ekleyebilir misiniz?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'employer-2',
      sender: mockUsers[2],
      content: 'Logo tasarımlarını gördüm, çok beğendim!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Teşekkürler! Küçük bir revizyon istediğinizi belirtmiştiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  'conv-3': [
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Mobil uygulamanın son halini test ettim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 'msg-10',
      conversationId: 'conv-3',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Nasıl buldunuz? Herhangi bir sorun var mı?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: 'msg-11',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Her şey mükemmel çalışıyor. Performans da harika.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ],
};

// Helper function to create paginated response
function createPaginatedResponse<
  T extends {
    category?: string;
    title?: string;
    description?: string;
    location?: string;
    skills?: string[];
    budget?: { type: string; amount: number } | number;
    price?: number;
    experienceLevel?: string;
    isRemote?: boolean;
    createdAt?: string;
    rating?: number;
  },
>(
  items: T[],
  page: number,
  limit: number,
  filters?: Record<string, string | number | boolean>,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): PaginatedResponse<T> {
  let filteredItems = [...items];

  // Apply filters
  if (filters) {
    // Category filter
    if (filters.category) {
      filteredItems = filteredItems.filter((item: T) =>
        item.category
          ?.toLowerCase()
          .includes(String(filters.category).toLowerCase())
      );
    }

    // Search filter
    if (filters.search) {
      filteredItems = filteredItems.filter(
        (item: T) =>
          item.title
            ?.toLowerCase()
            .includes(String(filters.search).toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(String(filters.search).toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filteredItems = filteredItems.filter((item: T) =>
        item.location
          ?.toLowerCase()
          .includes(String(filters.location).toLowerCase())
      );
    }

    // Skills filter (supports multiple skills)
    if (filters.skills) {
      const skillsStr = String(filters.skills);
      const skillsArray = skillsStr.includes(',')
        ? skillsStr.split(',').map((s: string) => s.trim())
        : [skillsStr];

      filteredItems = filteredItems.filter((item: T) =>
        skillsArray.some((skill: string) =>
          item.skills?.some((itemSkill: string) =>
            itemSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Budget filter for jobs
    if (filters.minBudget || filters.maxBudget) {
      filteredItems = filteredItems.filter((item: T) => {
        const budget = item.budget;
        if (!budget) return true;

        const amount = typeof budget === 'object' ? budget.amount : budget;
        if (filters.minBudget && amount < Number(filters.minBudget))
          return false;
        if (filters.maxBudget && amount > Number(filters.maxBudget))
          return false;
        return true;
      });
    }

    // Price filter for packages
    if (filters.minPrice || filters.maxPrice) {
      filteredItems = filteredItems.filter((item: T) => {
        const price = item.price;
        if (!price) return true;

        if (filters.minPrice && price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
        return true;
      });
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filteredItems = filteredItems.filter(
        (item: T) => item.experienceLevel === String(filters.experienceLevel)
      );
    }

    // Job type filter
    if (filters.jobType) {
      filteredItems = filteredItems.filter((item: T) => {
        if (filters.jobType === 'remote') return item.isRemote;
        if (filters.jobType === 'onsite') return !item.isRemote;
        return true;
      });
    }

    // Date filter
    if (filters.datePosted) {
      const now = new Date();
      filteredItems = filteredItems.filter((item: T) => {
        const createdAt = new Date(item.createdAt || Date.now());
        const daysDiff = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.datePosted) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (filters.minRating) {
      filteredItems = filteredItems.filter(
        (item: T) => (item.rating || 0) >= Number(filters.minRating)
      );
    }
  }

  // Apply sorting
  if (sortBy && sortOrder) {
    filteredItems.sort((a: T, b: T) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'budget':
          aValue =
            typeof a.budget === 'object' ? a.budget.amount : a.budget || 0;
          bValue =
            typeof b.budget === 'object' ? b.budget.amount : b.budget || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        default:
          // Fallback for other properties
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / limit),
    },
  };
}

// Helper function to convert Job to JobDetail
function createJobDetail(job: Job): JobDetail {
  return {
    ...job,
    // Extended fields for detail pages
    requirements: [
      'Proje gereksinimlerini detaylı olarak anlayabilme',
      'Belirlenen süre içerisinde teslimat yapabilme',
      'Düzenli iletişim kurabilme',
      'Kaliteli ve temiz kod yazabilme',
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'proje-detaylari.pdf',
        url: '/attachments/proje-detaylari.pdf',
        type: 'application/pdf',
      },
      {
        id: 'att-2',
        name: 'tasarim-ornekleri.zip',
        url: '/attachments/tasarim-ornekleri.zip',
        type: 'application/zip',
      },
    ],
    tags: [
      ...job.skills.slice(0, 3), // İlk 3 skill'i tag olarak kullan
      job.experienceLevel === 'expert'
        ? 'uzman'
        : job.experienceLevel === 'intermediate'
          ? 'orta'
          : 'başlangıç',
      job.isRemote ? 'uzaktan' : 'yerinde',
      job.category.toLowerCase().replace(' ', '-'),
    ],
    urgency:
      job.timeline.includes('acil') || job.timeline.includes('hızlı')
        ? 'high'
        : job.timeline.includes('ay')
          ? 'low'
          : 'medium',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
  };
}

// Helper function to convert ServicePackage to PackageDetail
function createPackageDetail(servicePackage: ServicePackage): PackageDetail {
  return {
    ...servicePackage,
    overview: `${servicePackage.description}\n\nBu hizmet paketi, profesyonel ihtiyaçlarınızı karşılamak için özenle tasarlanmıştır. Deneyimli ekibimizle kaliteli sonuçlar elde edeceksiniz.`,
    whatIncluded: servicePackage.features,
    faq: [
      {
        question: 'Revizyon hakkım nedir?',
        answer: `${servicePackage.revisions} revizyon hakkınız bulunmaktadır. İlave revizyon talepleri için ek ücret alınabilir.`,
      },
      {
        question: 'Teslimat süresi kesin midir?',
        answer: `${servicePackage.deliveryTime} gün içerisinde teslimat yapılacaktır. Proje karmaşıklığına göre süre değişiklik gösterebilir.`,
      },
      {
        question: 'Hangi dosya formatlarında teslim edilir?',
        answer:
          'Projenin gereksinimine göre PDF, DOCX, PNG, JPEG, PSD gibi formatları sağlanabilir.',
      },
    ],
    pricing: {
      basic: {
        price: servicePackage.price,
        title: 'Temel Paket',
        description: 'Başlangıç seviyesi çözüm',
        features: servicePackage.features.slice(0, 3),
        deliveryTime: servicePackage.deliveryTime,
        revisions: servicePackage.revisions,
      },
      standard: {
        price: Math.round(servicePackage.price * 1.5),
        title: 'Standart Paket',
        description: 'Kapsamlı çözüm',
        features: servicePackage.features.slice(0, 4),
        deliveryTime: Math.round(servicePackage.deliveryTime * 0.8),
        revisions: servicePackage.revisions + 2,
      },
      premium: {
        price: Math.round(servicePackage.price * 2.2),
        title: 'Premium Paket',
        description: 'Tam kapsamlı premium çözüm',
        features: servicePackage.features,
        deliveryTime: Math.round(servicePackage.deliveryTime * 0.6),
        revisions: servicePackage.revisions + 5,
      },
    },
    addOns: [
      {
        id: 'addon-1',
        title: 'Hızlı Teslimat',
        price: Math.round(servicePackage.price * 0.3),
        deliveryTime: -2,
      },
      {
        id: 'addon-2',
        title: 'Ek Revizyon',
        price: Math.round(servicePackage.price * 0.1),
        deliveryTime: 0,
      },
      {
        id: 'addon-3',
        title: 'Kaynak Dosyalar',
        price: Math.round(servicePackage.price * 0.2),
        deliveryTime: 1,
      },
    ],
    totalOrders: servicePackage.orders,
    detailedReviews: [],
    relatedPackages: [],
  };
}

// Helper function to create API response
function createApiResponse<T>(data: T, message = 'Başarılı'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// API Handlers
export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password, rememberMe } = (await request.json()) as {
      email: string;
      password: string;
      rememberMe?: boolean;
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find((u) => u.email === email);

    if (!user || password !== 'password123') {
      return HttpResponse.json(
        { success: false, error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }

    const token = `mock-token-${user.id}`;
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    ).toISOString();

    return HttpResponse.json(
      createApiResponse({
        user,
        token,
        expiresAt,
      })
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { email, firstName, lastName, userType } = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: 'freelancer' | 'employer';
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return HttpResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      userType,
      avatar: `/avatars/default-${userType}.jpg`,
      location: 'Türkiye',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock users array
    mockUsers.push(newUser);

    const token = `mock-token-${newUser.id}`;

    return HttpResponse.json(
      createApiResponse({
        user: newUser,
        token,
      })
    );
  }),

  http.get('/api/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    return HttpResponse.json(createApiResponse(user));
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    return HttpResponse.json(createApiResponse({ user }));
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(
      createApiResponse(null as null, 'Başarıyla çıkış yapıldı')
    );
  }),

  // Jobs handlers
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const location = url.searchParams.get('location') || '';
    const skills = url.searchParams.get('skills') || '';
    const minBudget = url.searchParams.get('minBudget') || '';
    const maxBudget = url.searchParams.get('maxBudget') || '';
    const experienceLevel = url.searchParams.get('experienceLevel') || '';
    const jobType = url.searchParams.get('jobType') || '';
    const datePosted = url.searchParams.get('datePosted') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const filters = {
      category,
      search,
      location,
      skills,
      ...(minBudget && { minBudget: parseInt(minBudget) }),
      ...(maxBudget && { maxBudget: parseInt(maxBudget) }),
      experienceLevel,
      jobType,
      datePosted,
    };

    const result = createPaginatedResponse(
      mockJobs,
      page,
      limit,
      filters,
      sortBy,
      sortOrder
    );

    return HttpResponse.json(createApiResponse(result));
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = mockJobs.find((j) => j.id === params.id);

    if (!job) {
      return HttpResponse.json(
        { success: false, message: 'İş ilanı bulunamadı' },
        { status: 404 }
      );
    }

    // Convert Job to JobDetail for detailed view
    const jobDetail = createJobDetail(job);

    return HttpResponse.json(createApiResponse(jobDetail));
  }),

  http.post('/api/jobs', async ({ request }) => {
    const jobData = (await request.json()) as Partial<Job>;

    const newJob: Job = {
      id: Date.now().toString(),
      title: jobData.title || '',
      description: jobData.description || '',
      category: jobData.category || '',
      subcategory: jobData.subcategory || '',
      budget: jobData.budget || { type: 'fixed', amount: 0 },
      timeline: jobData.timeline || '',
      skills: jobData.skills || [],
      experienceLevel: jobData.experienceLevel || 'beginner',
      location: jobData.location || '',
      isRemote: jobData.isRemote || false,
      status: 'open',
      employerId: 'employer-1',
      employer: mockEmployer,
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockJobs.unshift(newJob);
    return HttpResponse.json(createApiResponse(newJob));
  }),

  // Packages handlers
  http.get('/api/packages', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const minPrice = url.searchParams.get('minPrice') || '';
    const maxPrice = url.searchParams.get('maxPrice') || '';
    const minRating = url.searchParams.get('minRating') || '';
    const datePosted = url.searchParams.get('datePosted') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const filters = {
      category,
      search,
      ...(minPrice && { minPrice: parseInt(minPrice) }),
      ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
      ...(minRating && { minRating: parseFloat(minRating) }),
      datePosted,
    };

    const result = createPaginatedResponse(
      mockPackages,
      page,
      limit,
      filters,
      sortBy,
      sortOrder
    );

    return HttpResponse.json(createApiResponse(result));
  }),

  http.get('/api/packages/:id', ({ params }) => {
    const package_ = mockPackages.find((p) => p.id === params.id);

    if (!package_) {
      return HttpResponse.json(
        { success: false, message: 'Hizmet paketi bulunamadı' },
        { status: 404 }
      );
    }

    // Convert ServicePackage to PackageDetail for detailed view
    const packageDetail = createPackageDetail(package_);

    return HttpResponse.json(createApiResponse(packageDetail));
  }),

  http.get('/api/packages/my', () => {
    const userPackages = mockPackages.filter(
      (p) => p.freelancerId === 'freelancer-1'
    );
    return HttpResponse.json(createApiResponse(userPackages));
  }),

  http.post('/api/packages', async ({ request }) => {
    const packageData = (await request.json()) as Partial<ServicePackage>;

    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      title: packageData.title || '',
      description: packageData.description || '',
      category: packageData.category || '',
      subcategory: packageData.subcategory || '',
      price: packageData.price || 0,
      deliveryTime: packageData.deliveryTime || 1,
      revisions: packageData.revisions || 1,
      features: packageData.features || [],
      images: packageData.images || [],
      freelancerId: 'freelancer-1',
      freelancer: mockFreelancer,
      orders: 0,
      rating: 0,
      reviews: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPackages.unshift(newPackage);
    return HttpResponse.json(createApiResponse(newPackage));
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/freelancer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockFreelancerDashboard = {
      stats: {
        totalEarnings: 125000,
        currentMonthEarnings: 8500,
        activeOrders: 3,
        completedJobs: 89,
        responseRate: 96,
        rating: 4.9,
        profileViews: 247,
      },
      recentOrders: [
        {
          id: 'order-1',
          title: 'E-ticaret Web Sitesi',
          amount: 3500,
          status: 'in_progress',
          deadline: '2024-02-15',
          client: 'TechCorp Solutions',
        },
        {
          id: 'order-2',
          title: 'Logo Tasarımı',
          amount: 750,
          status: 'revision',
          deadline: '2024-02-10',
          client: 'StartupXYZ',
        },
      ],
      recentProposals: [
        {
          id: 'prop-1',
          jobTitle: 'React Developer',
          proposedAmount: 4200,
          status: 'pending',
          submittedAt: '2024-01-20',
        },
        {
          id: 'prop-2',
          jobTitle: 'Mobile App UI',
          proposedAmount: 2800,
          status: 'accepted',
          submittedAt: '2024-01-18',
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'order_update',
          title: 'Sipariş Güncellendi',
          message: 'E-ticaret projesi için yeni gereksinimler eklendi',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ],
      quickStats: {
        pendingProposals: 5,
        messagesWaiting: 2,
        reviewsPending: 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: mockFreelancerDashboard,
    });
  }),

  http.get('/api/dashboard/employer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockEmployerDashboard = {
      stats: {
        totalSpent: 45000,
        currentMonthSpending: 5200,
        activeJobs: 3,
        completedJobs: 15,
        avgProjectCost: 3000,
        savedFreelancers: 8,
      },
      activeJobs: [
        {
          id: 'job-1',
          title: 'React Developer Needed',
          proposalsCount: 12,
          budget: 3500,
          deadline: '2024-02-20',
          status: 'open',
        },
        {
          id: 'job-2',
          title: 'UI/UX Designer',
          proposalsCount: 8,
          budget: 2200,
          deadline: '2024-02-25',
          status: 'open',
        },
      ],
      recentHires: [
        {
          freelancerId: 'freelancer-1',
          jobTitle: 'Web Development',
          amount: 4500,
          startDate: '2024-01-15',
        },
        {
          freelancerId: 'freelancer-2',
          jobTitle: 'Logo Design',
          amount: 800,
          startDate: '2024-01-10',
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'proposal_received',
          title: 'Yeni Teklif',
          message: 'React Developer pozisyonu için yeni teklif aldınız',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
      ],
      quickStats: {
        proposalsReceived: 23,
        messagesWaiting: 4,
        jobsExpiringSoon: 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: mockEmployerDashboard,
    });
  }),

  // Enhanced profile endpoints
  http.post('/api/users/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // Future: Could use cropData for image processing
    // const cropData = formData.get('cropData') as string;

    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          success: false,
          error:
            'Geçersiz dosya formatı. Sadece JPEG, PNG ve WebP desteklenir.',
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        { success: false, error: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, error: 'Avatar yüklenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const avatarUrl = `/uploads/avatars/${userId}/${timestamp}-avatar.jpg`;

    return HttpResponse.json({
      success: true,
      data: {
        url: avatarUrl,
        thumbnailUrl: `/uploads/avatars/${userId}/${timestamp}-thumb.jpg`,
        originalUrl: `/uploads/avatars/${userId}/${timestamp}-original.jpg`,
      },
      message: 'Avatar başarıyla yüklendi',
    });
  }),
  http.get('/api/users/:id', async ({ params }) => {
    const { id } = params;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(user));
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as Partial<User>;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(createApiResponse(mockUsers[userIndex]));
  }),

  // MESSAGING SYSTEM ENDPOINTS

  // Get all conversations for current user
  http.get('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter conversations where user is a participant
    const userConversations = mockConversations
      .filter((conv) => conv.participants.some((p: User) => p.id === userId))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    return HttpResponse.json(createApiResponse(userConversations));
  }),

  // Get specific conversation
  http.get('/api/conversations/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(conversation));
  }),

  // Get messages for a conversation
  http.get('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const messages = mockMessages[conversationId] || [];

    // Sort messages by creation date
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return HttpResponse.json(createApiResponse(sortedMessages));
  }),

  // Send a new message
  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    const { content } = (await request.json()) as {
      content: string;
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const sender = mockUsers.find((u) => u.id === userId);
    if (!sender) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: userId,
      sender,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Add message to mock data
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    // Update conversation's last message and timestamp
    const convIndex = mockConversations.findIndex(
      (c) => c.id === conversationId
    );
    if (convIndex !== -1) {
      mockConversations[convIndex].lastMessage = newMessage;
      mockConversations[convIndex].updatedAt = new Date().toISOString();

      // Update unread count for other participants
      const otherParticipant = conversation.participants.find(
        (p: User) => p.id !== userId
      );
      if (otherParticipant) {
        mockConversations[convIndex].unreadCount += 1;
      }
    }

    return HttpResponse.json(createApiResponse(newMessage));
  }),

  // Create new conversation
  http.post('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const { participantId, jobId, packageId, initialMessage } =
      (await request.json()) as {
        participantId: string;
        jobId?: string;
        packageId?: string;
        initialMessage?: string;
      };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentUser = mockUsers.find((u) => u.id === userId);
    const participant = mockUsers.find((u) => u.id === participantId);

    if (!currentUser || !participant) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = mockConversations.find(
      (conv) =>
        conv.participants.length === 2 &&
        conv.participants.some((p: User) => p.id === userId) &&
        conv.participants.some((p: User) => p.id === participantId) &&
        (!jobId || conv.jobId === jobId) &&
        (!packageId || conv.packageId === packageId)
    );

    if (existingConversation) {
      return HttpResponse.json(createApiResponse(existingConversation));
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [currentUser, participant],
      unreadCount: 0,
      jobId,
      packageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If initial message provided, create it
    if (initialMessage?.trim()) {
      const firstMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: userId,
        sender: currentUser,
        content: initialMessage.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      mockMessages[newConversation.id] = [firstMessage];
      newConversation.lastMessage = firstMessage;
      newConversation.unreadCount = 1;
    }

    mockConversations.unshift(newConversation);

    return HttpResponse.json(createApiResponse(newConversation));
  }),

  // Mark messages as read
  http.patch(
    '/api/conversations/:id/mark-read',
    async ({ params, request }) => {
      const authHeader = request.headers.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const userId = token.replace('mock-token-', '');
      const conversationId = params.id as string;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if user has access to this conversation
      const convIndex = mockConversations.findIndex(
        (conv) =>
          conv.id === conversationId &&
          conv.participants.some((p: User) => p.id === userId)
      );

      if (convIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 403 }
        );
      }

      // Mark all messages as read for this user
      const messages = mockMessages[conversationId] || [];
      messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.isRead = true;
        }
      });

      // Reset unread count for this user
      mockConversations[convIndex].unreadCount = 0;

      return HttpResponse.json(createApiResponse({ success: true }));
    }
  ),

  // Bypass static assets and images
  http.get('*', ({ request }) => {
    const url = new URL(request.url);

    // Bypass static assets
    if (
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/static/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/uploads/') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.map') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.eot')
    ) {
      return;
    }

    // Only handle API routes
    if (!url.pathname.startsWith('/api/')) {
      return;
    }

    // For unmatched API routes, return 404
    return HttpResponse.json(
      { success: false, message: 'API endpoint bulunamadı' },
      { status: 404 }
    );
  }),

  // Avatar upload endpoints
  http.post('/api/upload/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return HttpResponse.json(
        { success: false, message: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          success: false,
          message:
            'Geçersiz dosya formatı. Sadece JPEG, PNG ve WebP desteklenir.',
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        { success: false, message: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      return HttpResponse.json(
        { success: false, message: 'Yükleme sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    // Generate mock avatar URL
    const timestamp = Date.now();
    const avatarUrl = `/uploads/avatars/${userId}/${timestamp}-${file.name}`;

    return HttpResponse.json({
      success: true,
      url: avatarUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  }),

  http.delete('/api/upload/avatar/:userId', async () => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json({
      success: true,
      message: 'Avatar başarıyla silindi',
    });
  }),

  // User update endpoint
  http.patch('/api/users/:userId', async ({ params, request }) => {
    const { userId } = params;
    const updateData = (await request.json()) as Record<string, unknown>;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, message: 'Güncelleme sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    // Return updated user data
    const updatedUser = {
      id: userId,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil başarıyla güncellendi',
    });
  }),

  // Push notification handlers
  http.post('/api/push/subscribe', async ({ request }) => {
    const subscription = (await request.json()) as unknown;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate random failures (1% chance)
    if (Math.random() < 0.01) {
      return HttpResponse.json(
        { success: false, message: 'Abonelik sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    console.log('Push subscription:', subscription);

    return HttpResponse.json({
      success: true,
      message: 'Push bildirim aboneliği başarılı',
      subscriptionId: `sub-${Date.now()}`,
    });
  }),

  http.delete('/api/push/unsubscribe', async ({ request }) => {
    const body = (await request.json()) as { subscriptionId?: string };
    const { subscriptionId } = body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Push bildirim aboneliğinden çıkıldı',
      subscriptionId,
    });
  }),

  http.post('/api/push/send', async ({ request }) => {
    const notificationData = (await request.json()) as unknown;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, message: 'Bildirim gönderimi başarısız' },
        { status: 500 }
      );
    }

    console.log('Sending notification:', notificationData);

    return HttpResponse.json({
      success: true,
      message: 'Bildirim başarıyla gönderildi',
      notificationId: `notif-${Date.now()}`,
      sentAt: new Date().toISOString(),
    });
  }),

  http.get('/api/notifications', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');

    // Mock notifications data
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'job_application',
        title: 'Yeni İş Başvurusu',
        message: 'Web sitesi geliştirme projenize yeni bir başvuru var',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        actionUrl: '/jobs/1',
        metadata: { jobId: '1', applicantId: 'freelancer-1' },
      },
      {
        id: 'notif-2',
        type: 'payment_received',
        title: 'Ödeme Alındı',
        message: '2,500 TL tutarında ödeme hesabınıza yatırıldı',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: '/dashboard/payments',
        metadata: { amount: 2500, paymentId: 'pay-123' },
      },
      {
        id: 'notif-3',
        type: 'order_update',
        title: 'Sipariş Güncellendi',
        message: 'Logo tasarım siparişiniz revizyon aşamasında',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        actionUrl: '/orders/ord-456',
        metadata: { orderId: 'ord-456', status: 'revision' },
      },
      {
        id: 'notif-4',
        type: 'system_announcement',
        title: 'Sistem Duyurusu',
        message: 'Platformda yeni özellikler eklendi. Hemen keşfedin!',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionUrl: '/announcements',
        metadata: { announcementId: 'ann-789' },
      },
      {
        id: 'notif-5',
        type: 'message_received',
        title: 'Yeni Mesaj',
        message: 'Proje detayları hakkında size mesaj gönderildi',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        actionUrl: '/messages/conv-123',
        metadata: { conversationId: 'conv-123', senderId: 'user-456' },
      },
    ];

    // Filter by type if provided
    const filteredNotifications = type
      ? mockNotifications.filter((n) => n.type === type)
      : mockNotifications;

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: filteredNotifications.length,
          totalPages: Math.ceil(filteredNotifications.length / limit),
          hasNext: endIndex < filteredNotifications.length,
          hasPrevious: page > 1,
        },
      },
    });
  }),

  http.patch('/api/notifications/:notificationId/read', async ({ params }) => {
    const { notificationId } = params;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      notificationId,
    });
  }),

  http.post(
    '/api/notifications/:notificationId/clicked',
    async ({ params, request }) => {
      const { notificationId } = params;
      const body = (await request.json()) as {
        action?: string;
        timestamp?: number;
      };
      const { action, timestamp } = body;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return HttpResponse.json({
        success: true,
        message: 'Bildirim tıklanması kaydedildi',
        notificationId,
        action,
        timestamp,
      });
    }
  ),

  http.post(
    '/api/notifications/:notificationId/dismissed',
    async ({ params, request }) => {
      const { notificationId } = params;
      const body = (await request.json()) as { timestamp?: number };
      const { timestamp } = body;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return HttpResponse.json({
        success: true,
        message: 'Bildirim kapatılması kaydedildi',
        notificationId,
        timestamp,
      });
    }
  ),

  http.get('/api/notifications/sync', async () => {
    // Mock offline notifications that need to be synced
    const offlineNotifications = [
      {
        id: 'offline-notif-1',
        title: 'Çevrimdışı Bildirim',
        message: 'İnternet bağlantınız kesildiğinde gelen bildirim',
        icon: '/icons/notification-icon.png',
        url: '/dashboard',
        tag: 'offline-sync',
      },
    ];

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return HttpResponse.json({
      success: true,
      notifications: offlineNotifications,
    });
  }),

  http.get('/api/notifications/settings', async () => {
    // Mock notification settings
    const mockSettings = {
      browser: {
        enabled: true,
        jobApplications: true,
        messages: true,
        payments: true,
        orderUpdates: true,
        systemAnnouncements: false,
      },
      email: {
        enabled: true,
        jobApplications: true,
        messages: false,
        payments: true,
        orderUpdates: true,
        systemAnnouncements: true,
      },
      sms: {
        enabled: false,
        jobApplications: false,
        messages: false,
        payments: true,
        orderUpdates: false,
        systemAnnouncements: false,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      settings: mockSettings,
    });
  }),

  http.patch('/api/notifications/settings', async ({ request }) => {
    const updatedSettings = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate random failures (1% chance)
    if (Math.random() < 0.01) {
      return HttpResponse.json(
        { success: false, message: 'Ayarlar güncellenemedi' },
        { status: 500 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Bildirim ayarları güncellendi',
      settings: updatedSettings,
    });
  }),

  // Location and Map API handlers
  http.get('/api/location/search', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10');
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Mock location-based search results
    const mockResults = [
      {
        id: '1',
        type: 'job',
        title: 'Web Geliştirici',
        description:
          'Modern web uygulamaları geliştirmek için deneyimli React geliştiricisi arıyoruz.',
        budget: { min: 5000, max: 8000, currency: 'TRY' },
        deadline: '2024-12-30',
        skills: ['React', 'TypeScript', 'Node.js'],
        location: {
          id: 'loc-1',
          name: 'Çankaya',
          address: 'Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.9208, longitude: 32.8541 },
          type: 'district' as const,
        },
        coordinates: { latitude: 39.9208, longitude: 32.8541 },
        distance: 2.5,
        employer: {
          id: 'emp-1',
          name: 'TechCorp',
          rating: 4.8,
          avatar: '/avatars/company-1.jpg',
        },
      },
      {
        id: '2',
        type: 'service',
        title: 'Logo Tasarımı',
        description:
          'Profesyonel logo tasarım hizmeti. Markanıza özel yaratıcı çözümler.',
        price: { amount: 500, currency: 'TRY' },
        rating: 4.9,
        reviewCount: 45,
        category: 'Grafik Tasarım',
        location: {
          id: 'loc-2',
          name: 'Kızılay',
          address: 'Kızılay, Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.9199, longitude: 32.8543 },
          type: 'neighborhood' as const,
        },
        coordinates: { latitude: 39.9199, longitude: 32.8543 },
        distance: 1.8,
        freelancer: {
          id: 'free-1',
          name: 'Ahmet Yılmaz',
          rating: 4.9,
          avatar: '/avatars/freelancer-1.jpg',
        },
      },
      {
        id: '3',
        type: 'freelancer',
        name: 'Zeynep Demir',
        title: 'UI/UX Tasarımcı',
        description: 'Kullanıcı deneyimi odaklı modern tasarımlar yapıyorum.',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        hourlyRate: { amount: 150, currency: 'TRY' },
        rating: 4.7,
        reviewCount: 32,
        location: {
          id: 'loc-3',
          name: 'Bahçelievler',
          address: 'Bahçelievler, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.94, longitude: 32.82 },
          type: 'district' as const,
        },
        coordinates: { latitude: 39.94, longitude: 32.82 },
        distance: 3.2,
        avatar: '/avatars/freelancer-2.jpg',
        completedJobs: 28,
        responseTime: '2 saat',
      },
      {
        id: '4',
        type: 'job',
        title: 'Mobil Uygulama Geliştirme',
        description:
          'iOS ve Android platformları için cross-platform mobil uygulama geliştirme.',
        budget: { min: 15000, max: 25000, currency: 'TRY' },
        deadline: '2025-02-15',
        skills: ['React Native', 'Flutter', 'Firebase'],
        location: {
          id: 'loc-4',
          name: 'Bilkent',
          address: 'Bilkent, Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.8681, longitude: 32.7489 },
          type: 'neighborhood' as const,
        },
        coordinates: { latitude: 39.8681, longitude: 32.7489 },
        distance: 8.5,
        employer: {
          id: 'emp-2',
          name: 'Innovation Labs',
          rating: 4.6,
          avatar: '/avatars/company-2.jpg',
        },
      },
    ];

    // Filter by type if specified
    let filteredResults = mockResults;
    if (type) {
      filteredResults = filteredResults.filter(
        (result) => result.type === type
      );
    }

    // Filter by category if specified
    if (category) {
      filteredResults = filteredResults.filter(
        (result) =>
          result.type === 'service' &&
          (result as { category?: string }).category === category
      );
    }

    // Filter by query if specified
    if (query) {
      const queryLower = query.toLowerCase();
      filteredResults = filteredResults.filter(
        (result) =>
          result.title.toLowerCase().includes(queryLower) ||
          result.description.toLowerCase().includes(queryLower)
      );
    }

    // Sort by distance if coordinates provided
    if (lat && lng) {
      filteredResults = filteredResults.sort((a, b) => {
        const distanceA = Math.sqrt(
          Math.pow(a.coordinates.latitude - lat, 2) +
            Math.pow(a.coordinates.longitude - lng, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(b.coordinates.latitude - lat, 2) +
            Math.pow(b.coordinates.longitude - lng, 2)
        );
        return distanceA - distanceB;
      });

      // Update distance calculations
      filteredResults = filteredResults.map((result) => ({
        ...result,
        distance:
          Math.sqrt(
            Math.pow(result.coordinates.latitude - lat, 2) +
              Math.pow(result.coordinates.longitude - lng, 2)
          ) * 111, // Rough km conversion
      }));

      // Filter by radius if specified
      if (radius) {
        filteredResults = filteredResults.filter(
          (result) => result.distance <= radius
        );
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      results: paginatedResults,
      total: filteredResults.length,
      page,
      limit,
      hasMore: endIndex < filteredResults.length,
      bounds: {
        north:
          Math.max(...paginatedResults.map((r) => r.coordinates.latitude)) +
          0.01,
        south:
          Math.min(...paginatedResults.map((r) => r.coordinates.latitude)) -
          0.01,
        east:
          Math.max(...paginatedResults.map((r) => r.coordinates.longitude)) +
          0.01,
        west:
          Math.min(...paginatedResults.map((r) => r.coordinates.longitude)) -
          0.01,
      },
    });
  }),

  http.get('/api/location/geocode', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('address');

    if (!address) {
      return HttpResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    // Mock geocoding responses
    const mockGeocode: Record<
      string,
      {
        success: boolean;
        results: Array<{
          coordinates: { latitude: number; longitude: number };
          formattedAddress: string;
          components: { city: string; state?: string; country: string };
        }>;
      }
    > = {
      ankara: {
        success: true,
        results: [
          {
            coordinates: { latitude: 39.9334, longitude: 32.8597 },
            formattedAddress: 'Ankara, Türkiye',
            components: {
              city: 'Ankara',
              state: 'Ankara',
              country: 'Türkiye',
            },
          },
        ],
      },
      istanbul: {
        success: true,
        results: [
          {
            coordinates: { latitude: 41.0082, longitude: 28.9784 },
            formattedAddress: 'İstanbul, Türkiye',
            components: {
              city: 'İstanbul',
              state: 'İstanbul',
              country: 'Türkiye',
            },
          },
        ],
      },
      izmir: {
        success: true,
        results: [
          {
            coordinates: { latitude: 38.4192, longitude: 27.1287 },
            formattedAddress: 'İzmir, Türkiye',
            components: {
              city: 'İzmir',
              state: 'İzmir',
              country: 'Türkiye',
            },
          },
        ],
      },
    };

    const searchKey = address.toLowerCase().trim();
    const result = mockGeocode[searchKey];

    if (result) {
      return HttpResponse.json(result);
    }

    return HttpResponse.json({
      success: true,
      results: [],
    });
  }),

  http.get('/api/location/reverse-geocode', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    if (!lat || !lng) {
      return HttpResponse.json(
        { success: false, error: 'Latitude and longitude parameters required' },
        { status: 400 }
      );
    }

    // Mock reverse geocoding
    const cities = [
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    ];

    let closestCity = cities[0];
    let minDistance = Math.sqrt(
      Math.pow(lat - closestCity.lat, 2) + Math.pow(lng - closestCity.lng, 2)
    );

    cities.forEach((city) => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    return HttpResponse.json({
      success: true,
      result: {
        formattedAddress: `${closestCity.name}, Türkiye`,
        components: {
          city: closestCity.name,
          country: 'Türkiye',
        },
        coordinates: { latitude: lat, longitude: lng },
      },
    });
  }),

  http.get('/api/location/nearby', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '5');
    const type = url.searchParams.get('type') || 'all';

    // Mock nearby locations
    const nearbyLocations = [
      {
        id: 'poi-1',
        name: 'Kızılay Metro İstasyonu',
        type: 'transit',
        coordinates: { latitude: 39.9199, longitude: 32.8543 },
        distance: 0.5,
        address: 'Kızılay, Çankaya, Ankara',
      },
      {
        id: 'poi-2',
        name: 'Armada AVM',
        type: 'shopping',
        coordinates: { latitude: 39.9, longitude: 32.85 },
        distance: 1.2,
        address: 'Söğütözü, Çankaya, Ankara',
      },
      {
        id: 'poi-3',
        name: 'Bilkent Üniversitesi',
        type: 'education',
        coordinates: { latitude: 39.8681, longitude: 32.7489 },
        distance: 8.5,
        address: 'Bilkent, Çankaya, Ankara',
      },
    ];

    // Filter by distance
    const filtered = nearbyLocations.filter(
      (location) => location.distance <= radius
    );

    // Filter by type if specified
    const typeFiltered =
      type === 'all'
        ? filtered
        : filtered.filter((location) => location.type === type);

    return HttpResponse.json({
      success: true,
      results: typeFiltered,
      center: { latitude: lat, longitude: lng },
      radius,
    });
  }),

  // Detail page handlers
  ...detailHandlers,
];
