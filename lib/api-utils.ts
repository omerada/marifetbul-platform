// API yardımcı fonksiyonu
export function getBaseUrl(): string {
  // Client-side'da window object var ise
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Vercel ortamında
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Vercel environment variable olarak NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Development ortamı
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production ortamında fallback (bu durumda relative URL kullan)
  return '';
}

export function createApiUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Server-side'da ve base URL yoksa, localhost kullan
  if (!baseUrl && typeof window === 'undefined') {
    return `http://localhost:3000/api${cleanPath}`;
  }

  if (!baseUrl) {
    // Client-side'da relative URL kullan
    return `/api${cleanPath}`;
  }

  return `${baseUrl}/api${cleanPath}`;
}
