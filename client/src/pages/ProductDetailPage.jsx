import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api';
import { safeStorage } from '@/lib/safeStorage';
import { useCurrency } from '@/context/CurrencyContext';
import useSEO from '@/hooks/useSEO';
import { PrimaryButton, SecondaryButton, ProductCard } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Check, Truck, ShieldCheck, Loader2, Star, Heart, Share2, 
  ChevronLeft, ChevronRight, ZoomIn, Minus, Plus, Ruler, X,
  Package, RotateCcw, Sparkles, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAlert } from '@/context/AlertContext';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 10;

const generateImageVariants = (baseUrl) => {
  if (!baseUrl) return [];
  return [
    baseUrl,
    baseUrl.replace(/\?.*/, '') + '?w=800&h=1000&fit=crop&crop=top',
    baseUrl.replace(/\?.*/, '') + '?w=800&h=1000&fit=crop&crop=center',
    baseUrl.replace(/\?.*/, '') + '?w=800&h=1000&fit=crop&crop=bottom',
  ];
};

const MOCK_REVIEWS = [
  { id: 1, name: 'Priya S.', rating: 5, date: '2024-11-20', text: 'Absolutely stunning! The quality exceeded my expectations. Fits perfectly and the color is exactly as shown.' },
  { id: 2, name: 'Anjali M.', rating: 4, date: '2024-11-15', text: 'Beautiful piece, great for special occasions. Delivery was quick. Would have loved more color options.' },
  { id: 3, name: 'Riya K.', rating: 5, date: '2024-11-10', text: 'Perfect for my sister\'s wedding! Got so many compliments. The fabric is premium quality.' },
];

const SIZE_CHART = [
  { size: 'XS', bust: '32"', waist: '24"', hip: '34"' },
  { size: 'S', bust: '34"', waist: '26"', hip: '36"' },
  { size: 'M', bust: '36"', waist: '28"', hip: '38"' },
  { size: 'L', bust: '38"', waist: '30"', hip: '40"' },
  { size: 'XL', bust: '40"', waist: '32"', hip: '42"' },
];

const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses,
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  );
};

const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <div className="relative aspect-[3/4] bg-brand-primary/5 rounded-lg overflow-hidden group">
          <img
            src={images[selectedIndex]}
            alt={`${productName} - View ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
            data-testid="img-product-main"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                aria-label="Previous image"
                data-testid="button-prev-image"
              >
                <ChevronLeft className="w-5 h-5 text-brand-primary" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                aria-label="Next image"
                data-testid="button-next-image"
              >
                <ChevronRight className="w-5 h-5 text-brand-primary" />
              </button>
            </>
          )}
          
          <DialogTrigger asChild>
            <button
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
              aria-label="Zoom image"
              data-testid="button-zoom-image"
            >
              <ZoomIn className="w-5 h-5 text-brand-primary" />
            </button>
          </DialogTrigger>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === selectedIndex ? "bg-brand-primary w-4" : "bg-white/70"
                )}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Zoomed`}
              className="max-w-full max-h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "flex-shrink-0 w-16 h-20 rounded-md overflow-hidden border-2 transition-all",
                idx === selectedIndex ? "border-brand-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
              data-testid={`button-thumbnail-${idx}`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const QuantitySelector = ({ quantity, setQuantity, maxStock, disabled }) => {
  const decrease = () => quantity > 1 && setQuantity(quantity - 1);
  const increase = () => quantity < maxStock && setQuantity(quantity + 1);
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-brand-primary">Quantity</span>
      <div className="flex items-center border border-brand-primary/20 rounded-lg">
        <button
          onClick={decrease}
          disabled={quantity <= 1 || disabled}
          className="w-10 h-10 flex items-center justify-center text-brand-primary hover:bg-brand-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          data-testid="button-quantity-decrease"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-medium text-brand-text" data-testid="text-quantity">
          {quantity}
        </span>
        <button
          onClick={increase}
          disabled={quantity >= maxStock || disabled}
          className="w-10 h-10 flex items-center justify-center text-brand-primary hover:bg-brand-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          data-testid="button-quantity-increase"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {maxStock < 10 && (
        <span className="text-xs text-amber-600">Max {maxStock} available</span>
      )}
    </div>
  );
};

const SizeGuideDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-xs underline text-brand-text/60 hover:text-brand-primary transition-colors" data-testid="button-size-guide">
          <Ruler className="w-3.5 h-3.5" />
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-brand-primary">Size Guide</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-primary/10">
                <th className="py-2 px-3 text-left font-medium text-brand-primary">Size</th>
                <th className="py-2 px-3 text-center font-medium text-brand-primary">Bust</th>
                <th className="py-2 px-3 text-center font-medium text-brand-primary">Waist</th>
                <th className="py-2 px-3 text-center font-medium text-brand-primary">Hip</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-b border-brand-primary/5">
                  <td className="py-2 px-3 font-medium">{row.size}</td>
                  <td className="py-2 px-3 text-center text-brand-text/70">{row.bust}</td>
                  <td className="py-2 px-3 text-center text-brand-text/70">{row.waist}</td>
                  <td className="py-2 px-3 text-center text-brand-text/70">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-brand-text/50 mt-2">
          Measurements are in inches. For the best fit, measure yourself and compare to the chart above.
        </p>
      </DialogContent>
    </Dialog>
  );
};

const ReviewCard = ({ review }) => (
  <div className="p-4 bg-white rounded-lg border border-brand-primary/10 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-medium text-brand-primary">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-brand-text">{review.name}</p>
          <p className="text-xs text-brand-text/50">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      <StarRating rating={review.rating} />
    </div>
    <p className="text-sm text-brand-text/80 leading-relaxed">{review.text}</p>
  </div>
);

const ProductDetailPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addItem, loading: cartLoading, isAuthenticated } = useCart();
  const { success, error: showError } = useAlert();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const { data: product, isLoading, error: productError } = useQuery({
    queryKey: ['product', code],
    queryFn: () => productsAPI.getByCode(code),
    enabled: !!code,
  });
  
  useSEO({
    title: product ? `${product.name} (${product.code})` : 'Loading Product',
    description: product 
      ? `Shop ${product.name} from Souba Atelier. ${product.category} collection featuring premium aesthetic wear with instant Reel-code shopping and fast delivery to your doorstep.`
      : 'Discover premium aesthetic clothing at Souba Atelier. Browse our curated collection of fashion-forward outfits with instant Reel-code shopping experience.'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSize('');
    setSelectedColor(null);
    setQuantity(1);
    setSizeError(false);
  }, [code]);

  useEffect(() => {
    if (code) {
      try {
        const stored = safeStorage.getJSON(RECENTLY_VIEWED_KEY, []);
        const filtered = stored.filter(c => c !== code);
        const updated = [code, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
        safeStorage.setJSON(RECENTLY_VIEWED_KEY, updated);
      } catch (err) {
        console.error('Failed to save recently viewed:', err);
      }
    }
  }, [code]);

  const { data: allProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = product?.variants && product.variants.length > 0
    ? product.variants.map(v => ({ name: v.color, value: v.hex || '#000000', images: v.images }))
    : [
        { name: 'Midnight', value: '#5d1526', images: [] },
        { name: 'Cream', value: '#f9ecdd', images: [] },
        { name: 'Black', value: '#1a1a1a', images: [] },
      ];

  const currentVariant = selectedColor ? colors.find(c => c.name === selectedColor.name) : colors[0];
  const images = currentVariant && currentVariant.images && currentVariant.images.length > 0 
    ? currentVariant.images 
    : (product && product.images && product.images.length > 0 ? product.images : (product ? generateImageVariants(product.imageUrl) : []));

  useEffect(() => {
    if (product && colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [product, colors, selectedColor]);
  const stock = product?.stock ?? 100;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 5;
  const averageRating = 4.5;
  const reviewCount = MOCK_REVIEWS.length;

  const relatedProducts = allProducts
    .filter(p => p.category === product?.category && p.code !== product?.code)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      showError('Please select a size before adding to cart');
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${code}` } });
      return;
    }
    
    setSizeError(false);
    setAddingToCart(true);
    setAddedToCart(false);
    
    try {
      const result = await addItem(product, quantity);
      if (result) {
        setAddedToCart(true);
        success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showError('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-brand-primary font-serif italic">Loading product...</p>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <Package className="w-8 h-8 text-brand-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary">
            We couldn't find this outfit
          </h1>
          <p className="text-brand-text/70 max-w-md mx-auto">
            The product you're looking for might have been removed or the code is incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <PrimaryButton onClick={() => navigate('/shop')} data-testid="button-browse-shop">
            Browse all outfits
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/')} data-testid="button-go-home">
            Go to Home
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <div className="relative">
          <ImageGallery images={images} productName={product.name} />
          <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-sm text-sm py-1.5 px-3 text-brand-primary border-0" data-testid="text-product-code">
            Code: {product.code}
          </Badge>
        </div>

        <div className="flex flex-col space-y-6 lg:pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-primary/60 font-medium tracking-wide uppercase">
                Seen in Reels
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary leading-tight" data-testid="text-product-name">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.floor(averageRating)} size="md" />
                <span className="text-sm font-medium text-brand-text">{averageRating}</span>
              </div>
              <span className="text-sm text-brand-text/50">({reviewCount} reviews)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-brand-primary" data-testid="text-product-price">
                {formatPrice(product.price)}
              </p>
            </div>
            
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600">
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Only {stock} left in stock!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">In Stock</span>
              </div>
            )}
          </div>

          <Separator className="bg-brand-primary/10" />

          <div className="space-y-5">
            <div className="space-y-3">
              <span className="text-sm font-medium text-brand-primary">Color</span>
              <div className="flex items-center gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2",
                      selectedColor?.name === color.name 
                        ? "ring-2 ring-brand-primary ring-offset-2 scale-110" 
                        : "border-brand-primary/20 hover:scale-105"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                    data-testid={`button-color-${color.name.toLowerCase()}`}
                  />
                ))}
                <span className="text-sm text-brand-text/60 ml-1">
                  {selectedColor ? selectedColor.name : 'Select a color'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-brand-primary">Size</span>
                <SizeGuideDialog />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      "h-11 rounded-md text-sm font-medium border-2 transition-all duration-200",
                      selectedSize === size
                        ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                        : "bg-transparent text-brand-text/80 border-brand-primary/20 hover:border-brand-primary/50 hover:text-brand-primary",
                      sizeError && !selectedSize && "border-red-400 animate-pulse",
                      isOutOfStock && "opacity-50 cursor-not-allowed"
                    )}
                    data-testid={`button-size-${size.toLowerCase()}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && !selectedSize && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Please select a size
                </p>
              )}
            </div>

            <QuantitySelector 
              quantity={quantity} 
              setQuantity={setQuantity} 
              maxStock={Math.min(stock, 10)} 
              disabled={isOutOfStock}
            />
          </div>

          <div className="space-y-3 pt-2">
            <PrimaryButton 
              onClick={handleAddToCart} 
              className="w-full text-base py-4"
              disabled={addingToCart || cartLoading || isOutOfStock}
              data-testid="button-add-to-cart"
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </span>
              ) : addedToCart ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </span>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : !isAuthenticated ? (
                'Log in to Add to Cart'
              ) : (
                `Add to Cart - ${formatPrice(parseFloat(product.price) * quantity)}`
              )}
            </PrimaryButton>
            
            <div className="flex gap-3">
              <SecondaryButton 
                onClick={() => navigate('/cart')} 
                className="flex-1 text-sm py-3"
                data-testid="button-view-cart"
              >
                View Cart
              </SecondaryButton>
              <button
                className="w-12 h-12 rounded-lg border border-brand-primary/20 flex items-center justify-center hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors"
                aria-label="Add to wishlist"
                data-testid="button-wishlist"
              >
                <Heart className="w-5 h-5 text-brand-primary" />
              </button>
              <button
                className="w-12 h-12 rounded-lg border border-brand-primary/20 flex items-center justify-center hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors"
                aria-label="Share product"
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5 text-brand-primary" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-brand-text/70">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>Free shipping on orders over {formatPrice(5000)}</span>
            </div>
            <div className="flex items-start gap-2">
              <RotateCcw className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>30-day easy returns policy</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>Secure checkout guaranteed</span>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>Premium packaging included</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-brand-primary/10 rounded-none gap-0 overflow-x-auto">
          <TabsTrigger 
            value="description" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
            data-testid="tab-description"
          >
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
            data-testid="tab-details"
          >
            Details & Fabric
          </TabsTrigger>
          <TabsTrigger 
            value="care" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
            data-testid="tab-care"
          >
            Care
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
            data-testid="tab-reviews"
          >
            Reviews ({reviewCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6 space-y-4">
          <p className="text-brand-text/80 leading-relaxed">
            {product.description || `The ${product.name} features an elegant silhouette perfect for any occasion. Crafted from premium materials to ensure comfort and style, this piece seamlessly transitions from day to night.`}
          </p>
          <p className="text-brand-text/80 leading-relaxed">
            Designed with attention to detail, this outfit captures the essence of modern fashion while maintaining timeless elegance. Whether you're attending a special event or looking for everyday sophistication, this piece is a versatile addition to your wardrobe.
          </p>
          <div className="pt-4">
            <h4 className="font-medium text-brand-primary mb-2">Style Notes</h4>
            <p className="text-sm text-brand-text/70">
              Pairs beautifully with delicate gold jewelry, strappy heels, or ankle boots for a more casual look. Add a structured clutch to complete your ensemble.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="mt-6 space-y-4">
          <ul className="space-y-2 text-sm text-brand-text/80">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              Premium blend fabric for durability and comfort
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              Fully lined interior for a polished finish
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              Hidden zipper closure for a seamless look
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              Adjustable fit with interior stays
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              Made ethically in Portugal
            </li>
          </ul>
          <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-brand-text/50">Material</span>
              <p className="font-medium">95% Polyester, 5% Spandex</p>
            </div>
            <div>
              <span className="text-brand-text/50">Lining</span>
              <p className="font-medium">100% Polyester</p>
            </div>
            <div>
              <span className="text-brand-text/50">Fit</span>
              <p className="font-medium">Regular fit</p>
            </div>
            <div>
              <span className="text-brand-text/50">Length</span>
              <p className="font-medium">Midi length</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="care" className="mt-6 space-y-4">
          <ul className="space-y-3 text-sm text-brand-text/80">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs shrink-0">1</span>
              Dry clean recommended for best results
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs shrink-0">2</span>
              If hand washing, use cold water and mild detergent
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs shrink-0">3</span>
              Do not bleach or tumble dry
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs shrink-0">4</span>
              Cool iron on reverse if needed
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs shrink-0">5</span>
              Store flat or on a padded hanger
            </li>
          </ul>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-primary/10">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-primary">{averageRating}</p>
                <StarRating rating={Math.floor(averageRating)} size="md" />
                <p className="text-xs text-brand-text/50 mt-1">{reviewCount} reviews</p>
              </div>
            </div>
            <SecondaryButton className="text-sm" data-testid="button-write-review">
              Write a Review
            </SecondaryButton>
          </div>
          
          <div className="space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-brand-primary/10">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
            Complete the Look
          </h2>
          
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[45%] sm:w-[30%] lg:w-auto">
                  <ProductCard
                    name={p.name}
                    price={formatPrice(p.price)}
                    code={p.code}
                    imageUrl={p.imageUrl}
                    onClick={() => navigate(`/product/${p.code}`)}
                    onAddToCart={async () => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      await addItem(p, 1);
                      success('Added to cart');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {relatedLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
