import type { Variants } from "framer-motion";

export const transition = {
  ease: "easeOut",
  duration: 0.4,
} as const;

export const transitionSlow = {
  ease: "easeOut",
  duration: 0.6,
} as const;

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1.01 },
  whileHover: { scale: 1.02 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Button hover effect
export const buttonHover: Variants = {
  rest: { scale: 1, opacity: 1 },
  hover: {
    scale: 1.05,
    opacity: 1,
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const buttonFloat: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.05,
    y: -3,
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};
