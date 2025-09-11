import { Metadata } from 'next';

export const generateMarketplaceMetadata = (
  mode: 'jobs' | 'packages',
  searchQuery?: string,
  category?: string
): Metadata => {
  const baseTitle = mode === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri';
  const baseDescription =
    mode === 'jobs'
      ? "Türkiye'nin en büyük freelance iş platformunda yeteneklerinize uygun işleri keşfedin. Uzaktan çalışma, part-time ve full-time iş fırsatları."
      : 'Profesyonel freelancerların hazırladığı kaliteli hizmet paketlerini keşfedin. Hızlı teslimat, uygun fiyat, güvenli ödeme.';

  let title = baseTitle;
  let description = baseDescription;

  if (searchQuery) {
    title = `${searchQuery} - ${baseTitle}`;
    description = `${searchQuery} ile ilgili ${mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri'} Marifeto'da. ${baseDescription}`;
  }

  if (category) {
    title = `${category} ${baseTitle}`;
    description = `${category} kategorisindeki ${mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri'}. ${baseDescription}`;
  }

  return {
    title: `${title} | Marifeto`,
    description,
    keywords: [
      mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri',
      'freelance',
      'uzaktan çalışma',
      'part-time',
      'türkiye',
      'marifeto',
      ...(searchQuery ? [searchQuery] : []),
      ...(category ? [category] : []),
    ].join(', '),
    openGraph: {
      title: `${title} | Marifeto`,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Marifeto',
      images: [
        {
          url: '/images/og-marketplace.jpg',
          width: 1200,
          height: 630,
          alt: `Marifeto ${baseTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Marifeto`,
      description,
      images: ['/images/og-marketplace.jpg'],
    },
    alternates: {
      canonical: `/marketplace?mode=${mode}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
    },
  };
};
