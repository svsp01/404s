"use client"

import {
  motion as framerMotion,
  AnimatePresence as FramerAnimatePresence,
} from "framer-motion";

// Re-export framer-motion components
export const motion = framerMotion;
export const AnimatePresence = FramerAnimatePresence;

// Common animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation durations
export const durations = {
  short: 0.2,
  medium: 0.5,
  long: 0.8,
};