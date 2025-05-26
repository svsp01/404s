"use client"

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion, useScroll, useTransform } from 'framer-motion';

export function HeaderSection() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const titleOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const titleY = useTransform(scrollY, [0, 150], [0, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`border-b border-border backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 shadow-md' : 'bg-background/50'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            className="h-8 w-8 text-primary"
          >
            <path 
              fill="currentColor" 
              d="M13 18h2v-4h4v-4h-4V6h-2v4H9v4h4zm4.5-11c.9-2.7-.5-5-3.5-5H5v6h3v12h6v-6h8l-4.5-7ZM12 1c.8 0 1.5.7 1.5 1.5S12.8 4 12 4s-1.5-.7-1.5-1.5S11.2 1 12 1Z" 
            />
          </svg>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">404s</h1>
        </motion.div>
        
        <ThemeToggle />
      </div>
      
     
    </header>
  );
}