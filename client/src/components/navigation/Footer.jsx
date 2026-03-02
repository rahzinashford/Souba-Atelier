import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-primary text-brand-beige pt-20 pb-10 border-t border-brand-primary/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="text-3xl font-serif font-bold tracking-tighter block">
              Souba Atelier
            </Link>
            <p className="text-brand-beige/60 font-light text-sm leading-relaxed max-w-xs">
              Bridging the gap between digital inspiration and your wardrobe. 
              Curated styles for the modern muse.
            </p>
            <div className="pt-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:text-white transition-colors opacity-80 hover:opacity-100"
              >
                <Instagram className="h-4 w-4" />
                Follow our Reels
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 md:col-start-6 space-y-6">
            <h4 className="text-sm font-bold tracking-widest uppercase opacity-40">Explore</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Shop All</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Search by Code</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Our Story</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold tracking-widest uppercase opacity-40">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Contact Us</Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Shipping</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Returns</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-sm font-bold tracking-widest uppercase opacity-40">Newsletter</h4>
            <p className="text-brand-beige/60 font-light text-sm">
              Subscribe for exclusive drops and early access to Reel codes.
            </p>
            <div className="flex border-b border-brand-beige/30 pb-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent w-full outline-none text-sm placeholder:text-brand-beige/30"
              />
              <button className="text-brand-beige hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-beige/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-beige/40 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} Souba Atelier.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-brand-beige/80 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-beige/80 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
