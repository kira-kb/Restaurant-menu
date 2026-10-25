import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  isLoading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#10B981] hover:bg-[#059669] text-[#141210] font-semibold shadow-xs',
    secondary:
      'bg-[#241F1C] hover:bg-[#2E2824] text-[#F5F0EB] border border-[#2E2824]',
    danger:
      'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30',
    outline:
      'border border-[#2E2824] hover:border-[#4A3F38] text-[#9E958C] hover:text-[#F5F0EB] bg-transparent',
    ghost:
      'text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#241F1C] bg-transparent',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

export default Button;
