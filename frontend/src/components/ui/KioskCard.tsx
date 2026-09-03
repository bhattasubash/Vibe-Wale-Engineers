import React from 'react';
import { cn } from '@/lib/utils';

export interface KioskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'danger' | 'amber';
}

export const KioskCard: React.FC<KioskCardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-surface border border-gray-100 shadow-kiosk-card',
    highlight: 'bg-primary-light/40 border-2 border-primary shadow-kiosk-card',
    danger: 'bg-status-dangerBg border-2 border-status-danger text-status-danger',
    amber: 'bg-secondary-light/40 border-2 border-secondary text-text-primary',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-8 transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
