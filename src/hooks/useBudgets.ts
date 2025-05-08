import { useQuery } from '@tanstack/react-query';
import { api } from '@/app/api/axios';
import { BudgetsListResponse } from '@/components/budget-list/BudgetTable';
import { BudgetListFilterState } from '@/pages/dashboard/Budgets';

interface BudgetQueryParams {
  page: number;
  limit: number;
}

/**
 * Enhanced fetch budgets function with filters
 * @param page - The page number to fetch
 * @param limit - The number of budgets to fetch per page
 * @param filters - The filters to apply to the budgets
 * @returns The budgets
 */
const fetchBudgetsWithFilters = async ({
  page,
  limit,
  ...filters
}: BudgetQueryParams & BudgetListFilterState) => {
  const response = await api.get<{ data: BudgetsListResponse }>('/user/budget/get-all', {
    params: {
      page,
      limit,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder,
      budgetAmountFilter: filters.budgetAmountFilter,
      yearFilter: filters.yearFilter !== 'all' ? filters.yearFilter : undefined,
      monthFilter: filters.monthFilter !== 'all' ? filters.monthFilter : undefined,
      searchQuery: filters.searchQuery ? filters.searchQuery.trim() : undefined,
    },
  });

  return response.data.data;
};

/**
 * React Query hook for budgets
 * @param page - The page number to fetch
 * @param limit - The number of budgets to fetch per page
 * @param filters - The filters to apply to the budgets
 * @returns The budgets
 */
export const useBudgets = (
  page: number,
  limit: number,
  filters: Partial<BudgetListFilterState> = {}
) => {
  // Default filter values
  const defaultFilters: BudgetListFilterState = {
    sortField: 'year',
    sortOrder: 'desc',
    budgetAmountFilter: 'all',
    yearFilter: 'all',
    monthFilter: 'all',
    searchQuery: '',
  };

  // Merge provided filters with defaults
  const mergedFilters = { ...defaultFilters, ...filters };

  return useQuery({
    queryKey: ['budgets', page, limit, filters],
    queryFn: () => fetchBudgetsWithFilters({ page, limit, ...mergedFilters }),
  });
};
