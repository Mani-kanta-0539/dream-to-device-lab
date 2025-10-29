import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    // Monitor component mount time in development
    if (import.meta.env.DEV) {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Log slow components (>100ms)
        if (renderTime > 100) {
          console.warn(`Slow component: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName]);
};

export const measureAsync = async <T,>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`${operationName} completed in ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    if (import.meta.env.DEV) {
      console.error(`${operationName} failed after ${(endTime - startTime).toFixed(2)}ms`, error);
    }
    
    throw error;
  }
};
