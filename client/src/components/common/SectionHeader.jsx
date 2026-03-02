import React from 'react';
import { cn } from '@/lib/utils';

const SectionHeader = ({ 
  title, 
  subtitle, 
  className,
  align = 'center' 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col gap-2 py-8 md:py-12",
        align === 'center' ? "text-center items-center" : "text-left items-start",
        className
      )}
    >
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
