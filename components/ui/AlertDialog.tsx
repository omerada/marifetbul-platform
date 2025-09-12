'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogActionProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

interface AlertDialogCancelProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  className,
  children,
}) => (
  <div
    className={cn(
      'mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg',
      className
    )}
  >
    {children}
  </div>
);

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  className,
  children,
}) => <div className={cn('mb-4 space-y-2', className)}>{children}</div>;

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  className,
  children,
}) => (
  <div className={cn('mt-4 flex justify-end space-x-2', className)}>
    {children}
  </div>
);

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  className,
  children,
}) => <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  className,
  children,
}) => <p className={cn('text-sm text-gray-600', className)}>{children}</p>;

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  className,
  onClick,
  children,
}) => (
  <Button
    onClick={onClick}
    className={cn('bg-red-600 text-white hover:bg-red-700', className)}
  >
    {children}
  </Button>
);

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  className,
  onClick,
  children,
}) => (
  <Button variant="outline" onClick={onClick} className={className}>
    {children}
  </Button>
);

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
