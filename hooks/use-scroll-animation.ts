import type { Variants, Transition } from "framer-motion";

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
};

export const staggerContainer: Variants = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const commonTransition: Transition = { duration: 0.8, ease: "easeOut" };
export const commonViewport = { once: true, amount: 0.2 } as const;

export function useScrollAnimation() {
  const getAnimationProps = (
    variant: Variants,
    customTransition?: Transition,
  ) => ({
    initial: "initial",
    whileInView: "whileInView",
    viewport: commonViewport,
    transition: customTransition || commonTransition,
    variants: variant,
  });

  return {
    fadeIn,
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    staggerContainer,
    commonTransition,
    commonViewport,
    getAnimationProps,
  };
}
