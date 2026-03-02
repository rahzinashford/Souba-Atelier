import React from 'react';
import { cn } from '@/lib/utils';

const PrimaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  className, 
  disabled = false,
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full md:w-auto bg-brand-primary text-white font-medium py-3 px-6 rounded-md shadow-sm",
        "hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
