import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

type MonthYearPickerProps = {
  className?: string;
  onMonthYearChange?: (date: Date) => void;
  onApply?: () => void;
  onClose?: () => void;
  defaultDate?: Date;
};

function MonthYearPicker({
  className,
  onMonthYearChange,
  onApply,
  onClose,
  defaultDate = dayjs().toDate(),
}: MonthYearPickerProps) {
  // Use controlled state instead of useNavigation hook
  const [currentDate, setCurrentDate] = useState<Date>(dayjs(defaultDate).toDate());
  const today = dayjs().toDate();
  const currentYear = dayjs(currentDate).year();

  useEffect(() => {
    onMonthYearChange?.(currentDate);
  }, [currentDate, onMonthYearChange]);

  // Navigation functions
  const goToDate = (date: Date) => setCurrentDate(date);

  // Get today for highlighting
  const isCurrentDate = (date: Date) =>
    date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

  // Custom month buttons renderer
  const renderMonthButtons = () => {
    return (
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {Array.from({ length: 12 }).map((_, month) => {
          const date = dayjs(currentDate).year(currentYear).month(month).toDate();
          const isCurrent = isCurrentDate(date);
          const isSelected = dayjs(currentDate).isSame(date, 'month');
          const monthName = dayjs(date).format('MMM');

          return (
            <button
              key={month}
              onClick={() => {
                goToDate(date);

                if (onMonthYearChange) {
                  onMonthYearChange(date);
                }
              }}
              className={cn(
                'py-1 px-2 rounded-md shadow-sm transition-all duration-200 relative overflow-hidden group flex items-center justify-center text-xs',
                isSelected
                  ? 'bg-primary text-white font-medium ring-1 ring-primary/20'
                  : 'bg-white hover:bg-primary/5 text-gray-700 border border-gray-100 hover:border-primary/20',
                isCurrent && !isSelected && 'ring-1 ring-primary/30'
              )}
            >
              {/* Background shape animation on hover */}
              <span
                className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-sm -z-10',
                  isSelected &&
                    'opacity-100 bg-gradient-to-r from-primary/70 via-primary/90 to-primary/70'
                )}
              />

              {/* Month name with dot indicator for current month */}
              <span className="relative">
                {monthName}
                {isCurrent && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1.5 w-1 h-1 rounded-full',
                      isSelected ? 'bg-white' : 'bg-primary'
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Custom year navigation renderer
  const renderYearNav = () => {
    return (
      <div className="flex items-center justify-between mb-3 z-10 w-full">
        <div className="w-6"></div>

        <div className="flex items-center rounded-md border border-primary/30 shadow-sm bg-primary/10 px-1">
          <button
            onClick={() => {
              const newDate = dayjs(currentDate).subtract(1, 'year').toDate();
              goToDate(newDate);
            }}
            className="text-primary bg-white hover:text-white hover:bg-primary rounded-l-sm px-2 py-1.5 text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-3 py-1.5 font-semibold text-primary text-sm">
            {dayjs(currentDate).year()}
          </span>

          <button
            onClick={() => {
              const newDate = dayjs(currentDate).add(1, 'year').toDate();
              goToDate(newDate);
            }}
            className="text-primary bg-white hover:text-white hover:bg-primary rounded-r-sm px-2 py-1.5 text-xs transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {onClose ? (
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors w-6 h-6 flex items-center justify-center"
            aria-label="Close month picker"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg',
        className
      )}
      style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
    >
      {/* Year navigation at the top */}
      {renderYearNav()}

      {renderMonthButtons()}

      {/* Action buttons */}
      <div className="mt-3 border-t border-gray-100 pt-2 flex justify-end gap-2">
        <button
          onClick={() => {
            const todayDate = dayjs().toDate();
            goToDate(todayDate);

            if (onMonthYearChange) {
              onMonthYearChange(todayDate);
            }
          }}
          disabled={isCurrentDate(currentDate)}
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors disabled:hover:bg-gray-50 disabled:opacity-50 disabled:!cursor-not-allowed"
        >
          Current Month
        </button>

        {onApply && (
          <button
            onClick={onApply}
            className="px-3 py-1 text-xs bg-primary text-white hover:bg-primary/90 rounded-md shadow-sm transition-colors"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}

export { MonthYearPicker };
export { DayPicker as Calendar };
