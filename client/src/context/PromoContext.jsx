import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

const PromoContext = createContext(null);

const FREE_SHIPPING_THRESHOLD = 2000;
const DEMO_TAX_RATE = 0.05;
const DEFAULT_SHIPPING_COST = 49;

const PROMO_CODES = {
  'WELCOME10': { type: 'percentage', value: 10, description: '10% off' },
  'FLAT100': { type: 'fixed', value: 100, description: '100 off' },
  'FLAT50': { type: 'fixed', value: 50, description: '50 off' },
  'FREESHIP': { type: 'freeship', value: 0, description: 'Free shipping' }
};

export const usePromo = () => {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
};

export const PromoProvider = ({ children }) => {
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = sessionStorage.getItem('appliedPromo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (appliedPromo) {
      sessionStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
    } else {
      sessionStorage.removeItem('appliedPromo');
    }
  }, [appliedPromo]);

  const applyPromoCode = useCallback((code) => {
    const upperCode = code.toUpperCase().trim();
    const promo = PROMO_CODES[upperCode];
    
    if (promo) {
      const appliedPromoData = { code: upperCode, ...promo };
      setAppliedPromo(appliedPromoData);
      return { success: true, message: `${promo.description} applied!`, promo: appliedPromoData };
    }
    
    return { success: false, message: 'Invalid promo code. Please try again.' };
  }, []);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  const calculatePricing = useCallback((subtotal, deliveryOption = null) => {
    let promoDiscount = 0;
    let isFreeShipping = false;

    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        promoDiscount = subtotal * (appliedPromo.value / 100);
      } else if (appliedPromo.type === 'fixed') {
        promoDiscount = appliedPromo.value;
      } else if (appliedPromo.type === 'freeship') {
        isFreeShipping = true;
      }
    }

    promoDiscount = Math.min(promoDiscount, subtotal);
    const effectiveSubtotal = Math.max(subtotal - promoDiscount, 0);

    let shippingCost = 0;
    if (deliveryOption) {
      shippingCost = isFreeShipping ? 0 : deliveryOption.price;
    } else {
      if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShipping) {
        shippingCost = 0;
      } else if (subtotal > 0) {
        shippingCost = DEFAULT_SHIPPING_COST;
      }
    }

    const estimatedTax = effectiveSubtotal * DEMO_TAX_RATE;
    const total = Math.max(effectiveSubtotal + shippingCost + estimatedTax, 0);

    const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

    return {
      subtotal,
      promoDiscount,
      effectiveSubtotal,
      shippingCost,
      estimatedTax,
      total,
      freeShippingProgress,
      amountToFreeShipping,
      hasFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShipping,
      isFreeShipPromo: isFreeShipping
    };
  }, [appliedPromo]);

  const value = {
    appliedPromo,
    applyPromoCode,
    removePromo,
    calculatePricing,
    FREE_SHIPPING_THRESHOLD,
    DEMO_TAX_RATE,
    PROMO_CODES
  };

  return (
    <PromoContext.Provider value={value}>
      {children}
    </PromoContext.Provider>
  );
};

export default PromoContext;
