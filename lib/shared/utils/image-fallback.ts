// Image fallback utilities
export const generateCategoryPlaceholder = (
  category: string,
  size: number = 200
): string => {
  // Generate a colored placeholder based on category name
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ];

  // Simple hash function to get consistent color for same category
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];

  // Create SVG placeholder
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold">
        ${category.substring(0, 2).toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateUserAvatar = (
  name: string,
  size: number = 100
): string => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ];

  // Get initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Simple hash for color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50%" cy="50%" r="50%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getImageFallback = (
  type: 'category' | 'user' | 'default',
  identifier: string,
  size?: number
): string => {
  switch (type) {
    case 'category':
      return generateCategoryPlaceholder(identifier, size);
    case 'user':
      return generateUserAvatar(identifier, size);
    default:
      return generateCategoryPlaceholder('Default', size);
  }
};
