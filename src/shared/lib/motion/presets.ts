export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.8 };

export const springSoft = { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.9 };

export const easeOut = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

export const pageTransition = easeOut;
