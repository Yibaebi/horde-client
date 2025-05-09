import { CreditCard, DollarSign, CalendarRange, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import pluralize from 'pluralize';

import { formatCurrencyWithSymbol, getMonthAndYearDate, getMonthName } from '@/lib/utils';
import type { IBudgetProps } from '@/app/api/budgets';

interface MonthlyBudgetCardProps {
  dashboardMonth: number;
  dashboardYear: number;
  budget?: IBudgetProps | null;
  isLoading?: boolean;
}

// Monthly Budget Card Component
export const MonthlyBudgetCard = ({
  budget,
  isLoading = false,
  dashboardMonth,
  dashboardYear,
}: MonthlyBudgetCardProps) => {
  // If data is still loading, show the skeleton
  if (isLoading) return <MonthlyBudgetCardSkeleton />;

  // If no budget is found, show the empty state
  if (!budget)
    return (
      <MonthlyBudgetEmptyState dashboardMonth={dashboardMonth} dashboardYear={dashboardYear} />
    );

  // Budget props
  const currentMonthName = getMonthName(budget.month);
  const currentYear = budget.year;
  const amountBudgeted = budget.amountBudgeted;
  const amountSpent = budget.amountSpent;
  const currencySymbol = budget.currencySym;
  const budgetProgress = ((amountSpent / amountBudgeted) * 100).toFixed(0);
  const lastExpenseDate = budget.lastExpenseDate;

  const budgetedAmount = formatCurrencyWithSymbol(amountBudgeted, currencySymbol, '0,0.00a');
  const spentBudget = formatCurrencyWithSymbol(amountSpent, currencySymbol, '0,00');

  const remainingBudget = formatCurrencyWithSymbol(
    amountBudgeted - amountSpent,
    currencySymbol,
    '0,00'
  );

  // Days left in month
  const isNotCurrentMonth = dashboardMonth !== dayjs().month() || dashboardYear !== dayjs().year();

  const monthAndYearDate = isNotCurrentMonth
    ? getMonthAndYearDate(dashboardMonth, dashboardYear)
    : dayjs();

  const endOfMonth = monthAndYearDate.endOf('month');
  const daysLeft = endOfMonth.diff(monthAndYearDate, 'days');
  const finalDaysLeft = isNotCurrentMonth ? daysLeft + 1 : daysLeft;
  const daysLeftText = pluralize('day', finalDaysLeft);

  // Last transaction date
  const lastTransactionDate = lastExpenseDate
    ? dayjs(lastExpenseDate).format('DD MMM YYYY, HH:mm')
    : 'No transactions yet';

  return (
    <div className="col-span-1 bg-gradient-to-br from-primary to-violet-600 rounded-lg p-6 shadow-lg relative overflow-hidden text-white h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-white/90">Monthly Summary</h3>

        <div className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl flex items-center border border-white/10">
          {currentMonthName} {currentYear}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-white/70">Budget for {currentMonthName}</p>

        <div className="flex items-baseline">
          <h2 className="text-4xl font-bold tracking-tight mt-1">{budgetedAmount}</h2>
        </div>
      </div>

      {/* Budget progress */}
      <div className="mt-6">
        <div className="flex justify-between text-[16px] mb-2">
          <span className="text-white">Progress ({budgetProgress}%)</span>
          <span className="text-white">
            {remainingBudget} of {budgetedAmount}
          </span>
        </div>

        <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400`}
            style={{ width: `${Number(budgetProgress) > 100 ? 100 : budgetProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center text-sm bg-white/10 rounded-xl p-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <CreditCard size={16} />
          </div>

          <span className="text-white mr-2">Spent so far</span>
          <span className=" ml-auto font-bold">{spentBudget}</span>
        </div>

        <div className="flex items-center text-sm bg-white/10 rounded-xl p-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <DollarSign size={16} />
          </div>

          <span className="text-white mr-2">Remaining</span>
          <span className=" ml-auto font-bold">{remainingBudget}</span>
        </div>
      </div>

      {/* Days left indicator */}
      <div className="mt-6 flex justify-between items-center text-sm">
        <span className="text-white/80">
          {isNotCurrentMonth ? 'Total days in' : 'Days left in'} {currentMonthName}
        </span>

        <span className="px-2 py-1 bg-white/20 rounded-md font-medium">
          {daysLeft === 0 ? 'Last day' : `${finalDaysLeft} ${daysLeftText}`}
        </span>
      </div>

      {/* Last transaction date */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
        <span className="text-white/80">Last transaction</span>

        <span className="flex items-center gap-1.5 text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse"></span>
          {lastTransactionDate}
        </span>
      </div>
    </div>
  );
};

// Monthly Budget Card Skeleton
export const MonthlyBudgetCardSkeleton = () => {
  return (
    <div className="col-span-1 bg-gradient-to-br from-primary to-violet-600 rounded-lg p-6 shadow-lg relative overflow-hidden text-white h-full">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

      <div className="relative">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded-xl w-28 animate-pulse"></div>
        </div>

        <div className="mt-6">
          <div className="h-4 bg-white/20 rounded w-40 animate-pulse"></div>
          <div className="h-10 bg-white/20 rounded w-48 mt-2 animate-pulse"></div>
        </div>

        {/* Budget progress skeleton */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/30 rounded-full w-2/3 animate-pulse"></div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center bg-white/10 rounded-xl p-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg mr-3 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-20 ml-auto animate-pulse"></div>
          </div>

          <div className="flex items-center bg-white/10 rounded-xl p-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg mr-3 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-20 ml-auto animate-pulse"></div>
          </div>
        </div>

        {/* Days left indicator skeleton */}
        <div className="mt-6 flex justify-between items-center">
          <div className="h-4 bg-white/20 rounded w-40 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded-md w-20 animate-pulse"></div>
        </div>

        {/* Last transaction date skeleton */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-white/20 rounded w-28 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Interface for the Monthly Budget Card Empty State
interface MonthlyBudgetEmptyStateProps {
  dashboardMonth: number;
  dashboardYear: number;
}

// Monthly Budget Card Empty State
export const MonthlyBudgetEmptyState = ({
  dashboardMonth,
  dashboardYear,
}: MonthlyBudgetEmptyStateProps) => {
  const navigate = useNavigate();

  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();

  const isCurrentMonth = dashboardMonth === currentMonth && dashboardYear === currentYear;
  const currentMonthName = getMonthName(isCurrentMonth ? currentMonth : dashboardMonth);

  const monthAndYear = isCurrentMonth ? 'this month' : `${currentMonthName} ${currentYear}`;

  return (
    <div className="col-span-1 bg-gradient-to-br from-primary/90 to-violet-600/90 rounded-lg p-6 shadow-lg relative overflow-hidden text-white h-full">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

      <div className="relative h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white/90">No Budget Yet</h3>

          <div className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl flex items-center border border-white/10">
            <CalendarRange size={14} className="mr-1.5" />
            {monthAndYear}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {isCurrentMonth ? 'Create Your First Budget' : 'Create Budget for'} {currentMonthName}
          </h3>

          <p className="text-white/70 text-sm mb-6 max-w-xs">
            Start tracking your finances by creating a budget for {currentMonthName}.
          </p>

          <button
            onClick={() => navigate('/dashboard/budgets/new')}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
          >
            <PlusCircle size={16} className="mr-2" />
            Create Budget
          </button>
        </div>

        <div className="border-t border-white/20 pt-4 mt-auto">
          <p className="text-xs text-white text-center">
            Setting up a budget helps you track spending and meet your financial goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudgetCard;
