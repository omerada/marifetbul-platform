'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface AvatarImageProps
  extends Omit<React.ComponentProps<typeof Image>, 'width' | 'height'> {
  alt: string;
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, alt, ...props }: AvatarImageProps) {
  return (
    <Image
      className={cn('aspect-square h-full w-full object-cover', className)}
      width={40}
      height={40}
      alt={alt}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
