import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/common';
import { useAuthOptional } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastSearchArea, setPastSearchArea] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, loading } = useAuthOptional();
  const { cartCount } = useCart();

  const isHomePage = location.pathname === '/';
  const isShopPage = location.pathname === '/shop';
  const isSearchPage = location.pathname === '/search';
  const hasOwnSearch = isHomePage || isShopPage || isSearchPage;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setPastSearchArea(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSearchIcon = isHomePage ? pastSearchArea : !hasOwnSearch;

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
  ];

  const handleSearch = (value) => {
    if (value && value.trim()) {
      navigate(`/search?code=${encodeURIComponent(value.trim())}`);
      setSearchValue('');
      setSearchOpen(false);
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full border-b",
          scrolled 
            ? "bg-brand-beige/90 backdrop-blur-md border-brand-primary/10 py-2 shadow-sm" 
            : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Left Section - Mobile Menu & Desktop Nav */}
            <div className="flex items-center w-[40px] md:w-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-brand-primary p-2 -ml-2 hover:bg-brand-primary/5 rounded-full transition-colors"
                data-testid="button-menu-toggle"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:text-brand-primary relative group",
                        isActive ? "text-brand-primary" : "text-brand-text/60"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.name}
                        <span className={cn(
                          "absolute -bottom-1 left-0 w-full h-px bg-brand-primary transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100",
                          isActive && "scale-x-100"
                        )} />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Logo (Center) */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary tracking-tighter hover:opacity-90 transition-opacity whitespace-nowrap">
                Souba Atelier
              </Link>
            </div>

            {/* Icons (Right) */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Search Trigger - conditional based on page and scroll */}
              {showSearchIcon && (
                <button 
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-all"
                  data-testid="button-search-toggle"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Desktop User Greeting & Auth Actions */}
              {loading ? (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-16 h-5 bg-brand-primary/10 rounded animate-pulse" />
                </div>
              ) : user ? (
                <div className="hidden md:flex items-center space-x-2">
                  {/* User Greeting */}
                  <span className="text-sm text-brand-text/70 font-medium" data-testid="desktop-user-greeting">
                    Hi, {user.name?.split(' ')[0] || 'User'}
                  </span>
                  
                  {/* Admin Link */}
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="p-2 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-all"
                      title="Admin Dashboard"
                      data-testid="desktop-link-admin"
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                  )}
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-all"
                    title="Logout"
                    data-testid="desktop-button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden md:flex p-2 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-all"
                  data-testid="desktop-link-login"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
              
              <Link to="/cart" className="p-2 text-brand-primary/80 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-all relative group" data-testid="link-cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-brand-primary text-white text-[10px] font-medium flex items-center justify-center rounded-full ring-2 ring-brand-beige" data-testid="cart-count">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Overlay - only when search icon is visible */}
        {showSearchIcon && (
          <div className={cn(
            "absolute top-full left-0 w-full bg-brand-beige/95 backdrop-blur-md border-b border-brand-primary/10 transition-all duration-300 overflow-hidden",
            searchOpen ? "max-h-24 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}>
            <div className="max-w-2xl mx-auto px-4">
              <SearchInput 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSubmit={handleSearch}
                placeholder="Enter Reel Code (e.g. DRS101)..."
                className="bg-transparent border-b border-brand-primary/30 focus-within:border-brand-primary rounded-none px-0"
                autoFocus={searchOpen}
              />
            </div>
          </div>
        )}

      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-[280px] bg-brand-beige z-50 transition-transform duration-300 ease-in-out shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-brand-primary/10">
          <span className="text-xl font-serif font-bold text-brand-primary">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-brand-primary p-2 hover:bg-brand-primary/5 rounded-full transition-colors"
            data-testid="button-close-menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col p-6 space-y-6">
          {/* User Greeting */}
          {loading ? (
            <div className="pb-4 border-b border-brand-primary/10">
              <div className="w-20 h-4 bg-brand-primary/10 rounded animate-pulse mb-2" />
              <div className="w-32 h-6 bg-brand-primary/10 rounded animate-pulse" />
            </div>
          ) : user && (
            <div className="pb-4 border-b border-brand-primary/10">
              <p className="text-sm text-brand-text/60">Welcome back,</p>
              <p className="text-lg font-serif font-medium text-brand-primary" data-testid="text-user-greeting">
                {user.name || user.email}
              </p>
            </div>
          )}

          <div className="pb-6 border-b border-brand-primary/10">
            <SearchInput 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSubmit={handleSearch}
              placeholder="Search by Code..."
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "text-2xl font-serif font-medium transition-colors",
                    isActive ? "text-brand-primary" : "text-brand-text/60 hover:text-brand-primary"
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
            <NavLink to="/contact" className="text-2xl font-serif font-medium text-brand-text/60 hover:text-brand-primary transition-colors">
              Contact
            </NavLink>

            {/* Auth Links */}
            {loading ? (
              <div className="space-y-4">
                <div className="w-20 h-8 bg-brand-primary/10 rounded animate-pulse" />
                <div className="w-16 h-8 bg-brand-primary/10 rounded animate-pulse" />
              </div>
            ) : user ? (
              <>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) =>
                    cn(
                      "text-2xl font-serif font-medium transition-colors",
                      isActive ? "text-brand-primary" : "text-brand-text/60 hover:text-brand-primary"
                    )
                  }
                  data-testid="mobile-link-profile"
                >
                  Profile
                </NavLink>
                
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) =>
                      cn(
                        "text-2xl font-serif font-medium transition-colors flex items-center gap-2",
                        isActive ? "text-brand-primary" : "text-brand-text/60 hover:text-brand-primary"
                      )
                    }
                    data-testid="mobile-link-admin"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </NavLink>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-2xl font-serif font-medium text-brand-text/60 hover:text-brand-primary transition-colors text-left flex items-center gap-2"
                  data-testid="mobile-button-logout"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) =>
                    cn(
                      "text-2xl font-serif font-medium transition-colors",
                      isActive ? "text-brand-primary" : "text-brand-text/60 hover:text-brand-primary"
                    )
                  }
                  data-testid="mobile-link-login"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) =>
                    cn(
                      "text-2xl font-serif font-medium transition-colors",
                      isActive ? "text-brand-primary" : "text-brand-text/60 hover:text-brand-primary"
                    )
                  }
                  data-testid="mobile-link-register"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
