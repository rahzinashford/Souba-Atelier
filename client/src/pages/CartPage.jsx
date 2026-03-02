import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton, Badge } from '@/components/common';
import { Progress } from '@/components/ui/progress';
import useSEO from '@/hooks/useSEO';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Loader2, 
  Heart, 
  Sparkles, 
  Truck, 
  AlertTriangle,
  Tag,
  Gift,
  ArrowRight,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { usePromo } from '@/context/PromoContext';
import { useCurrency } from '@/context/CurrencyContext';
import { wishlistAPI } from '@/lib/api';
import { toast } from 'sonner';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    subtotal, 
    updateQuantity, 
    removeItem, 
    loading, 
    error, 
    isAuthenticated 
  } = useCart();
  
  useSEO({
    title: 'Your Cart',
    description: 'Review items in your Souba Atelier shopping cart. Apply promo codes, update quantities, save to wishlist, and proceed to secure checkout with fast delivery.'
  });
  
  const { 
    appliedPromo, 
    applyPromoCode, 
    removePromo, 
    calculatePricing,
    FREE_SHIPPING_THRESHOLD 
  } = usePromo();
  
  const { formatPrice } = useCurrency();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [movingToWishlist, setMovingToWishlist] = useState({});
  const [updatingItem, setUpdatingItem] = useState({});

  const totalSavings = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const originalPrice = item.product?.originalPrice || item.price;
      const savings = (originalPrice - item.price) * item.quantity;
      return sum + Math.max(0, savings);
    }, 0);
  }, [cartItems]);

  const pricing = useMemo(() => {
    return calculatePricing(subtotal);
  }, [calculatePricing, subtotal]);

  const formatPromoMessage = (result) => {
    if (!result.success) return result.message;
    const promo = result.promo;
    if (promo?.type === 'fixed') {
      return `${formatPrice(promo.value)} off applied!`;
    }
    return result.message;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = applyPromoCode(promoCode);
    if (result.success) {
      toast.success(formatPromoMessage(result));
      setPromoCode('');
    } else {
      toast.error(result.message);
    }
    
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoCode('');
    toast.info('Promo code removed.');
  };

  const handleMoveToWishlist = async (item) => {
    setMovingToWishlist(prev => ({ ...prev, [item.id]: true }));
    
    try {
      await wishlistAPI.add(item.productId);
      await removeItem(item.id);
      toast.success(`${item.name} moved to wishlist!`);
    } catch (err) {
      console.error('Error moving to wishlist:', err);
      toast.error('Failed to move item to wishlist. Please try again.');
    } finally {
      setMovingToWishlist(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    const maxStock = item.product?.stock || 100;

    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} available in stock.`);
      return;
    }

    if (newQuantity < 1) return;

    setUpdatingItem(prev => ({ ...prev, [itemId]: true }));
    await updateQuantity(itemId, change);
    setUpdatingItem(prev => ({ ...prev, [itemId]: false }));
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItem(prev => ({ ...prev, [itemId]: true }));
    await removeItem(itemId);
    setUpdatingItem(prev => ({ ...prev, [itemId]: false }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-8 animate-in fade-in duration-500" data-testid="cart-login-prompt">
        <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/40 mb-2">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-3xl font-serif font-bold text-brand-primary">
            Sign in to view your cart
          </h1>
          <p className="text-brand-text/70">
            Please log in to manage your cart and checkout.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <PrimaryButton onClick={() => navigate('/login')} data-testid="button-login">
            Log In
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/register')} data-testid="button-register">
            Create Account
          </SecondaryButton>
        </div>
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center" data-testid="cart-loading">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-brand-text/60 mt-4">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 space-y-8 animate-in fade-in duration-500" data-testid="cart-empty">
        <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/30 mb-2">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-serif font-bold text-brand-primary">
            Your cart is empty
          </h1>
          <p className="text-brand-text/70 text-lg">
            Start by finding your outfit from Reels or browsing the shop.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <PrimaryButton 
            onClick={() => navigate('/shop')} 
            className="flex-1 py-4"
            data-testid="button-browse"
          >
            <Gift className="w-4 h-4 mr-2" />
            Browse outfits
          </PrimaryButton>
          <SecondaryButton 
            onClick={() => navigate('/')} 
            className="flex-1 py-4"
            data-testid="button-search-code"
          >
            <Search className="w-4 h-4 mr-2" />
            Search by code
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-32 lg:pb-10 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary" data-testid="text-cart-title">
          Your cart
        </h1>
        <p className="text-brand-text/60 mt-1">
          Review your outfits before checking out.
        </p>
      </div>

      {subtotal > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 rounded-lg border border-brand-primary/10" data-testid="free-shipping-progress">
          {pricing.hasFreeShipping ? (
            <div className="flex items-center gap-2 text-green-700">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">
                {pricing.isFreeShipPromo ? "Free shipping with promo!" : "You've unlocked free shipping!"}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2 text-brand-text/80">
                  <Truck className="w-4 h-4" />
                  <span>Add <span className="font-semibold text-brand-primary">{formatPrice(pricing.amountToFreeShipping)}</span> more for free shipping</span>
                </div>
                <span className="text-brand-text/60">{pricing.freeShippingProgress.toFixed(0)}%</span>
              </div>
              <Progress value={pricing.freeShippingProgress} className="h-2" />
            </>
          )}
        </div>
      )}

      {totalSavings > 0 && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2" data-testid="savings-indicator">
          <Tag className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            You saved {formatPrice(totalSavings)} on this cart! 🎉
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const stock = item.product?.stock ?? 100;
            const isLowStock = stock > 0 && stock < 5;
            const isMaxQuantity = item.quantity >= stock;
            const isUpdating = updatingItem[item.id];
            const isMoving = movingToWishlist[item.id];

            return (
              <div 
                key={item.id}
                className={cn(
                  "flex gap-4 p-4 bg-white rounded-lg border border-brand-primary/10 shadow-sm transition-opacity",
                  (isUpdating || isMoving) && "opacity-60"
                )}
                data-testid={`cart-item-${item.id}`}
              >
                <Link 
                  to={`/product/${item.code}`}
                  className="relative w-20 sm:w-24 aspect-[3/4] rounded-md overflow-hidden bg-brand-primary/5 flex-shrink-0 hover:opacity-90 transition-opacity"
                  data-testid={`link-product-${item.id}`}
                >
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-primary/20 text-xs">
                      No Image
                    </div>
                  )}
                </Link>

                <div className="flex flex-col flex-grow min-w-0 gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/product/${item.code}`}
                        className="block"
                        data-testid={`link-product-name-${item.id}`}
                      >
                        <h3 className="font-medium text-brand-text hover:text-brand-primary transition-colors truncate">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="code" className="text-[10px] px-1.5 py-0 h-5">
                          {item.code}
                        </Badge>
                        {item.product?.category && (
                          <span className="text-xs text-brand-text/50">
                            {item.product.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-text/60 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-serif font-bold text-lg text-brand-primary flex-shrink-0" data-testid={`text-line-total-${item.id}`}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {isLowStock && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs" data-testid={`low-stock-warning-${item.id}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Only {stock} left in stock!</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 gap-2 flex-wrap">
                    <div className="flex items-center border border-brand-primary/20 rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-2 sm:p-2.5 hover:bg-brand-primary/5 text-brand-primary transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1 || isUpdating}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-sm" data-testid={`text-quantity-${item.id}`}>
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-2 sm:p-2.5 hover:bg-brand-primary/5 text-brand-primary transition-colors disabled:opacity-40"
                        disabled={isMaxQuantity || isUpdating}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {isMaxQuantity && (
                      <span className="text-xs text-brand-text/50">Max available</span>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        disabled={isMoving || isUpdating}
                        className="text-xs text-brand-text/60 hover:text-brand-primary flex items-center gap-1.5 transition-colors p-1.5 sm:px-2 sm:py-1 disabled:opacity-40"
                        data-testid={`button-wishlist-${item.id}`}
                      >
                        {isMoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Wishlist</span>
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="text-xs text-destructive/70 hover:text-destructive flex items-center gap-1.5 transition-colors p-1.5 sm:px-2 sm:py-1 disabled:opacity-40"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-lg border border-brand-primary/10 shadow-sm space-y-5 lg:sticky lg:top-24">
            <h2 className="font-serif font-bold text-xl text-brand-primary">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-brand-text/80">
              <div className="flex justify-between">
                <span>Items ({cartCount})</span>
                <span data-testid="text-items-total">{formatPrice(subtotal)}</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Promo ({appliedPromo.code})
                  </span>
                  <span data-testid="text-promo-discount">
                    {appliedPromo.type === 'freeship' ? 'Free Shipping' : `-${formatPrice(pricing.promoDiscount)}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping (Standard)</span>
                <span className={cn(pricing.shippingCost === 0 && "text-green-600 font-medium")} data-testid="text-shipping">
                  {pricing.shippingCost === 0 ? 'Free' : formatPrice(pricing.shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-brand-text/60">
                <span>Est. Tax (5%)</span>
                <span data-testid="text-tax">{formatPrice(pricing.estimatedTax)}</span>
              </div>

              <div className="border-t border-brand-primary/10 pt-3 flex justify-between font-bold text-lg text-brand-primary">
                <span>Estimated Total</span>
                <span data-testid="text-total">{formatPrice(pricing.total)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {!appliedPromo ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    disabled={promoLoading}
                    className="flex-1 px-3 py-2.5 rounded-md border border-brand-primary/20 bg-white/50 text-brand-text placeholder:text-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-all duration-200 text-sm"
                    data-testid="input-promo-code"
                  />
                  <SecondaryButton 
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2.5 h-auto"
                    data-testid="button-apply-promo"
                  >
                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </SecondaryButton>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 p-2.5 rounded-md border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">{appliedPromo.code} applied</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-xs text-green-600 hover:text-green-800 underline"
                    data-testid="button-remove-promo"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="text-xs text-brand-text/50">
                Try: WELCOME10, FLAT100, FLAT50, or FREESHIP
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <PrimaryButton 
                onClick={() => navigate('/checkout')} 
                className="w-full py-4 text-base flex items-center justify-center gap-2"
                data-testid="button-checkout"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </PrimaryButton>
              <SecondaryButton 
                onClick={() => navigate('/shop')} 
                className="w-full"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </SecondaryButton>
            </div>
            
            <div className="text-xs text-center text-brand-text/50 pt-2">
              Secure checkout powered by Stripe
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-brand-primary/10 p-4 shadow-lg z-50 safe-area-inset-bottom">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <p className="text-xs text-brand-text/60">Estimated Total</p>
              <p className="font-serif font-bold text-xl text-brand-primary" data-testid="text-mobile-total">
                {formatPrice(pricing.total)}
              </p>
            </div>
            <PrimaryButton 
              onClick={() => navigate('/checkout')} 
              className="flex-1 max-w-[200px] py-3 text-base"
              data-testid="button-checkout-mobile"
            >
              Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </div>
          {!pricing.hasFreeShipping && (
            <p className="text-xs text-center text-brand-text/60 mt-2">
              Add {formatPrice(pricing.amountToFreeShipping)} more for free shipping
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
