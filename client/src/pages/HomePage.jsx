import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/common';
import { ArrowRight, Search } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import useSEO from '@/hooks/useSEO';

const HomePage = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: 'Aesthetic Clothing by Reel Code',
    description: 'Shop aesthetic clothing using Reel codes at Souba Atelier. Discover outfits instantly from Instagram reels and checkout seamlessly with premium quality fashion.'
  });
  const [searchCode, setSearchCode] = useState('');
  const { formatPrice } = useCurrency();

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  const featuredProducts = allProducts.slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/search?code=${encodeURIComponent(searchCode.trim())}`);
    }
  };

  return (
    <div className="space-y-20 md:space-y-32 pb-20">
      
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-muted-rose/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-warm-beige/20 blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-1000">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-brand-primary leading-[1.1] tracking-tight">
              Seen it in <br/> <span className="italic">a Reel?</span>
            </h1>
            <p className="text-brand-text/70 text-lg font-light tracking-wide">
              Type the code below to shop the look.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
             <div className="relative group">
               <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-md transform group-hover:scale-105 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
               <div className="relative flex items-center bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 focus-within:shadow-[0_0_0_2px_rgba(93,21,38,0.1)] focus-within:bg-white/80">
                 <input 
                   type="text" 
                   value={searchCode}
                   onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                   placeholder="DRS123"
                   className="w-full bg-transparent border-none px-8 py-6 text-center text-3xl md:text-4xl font-serif tracking-[0.3em] text-brand-primary placeholder:text-brand-primary/20 focus:ring-0 focus:outline-none uppercase"
                   data-testid="input-search-code"
                 />
                 <button 
                   type="submit"
                   className="absolute right-4 p-3 rounded-xl text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                   data-testid="button-search"
                 >
                   <Search className="w-6 h-6" />
                 </button>
               </div>
             </div>
             <div className="mt-4 flex justify-center gap-8 text-xs font-medium text-brand-text/40 uppercase tracking-widest">
                <span>Reel</span>
                <ArrowRight className="w-3 h-3" />
                <span>Code</span>
                <ArrowRight className="w-3 h-3" />
                <span>Dress</span>
             </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-brand-primary">
              Latest Drops
            </h2>
            <div className="h-1 w-20 bg-brand-primary/10 rounded-full" />
          </div>
          <button 
            onClick={() => navigate('/shop')}
            className="group flex items-center gap-2 text-sm font-bold text-brand-primary tracking-widest uppercase hover:opacity-70 transition-opacity pb-2 border-b border-brand-primary/20 hover:border-brand-primary"
            data-testid="button-view-all"
          >
            View All Collections
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              code={product.code}
              imageUrl={product.imageUrl}
              onClick={() => navigate(`/product/${product.code}`)}
              onAddToCart={() => console.log(`Added ${product.name} to cart`)}
            />
          ))}
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary to-transparent" />
        
        <div className="max-w-3xl mx-auto text-center px-6 space-y-8 relative z-10">
          <h3 className="font-serif text-3xl md:text-5xl text-brand-primary leading-tight">
            "Soft luxury meets digital minimalism."
          </h3>
          <p className="text-brand-text/60 font-sans text-sm uppercase tracking-widest leading-relaxed">
            Designed for the Instagram generation.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
