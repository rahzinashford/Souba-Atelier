import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/common';
import { productsAPI } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import useSEO from '@/hooks/useSEO';
import { 
  Filter, X, Search, SlidersHorizontal, ChevronDown, 
  Grid3X3, List, ArrowLeft, RefreshCw, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', value: 'black', hex: '#1f1b1d' },
  { name: 'White', value: 'white', hex: '#ffffff' },
  { name: 'Beige', value: 'beige', hex: '#f5deb3' },
  { name: 'Navy', value: 'navy', hex: '#1e3a5f' },
  { name: 'Wine', value: 'wine', hex: '#5d1526' },
  { name: 'Olive', value: 'olive', hex: '#556b2f' },
];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];
const ITEMS_PER_PAGE = 12;

const ProductCardSkeleton = () => (
  <div className="flex flex-col space-y-4">
    <Skeleton className="aspect-[3/4] rounded-2xl bg-brand-beige-dark/30" />
    <div className="space-y-2 px-1">
      <Skeleton className="h-1 w-12 bg-brand-beige-dark/30" />
      <Skeleton className="h-6 w-3/4 bg-brand-beige-dark/30" />
      <Skeleton className="h-4 w-1/2 bg-brand-beige-dark/30" />
    </div>
  </div>
);

const FilterSection = ({ title, children }) => (
  <div className="space-y-3">
    <label className="text-xs uppercase tracking-widest text-brand-primary/60 font-medium">
      {title}
    </label>
    {children}
  </div>
);

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, isAuthenticated } = useCart();
  const { formatPrice, getCurrencySymbol } = useCurrency();
  
  useSEO({
    title: 'Shop All Outfits',
    description: 'Browse our curated collection of aesthetic clothing. Filter by category, size, color, and price to find your perfect outfit at Souba Atelier.'
  });
  
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice')) || 0,
    parseInt(searchParams.get('maxPrice')) || 10000
  ]);
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'featured');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        setRecentlyViewed([]);
      }
    }
  }, []);

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map(p => parseFloat(p.price));
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  useEffect(() => {
    if (products.length === 0) return;
    
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    
    if (!urlMinPrice && !urlMaxPrice) {
      setPriceRange([priceStats.min, priceStats.max]);
    } else {
      const newMin = urlMinPrice ? Math.max(parseInt(urlMinPrice), priceStats.min) : priceStats.min;
      const newMax = urlMaxPrice ? Math.min(parseInt(urlMaxPrice), priceStats.max) : priceStats.max;
      setPriceRange([newMin, newMax]);
    }
  }, [priceStats.min, priceStats.max, products.length]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (priceRange[0] > priceStats.min) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < priceStats.max) params.set('maxPrice', priceRange[1].toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sortOption !== 'featured') params.set('sort', sortOption);
    
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, priceStats, debouncedSearch, sortOption, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.code.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.sizes) return true;
        const productSizes = Array.isArray(p.sizes) ? p.sizes : [p.sizes];
        return selectedSizes.some(size => productSizes.includes(size));
      });
    }

    if (selectedColors.length > 0) {
      result = result.filter(p => {
        if (!p.colors && !p.color) return true;
        const productColors = p.colors 
          ? (Array.isArray(p.colors) ? p.colors : [p.colors])
          : (p.color ? [p.color] : []);
        return selectedColors.some(color => 
          productColors.map(c => c.toLowerCase()).includes(color.toLowerCase())
        );
      });
    }

    const effectiveMinPrice = priceRange[0] > priceStats.min ? priceRange[0] : 0;
    const effectiveMaxPrice = priceRange[1] < priceStats.max ? priceRange[1] : Infinity;
    
    if (effectiveMinPrice > 0 || effectiveMaxPrice < Infinity) {
      result = result.filter(p => {
        const price = parseFloat(p.price);
        return price >= effectiveMinPrice && price <= effectiveMaxPrice;
      });
    }

    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, debouncedSearch, selectedSizes, selectedColors, priceRange, priceStats, sortOption]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const hasMoreProducts = displayCount < filteredProducts.length;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedSizes.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) count++;
    if (debouncedSearch) count++;
    return count;
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, priceStats, debouncedSearch]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('All');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([priceStats.min, priceStats.max]);
    setSearchText('');
    setDebouncedSearch('');
    setSortOption('featured');
    setDisplayCount(ITEMS_PER_PAGE);
  }, [priceStats]);

  const toggleSize = useCallback((size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  }, []);

  const toggleColor = useCallback((color) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  }, []);

  const removeFilter = useCallback((type, value) => {
    switch (type) {
      case 'category':
        setSelectedCategory('All');
        break;
      case 'size':
        setSelectedSizes(prev => prev.filter(s => s !== value));
        break;
      case 'color':
        setSelectedColors(prev => prev.filter(c => c !== value));
        break;
      case 'price':
        setPriceRange([priceStats.min, priceStats.max]);
        break;
      case 'search':
        setSearchText('');
        setDebouncedSearch('');
        break;
      default:
        break;
    }
  }, [priceStats]);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const handleProductClick = useCallback((product) => {
    const stored = localStorage.getItem('recentlyViewed');
    let recent = stored ? JSON.parse(stored) : [];
    recent = recent.filter(p => p.code !== product.code);
    recent.unshift({ code: product.code, name: product.name, imageUrl: product.imageUrl, price: product.price });
    recent = recent.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
    navigate(`/product/${product.code}`);
  }, [navigate]);

  const FilterContent = () => (
    <div className="space-y-6">
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-2 rounded-full text-xs font-medium border transition-all duration-200 min-h-[40px]",
                selectedCategory === cat
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-transparent text-brand-text/70 border-brand-primary/20 hover:border-brand-primary/50"
              )}
              data-testid={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "w-12 h-10 rounded-lg text-xs font-medium border transition-all duration-200",
                selectedSizes.includes(size)
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-transparent text-brand-text/70 border-brand-primary/20 hover:border-brand-primary/50"
              )}
              data-testid={`filter-size-${size.toLowerCase()}`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200",
                selectedColors.includes(color.value)
                  ? "bg-brand-primary/10"
                  : "hover:bg-brand-primary/5"
              )}
              data-testid={`filter-color-${color.value}`}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all duration-200",
                  selectedColors.includes(color.value)
                    ? "border-brand-primary ring-2 ring-brand-primary/20"
                    : "border-brand-primary/20",
                  color.value === 'white' && "border-gray-300"
                )}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[10px] text-brand-text/60">{color.name}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={`Price Range: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}>
        <div className="px-2 py-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={priceStats.min}
            max={priceStats.max}
            step={100}
            className="w-full"
            data-testid="filter-price-slider"
          />
          <div className="flex justify-between mt-2 text-xs text-brand-text/50">
            <span>{formatPrice(priceStats.min)}</span>
            <span>{formatPrice(priceStats.max)}</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  const ActiveFilterChips = () => {
    const chips = [];
    
    if (selectedCategory !== 'All') {
      chips.push({ type: 'category', label: selectedCategory, value: selectedCategory });
    }
    selectedSizes.forEach(size => {
      chips.push({ type: 'size', label: `Size: ${size}`, value: size });
    });
    selectedColors.forEach(color => {
      const colorObj = COLORS.find(c => c.value === color);
      chips.push({ type: 'color', label: colorObj?.name || color, value: color });
    });
    if (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) {
      chips.push({ type: 'price', label: `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`, value: 'price' });
    }
    if (debouncedSearch) {
      chips.push({ type: 'search', label: `"${debouncedSearch}"`, value: debouncedSearch });
    }

    if (chips.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 py-3">
        {chips.map((chip, index) => (
          <Badge
            key={`${chip.type}-${chip.value}-${index}`}
            variant="secondary"
            className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20 cursor-pointer transition-colors pl-3 pr-1 py-1.5 gap-1 text-xs"
            onClick={() => removeFilter(chip.type, chip.value)}
            data-testid={`chip-${chip.type}-${chip.value}`}
          >
            {chip.label}
            <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
        <button
          onClick={handleClearFilters}
          className="text-xs text-brand-primary/60 hover:text-brand-primary underline underline-offset-2 ml-2 transition-colors"
          data-testid="button-clear-all-filters"
        >
          Clear all
        </button>
      </div>
    );
  };

  const RecentlyViewedSection = () => {
    if (recentlyViewed.length === 0) return null;

    return (
      <div className="mt-16 pt-8 border-t border-brand-primary/10">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-brand-primary/60" />
          <h3 className="text-sm font-medium uppercase tracking-widest text-brand-primary/60">
            Recently Viewed
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {recentlyViewed.map((product) => (
            <div
              key={product.code}
              onClick={() => navigate(`/product/${product.code}`)}
              className="flex-shrink-0 w-40 cursor-pointer group"
              data-testid={`recent-product-${product.code}`}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-brand-beige-dark/30">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary/20 font-serif italic text-sm">
                    No Image
                  </div>
                )}
              </div>
              <p className="text-sm font-serif text-brand-primary truncate">{product.name}</p>
              <p className="text-xs text-brand-text/60">{formatPrice(product.price)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isError) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="py-32 text-center space-y-6 border border-dashed border-destructive/30 rounded-2xl bg-destructive/5">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-brand-primary font-serif text-xl">We couldn't load outfits right now.</p>
              <p className="text-brand-text/50 text-sm">Please check your connection and try again.</p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="gap-2"
              data-testid="button-retry-load"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-xs font-bold tracking-[0.2em] text-brand-primary/50 uppercase">
            Collection
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-brand-primary mt-1 mb-2">
            Shop All Outfits
          </h1>
          <p className="text-sm text-brand-text/50 max-w-md">
            Filter by size, color, and style. Search by name or code.
          </p>
        </header>

        <div className="sticky top-16 z-30 bg-brand-beige/95 backdrop-blur-sm py-4 -mx-4 px-4 md:static md:bg-transparent md:backdrop-blur-none border-b border-brand-primary/10 md:border-none">
          <div className="md:hidden flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/40" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-primary/20 bg-white/60 text-sm placeholder:text-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40"
                data-testid="input-search-mobile"
              />
            </div>
            
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative gap-2 h-10 px-4 border-brand-primary/20"
                  data-testid="button-open-filters-mobile"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-brand-beige">
                <SheetHeader className="text-left mb-4">
                  <SheetTitle className="font-serif text-xl text-brand-primary">Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-8rem)] pr-4">
                  <FilterContent />
                </ScrollArea>
                <SheetFooter className="flex-row gap-3 mt-4 pt-4 border-t border-brand-primary/10">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClearFilters}
                    data-testid="button-clear-filters-sheet"
                  >
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button 
                      className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                      data-testid="button-apply-filters-sheet"
                    >
                      Show {filteredProducts.length} Results
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-auto gap-1 h-10 border-brand-primary/20 bg-white/60" data-testid="select-sort-mobile">
                <ChevronDown className="w-4 h-4" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200",
                      selectedCategory === cat
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-transparent text-brand-text/60 border-brand-primary/15 hover:border-brand-primary/40"
                    )}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-brand-primary/10 mx-2" />

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-brand-text/60 hover:text-brand-primary"
                    data-testid="button-more-filters"
                  >
                    <Filter className="w-4 h-4" />
                    More Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="bg-brand-primary text-white text-[10px] px-1.5 py-0">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] bg-brand-beige">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="font-serif text-xl text-brand-primary">All Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <FilterContent />
                  </ScrollArea>
                  <SheetFooter className="flex-row gap-3 mt-4 pt-4 border-t border-brand-primary/10">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleClearFilters}
                    >
                      Clear All
                    </Button>
                    <SheetClose asChild>
                      <Button className="flex-1 bg-brand-primary hover:bg-brand-primary/90">
                        Apply Filters
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/40" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-primary/20 bg-white/60 text-sm placeholder:text-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40"
                  data-testid="input-search-desktop"
                />
              </div>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-48 border-brand-primary/20 bg-white/60" data-testid="select-sort-desktop">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden lg:flex items-center border border-brand-primary/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid' ? "bg-brand-primary text-white" : "text-brand-text/50 hover:text-brand-primary"
                  )}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list' ? "bg-brand-primary text-white" : "text-brand-text/50 hover:text-brand-primary"
                  )}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ActiveFilterChips />

        <div className="flex items-center justify-between py-4 border-b border-brand-primary/5">
          <span className="text-xs text-brand-text/40 uppercase tracking-widest" data-testid="text-items-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="py-6 animate-in fade-in duration-500">
          {isLoading ? (
            <div className={cn(
              "grid gap-x-4 gap-y-8",
              viewMode === 'grid' 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2"
            )}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className={cn(
                "grid gap-x-4 gap-y-8",
                viewMode === 'grid'
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-2"
              )}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    price={product.price}   
                    code={product.code}
                    imageUrl={product.imageUrl}
                    onClick={() => handleProductClick(product)}
                    onAddToCart={async () => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      await addItem(product, 1);
                    }}
                    data-testid={`product-card-${product.code}`}
                  />
                ))}
              </div>

              {hasMoreProducts && (
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    className="px-12 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5"
                    data-testid="button-load-more"
                  >
                    Load More ({filteredProducts.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center space-y-6 border border-dashed border-brand-primary/10 rounded-2xl bg-white/30">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand-primary/5 flex items-center justify-center">
                <Search className="w-6 h-6 text-brand-primary/30" />
              </div>
              <div className="space-y-2">
                <p className="text-brand-primary font-serif text-xl">No outfits match your filters.</p>
                <p className="text-brand-text/50 text-sm max-w-sm mx-auto">
                  Try clearing some filters or searching a different term.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="gap-2"
                  data-testid="button-clear-filters-empty"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/shop')}
                  className="gap-2 text-brand-primary"
                  data-testid="button-back-to-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Outfits
                </Button>
              </div>
            </div>
          )}
        </div>

        <RecentlyViewedSection />
      </div>
    </div>
  );
};

export default ShopPage;
