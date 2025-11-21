/**
 * Advanced UI/UX Utilities
 * Year 3000 Level UI Enhancements
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Smooth scroll with easing
 */
export function smoothScrollTo(
  element: HTMLElement | null,
  options?: {
    top?: number;
    left?: number;
    behavior?: ScrollBehavior;
    duration?: number;
  }
): void {
  if (!element) return;

  const { top = 0, left = 0, duration = 500 } = options || {};
  const startTop = element.scrollTop;
  const startLeft = element.scrollLeft;
  const changeTop = top - startTop;
  const changeLeft = left - startLeft;
  const startTime = performance.now();

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateScroll(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    element.scrollTop = startTop + changeTop * eased;
    element.scrollLeft = startLeft + changeLeft * eased;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

/**
 * Advanced animation hook with spring physics
 */
export function useSpringAnimation(
  targetValue: number,
  options?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    precision?: number;
  }
) {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    precision = 0.01,
  } = options || {};

  const [value, setValue] = useState(targetValue);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const distance = targetValue - value;
      const springForce = distance * stiffness;
      const dampingForce = velocityRef.current * damping;
      const acceleration = (springForce - dampingForce) / mass;

      velocityRef.current += acceleration * 0.016; // ~60fps
      const newValue = value + velocityRef.current;

      if (Math.abs(distance) < precision && Math.abs(velocityRef.current) < precision) {
        setValue(targetValue);
        return;
      }

      setValue(newValue);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, value, stiffness, damping, mass, precision]);

  return value;
}

/**
 * Gesture recognition hook
 */
export function useGesture(
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void,
  onPinch?: (scale: number) => void,
  onRotate?: (angle: number) => void
) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchStartDistanceRef = useRef<number>(0);
  const touchStartAngleRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      touchStartDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      touchStartAngleRef.current = Math.atan2(dy, dx);
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const time = Date.now() - touchStartRef.current.time;

      if (distance > 50 && time < 300) {
        // Swipe detected
        if (Math.abs(dx) > Math.abs(dy)) {
          onSwipe?.(dx > 0 ? 'right' : 'left');
        } else {
          onSwipe?.(dy > 0 ? 'down' : 'up');
        }
      }

      touchStartRef.current = null;
    },
    [onSwipe]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        if (touchStartDistanceRef.current > 0) {
          const scale = distance / touchStartDistanceRef.current;
          onPinch?.(scale);
        }

        const angleDiff = angle - touchStartAngleRef.current;
        onRotate?.(angleDiff);
      }
    },
    [onPinch, onRotate]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}

/**
 * Advanced tooltip with positioning
 */
export function useAdvancedTooltip() {
  const [tooltip, setTooltip] = useState<{
    content: React.ReactNode;
    x: number;
    y: number;
    visible: boolean;
  }>({
    content: null,
    x: 0,
    y: 0,
    visible: false,
  });

  const showTooltip = useCallback(
    (content: React.ReactNode, x: number, y: number) => {
      setTooltip({ content, x, y, visible: true });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return { tooltip, showTooltip, hideTooltip };
}

/**
 * Parallax scroll effect
 */
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffset(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { offset, elementRef };
}

/**
 * Magnetic cursor effect
 */
export function useMagneticCursor(strength: number = 0.3) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
      }
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, [strength]);

  return { position, elementRef };
}

/**
 * Confetti animation
 */
export function createConfetti(
  container: HTMLElement,
  options?: {
    count?: number;
    colors?: string[];
    duration?: number;
  }
): void {
  const {
    count = 50,
    colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
    duration = 3000,
  } = options || {};

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';

    container.appendChild(confetti);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const rotation = Math.random() * 360;

    let x = parseFloat(confetti.style.left);
    let y = -10;
    let rotationAngle = rotation;

    const animate = () => {
      x += Math.cos(angle) * velocity;
      y += Math.sin(angle) * velocity + 0.5; // Gravity
      rotationAngle += 5;

      confetti.style.left = `${x}%`;
      confetti.style.top = `${y}px`;
      confetti.style.transform = `rotate(${rotationAngle}deg)`;

      if (y < window.innerHeight + 10) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };

    requestAnimationFrame(animate);
    setTimeout(() => confetti.remove(), duration);
  }
}

/**
 * Ripple effect
 */
export function createRipple(
  event: React.MouseEvent<HTMLElement>,
  color?: string
): void {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.style.position = 'absolute';
  circle.style.borderRadius = '50%';
  circle.style.transform = 'scale(0)';
  circle.style.animation = 'ripple 600ms linear';
  circle.style.backgroundColor = color || 'rgba(255, 255, 255, 0.6)';
  circle.style.pointerEvents = 'none';

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);

  setTimeout(() => circle.remove(), 600);
}

/**
 * Glassmorphism effect
 */
export function useGlassmorphism(intensity: number = 0.1) {
  return {
    background: `rgba(255, 255, 255, ${intensity})`,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };
}

/**
 * Advanced loading states
 */
export function useLoadingState() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  return {
    loading,
    progress,
    startLoading,
    updateProgress,
    finishLoading,
  };
}

// Add CSS for ripple animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// React imports
import React from 'react';

