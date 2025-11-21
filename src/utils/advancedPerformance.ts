/**
 * Advanced Performance Optimization Utilities
 * Year 3000 Level Performance Enhancements
 */

import { useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Web Worker for heavy computations
 */
export class PerformanceWorker {
  private worker: Worker | null = null;
  private taskQueue: Array<{ id: string; resolve: (value: unknown) => void; reject: (error: Error) => void }> = [];
  private taskId = 0;

  constructor(workerScript?: string) {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(
          workerScript || 
          URL.createObjectURL(
            new Blob([`
              self.onmessage = function(e) {
                const { id, type, data } = e.data;
                try {
                  let result;
                  switch(type) {
                    case 'processData':
                      result = processLargeDataset(data);
                      break;
                    case 'calculateStats':
                      result = calculateStatistics(data);
                      break;
                    case 'filterData':
                      result = filterLargeArray(data);
                      break;
                    default:
                      throw new Error('Unknown task type');
                  }
                  self.postMessage({ id, result, success: true });
                } catch (error) {
                  self.postMessage({ id, error: error.message, success: false });
                }
              }
              
              function processLargeDataset(data) {
                // Heavy data processing
                return data.map(item => ({
                  ...item,
                  processed: true,
                  timestamp: Date.now()
                }));
              }
              
              function calculateStatistics(data) {
                const sum = data.reduce((acc, val) => acc + (val || 0), 0);
                const avg = sum / data.length;
                const max = Math.max(...data);
                const min = Math.min(...data);
                return { sum, avg, max, min, count: data.length };
              }
              
              function filterLargeArray(data) {
                return data.filter(item => item && item !== null && item !== undefined);
              }
            `], { type: 'application/javascript' })
          )
        );
        
        this.worker.onmessage = (e) => {
          const { id, result, error, success } = e.data;
          const task = this.taskQueue.find(t => t.id === id);
          if (task) {
            if (success) {
              task.resolve(result);
            } else {
              task.reject(new Error(error));
            }
            this.taskQueue = this.taskQueue.filter(t => t.id !== id);
          }
        };
      } catch (error) {
        console.warn('Web Worker not available, falling back to main thread');
      }
    }
  }

  async execute<T>(type: string, data: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread
        try {
          const result = this.processInMainThread(type, data);
          resolve(result as T);
        } catch (error) {
          reject(error as Error);
        }
        return;
      }

      const id = `task_${++this.taskId}_${Date.now()}`;
      this.taskQueue.push({ id, resolve, reject });
      this.worker.postMessage({ id, type, data });
    });
  }

  private processInMainThread(type: string, data: unknown): unknown {
    // Fallback implementation
    if (type === 'filterData' && Array.isArray(data)) {
      return data.filter(item => item && item !== null && item !== undefined);
    }
    return data;
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.taskQueue = [];
  }
}

/**
 * Advanced debounce with immediate execution option
 */
export function advancedDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const leading = options?.leading ?? false;
  const trailing = options?.trailing ?? true;
  const maxWait = options?.maxWait;

  const invokeFunc = (time: number) => {
    const args = lastArgs || ([] as unknown as Parameters<T>);
    lastArgs = null;
    lastInvokeTime = time;
    return func(...args);
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : undefined;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
  };

  return function (this: unknown, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
  };
}

/**
 * Request Animation Frame based throttle for smooth animations
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
        rafId = null;
      });
    }
  };
}

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

/**
 * Memory-efficient batch processor
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 10,
  delay = 0
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    if (delay > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Intelligent caching with TTL and size limits
 */
export class IntelligentCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; accessCount: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    entry.accessCount++;
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove least recently used
      const lruKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].accessCount - b[1].accessCount)[0][0];
      this.cache.delete(lruKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16) { // More than one frame
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return {
    renderCount: renderCount.current,
    measure: (label: string, fn: () => void) => {
      const start = performance.now();
      fn();
      const duration = performance.now() - start;
      if (duration > 10) {
        console.warn(`[Performance] ${componentName}.${label} took ${duration.toFixed(2)}ms`);
      }
    },
  };
}

/**
 * Lazy load images with intersection observer
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.src = src;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imageSrc, isLoaded, imgRef };
}

// React imports
import React, { useState } from 'react';

