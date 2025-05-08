import { useEffect, RefObject } from 'react';

/**
 * Hook that alerts when clicked outside of the passed ref
 * @param ref Reference to the element to detect clicks outside of
 * @param callback Function to call when a click outside is detected
 */
function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent) => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Unbind the event listener on cleanup
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

export default useClickOutside;
