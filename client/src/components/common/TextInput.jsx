import React from 'react';
import { cn } from '@/lib/utils';

const TextInput = ({ 
  label, 
  placeholder, 
  type = 'text', 
  value, 
  onChange, 
  name, 
  className, 
  error,
  ...props 
}) => {
  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-brand-primary/90 ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 rounded-md border border-brand-primary/20 bg-white/50 text-brand-text placeholder:text-brand-text/40",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
          "transition-all duration-200",
          error && "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20"
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-destructive ml-1">{error}</span>
      )}
    </div>
  );
};

export default TextInput;
