export const MOTION = {
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  threshold: 0.12,
  rootMargin: "0px 0px -80px 0px" as const,
  duration: {
    micro: 350,
    card: 550,
    section: 750,
    hero: 1000,
  },
  stagger: {
    fast: 80,
    normal: 120,
    slow: 200,
  },
  distance: {
    sm: 20,
    md: 30,
    lg: 50,
  },
} as const;
