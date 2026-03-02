import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Loader = ({ message, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      {message && (
        <p className="text-sm text-brand-text/60 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
