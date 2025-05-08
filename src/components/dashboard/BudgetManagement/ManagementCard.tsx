import dayjs from 'dayjs';
import { useState } from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BarChart4,
  Settings,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Eye,
  WalletCards,
  FolderPlus,
} from 'lucide-react';

import { MonthYearPicker } from '@/components/ui/calendar';
import { getMonthAndYearDate, getMonthName } from '@/lib/utils';
import useClickOutside from '@/hooks/useClickOutside';
import CategoryManagementModal from '@/components/dashboard/BudgetManagement/CategoryManagementModal';
import type { IBudgetProps } from '@/app/api/budgets';

interface ManagementCardProps {
  onTimelineChange?: (date: Date) => void;
  budget?: IBudgetProps | null;
  defaultMonth?: number;
  defaultYear?: number;
}

const ManagementCard = ({
  onTimelineChange,
  budget,
  defaultMonth,
  defaultYear,
}: ManagementCardProps) => {
  const navigate = useNavigate();
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Current date info
  const [selectedDate, setSelectedDate] = useState<Date>(
    defaultMonth && defaultYear
      ? getMonthAndYearDate(defaultMonth, defaultYear).toDate()
      : dayjs().toDate()
  );

  // Derived month and year from selected date
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // Get Budget Data
  const categories = budget?.categories || [];
  const currencySymbol = budget?.currencySym || '';
  const currentMonthName = getMonthName(selectedMonth);
  const currentYear = selectedYear;

  // Use the custom hook to handle clicks outside
  useClickOutside(monthPickerRef, () => {
    setIsMonthSelectorOpen(false);
  });

  // Selected month date
  const monthDate = getMonthAndYearDate(selectedMonth, selectedYear);

  const goToPreviousMonth = () => {
    const prevDate = monthDate.subtract(1, 'month').toDate();
    setSelectedDate(prevDate);
    onTimelineChange?.(prevDate);
  };

  const goToNextMonth = () => {
    const nextDate = monthDate.add(1, 'month').toDate();
    setSelectedDate(nextDate);
    onTimelineChange?.(nextDate);
  };

  // Handle month year change from picker
  const handleMonthYearChange = (date: Date) => setSelectedDate(date);

  // Handle date change apply from picker
  const handleDateChangeApply = () => {
    onTimelineChange?.(selectedDate);
    setIsMonthSelectorOpen(false);
  };

  return (
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart4 size={16} className="text-white/80" />
          <span className="text-sm font-medium">Budget Management</span>
        </div>

        <button
          className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors cursor-pointer relative group"
          onClick={() => navigate('/dashboard/budgets/settings')}
          aria-label="Budget Settings"
        >
          <Settings size={14} className="text-white" />

          <div className="absolute -bottom-8 right-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
            Budget Settings
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center">
        {/* Month Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="bg-white/20 p-1 rounded-md hover:bg-white/30 transition-colors cursor-pointer relative group"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} className="text-white" />

            <div className="absolute -bottom-8 left-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
              Previous Month
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
              className="bg-white/20 px-2 py-1 rounded-md hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer group"
            >
              <CalendarRange size={14} className="text-white" />

              <span className="text-xs font-medium">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </button>

            {/* Month-Year Picker Dropdown */}
            {isMonthSelectorOpen && (
              <>
                {/* Calendar container */}
                <div
                  ref={monthPickerRef}
                  className="absolute z-50 mt-2  left-0 top-full  mx-auto animate-in fade-in-0 zoom-in-95 duration-100 min-w-[260px] min-h-[300px]"
                  style={{ pointerEvents: 'auto' }}
                >
                  <MonthYearPicker
                    defaultMonth={selectedDate}
                    onMonthYearChange={handleMonthYearChange}
                    onClose={() => setIsMonthSelectorOpen(false)}
                    onApply={handleDateChangeApply}
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={goToNextMonth}
            className="bg-white/20 p-1 rounded-md hover:bg-white/30 transition-colors cursor-pointer relative group"
            aria-label="Next month"
          >
            <ChevronRight size={16} className="text-white" />

            <div className="absolute -bottom-8 right-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
              Next Month
            </div>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/dashboard/budgets/view')}
            className="bg-white/20 p-1.5 rounded-md hover:bg-white/30 transition-colors cursor-pointer relative group"
            aria-label="View Budget"
          >
            <Eye size={14} className="text-white" />

            <div className="absolute -bottom-8 right-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
              View Budget
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/income-sources')}
            className="bg-white/20 p-1.5 rounded-md hover:bg-white/30 transition-colors cursor-pointer relative group"
            aria-label="Manage Income Sources"
          >
            <WalletCards size={14} className="text-white" />

            <div className="absolute -bottom-8 right-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
              Manage Income
            </div>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white/20 p-1.5 rounded-md hover:bg-white/30 transition-colors cursor-pointer relative group"
            aria-label="Edit Categories"
          >
            <FolderPlus size={14} className="text-white" />

            <div className="absolute -bottom-8 right-0 bg-white text-primary-900 text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
              Edit Categories
            </div>
          </button>
        </div>
      </div>

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        currencySymbol={currencySymbol}
        onAddCategory={async data => {
          console.log('Adding category:', data);
          // Implement the actual API call logic here
        }}
        onUpdateCategory={async (id, data) => {
          console.log('Updating category:', id, data);
          // Implement the actual API call logic here
        }}
        onDeleteCategory={async id => {
          console.log('Deleting category:', id);
          // Implement the actual API call logic here
        }}
        currentMonthName={currentMonthName}
        currentYear={currentYear}
      />
    </div>
  );
};

export default ManagementCard;
