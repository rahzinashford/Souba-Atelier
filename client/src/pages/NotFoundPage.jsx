import React from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import { AlertCircle } from 'lucide-react';
import useSEO from '@/hooks/useSEO';

const NotFoundPage = () => {
  useSEO({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist. Return to Souba Atelier to browse our aesthetic clothing collection.'
  });

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-8">
      <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/40 mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-primary">404</h1>
        <h2 className="text-2xl font-medium text-brand-primary/80">Page not found</h2>
        <p className="text-brand-text/60">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link to="/">
          <PrimaryButton className="w-full sm:w-auto">
            Go to Home
          </PrimaryButton>
        </Link>
        <Link to="/shop">
          <SecondaryButton className="w-full sm:w-auto">
            Browse Outfits
          </SecondaryButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
