// Scroll Progress Hook - For scrollytelling interactions
import { useState, useEffect } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Calculate scroll progress (0 to 1)
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? Math.min(scrollTop / documentHeight, 1) : 0;
      
      setScrollProgress(progress);
      
      // Clear previous timeout
      clearTimeout(scrollTimeout);
      
      // Set new timeout
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return {
    scrollProgress,
    isScrolling,
    // Utility functions
    scrollToSection: (elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
};

// Animation variants for Framer Motion
export const scrollVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// 3D scene animation variants
export const sceneVariants = {
  base: {
    scale: 1,
    rotation: 0
  },
  active: (progress) => ({
    scale: 1 + (progress * 0.2),
    rotation: progress * Math.PI * 2,
    transition: {
      duration: 0.1,
      ease: "linear"
    }
  })
};