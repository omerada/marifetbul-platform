/**
 * ================================================
 * QUICK ACCESS CARDS COMPONENT
 * ================================================
 * Quick navigation cards for common admin actions
 *
 * Sprint 3.2: Admin Dashboard Enhancement
 * @version 1.0.0
 */

'use client';

import Link from 'next/link';
import {
  Users,
  ShoppingCart,
  AlertTriangle,
  Headphones,
  Shield,
} from 'lucide-react';
import type { QuickAccessData } from '@/types/business/admin-dashboard';

interface QuickAccessCardsProps {
  data: QuickAccessData;
  isLoading?: boolean;
}

export function QuickAccessCards({ data, isLoading }: QuickAccessCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border border-gray-200 bg-white"
          />
        ))}
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Users className="h-6 w-6" />;
      case 'orders':
        return <ShoppingCart className="h-6 w-6" />;
      case 'disputes':
        return <AlertTriangle className="h-6 w-6" />;
      case 'support':
        return <Headphones className="h-6 w-6" />;
      case 'moderation':
        return <Shield className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getColorClasses = (
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  ) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-700',
          hoverBorder: 'hover:border-blue-200',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-700',
          hoverBorder: 'hover:border-green-200',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-700',
          hoverBorder: 'hover:border-yellow-200',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-700',
          hoverBorder: 'hover:border-red-200',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-700',
          hoverBorder: 'hover:border-purple-200',
        };
    }
  };

  const cards = [
    data.users,
    data.orders,
    data.disputes,
    data.support,
    data.moderation,
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const colors = getColorClasses(card.color);
        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group rounded-lg border border-gray-200 ${colors.bg} p-4 transition-all hover:shadow-md ${colors.hoverBorder}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`rounded-lg ${colors.iconBg} p-2 ${colors.iconColor}`}
              >
                {getIcon(card.icon)}
              </div>
              <span
                className={`text-2xl font-bold ${colors.textColor} transition-transform group-hover:scale-110`}
              >
                {card.value.toLocaleString()}
              </span>
            </div>
            <h3 className="mt-3 font-medium text-gray-900">{card.title}</h3>
            {card.description && (
              <p className="mt-1 text-xs text-gray-600">{card.description}</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
