export interface PlaceholderOptions {
  width?: number;
  height?: number;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

export const DEFAULT_PLACEHOLDER_OPTIONS: PlaceholderOptions = {
  width: 300,
  height: 200,
  text: 'Resim Yok',
  backgroundColor: '#f0f0f0',
  textColor: '#666666',
  fontSize: 16,
};

export function generatePlaceholder(
  options: PlaceholderOptions = DEFAULT_PLACEHOLDER_OPTIONS
): string {
  const opts = { ...DEFAULT_PLACEHOLDER_OPTIONS, ...options };

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${opts.width}" height="${opts.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${opts.backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            font-family="Arial, sans-serif" font-size="${opts.fontSize}" fill="${opts.textColor}">
        ${opts.text}
      </text>
    </svg>
  `)}`;
}

export function generateCategoryPlaceholder(
  categoryName?: string,
  altText?: string
): string {
  return generatePlaceholder({
    width: 300,
    height: 200,
    text: altText || categoryName || 'Kategori',
    backgroundColor: '#e3f2fd',
    textColor: '#1976d2',
    fontSize: 18,
  });
}

export function generateUserAvatarPlaceholder(username?: string): string {
  const initials = username
    ? username
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return generatePlaceholder({
    width: 100,
    height: 100,
    text: initials,
    backgroundColor: '#4caf50',
    textColor: '#ffffff',
    fontSize: 32,
  });
}

export function generateJobPlaceholder(): string {
  return generatePlaceholder({
    width: 400,
    height: 250,
    text: 'İş İlanı',
    backgroundColor: '#fff3e0',
    textColor: '#f57c00',
    fontSize: 20,
  });
}

export function generatePackagePlaceholder(): string {
  return generatePlaceholder({
    width: 400,
    height: 250,
    text: 'Paket',
    backgroundColor: '#f3e5f5',
    textColor: '#7b1fa2',
    fontSize: 20,
  });
}

export function getImageFallback(
  type: 'category' | 'user' | 'job' | 'package' | 'default',
  name?: string
): string {
  switch (type) {
    case 'category':
      return generateCategoryPlaceholder(name);
    case 'user':
      return generateUserAvatarPlaceholder(name);
    case 'job':
      return generateJobPlaceholder();
    case 'package':
      return generatePackagePlaceholder();
    default:
      return generatePlaceholder();
  }
}

export function createImageWithFallback(
  src: string,
  fallbackType: 'category' | 'user' | 'job' | 'package' | 'default' = 'default',
  name?: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(src);
    };

    img.onerror = () => {
      resolve(getImageFallback(fallbackType, name));
    };

    img.src = src;
  });
}
