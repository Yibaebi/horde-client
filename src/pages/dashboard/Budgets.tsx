import { useState, useEffect, useReducer, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, BarChart3, PieChart, ArrowUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useBudgets } from '@/hooks/useBudgets';
import useDeferredLoading from '@/hooks/useDeferredLoading';

import BudgetTable from '@/components/budget-list/BudgetTable';
import BudgetFilters from '@/components/budget-list/BudgetListFilters';
import EmptyBudgetListState from '@/components/budget-list/EmptyState';
import BudgetListViewToggle from '@/components/budget-list/ViewToggle';
import NoBudgetMatches from '@/components/budget-list/NoBudgetMatches';
import BudgetCardSkeleton from '@/components/budget-list/BudgetCardSkeleton';
import BudgetTableSkeleton from '@/components/budget-list/BudgetTableSkeleton';
import BudgetCard from '@/components/budget-list/BudgetCard';
import Pagination from '@/components/Pagination';
import ErrorCard from '@/components/ErrorCard';

type ViewMode = 'grid' | 'table';

// Filter state interface
export interface BudgetListFilterState {
  sortField: 'year' | 'budgeted' | 'spent' | 'remaining' | 'percentage';
  sortOrder: 'asc' | 'desc';
  budgetAmountFilter: 'all' | 'over' | 'under' | 'unused';
  yearFilter: number | 'all';
  monthFilter: number | 'all';
  searchQuery: string;
}

// Filter action types
type FilterAction =
  | { type: 'SET_SORT_FIELD'; payload: BudgetListFilterState['sortField'] }
  | { type: 'SET_SORT_ORDER'; payload: BudgetListFilterState['sortOrder'] }
  | { type: 'SET_BUDGET_AMOUNT_FILTER'; payload: BudgetListFilterState['budgetAmountFilter'] }
  | { type: 'SET_YEAR_FILTER'; payload: BudgetListFilterState['yearFilter'] }
  | { type: 'SET_MONTH_FILTER'; payload: BudgetListFilterState['monthFilter'] }
  | { type: 'RESET_FILTERS' };

// Initial filter state
const initialFilterState: BudgetListFilterState = {
  sortField: 'year',
  sortOrder: 'desc',
  budgetAmountFilter: 'all',
  yearFilter: 'all',
  monthFilter: 'all',
  searchQuery: '',
};

// Filter reducer function
const filterReducer = (
  state: BudgetListFilterState,
  action: FilterAction
): BudgetListFilterState => {
  switch (action.type) {
    case 'SET_SORT_FIELD':
      return { ...state, sortField: action.payload };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    case 'SET_BUDGET_AMOUNT_FILTER':
      return { ...state, budgetAmountFilter: action.payload };
    case 'SET_YEAR_FILTER':
      return { ...state, yearFilter: action.payload };
    case 'SET_MONTH_FILTER':
      return { ...state, monthFilter: action.payload };
    case 'RESET_FILTERS':
      return initialFilterState;
    default:
      return state;
  }
};

// Budgets Page Component
export const Budgets = () => {
  // Initialize view mode from localStorage or default to 'grid'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedView = localStorage.getItem('budgetViewMode');

    return (savedView as ViewMode) || 'grid';
  });

  // Filter state
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const { sortField, sortOrder, budgetAmountFilter, yearFilter, monthFilter, searchQuery } =
    filterState;

  const [pageOptions, setPageOptions] = useState({ page: 1, limit: 6 });

  // Reset to first page when filters change
  useEffect(() => {
    setPageOptions(prev => ({ ...prev, page: 1 }));
  }, [sortField, sortOrder, budgetAmountFilter, yearFilter, monthFilter, searchQuery]);

  // React Query hook for budgets
  const { data, isLoading, error, refetch } = useBudgets(pageOptions.page, pageOptions.limit, {
    sortField,
    sortOrder,
    budgetAmountFilter,
    yearFilter,
    monthFilter,
    searchQuery,
  });

  const budgets = useMemo(() => data?.budgets || [], [data]);
  const loading = useDeferredLoading(isLoading, 1000);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('budgetViewMode', viewMode);
  }, [viewMode]);

  const handlePageChange = (newPage: number) => {
    if (data?.pagination.totalPages && newPage >= 1 && newPage <= data.pagination.totalPages) {
      setPageOptions({ ...pageOptions, page: newPage });
    }
  };

  const handleItemsPerPageChange = (newLimit: number) =>
    setPageOptions({ ...pageOptions, limit: newLimit });

  // Filter action dispatchers
  const setSortFieldAction = (value: BudgetListFilterState['sortField']) =>
    dispatch({ type: 'SET_SORT_FIELD', payload: value });

  const setSortOrderAction = (value: BudgetListFilterState['sortOrder']) =>
    dispatch({ type: 'SET_SORT_ORDER', payload: value });

  const setBudgetAmountFilterAction = (value: BudgetListFilterState['budgetAmountFilter']) =>
    dispatch({ type: 'SET_BUDGET_AMOUNT_FILTER', payload: value });

  const setYearFilterAction = (value: BudgetListFilterState['yearFilter']) =>
    dispatch({ type: 'SET_YEAR_FILTER', payload: value });

  const setMonthFilterAction = (value: BudgetListFilterState['monthFilter']) =>
    dispatch({ type: 'SET_MONTH_FILTER', payload: value });

  // Reset filters function
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 relative">
      {/* Decorative background elements */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-16 -right-24 w-72 h-72 bg-indigo-200/10 rounded-full blur-3xl -z-10"></div>

      <div className="mb-12 relative">
        {/* Small decorative chart icons */}
        <div className="absolute -top-3 right-[15%] text-indigo-200/70 rotate-12">
          <BarChart3 className="h-7 w-7" />
        </div>

        <div className="absolute top-5 right-[8%] text-blue-200/70 -rotate-6">
          <PieChart className="h-6 w-6" />
        </div>

        {/* Main heading with enhanced design */}
        <div className="max-w-xl mx-auto text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="relative inline-block">
              <span className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-md rounded-full"></span>
              <Sparkles className="h-6 w-6 text-amber-400 animate-pulse relative" />
            </div>
          </div>

          <h1 className="!text-4xl font-bold bg-gradient-to-r from-blue-600 via-primary to-indigo-600 bg-clip-text text-transparent tracking-tight pb-1 relative">
            Budget Management
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-indigo-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full"></div>
          </h1>

          <p className="mt-4 text-gray-600 max-w-md mx-auto">
            View all existing budgets, create new ones, and make quick decisions on your finances.
          </p>
        </div>

        {/* Action buttons with enhanced design */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="p-1 rounded-lg bg-gradient-to-r from-blue-400/20 to-indigo-400/30">
            <BudgetListViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>

          <Link to="/dashboard/budgets/new">
            <Button className="shadow-lg hover:shadow-blue-300/30 transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 h-10 text-sm rounded-lg group">
              <div className="mr-1.5 relative">
                <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="absolute inset-0 bg-white rounded-full blur-md opacity-30 -z-10 scale-0 group-hover:scale-100 transition-transform"></span>
              </div>

              <span className="font-medium">Create Budget</span>

              <ArrowUp className="ml-1.5 h-2.5 w-2.5 rotate-45 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="sticky top-[4rem] z-30 py-2 backdrop-blur ">
        <BudgetFilters
          disableFilters={loading || !!error}
          budgetAmountFilter={budgetAmountFilter}
          setBudgetAmountFilter={setBudgetAmountFilterAction}
          sortField={sortField}
          setSortField={setSortFieldAction}
          sortOrder={sortOrder}
          setSortOrder={setSortOrderAction}
          resetFilters={resetFilters}
          yearFilter={yearFilter}
          setYearFilter={setYearFilterAction}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilterAction}
        />
      </div>

      {loading ? (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2">
              {Array(12)
                .fill(0)
                .map((_, index) => (
                  <BudgetCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
          ) : (
            <BudgetTableSkeleton />
          )}
        </div>
      ) : error ? (
        <ErrorCard error={error} reload={refetch} />
      ) : budgets.length === 0 ? (
        <EmptyBudgetListState />
      ) : (
        <>
          {budgets.length === 0 ? (
            <NoBudgetMatches
              resetFilters={resetFilters}
              budgetAmountFilter={budgetAmountFilter}
              yearFilter={yearFilter}
              searchQuery={searchQuery}
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-2">
                  {budgets.map(budget => (
                    <BudgetCard key={budget._id} budget={budget} />
                  ))}
                </div>
              ) : (
                <BudgetTable budgets={budgets} />
              )}

              <Pagination
                pagination={{ pageIndex: pageOptions.page - 1 }}
                handlePageChange={handlePageChange}
                pageCount={data?.pagination.totalPages || 1}
                itemsPerPage={pageOptions.limit}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
