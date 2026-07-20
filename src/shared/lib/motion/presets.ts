export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.8 };

export const springSoft = { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.9 };

export const easeOut = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

export const pageTransition = easeOut;

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const fadeUpVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 }
  }
};

export const listItemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 }
};

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 }
};
