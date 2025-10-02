'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            'peer-focus:ring-primary/30 dark:peer-focus:ring-primary/20 peer peer-checked:bg-primary bg-input after:border-border after:bg-background peer-checked:after:border-background dark:border-border dark:bg-muted relative h-6 w-11 rounded-full peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-[""] peer-checked:after:translate-x-full',
            className
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
