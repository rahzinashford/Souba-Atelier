import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import PrimaryButton from '@/components/common/PrimaryButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import useSEO from '@/hooks/useSEO';

const getPasswordStrength = (password) => {
  if (!password) return { strength: '', color: '', width: '0%' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
  if (score <= 3) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
  return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
};

const validateEmail = (email) => {
  if (!email) return 'Please enter your email';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  return '';
};

const validateName = (name) => {
  if (!name) return 'Please enter your name';
  if (name.length < 3) return 'Name must be at least 3 characters';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Please enter a password';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
};

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState({ 
    name: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });

  const { register, user, loading } = useAuth();
  const { success } = useAlert();
  const navigate = useNavigate();

  const location = useLocation();
  const redirectTo = location.state?.redirectTo || '/profile';
  
  useSEO({
    title: 'Create Account',
    description: 'Join Souba Atelier to shop aesthetic clothing, track orders, save your favorites, and enjoy a seamless shopping experience.'
  });

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const nameError = touched.name ? validateName(formData.name) : '';
  const emailError = touched.email ? validateEmail(formData.email) : '';
  const passwordError = touched.password ? validatePassword(formData.password) : '';
  const confirmPasswordError = touched.confirmPassword 
    ? validateConfirmPassword(formData.password, formData.confirmPassword) 
    : '';
  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (nameErr || emailErr || passwordErr || confirmErr) {
      setFormError('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      success('Account created successfully! Please login.');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      if (message.toLowerCase().includes('email') && message.toLowerCase().includes('exist')) {
        setFormError('That email is already registered');
      } else {
        setFormError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-[#f9ecdd]/50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-brand-primary/10 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="inline-block mb-4" data-testid="link-home">
              <h2 className="text-2xl font-serif font-bold text-brand-primary tracking-wide">
                Souba Atelier
              </h2>
            </Link>
            <CardTitle className="text-2xl font-serif text-brand-primary">
              Create your account
            </CardTitle>
            <CardDescription className="text-brand-text/60 italic">
              Join us to save outfits & track your orders
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription data-testid="text-error">{formError}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-primary/90 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    disabled={isLoading}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-md border bg-white/50 text-brand-text placeholder:text-brand-text/40",
                      "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
                      "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      nameError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-brand-primary/20"
                    )}
                    data-testid="input-name"
                  />
                </div>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-500 ml-1"
                    data-testid="text-name-error"
                  >
                    {nameError}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-primary/90 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40" />
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    disabled={isLoading}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-md border bg-white/50 text-brand-text placeholder:text-brand-text/40",
                      "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
                      "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      emailError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-brand-primary/20"
                    )}
                    data-testid="input-email"
                  />
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-500 ml-1"
                    data-testid="text-email-error"
                  >
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-primary/90 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    disabled={isLoading}
                    className={cn(
                      "w-full pl-10 pr-12 py-3 rounded-md border bg-white/50 text-brand-text placeholder:text-brand-text/40",
                      "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
                      "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      passwordError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-brand-primary/20"
                    )}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-text/40 hover:text-brand-text/70 transition-colors"
                    tabIndex={-1}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-brand-text/50 ml-1">
                  At least 8 characters, include letters & numbers
                </p>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-500 ml-1"
                    data-testid="text-password-error"
                  >
                    {passwordError}
                  </motion.p>
                )}

                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-300", passwordStrength.color)}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        passwordStrength.strength === 'Weak' && "text-red-500",
                        passwordStrength.strength === 'Medium' && "text-yellow-600",
                        passwordStrength.strength === 'Strong' && "text-green-600"
                      )} data-testid="text-password-strength">
                        {passwordStrength.strength}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-primary/90 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    disabled={isLoading}
                    className={cn(
                      "w-full pl-10 pr-12 py-3 rounded-md border bg-white/50 text-brand-text placeholder:text-brand-text/40",
                      "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50",
                      "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      confirmPasswordError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-brand-primary/20"
                    )}
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-text/40 hover:text-brand-text/70 transition-colors"
                    tabIndex={-1}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-500 ml-1"
                    data-testid="text-confirm-password-error"
                  >
                    {confirmPasswordError}
                  </motion.p>
                )}
              </div>

              <div className="pt-3">
                <PrimaryButton 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 py-3.5" 
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </PrimaryButton>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-brand-text/50">or</span>
                </div>
              </div>

              {/* TODO: Wire up social login when ready */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border border-brand-primary/20 bg-white/50 text-brand-text/50 cursor-not-allowed transition-all"
                  data-testid="button-google-register"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md border border-brand-primary/20 bg-white/50 text-brand-text/50 cursor-not-allowed transition-all"
                  data-testid="button-apple-register"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="text-center text-sm text-brand-text/70 pt-4">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-brand-primary font-medium hover:underline transition-colors" 
                  data-testid="link-login"
                >
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
