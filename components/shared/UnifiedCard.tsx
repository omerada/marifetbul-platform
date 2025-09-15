/**
 * Shared UnifiedCard Component
 */

'use client';

import React from 'react';

interface UnifiedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function UnifiedCard({
  children,
  className = '',
  variant = 'default',
  hover = false,
  clickable = false,
  onClick,
}: UnifiedCardProps) {
  const baseClasses = 'rounded-lg transition-all duration-200';

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-transparent border-2 border-gray-300',
  };

  const hoverClasses =
    hover || clickable ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    clickableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
}

export default UnifiedCard;
