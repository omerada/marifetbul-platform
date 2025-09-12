'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
      destructive:
        'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300',
      warning:
        'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300',
      success:
        'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300',
    };

    const icons = {
      default: Info,
      destructive: XCircle,
      warning: AlertTriangle,
      success: CheckCircle,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 leading-none font-medium tracking-tight', className)}
      {...props}
    />
  )
);

AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
