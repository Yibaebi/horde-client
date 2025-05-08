import { useState, useEffect } from 'react';

/**
 * Hook to track window dimensions and handle resize events
 * @returns {Object} Window dimensions (width and height)
 */
export function useWindowResize(onWindowResize: () => void): object {
  // Initialize with window dimensions or default values if SSR
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      onWindowResize();

      // Set window dimensions
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away to update initial size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize;
}

export default useWindowResize;
