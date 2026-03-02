import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CURRENCY_CONFIG = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', position: 'before' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', position: 'before' },
  AED: { symbol: 'AED', code: 'AED', name: 'UAE Dirham', position: 'before' },
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.currency && CURRENCY_CONFIG[data.currency]) {
          setCurrency(data.currency);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

const normalizePrice = (price) => {
  if (price === null || price === undefined) return null;

  if (typeof price === 'object' && price !== null) {
    if ('value' in price) return Number(price.value);
  }

  const num = Number(price);
  return Number.isFinite(num) ? num : null;
};

  const formatPrice = useCallback((price) => {
  const numPrice = normalizePrice(price);
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  if (numPrice === null) return `${config.symbol}0`;

  const formatted = numPrice.toLocaleString('en-IN', {
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${config.symbol}${formatted}`;
}, [currency]);

const formatPriceCompact = useCallback((price) => {
  const numPrice = normalizePrice(price);
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  if (numPrice === null) return `${config.symbol}0`;

  const formatted = numPrice.toFixed(currency === 'INR' ? 0 : 2);
  return `${config.symbol}${formatted}`;
}, [currency]);


  const getCurrencySymbol = useCallback(() => {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
    return config.symbol;
  }, [currency]);

  const updateCurrency = useCallback((newCurrency) => {
    if (CURRENCY_CONFIG[newCurrency]) {
      setCurrency(newCurrency);
    }
  }, []);

  const value = {
    currency,
    currencyConfig: CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR,
    formatPrice,
    formatPriceCompact,
    getCurrencySymbol,
    updateCurrency,
    loading,
    CURRENCY_OPTIONS: Object.values(CURRENCY_CONFIG),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
