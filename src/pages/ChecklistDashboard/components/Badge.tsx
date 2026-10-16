import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
  dot = false
}: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success border-success/25',
    warning: 'bg-attention/10 text-attention border-attention/25',
    danger: 'bg-danger/10 text-danger border-danger/25',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-primary/10 text-primary border-primary/25'
  };

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-attention',
    danger: 'bg-danger',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
    primary: 'bg-primary'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
