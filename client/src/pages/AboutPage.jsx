import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Hash, Sparkles, Play, Eye, Search, Leaf, Heart, Recycle, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useSEO from '@/hooks/useSEO';

const AboutPage = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useSEO({
    title: 'About Us',
    description: 'Discover Souba Atelier - aesthetic clothing for the modern muse. Learn about our Reel Code system, our story, and our commitment to sustainable fashion.'
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'about-jsonld';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Souba Atelier",
      "url": window.location.origin,
      "logo": `${window.location.origin}/favicon.png`,
      "description": "Aesthetic clothing brand for the modern muse",
      "sameAs": [
        "https://instagram.com/soubaatelier"
      ]
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('about-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      if (!navigator.onLine) {
        const stored = JSON.parse(localStorage.getItem('newsletter_signups') || '[]');
        stored.push({ email, date: new Date().toISOString() });
        localStorage.setItem('newsletter_signups', JSON.stringify(stored));
        toast.success('Saved for later! We\'ll sync when you\'re back online.');
        setEmail('');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const timeline = [
    { year: '2022', title: 'The Spark', desc: 'Frustrated by unanswered "Where is this from?" comments on Instagram, we decided to make fashion more accessible.' },
    { year: '2023', title: 'The Launch', desc: 'Souba Atelier was born with a simple mission: match every outfit to a code, making it instantly shoppable.' },
    { year: '2024', title: 'Growing Together', desc: 'Our community grew as more people discovered the joy of effortless shopping through Reel Codes.' },
    { year: '2025', title: 'Today', desc: 'We continue curating beautiful pieces, one code at a time, for the modern muse.' },
  ];

  const aestheticItems = [
    { title: 'Soft Tones', desc: 'Muted palettes that bring calm and elegance to your wardrobe.', icon: Sparkles },
    { title: 'Minimal Cuts', desc: 'Clean lines and timeless silhouettes that never go out of style.', icon: Heart },
    { title: 'Effortless Chic', desc: 'Pieces designed to look put-together with zero effort.', icon: CheckCircle2 },
  ];

  const steps = [
    { icon: Play, title: 'Watch Reels', desc: 'See an outfit you love on our Instagram Reels' },
    { icon: Eye, title: 'Note the Code', desc: 'Spot the unique code displayed on screen (e.g., DRS101)' },
    { icon: Search, title: 'Shop Instantly', desc: 'Type the code here and add the look to your cart' },
  ];

  const sustainabilityPoints = [
    { icon: Leaf, text: 'Ethically sourced materials' },
    { icon: Recycle, text: 'Minimal packaging, maximum care' },
    { icon: Heart, text: 'Quality over quantity philosophy' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-white px-4 py-2 rounded z-50">
        Skip to main content
      </a>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-12 space-y-20">

        <section aria-labelledby="hero-heading" className="text-center space-y-6 pt-8">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-serif font-bold text-brand-primary leading-tight" data-testid="text-hero-title">
            We make outfits you remember
          </h1>
          <p className="text-lg md:text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            See it on our Reels. Note the code. Find it here. <br className="hidden md:block" />
            Fashion discovery, simplified.
          </p>
          <div className="pt-4">
            <Link to="/shop">
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-6 text-lg" data-testid="button-shop-cta">
                Shop the look
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section aria-labelledby="how-it-works-heading" className="space-y-8">
          <div className="text-center">
            <h2 id="how-it-works-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-2">
              How the Reel Code System Works
            </h2>
            <p className="text-brand-text/70">Three simple steps to your dream outfit</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <Card key={idx} className="bg-white/60 backdrop-blur-sm border-brand-primary/10 hover:shadow-lg transition-shadow" data-testid={`card-step-${idx + 1}`}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-brand-primary" aria-hidden="true" />
                  </div>
                  <div className="text-sm font-bold text-brand-primary/50 uppercase tracking-wider">Step {idx + 1}</div>
                  <h3 className="text-xl font-serif font-bold text-brand-primary">{step.title}</h3>
                  <p className="text-brand-text/70 text-sm">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="story-heading" className="space-y-10">
          <div className="text-center">
            <h2 id="story-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-2">
              Our Story
            </h2>
            <div className="h-0.5 w-16 bg-brand-primary/20 mx-auto"></div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-brand-primary/10 hidden md:block"></div>
            <div className="space-y-8">
              {timeline.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col md:flex-row items-center gap-4 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  data-testid={`timeline-item-${idx}`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className="bg-white/60 backdrop-blur-sm border-brand-primary/10 inline-block">
                      <CardContent className="p-5">
                        <p className="text-brand-text/80 text-sm leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-20 h-20 bg-brand-primary text-white rounded-full flex flex-col items-center justify-center font-serif font-bold shrink-0 z-10">
                    <span className="text-xl">{item.year}</span>
                  </div>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-lg font-serif font-bold text-brand-primary">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="aesthetic-heading" className="space-y-8">
          <div className="text-center">
            <h2 id="aesthetic-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-2">
              Our Aesthetic
            </h2>
            <p className="text-brand-text/70 max-w-xl mx-auto">
              Inspired by minimalism, warm tones, and effortless elegance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {aestheticItems.map((item, idx) => (
              <Card key={idx} className="bg-white/40 border-brand-primary/10 hover:bg-white/60 transition-colors" data-testid={`card-aesthetic-${idx}`}>
                <CardContent className="p-6 text-center space-y-3">
                  <item.icon className="w-8 h-8 text-brand-primary/60 mx-auto" aria-hidden="true" />
                  <h3 className="font-serif font-bold text-brand-primary">{item.title}</h3>
                  <p className="text-sm text-brand-text/70">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="aspect-square bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-lg flex items-center justify-center"
                role="img"
                aria-label={`Moodboard image ${i}`}
              >
                <span className="text-brand-primary/30 text-xs uppercase tracking-wider">Look {i}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-brand-text/50 italic">
            Minimal cuts • Warm tones • Seasonal palettes • Timeless pieces
          </p>
        </section>

        <section aria-labelledby="sustainability-heading" className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <div className="text-center space-y-6">
            <h2 id="sustainability-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
              Thoughtfully Made
            </h2>
            <p className="text-brand-text/70 max-w-xl mx-auto">
              We believe in fashion that respects both people and the planet.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {sustainabilityPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 text-brand-text/80" data-testid={`sustainability-point-${idx}`}>
                  <point.icon className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                  <span className="text-sm">{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="newsletter-heading" className="bg-brand-primary/5 rounded-2xl p-8 md:p-12">
          <div className="text-center space-y-6 max-w-lg mx-auto">
            <Mail className="w-12 h-12 text-brand-primary mx-auto" aria-hidden="true" />
            <h2 id="newsletter-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
              Stay in the Loop
            </h2>
            <p className="text-brand-text/70">
              Get early access to new drops, exclusive codes, and styling tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border-brand-primary/20"
                aria-label="Email address for newsletter"
                data-testid="input-newsletter-email"
              />
              <Button 
                type="submit" 
                disabled={isSubscribing}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                data-testid="button-newsletter-subscribe"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            <p className="text-xs text-brand-text/50">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </section>

        <section aria-labelledby="instagram-heading" className="text-center pt-8 border-t border-brand-primary/10">
          <h2 id="instagram-heading" className="sr-only">Follow us on Instagram</h2>
          <a 
            href="https://instagram.com/soubaatelier" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-primary font-medium hover:opacity-80 transition-opacity text-lg"
            data-testid="link-instagram"
          >
            <Instagram className="w-6 h-6" aria-hidden="true" />
            <span>@soubaatelier</span>
          </a>
          <p className="text-sm text-brand-text/50 mt-2">Follow us for daily inspiration</p>
        </section>

      </main>
    </div>
  );
};

export default AboutPage;
