export function createPlaceholderImage(
  width: number = 640,
  height: number = 480,
  text: string = 'Placeholder',
  bgColor: string = 'e5e7eb',
  textColor: string = '6b7280'
): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial,sans-serif" font-size="16" 
            font-weight="bold" text-anchor="middle" dominant-baseline="middle" 
            fill="#${textColor}">${text}</text>
    </svg>
  `)}`;
}

export const placeholderImages = {
  packageDefault: createPlaceholderImage(640, 480, 'Hizmet Paketi'),
  jobDefault: createPlaceholderImage(640, 480, 'İş İlanı'),
  webDev: createPlaceholderImage(640, 480, 'Web Development'),
  mobileDev: createPlaceholderImage(640, 480, 'Mobile Development'),
  design: createPlaceholderImage(640, 480, 'Design'),
  seo: createPlaceholderImage(640, 480, 'SEO'),
  marketing: createPlaceholderImage(640, 480, 'Marketing'),
  writing: createPlaceholderImage(640, 480, 'Content Writing'),
};
