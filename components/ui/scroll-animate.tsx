'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimateProps {
  children: React.ReactNode;
  variant?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'fade-in';
  delay?: number; // ms delay
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsActive(true), delay);
          } else {
            setIsActive(true);
          }
          // Once animated, we don't need to observe anymore
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px', // trigger slightly before entering viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
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
