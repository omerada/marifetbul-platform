import React from 'react';
import { AvatarImage } from './UnifiedImage';
import { cn } from '@/lib/utils';

// Re-export AvatarImage for external use
export { AvatarImage } from './UnifiedImage';

// ================================================
// AVATAR COMPONENT SYSTEM
// ================================================

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

// Main Avatar component
export function Avatar({
  src,
  alt = 'Avatar',
  className,
  children,
  size = 'md',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <AvatarImage
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        children
      )}
    </div>
  );
}

// Avatar Fallback component
export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        'bg-muted flex h-full w-full items-center justify-center rounded-full text-sm font-medium',
        className
      )}
    >
      {children}
    </div>
  );
}

// Convenience export with all components
export const AvatarComponents = {
  Avatar,
  AvatarFallback,
  AvatarImage,
};
