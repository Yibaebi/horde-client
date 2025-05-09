import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Colors } from '@/constants/colors';

interface ScrollableContainerProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  maxHeight?: string | number;
  maxWidth?: string | number;
  className?: string;
  showScrollIndicators?: boolean;
  scrollStep?: number;
  containerClassName?: string;
}

// Scroll icon
const SCROLL_ICON = {
  vertical: {
    StartIcon: ChevronUp,
    EndIcon: ChevronDown,
  },
  horizontal: {
    StartIcon: ChevronLeft,
    EndIcon: ChevronRight,
  },
};

// Scrollable container
const ScrollableContainer = ({
  children,
  direction = 'vertical',
  className = '',
  showScrollIndicators = true,
  scrollStep = 100,
  containerClassName = '',
}: ScrollableContainerProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === 'vertical';

  const [scrollState, setScrollState] = useState([false, false]);
  const [canScrollStart, canScrollEnd] = scrollState;

  // Handle scroll state
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) return;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } =
      scrollContainer;

    const scrollState = isVertical
      ? [scrollTop > 0, scrollTop < scrollHeight - clientHeight - 5]
      : [scrollLeft > 0, scrollLeft < scrollWidth - clientWidth - 5];

    setScrollState(scrollState);
  }, [isVertical]);

  // Scroll the container
  const scroll = useCallback(
    (amount: number) => {
      const scrollContainer = scrollContainerRef.current;

      if (!scrollContainer) return;

      const scrollOptions = {
        behavior: 'smooth' as const,
        [isVertical ? 'top' : 'left']: amount,
      };

      scrollContainer.scrollBy(scrollOptions);
    },
    [isVertical]
  );

  // Scroll to the start of the container
  const scrollStart = useCallback(() => scroll(-scrollStep), [scroll, scrollStep]);
  const scrollEnd = useCallback(() => scroll(scrollStep), [scroll, scrollStep]);

  // Handle scroll events
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) return;

    handleScroll();

    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(scrollContainer);

    return () => resizeObserver.disconnect();
  }, [handleScroll]);

  // Get the scroll icon
  const StartIcon = SCROLL_ICON[direction].StartIcon;
  const EndIcon = SCROLL_ICON[direction].EndIcon;

  // Get the scroll container style
  const scrollContainerStyle = {
    overflowX: isVertical ? 'hidden' : 'auto',
    overflowY: isVertical ? 'auto' : 'hidden',
  } as React.CSSProperties;

  return (
    <div className={`relative ${className} max-h-full max-w-full`}>
      {showScrollIndicators && canScrollStart && (
        <button
          onClick={scrollStart}
          className={`absolute z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all shadow-[0px_7px_29px_0px_${Colors.SHADOW_GRAY}] ${
            isVertical
              ? '-top-3 left-1/2 transform -translate-x-1/2'
              : '-left-3 top-1/2 transform -translate-y-1/2'
          }`}
          aria-label={`Scroll ${isVertical ? 'up' : 'left'}`}
        >
          <StartIcon size={14} className="text-primary-600 z-10" />
        </button>
      )}

      {showScrollIndicators && canScrollStart && (
        <div
          className={`absolute pointer-events-none z-1 transition-all duration-300 ${
            isVertical ? '-top-2 left-0 right-0 h-12' : '-left-1 top-0 bottom-0 w-12'
          }`}
          style={{
            background: `linear-gradient(${
              isVertical ? 'to bottom' : 'to right'
            }, ${Colors.WHITE_85} 0%, ${Colors.WHITE_50} 65%, rgba(255, 255, 255, 0) 100%)`,
            backdropFilter: 'blur(1px)',
            borderRadius: isVertical ? '8px 8px 0 0' : '8px 0 0 8px',
          }}
        />
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative ${containerClassName}`}
        style={scrollContainerStyle}
        role="region"
        aria-label={`Scrollable ${direction} content`}
      >
        {children}
      </div>

      {showScrollIndicators && canScrollEnd && (
        <div
          className={`absolute pointer-events-none z-10 transition-all duration-300 ${
            isVertical ? '-bottom-1.5 left-0 right-0 h-12' : '-right-1.5 top-0 bottom-0 w-12'
          }`}
          style={{
            background: `linear-gradient(${
              isVertical ? 'to top' : 'to left'
            }, ${Colors.WHITE_85} 0%, ${Colors.WHITE_50} 65%, rgba(255, 255, 255, 0) 100%)`,
            backdropFilter: 'blur(1px)',
            borderRadius: isVertical ? '0 0 8px 8px' : '0 8px 8px 0',
          }}
        />
      )}

      {showScrollIndicators && canScrollEnd && (
        <button
          onClick={scrollEnd}
          className={`absolute z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all shadow-[0px_7px_29px_0px_${Colors.SHADOW_GRAY}] ${
            isVertical
              ? '-bottom-3 left-1/2 transform -translate-x-1/2'
              : '-right-3 top-1/2 transform -translate-y-1/2'
          }`}
          aria-label={`Scroll ${isVertical ? 'down' : 'right'}`}
        >
          <EndIcon size={14} className="text-primary-600 z-10" />
        </button>
      )}
    </div>
  );
};

export default ScrollableContainer;
