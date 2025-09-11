'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { placeholderImages } from '@/lib/utils/placeholders';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  placeholderType?: keyof typeof placeholderImages;
  className?: string;
}

export function SafeImage({
  src,
  fallbackSrc,
  placeholderType = 'packageDefault',
  alt,
  className = '',
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setImgSrc(placeholderImages[placeholderType]);
      }
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      placeholder="blur"
      blurDataURL={placeholderImages[placeholderType]}
    />
  );
}
