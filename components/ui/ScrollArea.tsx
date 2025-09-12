'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative overflow-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default ScrollArea;
