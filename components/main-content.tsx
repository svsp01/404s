'use client'
import React from 'react'
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion, useScroll, useTransform } from 'framer-motion';

function MainContent() {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);
    const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
    const titleOpacity = useTransform(scrollY, [0, 150], [1, 0]);
    const titleY = useTransform(scrollY, [0, 150], [0, 20]);
  
  return (
    <motion.div 
    className="container mx-auto px-4 py-12 text-center"
    style={{ opacity: titleOpacity, y: titleY }}
  >
    <motion.h2 
      className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      Craft Beautiful 404 Pages with AI
    </motion.h2>
    <motion.p 
      className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      Describe what you want, and we'll generate custom 404 pages for your website. 
      Get both HTML/CSS and Next.js component versions instantly.
    </motion.p>
  </motion.div>
  )
}

export default MainContent