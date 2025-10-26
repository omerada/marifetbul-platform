interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'small';
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  variant = 'default',
  className = '',
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  const sizeClasses =
    variant === 'small' ? 'h-4 w-4 text-[10px]' : 'h-5 w-5 text-xs';

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-red-500 leading-none font-bold text-white ${className}`}
      aria-label={`${count} okunmamış bildirim`}
    >
      {displayCount}
    </span>
  );
}
