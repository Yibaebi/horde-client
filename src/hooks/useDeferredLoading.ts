import { useEffect, useState } from 'react';

/**
 * Custom hook that delays hiding a loader for a specified time.
 *
 * @param {boolean} loading - The current loading state.
 * @param {number} [delay=300] - The minimum wait time (in milliseconds) before hiding the loader.
 * @returns {boolean} - `true` if the loader should be visible, otherwise `false`.
 *
 * @example
 * const showLoader = useDeferredLoading(isLoading, 500);
 * if (showLoader) {
 *   return <p>Loading...</p>;
 * }
 */
const useDeferredLoading = (loading: boolean, delay: number = 300): boolean => {
  const [showLoader, setShowLoader] = useState(loading);

  useEffect(() => {
    // If loading becomes true, immediately show the loader
    if (loading) {
      setShowLoader(true);

      return;
    }

    // If loading becomes false, wait for the delay before hiding the loader
    const timer = setTimeout(() => setShowLoader(false), delay);

    // Clean up the timer if the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [loading, delay]);

  return showLoader;
};

export default useDeferredLoading;
