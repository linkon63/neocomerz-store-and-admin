'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MOTION } from '@/lib/motion.config';

interface ScrollAnimateProps {
  children: React.ReactNode;
  variant?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'fade-in';
  delay?: number;
  className?: string;
  direct?: boolean;
}

export default function ScrollAnimate({
  children,
  variant = 'fade-in-up',
  delay = 0,
  className = '',
  direct = false,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Respect user's reduced-motion preference — skip animation entirely
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsActive(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timeoutId = setTimeout(() => setIsActive(true), delay);
          } else {
            setIsActive(true);
          }
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: MOTION.threshold,
        rootMargin: MOTION.rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [delay]);

  const baseClass = direct ? 'reveal-direct' : 'reveal';
  const variantClass =
    variant === 'fade-in-up' ? (direct ? 'reveal-fade-in-up-direct' : 'reveal-fade-in-up') :
    variant === 'fade-in-down' ? (direct ? 'reveal-fade-in-down-direct' : 'reveal-fade-in-down') :
    variant === 'fade-in-left' ? (direct ? 'reveal-fade-in-left-direct' : 'reveal-fade-in-left') :
    variant === 'fade-in-right' ? (direct ? 'reveal-fade-in-right-direct' : 'reveal-fade-in-right') : '';

  return (
    <div
      ref={ref}
      className={`${baseClass} ${variantClass} ${isActive ? 'active' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
