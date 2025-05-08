import { api } from './axios';
import { ApiResponse, ICurrentMonthAnalyticsData } from '@/types/api';

export interface Category {
  expensesStats: {
    totalAmount: number;
    count: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  };
  key: string;
  amountBudgeted: number;
  name: string;
  amountSpent: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSource {
  name: string;
  amount: number;
  description: string;
  recurring: boolean;
  frequency: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudgetProps {
  _id: string;
  user: string;
  currency: string;
  year: number;
  month: number;
  currencySym: string;
  amountSpent: number;
  budgetVariance: number;
  amountBudgeted: number;
  categories: Category[];
  budgetSources: BudgetSource[];
  createdAt: string;
  updatedAt: string;
  lastExpenseDate: Date;
}

export const budgetApi = {
  getCurrentMonthBudget: async () =>
    (await api.get<ApiResponse<IBudgetProps>>('/user/budget/current-budget')).data.data,

  getBudgetById: async (id: string) =>
    await api.get<ApiResponse<IBudgetProps>>(`/user/budget/${id}`),

  getCurrentMonthAnalytics: async (month: string | number, year: string | number) =>
    (
      await api.get<ApiResponse<ICurrentMonthAnalyticsData>>(
        `/user/budget/current-month-analytics?month=${month}&year=${year}`
      )
    ).data.data,

  getBudgetByMonthAndYear: async (month: string | number, year: string | number) =>
    (
      await api.get<ApiResponse<IBudgetProps>>(
        `/user/budget/get-by-month-and-year?month=${month}&year=${year}`
      )
    ).data.data,
};
