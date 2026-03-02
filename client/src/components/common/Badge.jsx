import React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}) => {
  const variants = {
    default: "bg-brand-primary/10 text-brand-primary border-transparent",
    code: "bg-white/50 border-brand-primary/30 text-brand-primary font-mono tracking-wider",
    sale: "bg-destructive/10 text-destructive border-transparent",
    outline: "bg-transparent border-brand-primary/40 text-brand-primary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
