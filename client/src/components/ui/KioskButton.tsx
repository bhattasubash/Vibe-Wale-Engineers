import React from 'react';
import { cn } from '@/lib/utils';

export interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'default' | 'large' | 'icon';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const KioskButton: React.FC<KioskButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-colors select-none border tracking-wider font-sans cursor-pointer';

  const variantStyles = {
    // Primary: rgb(10, 45, 101) with pure white text and flat 1px border
    primary: 'bg-[#0A2D65] hover:bg-[#071F45] text-white border-[#071F45]',
    secondary: 'bg-white text-[#0A2D65] border-2 border-[#0A2D65] hover:bg-[#E8EDF5]',
    outline: 'bg-white text-[#212529] border border-[#CED4DA] hover:border-[#0A2D65] hover:text-[#0A2D65]',
    danger: 'bg-[#B91C1C] hover:bg-[#991B1B] text-white border-[#7F1D1D]',
  };

  const sizeStyles = {
    default: 'min-h-[48px] sm:min-h-[54px] px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base',
    large: 'min-h-[54px] sm:min-h-[64px] px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-extrabold',
    icon: 'min-h-[48px] min-w-[48px] p-2.5',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  const variantInlineStyles: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)', borderRadius: '2px', ...style }
      : { borderRadius: '2px', ...style };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && disabledStyles,
        className
      )}
      style={variantInlineStyles}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
    </button>
  );
};
