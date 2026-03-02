import React from 'react';
import { cn } from '@/lib/utils';
import PrimaryButton from './PrimaryButton';

const SearchInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Enter Reel code...", 
  className 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };

  return (
    <div className={cn("w-full flex flex-col md:flex-row gap-3", className)}>
      <div className="flex-grow relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full h-full px-4 py-3 md:py-3 rounded-md border border-brand-primary/20 bg-white/50 text-brand-text placeholder:text-brand-text/40",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
            "transition-all duration-200"
          )}
        />
      </div>
      <PrimaryButton 
        onClick={() => onSubmit(value)}
        className="md:w-auto md:px-8"
      >
        Search
      </PrimaryButton>
    </div>
  );
};

export default SearchInput;
