import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const ProductCard = ({ 
  name, 
  price, 
  code, 
  imageUrl, 
  images,
  variants,
  onClick, 
  onAddToCart, 
  className,
  ...props
}) => {
  const { formatPrice } = useCurrency();
  const displayImage = (variants && variants.length > 0 && variants[0].images && variants[0].images.length > 0)
    ? variants[0].images[0]
    : (images && images.length > 0 ? images[0] : imageUrl);
  
  return (
    <div 
      className={cn(
        "group relative flex flex-col cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
      data-testid={`card-product-${code}`}
    >
      {/* Cinematic Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(93,21,38,0.2)]">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
            data-testid={`img-product-${code}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-warm-beige/20 text-brand-primary/20 font-serif italic">
            No Image
          </div>
        )}
        
        {/* Code Badge - Top Right Floating Pill */}
        {code && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-bold tracking-widest uppercase py-1.5 px-3 rounded-full text-brand-primary border border-brand-primary/10 shadow-sm">
              {code}
            </span>
          </div>
        )}
      </div>

      {/* Content - Cinematic Framing */}
      <div className="flex flex-col space-y-2 px-1">
        <div className="w-12 h-[1px] bg-brand-primary/20 mb-2" /> {/* Separator line */}
        
        <h3 className="font-serif text-2xl text-brand-primary leading-tight">
          {name || 'Product Name'}
        </h3>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <p className="font-medium text-brand-text tracking-wide">
              {formatPrice(Number(price))}
            </p>
            {code && (
              <p className="text-[10px] text-brand-text/50 uppercase tracking-widest">
                Code: {code}
              </p>
            )}
          </div>
          
          <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand-primary group-hover:translate-x-1 transition-transform duration-300">
            View Look <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
