import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, Instagram, MapPin, Clock, Phone, CheckCircle2, HelpCircle, Package, RefreshCw, Ruler, Truck, Home, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useSEO from '@/hooks/useSEO';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderId: '',
    phone2: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  useSEO({
    title: 'Contact Support',
    description: 'Contact Souba Atelier for questions about orders, products, returns, or any inquiries. We typically respond within 24-48 hours.'
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'contact-jsonld';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@soubaatelier.com",
      "areaServed": "Worldwide",
      "availableLanguage": ["English"]
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('contact-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubjectChange = (value) => {
    setFormData(prev => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setTicketNumber(data.ticketNumber);
        setShowConfirmation(true);
        setFormData({ name: '', email: '', subject: '', message: '', orderId: '', phone2: '' });
      } else {
        toast.error(data.message || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      if (!navigator.onLine) {
        const demoTicket = `TKT${Date.now().toString(36).toUpperCase()}`;
        const stored = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        stored.push({ ...formData, ticketNumber: demoTicket, date: new Date().toISOString() });
        localStorage.setItem('contact_submissions', JSON.stringify(stored));
        setTicketNumber(demoTicket);
        setShowConfirmation(true);
        setFormData({ name: '', email: '', subject: '', message: '', orderId: '', phone2: '' });
        toast.info('Saved offline. We\'ll sync when you\'re back online.');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@soubaatelier.com',
      href: 'mailto:support@soubaatelier.com',
      desc: 'Send us an email anytime',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@soubaatelier',
      href: 'https://instagram.com/soubaatelier',
      desc: 'DM us on Instagram',
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      value: '+1 (555) 123-4567',
      href: 'https://wa.me/15551234567',
      desc: 'Chat with us on WhatsApp',
    },
  ];

  const faqs = [
    {
      id: 'order-status',
      icon: Package,
      question: 'How do I check my order status?',
      answer: 'You can check your order status by logging into your account and visiting the "My Orders" section. You\'ll see real-time updates on your order\'s progress.',
      link: '/profile',
      linkText: 'View my orders',
    },
    {
      id: 'returns',
      icon: RefreshCw,
      question: 'What is your return policy?',
      answer: 'We accept returns within 14 days of delivery for unworn items with original tags attached. Refunds are processed within 5-7 business days after we receive the item.',
      link: null,
      linkText: null,
    },
    {
      id: 'sizing',
      icon: Ruler,
      question: 'How do I find the right size?',
      answer: 'Each product page includes a detailed size chart. Measure yourself and compare with our size guide. If you\'re between sizes, we recommend sizing up for a relaxed fit.',
      link: null,
      linkText: null,
    },
    {
      id: 'shipping',
      icon: Truck,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout. All orders include tracking information.',
      link: null,
      linkText: null,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-white px-4 py-2 rounded z-50">
        Skip to main content
      </a>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        <section aria-labelledby="contact-hero" className="text-center space-y-4 pt-8">
          <h1 id="contact-hero" className="text-4xl md:text-5xl font-serif font-bold text-brand-primary" data-testid="text-contact-title">
            Contact Us
          </h1>
          <p className="text-lg text-brand-text/70 max-w-xl mx-auto" data-testid="text-contact-subtitle">
            Questions about your order or an outfit? We're here to help.
          </p>
        </section>

        <section aria-labelledby="contact-options-heading" className="space-y-6">
          <h2 id="contact-options-heading" className="sr-only">Contact Options</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {contactOptions.map((option, idx) => (
              <a
                key={idx}
                href={option.href}
                target={option.href.startsWith('http') ? '_blank' : undefined}
                rel={option.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block"
                data-testid={`link-contact-${option.title.toLowerCase()}`}
              >
                <Card className="bg-white/60 backdrop-blur-sm border-brand-primary/10 hover:shadow-lg hover:border-brand-primary/30 transition-all h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <option.icon className="w-6 h-6 text-brand-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary">{option.title}</h3>
                      <p className="text-sm text-brand-text/80">{option.value}</p>
                      <p className="text-xs text-brand-text/50">{option.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-5 gap-8">
          <section aria-labelledby="contact-form-heading" className="lg:col-span-3">
            <Card className="bg-white/60 backdrop-blur-sm border-brand-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-primary font-serif">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                  Send us a message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <input 
                    type="text" 
                    name="phone2" 
                    value={formData.phone2}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute opacity-0 h-0 w-0 pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-brand-primary/90">
                        Name <span className="text-red-500" aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className={cn("bg-white/50 border-brand-primary/20", errors.name && "border-red-400")}
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        data-testid="input-name"
                      />
                      {errors.name && <p id="name-error" className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-brand-primary/90">
                        Email <span className="text-red-500" aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={cn("bg-white/50 border-brand-primary/20", errors.email && "border-red-400")}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        data-testid="input-email"
                      />
                      {errors.email && <p id="email-error" className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-brand-primary/90">
                        Subject <span className="text-red-500" aria-hidden="true">*</span>
                      </Label>
                      <Select value={formData.subject} onValueChange={handleSubjectChange}>
                        <SelectTrigger 
                          id="subject"
                          className={cn("bg-white/50 border-brand-primary/20", errors.subject && "border-red-400")}
                          aria-required="true"
                          aria-invalid={!!errors.subject}
                          data-testid="select-subject"
                        >
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Order">Order Inquiry</SelectItem>
                          <SelectItem value="Product">Product Question</SelectItem>
                          <SelectItem value="Returns">Returns & Refunds</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderId" className="text-brand-primary/90">
                        Order ID <span className="text-brand-text/50 text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="orderId"
                        name="orderId"
                        placeholder="e.g., ORD-12345"
                        value={formData.orderId}
                        onChange={handleChange}
                        className="bg-white/50 border-brand-primary/20"
                        data-testid="input-order-id"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-brand-primary/90">
                      Message <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                      className={cn("bg-white/50 border-brand-primary/20 resize-none", errors.message && "border-red-400")}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      data-testid="input-message"
                    />
                    {errors.message && <p id="message-error" className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <p className="text-xs text-brand-text/50">
                    We use your email only to respond to your request.
                  </p>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          <aside className="lg:col-span-2 space-y-6">
            <Card className="bg-brand-primary/5 border-brand-primary/10">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-brand-primary">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-brand-text/80">
                  <p>Monday - Friday: 9 AM - 6 PM</p>
                  <p>Saturday: 10 AM - 4 PM</p>
                  <p>Sunday: Closed</p>
                </div>
                <div className="pt-2 border-t border-brand-primary/10">
                  <p className="text-sm text-brand-text/70">
                    <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-600" aria-hidden="true" />
                    Typical response within 24-48 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/40 border-brand-primary/10">
              <CardContent className="p-5 space-y-3 text-center">
                <MapPin className="w-8 h-8 text-brand-primary/40 mx-auto" aria-hidden="true" />
                <p className="text-sm text-brand-text/70">
                  We're an online-only boutique, <br />
                  but always just a message away.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section aria-labelledby="faq-heading" className="space-y-6">
          <div className="text-center">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-text/70">Quick answers to common questions</p>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm border-brand-primary/10">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border-brand-primary/10" data-testid={`accordion-${faq.id}`}>
                    <AccordionTrigger className="text-left hover:no-underline group">
                      <span className="flex items-center gap-3">
                        <faq.icon className="w-5 h-5 text-brand-primary/60 group-hover:text-brand-primary transition-colors" aria-hidden="true" />
                        <span className="text-brand-text group-hover:text-brand-primary transition-colors">{faq.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-brand-text/70 pl-8">
                      <p>{faq.answer}</p>
                      {faq.link && (
                        <Link to={faq.link} className="inline-flex items-center gap-1 text-brand-primary text-sm mt-2 hover:underline">
                          {faq.linkText}
                        </Link>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

      </main>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-brand-bg border-brand-primary/20">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-2xl font-serif text-brand-primary text-center">
              Message Received!
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>Thanks for reaching out. We'll get back to you soon.</p>
              <p className="font-mono text-sm bg-brand-primary/5 px-3 py-2 rounded inline-block">
                Ticket #{ticketNumber}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5"
              data-testid="button-back-home"
            >
              <Home className="mr-2 w-4 h-4" aria-hidden="true" />
              Back to Home
            </Button>
            <Link to="/profile">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto" data-testid="button-view-orders">
                <ShoppingBag className="mr-2 w-4 h-4" aria-hidden="true" />
                View Orders
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactPage;
