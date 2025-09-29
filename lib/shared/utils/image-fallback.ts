// Image fallback utilities

// Safe base64 encoding for Unicode characters
const safeBase64Encode = (str: string): string => {
  try {
    // Use TextEncoder for proper Unicode handling
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const binaryString = Array.from(bytes, (byte) =>
      String.fromCharCode(byte)
    ).join('');
    return btoa(binaryString);
  } catch {
    // Fallback: remove non-Latin1 characters
    const latin1Safe = str.replace(/[^\x00-\xFF]/g, '?');
    return btoa(latin1Safe);
  }
};

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

  // Convert Turkish characters to safe equivalents for processing
  const safeCategory = category
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');

  // Simple hash function to get consistent color for same category
  let hash = 0;
  for (let i = 0; i < safeCategory.length; i++) {
    hash = safeCategory.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];

  // Create safe display text (first 2 characters, uppercase)
  const displayText = safeCategory.substring(0, 2).toUpperCase();

  // Create SVG placeholder with safe encoding
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold">
        ${displayText}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${safeBase64Encode(svg)}`;
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

  // Convert Turkish characters to safe equivalents
  const safeName = name
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');

  // Get initials from safe name
  const initials = safeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Simple hash for color using safe name
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
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

  return `data:image/svg+xml;base64,${safeBase64Encode(svg)}`;
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
