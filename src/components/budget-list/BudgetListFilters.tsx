import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, FilterX } from 'lucide-react';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BudgetListFilterState } from '@/pages/dashboard/Budgets';

// Budget Filter Component Props
interface BudgetFiltersProps {
  disableFilters: boolean;
  budgetAmountFilter: BudgetListFilterState['budgetAmountFilter'];
  setBudgetAmountFilter: (filter: BudgetListFilterState['budgetAmountFilter']) => void;
  sortField: BudgetListFilterState['sortField'];
  setSortField: (field: BudgetListFilterState['sortField']) => void;
  sortOrder: BudgetListFilterState['sortOrder'];
  setSortOrder: (order: BudgetListFilterState['sortOrder']) => void;
  yearFilter: BudgetListFilterState['yearFilter'];
  setYearFilter: (year: BudgetListFilterState['yearFilter']) => void;
  monthFilter: BudgetListFilterState['monthFilter'];
  setMonthFilter: (month: BudgetListFilterState['monthFilter']) => void;
  resetFilters: () => void;
}

// Month names mapping
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Sort field options mapping
const SORT_FIELD_OPTIONS = [
  { value: 'year', label: 'Date' },
  { value: 'budgeted', label: 'Budget Amount' },
  { value: 'spent', label: 'Spent Amount' },
  { value: 'remaining', label: 'Remaining' },
  { value: 'percentage', label: 'Usage %' },
];

// Budget Filter Component
const BudgetFilters = ({
  budgetAmountFilter,
  setBudgetAmountFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  resetFilters,
  disableFilters,
}: BudgetFiltersProps) => {
  const [yearInput, setYearInput] = useState(yearFilter === 'all' ? '' : yearFilter.toString());

  // Create handler functions for filter buttons
  const handleFilterClick = (filter: 'all' | 'over' | 'under' | 'unused') => {
    setBudgetAmountFilter(filter);
  };

  const handleSortFieldChange = (value: BudgetListFilterState['sortField']) => {
    setSortField(value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYearInput(value);

    // Only update filter if value is a valid year or empty (all)
    if (value === '') {
      setYearFilter('all');
    } else {
      const numValue = parseInt(value, 10);

      if (!isNaN(numValue) && numValue > 1000 && numValue < 10000) {
        setYearFilter(numValue);
      }
    }
  };

  const handleMonthChange = (value: string) => {
    setMonthFilter(value === 'all' ? 'all' : parseInt(value, 10));
  };

  // Check if any filters are active to conditionally show reset button
  const hasActiveFilters =
    budgetAmountFilter !== 'all' ||
    sortField !== 'year' ||
    sortOrder !== 'desc' ||
    yearFilter !== 'all' ||
    monthFilter !== 'all';

  const disableAllFilters = !hasActiveFilters && disableFilters;

  // Get human-readable filter values for the summary
  const getSortFieldLabel = () => {
    const option = SORT_FIELD_OPTIONS.find(opt => opt.value === sortField);
    return option ? option.label : 'Date';
  };

  const getMonthLabel = () => {
    return monthFilter === 'all' ? 'All Months' : MONTH_NAMES[monthFilter as number];
  };

  const getStatusLabel = () => {
    switch (budgetAmountFilter) {
      case 'over':
        return 'Over Budget';
      case 'under':
        return 'Under Budget';
      case 'unused':
        return 'Unused';
      default:
        return 'All Statuses';
    }
  };

  return (
    <Card className="mb-6 shadow-md border border-gray-200/50 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-sm overflow-hidden relative">
      <CardContent className="p-4 flex flex-col gap-4 relative z-10">
        <div className="flex gap-4 justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Year and Month Filters */}
            <div className="group relative flex items-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-100 via-emerald-100/30 to-green-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center h-9 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-md shadow-primary/5">
                <span className="text-xs font-semibold text-primary px-3 border-r border-gray-100">
                  Year:
                </span>

                <input
                  disabled={disableAllFilters}
                  type="text"
                  value={yearInput}
                  onChange={handleYearInputChange}
                  placeholder="Any Year"
                  className="w-20 h-full text-xs px-3 border-0 focus:ring-0 focus:outline-none text-center font-medium"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            <div className="group relative flex items-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-100 via-cyan-100/30 to-blue-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center h-9 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-md shadow-primary/5">
                <span className="text-xs font-semibold text-primary px-3 border-r border-gray-100">
                  Month:
                </span>

                <Select
                  disabled={disableAllFilters}
                  value={monthFilter === 'all' ? 'all' : monthFilter.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-9 w-[120px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 px-3 text-xs font-medium">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>

                    {MONTH_NAMES.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget Status Filter */}
            <div className="group relative flex items-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-100 via-purple-100/30 to-fuchsia-100/50 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center h-9 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-md shadow-primary/5">
                <span className="text-xs font-semibold text-primary px-3 border-r border-gray-100">
                  Status:
                </span>

                <div className="flex h-full">
                  <button
                    disabled={disableFilters}
                    type="button"
                    onClick={() => handleFilterClick('all')}
                    className={`h-full px-3 text-xs font-medium transition-colors ${
                      budgetAmountFilter === 'all'
                        ? 'bg-blue-50/80 text-blue-700'
                        : 'bg-transparent text-gray-600 hover:bg-gray-50/80'
                    }`}
                  >
                    All
                  </button>

                  <div className="w-[1px] h-full bg-gray-100"></div>

                  <button
                    disabled={disableFilters}
                    type="button"
                    onClick={() => handleFilterClick('over')}
                    className={`h-full px-3 text-xs font-medium transition-colors ${
                      budgetAmountFilter === 'over'
                        ? 'bg-rose-50/80 text-rose-700'
                        : 'bg-transparent text-gray-600 hover:bg-gray-50/80'
                    }`}
                  >
                    Over Budget
                  </button>

                  <div className="w-[1px] h-full bg-gray-100"></div>

                  <button
                    disabled={disableFilters}
                    type="button"
                    onClick={() => handleFilterClick('under')}
                    className={`h-full px-3 text-xs font-medium transition-colors ${
                      budgetAmountFilter === 'under'
                        ? 'bg-emerald-50/80 text-emerald-700'
                        : 'bg-transparent text-gray-600 hover:bg-gray-50/80'
                    }`}
                  >
                    Under Budget
                  </button>

                  <div className="w-[1px] h-full bg-gray-100"></div>

                  <button
                    disabled={disableFilters}
                    type="button"
                    onClick={() => handleFilterClick('unused')}
                    className={`h-full px-3 text-xs font-medium transition-colors rounded-r-xl ${
                      budgetAmountFilter === 'unused'
                        ? 'bg-amber-50/80 text-amber-700'
                        : 'bg-transparent text-gray-600 hover:bg-gray-50/80'
                    }`}
                  >
                    Unused
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Controls */}
            <div className="group relative flex items-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-100 via-primary/10 to-indigo-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center h-9 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-md shadow-primary/5">
                <span className="text-xs font-semibold text-primary px-3 border-r border-gray-100">
                  Sort by:
                </span>

                <div className="flex h-full items-center">
                  <Select
                    disabled={disableFilters}
                    value={sortField}
                    onValueChange={handleSortFieldChange}
                  >
                    <SelectTrigger className="h-9 min-w-[140px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 px-3 text-xs font-medium">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      {SORT_FIELD_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="w-[1px] h-full bg-gray-100"></div>

                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button
                          disabled={disableFilters}
                          type="button"
                          onClick={handleSortOrderToggle}
                          className="h-full px-3 transition-colors hover:bg-gray-50/80"
                        >
                          {sortOrder === 'asc' ? (
                            <ArrowUpCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" className="text-xs bg-white shadow-sm">
                        {sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disableFilters}
                onClick={() => {
                  resetFilters();
                  setYearInput('');
                }}
                className="ml-2 text-xs h-7 px-2 border-gray-200 bg-white/80 hover:bg-gray-50 hover:text-primary shadow-sm"
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* Filter Summary - Only show when filters are active */}
          {hasActiveFilters && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Active:</span>

                {yearFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-100 shadow-sm">
                    {yearFilter}
                  </span>
                )}

                {monthFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 shadow-sm">
                    {getMonthLabel()}
                  </span>
                )}

                {budgetAmountFilter !== 'all' && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium shadow-sm ${
                      budgetAmountFilter === 'over'
                        ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-100'
                        : budgetAmountFilter === 'under'
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-100'
                          : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {getStatusLabel()}
                  </span>
                )}

                {(sortField !== 'year' || sortOrder !== 'desc') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-100 shadow-sm">
                    {getSortFieldLabel()} {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetFilters();
                    setYearInput('');
                  }}
                  className="text-xs text-gray-400 hover:bg-white/80 hover:text-red-600 flex items-center h-5 px-1.5 ml-auto"
                >
                  <FilterX size={12} className="mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetFilters;
