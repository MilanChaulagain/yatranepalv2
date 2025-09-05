import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

export const useLoadingRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startLoading, completeLoading } = useLoading();
  const loadingTimer = useRef(null);

  useEffect(() => {
    // Clear any existing timer
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }

    // Start loading
    startLoading();

    // Set minimum loading time to ensure smooth animation
    loadingTimer.current = setTimeout(() => {
      // Complete loading after content is likely loaded
      completeLoading();
    }, 800); // Increased minimum loading time for smoother appearance

    // Cleanup
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, [location.pathname, startLoading, completeLoading]);

  return { location, navigate };
};
