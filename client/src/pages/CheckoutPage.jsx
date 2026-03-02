import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PrimaryButton, SecondaryButton, Badge, Loader } from '@/components/common';
import { 
  CheckCircle, Truck, ShieldCheck, ShoppingBag, MapPin, CreditCard, 
  Package, Clock, ChevronRight, Plus, Check, Tag, X, Home, AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePromo } from '@/context/PromoContext';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import useSEO from '@/hooks/useSEO';

const DELIVERY_OPTIONS = [
  { 
    id: 'standard', 
    name: 'Standard Delivery', 
    description: '4-7 business days',
    price: 49,
    days: { min: 4, max: 7 }
  },
  { 
    id: 'express', 
    name: 'Express Delivery', 
    description: '1-3 business days',
    price: 99,
    days: { min: 1, max: 3 }
  }
];

const PAYMENT_METHODS = [
  { 
    id: 'online', 
    name: 'UPI / Card (Online)', 
    description: 'Pay securely using UPI, Credit/Debit Card',
    icon: CreditCard
  },
  { 
    id: 'cod', 
    name: 'Cash on Delivery', 
    description: 'Pay when you receive your order',
    icon: Package
  }
];


const CheckoutSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Delivery', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="bg-white border border-brand-primary/10 rounded-lg p-4 mb-6" data-testid="checkout-steps">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step.id <= currentStep 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-brand-primary/10 text-brand-primary/50'
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${
                step.id <= currentStep ? 'text-brand-primary' : 'text-brand-text/50'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                step.id < currentStep ? 'bg-brand-primary' : 'bg-brand-primary/10'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const AddressCard = ({ address, selected, onSelect, onEdit }) => (
  <div 
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected 
        ? 'border-brand-primary bg-brand-primary/5' 
        : 'border-brand-primary/10 hover:border-brand-primary/30'
    }`}
    data-testid={`address-card-${address.id}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
          selected ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/30'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-brand-text">{address.name}</span>
            {address.isDefault && (
              <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">Default</Badge>
            )}
          </div>
          <p className="text-sm text-brand-text/70">{address.phone}</p>
          <p className="text-sm text-brand-text/60 mt-1">
            {address.addressLine}, {address.city}, {address.state} - {address.pinCode}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DeliveryOptionCard = ({ option, selected, onSelect, estimatedDate, formatPrice }) => (
  <div 
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected 
        ? 'border-brand-primary bg-brand-primary/5' 
        : 'border-brand-primary/10 hover:border-brand-primary/30'
    }`}
    data-testid={`delivery-option-${option.id}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/30'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-primary" />
            <span className="font-medium text-brand-text">{option.name}</span>
          </div>
          <p className="text-sm text-brand-text/60 mt-0.5">{option.description}</p>
          {estimatedDate && (
            <p className="text-xs text-brand-primary mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Estimated delivery: {estimatedDate}
            </p>
          )}
        </div>
      </div>
      <span className="font-bold text-brand-primary" data-testid={`delivery-price-${option.id}`}>
        {option.price === 0 ? 'Free' : formatPrice(option.price)}
      </span>
    </div>
  </div>
);

const PaymentMethodCard = ({ method, selected, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected 
        ? 'border-brand-primary bg-brand-primary/5' 
        : 'border-brand-primary/10 hover:border-brand-primary/30'
    }`}
    data-testid={`payment-method-${method.id}`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/30'
      }`}>
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex items-center gap-3 flex-1">
        <method.icon className="w-5 h-5 text-brand-primary" />
        <div>
          <span className="font-medium text-brand-text">{method.name}</span>
          <p className="text-sm text-brand-text/60">{method.description}</p>
        </div>
      </div>
    </div>
  </div>
);

const AddressForm = ({ formData, onChange, errors, onSubmit, onCancel, showSaveOption, saveToProfile, onSaveToProfileChange, saving, saveError }) => (
  <div className="space-y-4 bg-brand-beige/30 p-4 rounded-lg border border-brand-primary/10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextInput
        label="Full Name"
        name="name"
        placeholder="e.g. Jane Doe"
        value={formData.name}
        onChange={onChange}
        error={errors.name}
        data-testid="input-address-name"
      />
      <TextInput
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="+91 9876543210"
        value={formData.phone}
        onChange={onChange}
        error={errors.phone}
        data-testid="input-address-phone"
      />
    </div>
    <TextInput
      label="Address Line"
      name="addressLine"
      placeholder="123 Fashion Ave, Apartment 4B"
      value={formData.addressLine}
      onChange={onChange}
      error={errors.addressLine}
      data-testid="input-address-line"
    />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <TextInput
        label="City"
        name="city"
        placeholder="Mumbai"
        value={formData.city}
        onChange={onChange}
        error={errors.city}
        data-testid="input-address-city"
      />
      <TextInput
        label="State"
        name="state"
        placeholder="Maharashtra"
        value={formData.state}
        onChange={onChange}
        error={errors.state}
        data-testid="input-address-state"
      />
      <TextInput
        label="PIN Code"
        name="pinCode"
        placeholder="400001"
        value={formData.pinCode}
        onChange={onChange}
        error={errors.pinCode}
        data-testid="input-address-pincode"
      />
    </div>
    {showSaveOption && (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={saveToProfile}
          onChange={(e) => onSaveToProfileChange(e.target.checked)}
          className="w-4 h-4 rounded border-brand-primary/30 text-brand-primary focus:ring-brand-primary"
          data-testid="checkbox-save-address"
          disabled={saving}
        />
        <span className="text-sm text-brand-text/70">Save this address to my profile</span>
      </label>
    )}
    {saveError && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {saveError}
      </p>
    )}
    <div className="flex gap-3 pt-2">
      {onSubmit && (
        <PrimaryButton onClick={onSubmit} className="flex-1" disabled={saving} data-testid="button-save-address">
          {saving ? 'Saving...' : 'Use This Address'}
        </PrimaryButton>
      )}
      {onCancel && (
        <SecondaryButton onClick={onCancel} disabled={saving} data-testid="button-cancel-address">
          Cancel
        </SecondaryButton>
      )}
    </div>
  </div>
);

const OrderSummaryItem = ({ item, formatPrice }) => (
  <div className="flex gap-3 py-3 border-b border-brand-primary/5 last:border-0" data-testid={`checkout-item-${item.id}`}>
    <div className="w-16 h-20 bg-brand-primary/5 rounded-md overflow-hidden flex-shrink-0">
      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
    </div>
    <div className="flex-grow flex flex-col justify-between py-0.5">
      <div>
        <h4 className="text-sm font-medium text-brand-text line-clamp-1">{item.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="code" className="text-[9px] px-1 h-4">{item.code}</Badge>
          <span className="text-xs text-brand-text/50">Qty: {item.quantity}</span>
        </div>
      </div>
      <p className="text-sm font-bold text-brand-primary" data-testid={`item-total-${item.id}`}>{formatPrice(item.price * item.quantity)}</p>
    </div>
  </div>
);

const PromoCodeSection = ({ promoCode, onApply, onRemove, appliedPromo, promoError, formatPrice }) => {
  const [inputValue, setInputValue] = useState('');
  
  const getPromoDescription = (promo) => {
    if (!promo) return '';
    if (promo.type === 'fixed') {
      return `${formatPrice(promo.value)} off`;
    }
    return promo.description;
  };

  const handleApply = () => {
    if (inputValue.trim()) {
      onApply(inputValue.trim().toUpperCase());
      setInputValue('');
    }
  };

  return (
    <div className="border-t border-brand-primary/10 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-brand-primary" />
        <span className="text-sm font-medium text-brand-text">Promo Code</span>
      </div>
      
      {appliedPromo ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">{appliedPromo.code}</span>
            <span className="text-xs text-green-600">({getPromoDescription(appliedPromo)})</span>
          </div>
          <button 
            onClick={onRemove}
            className="text-green-600 hover:text-green-800"
            data-testid="button-remove-promo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-3 py-2 text-sm border border-brand-primary/20 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
            data-testid="input-promo-code"
          />
          <SecondaryButton onClick={handleApply} className="px-4" data-testid="button-apply-promo">
            Apply
          </SecondaryButton>
        </div>
      )}
      
      {promoError && (
        <p className="text-xs text-red-500 mt-2">{promoError}</p>
      )}
    </div>
  );
};

const MobileStickyBar = ({ total, onPlaceOrder, loading, formatPrice }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-primary/10 p-4 lg:hidden z-50 shadow-lg safe-area-inset-bottom">
    <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
      <div className="flex-shrink-0">
        <p className="text-xs text-brand-text/60">Total Amount</p>
        <p className="text-xl font-bold text-brand-primary" data-testid="mobile-total">{formatPrice(total)}</p>
      </div>
      <PrimaryButton 
        onClick={onPlaceOrder} 
        disabled={loading}
        className="flex-1 max-w-[200px] py-3"
        data-testid="mobile-place-order"
      >
        {loading ? 'Placing...' : 'Place Order'}
      </PrimaryButton>
    </div>
  </div>
);

const OrderConfirmationModal = ({ order, formData, onViewOrder, onBackHome, formatPrice }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300" data-testid="order-confirmation-modal">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-2">Order Placed!</h2>
        <p className="text-brand-text/70 mb-4">
          Thank you for your order. We've sent a confirmation email to your registered email address.
        </p>
        
        <div className="bg-brand-beige/30 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-text/60">Order ID</span>
              <span className="font-medium text-brand-text" data-testid="confirmation-order-id">
                #{order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text/60">Total Amount</span>
              <span className="font-bold text-brand-primary" data-testid="confirmation-total">
                {formatPrice(order?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text/60">Payment</span>
              <span className="font-medium text-brand-text">
                {order?.paymentStatus === 'PENDING' ? 'Cash on Delivery' : 'Paid'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={onViewOrder} className="w-full" data-testid="button-view-order">
            View Order Details
          </PrimaryButton>
          <SecondaryButton onClick={onBackHome} className="w-full" data-testid="button-back-home">
            Back to Home
          </SecondaryButton>
        </div>
      </div>
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, loading: cartLoading, fetchCart } = useCart();
  const { token, user } = useAuth();
  const { appliedPromo, applyPromoCode, removePromo, calculatePricing } = usePromo();
  const { formatPrice } = useCurrency();
  
  useSEO({
    title: 'Checkout',
    description: 'Complete your order at Souba Atelier with our secure checkout. Choose from multiple payment options, add delivery address, and enjoy fast reliable shipping.'
  });
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);
  const [useNewAddressData, setUseNewAddressData] = useState(false);
  
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  
  const [promoError, setPromoError] = useState('');
  
  const [addressFormData, setAddressFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pinCode: ''
  });
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    if (user) {
      setAddressFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) {
        setAddressesLoading(false);
        setShowAddressForm(true);
        return;
      }
      
      setAddressesLoading(true);
      
      try {
        const response = await fetch('/api/addresses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const addresses = await response.json();
          setSavedAddresses(addresses);
          
          const defaultAddress = addresses.find(a => a.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          } else {
            setShowAddressForm(true);
          }
        } else {
          setShowAddressForm(true);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setShowAddressForm(true);
      } finally {
        setAddressesLoading(false);
      }
    };
    
    fetchAddresses();
  }, [token]);

  const selectedDeliveryOption = DELIVERY_OPTIONS.find(o => o.id === selectedDelivery);
  
  const pricing = useMemo(() => {
    return calculatePricing(subtotal);
  }, [calculatePricing, subtotal]);
  
  const deliveryCharge = pricing.shippingCost;
  const discount = pricing.promoDiscount;
  const total = pricing.total;

  const getEstimatedDeliveryDate = (option) => {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    minDate.setDate(today.getDate() + option.days.min);
    maxDate.setDate(today.getDate() + option.days.max);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };
    
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!addressFormData.name.trim()) errors.name = 'Name is required';
    if (!addressFormData.phone.trim()) errors.phone = 'Phone is required';
    else if (addressFormData.phone.replace(/\D/g, '').length < 10) errors.phone = 'Valid phone number required';
    if (!addressFormData.addressLine.trim()) errors.addressLine = 'Address is required';
    if (!addressFormData.city.trim()) errors.city = 'City is required';
    if (!addressFormData.state.trim()) errors.state = 'State is required';
    if (!addressFormData.pinCode.trim()) errors.pinCode = 'PIN code is required';
    else if (addressFormData.pinCode.length < 5) errors.pinCode = 'Valid PIN code required';
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUseNewAddress = async () => {
    if (!validateAddressForm()) return;
    
    setAddressSaveError('');
    
    if (saveToProfile) {
      setAddressSaving(true);
      try {
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addressFormData)
        });
        
        if (response.ok) {
          const newAddress = await response.json();
          setSavedAddresses(prev => [newAddress, ...prev]);
          setSelectedAddressId(newAddress.id);
          setShowAddressForm(false);
          setUseNewAddressData(false);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setAddressSaveError(errorData.message || 'Failed to save address');
        }
      } catch (error) {
        console.error('Error saving address:', error);
        setAddressSaveError('Failed to save address. Please try again.');
      } finally {
        setAddressSaving(false);
      }
    } else {
      setSelectedAddressId(null);
      setUseNewAddressData(true);
      setShowAddressForm(false);
    }
  };

  const handleApplyPromo = (code) => {
    const result = applyPromoCode(code);
    if (result.success) {
      setPromoError('');
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoError('');
  };

  const getShippingData = () => {
    if (selectedAddressId) {
      const address = savedAddresses.find(a => a.id === selectedAddressId);
      if (address) {
        return {
          name: address.name,
          phone: address.phone,
          address: address.addressLine,
          city: address.city,
          state: address.state,
          pinCode: address.pinCode
        };
      }
    }
    return {
      name: addressFormData.name,
      phone: addressFormData.phone,
      address: addressFormData.addressLine,
      city: addressFormData.city,
      state: addressFormData.state,
      pinCode: addressFormData.pinCode
    };
  };

  const validateCheckout = () => {
    const errors = [];
    
    if (cartItems.length === 0) {
      errors.push('Your cart is empty');
      return errors;
    }
    
    if (!selectedAddressId && !useNewAddressData) {
      if (showAddressForm) {
        errors.push('Please confirm your delivery address by clicking "Use This Address"');
      } else {
        errors.push('Please select or add a delivery address');
      }
    }
    
    if (!selectedDelivery) {
      errors.push('Please select a delivery method');
    }
    
    if (!selectedPayment) {
      errors.push('Please select a payment method');
    }
    
    return errors;
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validateCheckout();
    
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join('. '));
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const shipping = getShippingData();
      
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            price: String(item.price),
          },
        })),
        shipping,
        deliveryMethod: selectedDelivery,
        paymentMethod: selectedPayment,
        promoCode: appliedPromo?.code || null,
        deliveryCharge: deliveryCharge.toFixed(2),
        discount: discount.toFixed(2)
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      setOrderDetails(data.order);
      clearCart();
      removePromo();
      setOrderPlaced(true);
      
      // TODO: If paymentMethod is 'online', redirect to payment gateway here
      // Example: 
      // if (selectedPayment === 'online') {
      //   const paymentResponse = await fetch('/api/checkout/create-payment', { ... });
      //   window.location.href = paymentResponse.paymentUrl;
      // }
      
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = useMemo(() => {
    if (selectedAddressId || !showAddressForm) {
      if (selectedDelivery && selectedPayment) {
        return 3;
      }
      return 2;
    }
    return 1;
  }, [selectedAddressId, showAddressForm, selectedDelivery, selectedPayment]);

  if (orderPlaced) {
    return (
      <OrderConfirmationModal
        order={orderDetails}
        formData={getShippingData()}
        onViewOrder={() => navigate(`/profile?tab=orders`)}
        onBackHome={() => navigate('/')}
        formatPrice={formatPrice}
      />
    );
  }

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="checkout-loading">
        <Loader size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-6 animate-in fade-in duration-500" data-testid="checkout-empty">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-brand-primary">
            Your Cart is Empty
          </h1>
          <p className="text-brand-text/60">
            Add some items to your cart before checkout
          </p>
        </div>
        <PrimaryButton onClick={() => navigate('/shop')} data-testid="button-browse-products">
          Browse Products
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-32 lg:pb-10 animate-in fade-in duration-500" data-testid="checkout-page">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-6">
        Checkout
      </h1>

      <CheckoutSteps currentStep={currentStep} />

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start gap-3" data-testid="checkout-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Unable to place order</p>
            <p className="text-sm mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Address Section */}
          <div className="bg-white p-6 rounded-lg border border-brand-primary/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-brand-primary/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-primary">Delivery Address</h2>
            </div>

            {useNewAddressData && !showAddressForm && !selectedAddressId && (
              <div className="space-y-3 mb-4">
                <div className="p-4 rounded-lg border-2 border-brand-primary bg-brand-primary/5" data-testid="new-address-confirmed">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-primary bg-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-brand-text">{addressFormData.name}</span>
                        <button
                          onClick={() => {
                            setShowAddressForm(true);
                            setUseNewAddressData(false);
                          }}
                          className="text-xs text-brand-primary hover:underline"
                          data-testid="button-edit-new-address"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-brand-text/70">{addressFormData.phone}</p>
                      <p className="text-sm text-brand-text/60 mt-1">
                        {addressFormData.addressLine}, {addressFormData.city}, {addressFormData.state} - {addressFormData.pinCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {savedAddresses.length > 0 && !showAddressForm && !useNewAddressData && (
              <div className="space-y-3 mb-4">
                {savedAddresses.map(address => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    selected={selectedAddressId === address.id}
                    onSelect={() => setSelectedAddressId(address.id)}
                  />
                ))}
              </div>
            )}

            {!showAddressForm && (
              <button
                onClick={() => {
                  setShowAddressForm(true);
                  setSelectedAddressId(null);
                  setUseNewAddressData(false);
                }}
                className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 text-sm font-medium mt-2"
                data-testid="button-add-new-address"
              >
                <Plus className="w-4 h-4" />
                {useNewAddressData ? 'Change address' : 'Add new address'}
              </button>
            )}

            {showAddressForm && (
              <AddressForm
                formData={addressFormData}
                onChange={handleAddressChange}
                errors={addressErrors}
                onSubmit={handleUseNewAddress}
                onCancel={savedAddresses.length > 0 ? () => {
                  setShowAddressForm(false);
                  setAddressSaveError('');
                  if (savedAddresses.length > 0) {
                    setSelectedAddressId(savedAddresses[0].id);
                  }
                } : null}
                showSaveOption={true}
                saveToProfile={saveToProfile}
                onSaveToProfileChange={setSaveToProfile}
                saving={addressSaving}
                saveError={addressSaveError}
              />
            )}
          </div>

          {/* Delivery Method Section */}
          <div className="bg-white p-6 rounded-lg border border-brand-primary/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-brand-primary/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-primary">Delivery Method</h2>
            </div>

            <div className="space-y-3">
              {DELIVERY_OPTIONS.map(option => (
                <DeliveryOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedDelivery === option.id}
                  onSelect={() => setSelectedDelivery(option.id)}
                  estimatedDate={getEstimatedDeliveryDate(option)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white p-6 rounded-lg border border-brand-primary/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-brand-primary/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-primary">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {PAYMENT_METHODS.map(method => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={selectedPayment === method.id}
                  onSelect={() => setSelectedPayment(method.id)}
                />
              ))}
            </div>

            {selectedPayment === 'online' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  You'll be redirected to a secure payment page after reviewing your order.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-lg border border-brand-primary/10 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-serif font-bold text-xl text-brand-primary mb-6">
              Order Summary
            </h2>

            <div className="space-y-1 mb-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-primary/10">
              {cartItems.map((item) => (
                <OrderSummaryItem key={item.id} item={item} formatPrice={formatPrice} />
              ))}
            </div>

            <PromoCodeSection
              onApply={handleApplyPromo}
              onRemove={handleRemovePromo}
              appliedPromo={appliedPromo}
              promoError={promoError}
              formatPrice={formatPrice}
            />

            <div className="space-y-3 text-sm text-brand-text/80 border-t border-brand-primary/10 pt-4 mt-4">
              <div className="flex justify-between">
                <span>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
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

            <div className="space-y-4 pt-4 hidden lg:block">
              <PrimaryButton 
                onClick={handlePlaceOrder}
                className="w-full py-4 text-base shadow-md"
                disabled={submitting || cartLoading}
                data-testid="button-place-order"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </PrimaryButton>
              
              <p className="text-xs text-center text-brand-text/50">
                By placing this order you agree to our{' '}
                <a href="/terms" className="underline hover:text-brand-primary">Terms</a> &{' '}
                <a href="/returns" className="underline hover:text-brand-primary">Return Policy</a>
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs text-brand-text/50">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure SSL Encrypted Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileStickyBar 
        total={total} 
        onPlaceOrder={handlePlaceOrder} 
        loading={submitting}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default CheckoutPage;
