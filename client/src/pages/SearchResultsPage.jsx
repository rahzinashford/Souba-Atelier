import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsAPI, cartAPI } from '@/lib/api';
import { SearchInput, ProductCard, PrimaryButton, SecondaryButton, Loader, Badge } from '@/components/common';
import { Search, AlertCircle, RefreshCw, Instagram, Hash, Sparkles, ShoppingBag, ArrowRight, Eye, Clock, X, WifiOff } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import useSEO from '@/hooks/useSEO';

const RECENT_CODES_KEY = 'recentSearchCodes';
const MAX_RECENT_CODES = 8;

const SAMPLE_CODES = ['DRS101', 'TOP204', 'SET350', 'SKT102'];

const getRecentCodes = () => {
  try {
    const stored = localStorage.getItem(RECENT_CODES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentCode = (code) => {
  try {
    const recent = getRecentCodes();
    const normalized = code.trim().toUpperCase();
    const filtered = recent.filter(c => c !== normalized);
    const updated = [normalized, ...filtered].slice(0, MAX_RECENT_CODES);
    localStorage.setItem(RECENT_CODES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const clearRecentCodes = () => {
  try {
    localStorage.removeItem(RECENT_CODES_KEY);
  } catch {}
};

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [inputError, setInputError] = useState('');
  const [recentCodes, setRecentCodes] = useState(getRecentCodes());
  
  useSEO({
    title: 'Find Outfit by Reel Code',
    description: 'Search for outfits using Reel codes from Instagram at Souba Atelier. Enter the code you saw in a reel to instantly find and shop the exact aesthetic outfit.'
  });
  
  const searchParams = new URLSearchParams(location.search);
  const codeParam = searchParams.get('code');
  const normalizedCode = codeParam?.trim().toUpperCase() || '';

  useEffect(() => {
    if (codeParam) {
      setSearchQuery(codeParam);
    } else {
      setSearchQuery('');
    }
    setInputError('');
  }, [codeParam]);

  const { 
    data: foundProduct, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['product', normalizedCode],
    queryFn: () => productsAPI.getByCode(normalizedCode),
    enabled: Boolean(normalizedCode),
    retry: false,
  });

  useEffect(() => {
    if (foundProduct && normalizedCode) {
      const updated = saveRecentCode(normalizedCode);
      setRecentCodes(updated);
    }
  }, [foundProduct, normalizedCode]);

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', foundProduct?.category],
    queryFn: () => productsAPI.getByCategory(foundProduct.category),
    enabled: Boolean(foundProduct?.category),
    select: (products) => products.filter(p => p.code !== foundProduct.code).slice(0, 4),
  });

  const shouldFetchSuggestions = Boolean(normalizedCode) && foundProduct === undefined && !isLoading;
  
  const { data: suggestedProducts = [] } = useQuery({
    queryKey: ['suggestedProducts'],
    queryFn: () => productsAPI.getAll(),
    enabled: shouldFetchSuggestions,
    select: (products) => products.slice(0, 4),
  });

  const addToCartMutation = useMutation({
    mutationFn: (data) => cartAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: `${foundProduct.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      setInputError('Please enter a code.');
      return;
    }
    setInputError('');
    navigate(`/search?code=${encodeURIComponent(trimmed)}`);
  };

  const handleCodeChipClick = (code) => {
    navigate(`/search?code=${encodeURIComponent(code)}`);
  };

  const handleClearRecent = () => {
    clearRecentCodes();
    setRecentCodes([]);
  };

  const handleAddToCart = () => {
    if (foundProduct) {
      addToCartMutation.mutate({
        productId: foundProduct.id,
        quantity: 1,
      });
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of stock', color: 'text-red-600' };
    if (stock <= 5) return { text: `Only ${stock} left!`, color: 'text-orange-600' };
    return { text: 'In stock', color: 'text-green-600' };
  };

  const renderInitialState = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="text-center space-y-6 mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-full flex items-center justify-center mx-auto">
          <Search className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary">
          Find your outfit by Reel code
        </h1>
        <p className="text-brand-text/70 leading-relaxed max-w-lg mx-auto">
          Each Instagram Reel has a unique outfit code. Type it here to instantly find that piece.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <SearchInput 
          placeholder="Enter Reel code (e.g., DRS123)..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (inputError) setInputError('');
          }}
          onSubmit={handleSearch}
          className="shadow-md"
          data-testid="input-search"
        />
        {inputError && (
          <p className="text-red-500 text-sm mt-2 text-center" data-testid="text-input-error">{inputError}</p>
        )}
      </div>

      <div className="bg-brand-warm-beige/30 rounded-2xl p-6 md:p-8 mb-10">
        <h2 className="font-serif text-xl text-brand-primary mb-6 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-medium">
              <Instagram className="w-5 h-5" />
              Watch our Reels
            </div>
            <p className="text-sm text-brand-text/60">
              Browse our Instagram for the latest outfit inspiration.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-medium">
              <Hash className="w-5 h-5" />
              Note the code
            </div>
            <p className="text-sm text-brand-text/60">
              Each Reel shows a unique code like DRS123 or TOP204.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-medium">
              <Sparkles className="w-5 h-5" />
              Find your outfit
            </div>
            <p className="text-sm text-brand-text/60">
              Enter the code above and shop the exact piece instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 mb-10">
        <p className="text-sm text-brand-text/60 font-medium uppercase tracking-wider">Try these sample codes</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_CODES.map((code) => (
            <button
              key={code}
              onClick={() => handleCodeChipClick(code)}
              className="px-4 py-2 rounded-full bg-white border border-brand-primary/20 text-brand-primary font-mono text-sm font-bold hover:bg-brand-primary hover:text-white transition-all duration-200 shadow-sm"
              data-testid={`chip-sample-${code}`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {recentCodes.length > 0 && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-brand-text/50" />
            <p className="text-sm text-brand-text/60 font-medium uppercase tracking-wider">Recent searches</p>
            <button
              onClick={handleClearRecent}
              className="ml-2 text-brand-text/40 hover:text-brand-primary transition-colors"
              title="Clear recent"
              data-testid="button-clear-recent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {recentCodes.map((code) => (
              <button
                key={code}
                onClick={() => handleCodeChipClick(code)}
                className="px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary/80 font-mono text-sm font-medium hover:bg-brand-primary hover:text-white transition-all duration-200"
                data-testid={`chip-recent-${code}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
          Searching for "{normalizedCode}"
        </h1>
      </div>
      <div className="max-w-md mx-auto mb-8">
        <SearchInput 
          placeholder="Try another code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          data-testid="input-search-loading"
        />
      </div>
      <Loader message="Looking up your outfit..." className="py-16" />
    </div>
  );

  const renderFoundState = () => {
    const stockStatus = getStockStatus(foundProduct.stock);
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
            Results for code "{normalizedCode}"
          </h1>
          <p className="text-brand-primary/80 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            We found your outfit!
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <SearchInput 
            placeholder="Try another code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
            data-testid="input-search-found"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-brand-primary/10 overflow-hidden mb-10">
          <div className="md:flex">
            <div 
              className="md:w-2/5 aspect-[3/4] md:aspect-auto relative cursor-pointer group"
              onClick={() => navigate(`/product/${foundProduct.code}`)}
            >
              {foundProduct.imageUrl ? (
                <img 
                  src={foundProduct.imageUrl} 
                  alt={foundProduct.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-brand-warm-beige/30 flex items-center justify-center text-brand-text/30 font-serif italic">
                  No Image
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className="bg-white/95 backdrop-blur-sm text-xs font-bold tracking-widest uppercase py-2 px-4 rounded-full text-brand-primary shadow-sm">
                  {foundProduct.code}
                </span>
              </div>
            </div>

            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-brand-text/50 uppercase tracking-widest mb-1">
                    {foundProduct.category}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                    {foundProduct.name}
                  </h2>
                </div>

                <p className="text-3xl font-bold text-brand-primary">
                  ${parseFloat(foundProduct.price).toFixed(2)}
                </p>

                {foundProduct.description && (
                  <p className="text-brand-text/70 leading-relaxed">
                    {foundProduct.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <span className={`font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                  <span className="text-brand-text/40">|</span>
                  <span className="text-brand-text/60">
                    Code: <span className="font-mono font-bold">{foundProduct.code}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <PrimaryButton 
                  onClick={() => navigate(`/product/${foundProduct.code}`)}
                  className="flex-1 flex items-center justify-center gap-2"
                  data-testid="button-view-details"
                >
                  <Eye className="w-4 h-4" />
                  View details
                </PrimaryButton>
                <SecondaryButton 
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || foundProduct.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to cart'}
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-brand-primary/30" />
              <h3 className="font-serif text-xl text-brand-primary">You may also like</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={formatPrice(product.price)}
                  code={product.code}
                  imageUrl={product.imageUrl}
                  onClick={() => navigate(`/product/${product.code}`)}
                  data-testid={`card-related-${product.code}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotFoundState = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
          Results for code "{normalizedCode}"
        </h1>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <SearchInput 
          placeholder="Try another code..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (inputError) setInputError('');
          }}
          onSubmit={handleSearch}
          data-testid="input-search-notfound"
        />
        {inputError && (
          <p className="text-red-500 text-sm mt-2 text-center">{inputError}</p>
        )}
      </div>

      <div className="bg-brand-primary/5 rounded-2xl border border-dashed border-brand-primary/20 p-8 text-center max-w-lg mx-auto mb-10">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-serif font-bold text-brand-primary mb-2" data-testid="text-not-found">
          We couldn't find that code.
        </h2>
        <p className="text-brand-text/70 mb-6">
          Double-check the code from the Reel (e.g., DRS123) and try again. It might be a typo!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton 
            onClick={() => navigate('/shop')} 
            className="flex items-center justify-center gap-2"
            data-testid="button-browse-shop"
          >
            Browse all outfits
            <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
          <SecondaryButton 
            onClick={() => navigate('/')}
            data-testid="button-go-home"
          >
            Back to Home
          </SecondaryButton>
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-brand-text/60 font-medium uppercase tracking-wider mb-2">
              Maybe you'll like these instead
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestedProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={formatPrice(product.price)}
                code={product.code}
                imageUrl={product.imageUrl}
                onClick={() => navigate(`/product/${product.code}`)}
                data-testid={`card-suggested-${product.code}`}
              />
            ))}
          </div>
        </div>
      )}

      {recentCodes.length > 0 && (
        <div className="text-center space-y-4 mt-10 pt-8 border-t border-brand-primary/10">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-brand-text/50" />
            <p className="text-sm text-brand-text/60 font-medium">Try a recent search</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {recentCodes.filter(c => c !== normalizedCode).slice(0, 5).map((code) => (
              <button
                key={code}
                onClick={() => handleCodeChipClick(code)}
                className="px-4 py-2 rounded-full bg-white border border-brand-primary/20 text-brand-primary font-mono text-sm font-medium hover:bg-brand-primary hover:text-white transition-all duration-200"
                data-testid={`chip-recent-notfound-${code}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
          Searching for "{normalizedCode}"
        </h1>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <SearchInput 
          placeholder="Try another code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
          data-testid="input-search-error"
        />
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <WifiOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-serif font-bold text-red-700 mb-2" data-testid="text-error">
          We're having trouble looking up that code.
        </h2>
        <p className="text-red-600/70 mb-6">
          Please check your connection and try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton 
            onClick={() => refetch()}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
            data-testid="button-retry"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </PrimaryButton>
          <SecondaryButton 
            onClick={() => navigate('/shop')}
            data-testid="button-go-shop-error"
          >
            Go to Shop
          </SecondaryButton>
        </div>
      </div>
    </div>
  );

  if (!normalizedCode) {
    return renderInitialState();
  }

  if (isLoading) {
    return renderLoadingState();
  }

  if (isError) {
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      return renderNotFoundState();
    }
    return renderErrorState();
  }

  if (foundProduct) {
    return renderFoundState();
  }

  return renderNotFoundState();
};

export default SearchResultsPage;
