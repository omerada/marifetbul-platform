'use client';

import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver, useReducedMotion } from '@/lib/animations';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  duration?: string;
  className?: string;
  threshold?: number;
}

const animationClasses = {
  fadeIn: 'animate-fade-in-up',
  slideUp: 'animate-slide-up',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
};

export function AnimatedContainer({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = '0.6s',
  className,
  threshold = 0.1,
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold,
  });

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasIntersected && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [hasIntersected, delay, isVisible]);

  const shouldAnimate = !prefersReducedMotion && isVisible;

  return (
    <div
      ref={targetRef}
      className={cn(
        'transition-all',
        !isVisible && 'opacity-0',
        shouldAnimate && animationClasses[animation],
        className
      )}
      style={{
        animationDuration: shouldAnimate ? duration : '0.1s',
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredContainerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  threshold?: number;
}

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 100,
  animation = 'fadeIn',
  threshold = 0.1,
}: StaggeredContainerProps) {
  const { targetRef, hasIntersected } = useIntersectionObserver({ threshold });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={targetRef} className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={
            hasIntersected && !prefersReducedMotion ? index * staggerDelay : 0
          }
          className="staggered-fade-in"
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
}

interface ScrollTriggeredAnimationProps {
  children: ReactNode;
  className?: string;
  animationClass?: string;
  offset?: number;
}

export function ScrollTriggeredAnimation({
  children,
  className,
  animationClass = 'animate-fade-in-up',
  offset = 100,
}: ScrollTriggeredAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector(
        `[data-scroll-animation="${animationClass}"]`
      );
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight - offset && rect.bottom > 0) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [animationClass, offset]);

  return (
    <div
      data-scroll-animation={animationClass}
      className={cn(
        className,
        !isVisible && 'opacity-0',
        isVisible && !prefersReducedMotion && animationClass
      )}
    >
      {children}
    </div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'transition-all duration-500',
        !isLoaded && 'translate-y-4 opacity-0',
        isLoaded && 'translate-y-0 opacity-100',
        prefersReducedMotion && '!translate-y-0 !duration-100',
        className
      )}
    >
      {children}
    </div>
  );
}

// Hover animation wrapper
interface HoverAnimationProps {
  children: ReactNode;
  effect?: 'scale' | 'lift' | 'glow' | 'rotate';
  className?: string;
  disabled?: boolean;
}

export function HoverAnimation({
  children,
  effect = 'scale',
  className,
  disabled = false,
}: HoverAnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  const effectClasses = {
    scale: 'hover:scale-105 active:scale-95',
    lift: 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0',
    glow: 'hover:shadow-xl hover:shadow-blue-500/25',
    rotate: 'hover:rotate-3 active:rotate-0',
  };

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        !disabled && !prefersReducedMotion && effectClasses[effect],
        prefersReducedMotion && 'hover:opacity-90',
        className
      )}
    >
      {children}
    </div>
  );
}

// Loading animation
interface LoadingAnimationProps {
  type?: 'spinner' | 'pulse' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingAnimation({
  type = 'spinner',
  size = 'md',
  className,
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (type === 'spinner') {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (type === 'pulse') {
    return (
      <div
        className={cn(
          'animate-pulse rounded bg-gray-300',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={cn('skeleton rounded', sizeClasses[size], className)} />
    );
  }

  if (type === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'animate-bounce rounded-full bg-blue-600',
              size === 'sm' && 'h-1 w-1',
              size === 'md' && 'h-2 w-2',
              size === 'lg' && 'h-3 w-3'
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return null;
}
