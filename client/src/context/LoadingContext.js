import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);
  const isLoadingRef = useRef(false);

  const clearTimers = () => {
    if (progressTimer.current) {
      clearTimeout(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const startLoading = useCallback(() => {
    clearTimers();
    isLoadingRef.current = true;
    
    // Start from beginning
    setProgress(0);
    
    // Simulate realistic loading progress
    const updateProgress = (value, delay) => {
      progressTimer.current = setTimeout(() => {
        if (isLoadingRef.current) {
          setProgress(value);
        }
      }, delay);
    };

    // Progressive loading simulation with carefully timed steps
    updateProgress(20, 50);   // Quick start
    updateProgress(40, 100);  // First chunk
    updateProgress(60, 200);  // Second chunk
    updateProgress(75, 400);  // Slower progress
    updateProgress(85, 800);  // Near completion
  }, []);

  const completeLoading = useCallback(() => {
    isLoadingRef.current = false;
    clearTimers();
    
    // Ensure we reach 100%
    setProgress(100);
    
    // Reset after completion
    progressTimer.current = setTimeout(() => {
      setProgress(0);
    }, 500);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isLoadingRef.current = false;
      clearTimers();
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ progress, startLoading, completeLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};