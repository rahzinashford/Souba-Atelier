import React from 'react';
import Navbar from '../navigation/Navbar';
import Footer from '../navigation/Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:py-10 fade-in">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
