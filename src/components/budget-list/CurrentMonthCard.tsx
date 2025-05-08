import { Calendar, ExternalLink, MoveUpRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetListItemProps } from './BudgetTable';
import { formatCurrency, getMonthName } from '@/lib/utils';

interface CurrentMonthCardProps {
  currentMonthBudget?: BudgetListItemProps;
  isLoading: boolean;
}

const CurrentMonthCard = ({ currentMonthBudget, isLoading }: CurrentMonthCardProps) => {
  const navigate = useNavigate();
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const currentMonthName = getMonthName(currentMonth);

  // If no budget exists for current month or still loading
  if (!currentMonthBudget || isLoading) {
    return (
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md border border-blue-200 overflow-hidden relative">
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-blue-500 text-white shadow">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {currentMonthName} {currentYear}
                </h3>
                <p className="text-sm text-gray-600">Current Month</p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard/budgets/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <MoveUpRight className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">No budget created for this month yet</p>
              <p className="text-blue-700 text-sm font-medium mt-1">
                Get started by creating a new budget
              </p>
            </div>

            <div className="hidden md:block">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-indigo-200/30 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate budget progress
  const usagePercentage = Math.round(
    (currentMonthBudget.amountSpent / currentMonthBudget.amountBudgeted) * 100
  );
  const isOverBudget = currentMonthBudget.amountSpent > currentMonthBudget.amountBudgeted;
  const progressColor = isOverBudget
    ? 'bg-gradient-to-r from-rose-400 to-rose-500'
    : usagePercentage > 80
      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
      : 'bg-gradient-to-r from-emerald-400 to-emerald-500';

  // Get most used category if available
  const hasMostUsedCategory =
    currentMonthBudget.mostUsedCategory && currentMonthBudget.mostUsedCategory.amountSpent > 0;

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md border border-blue-200 overflow-hidden relative">
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-500 text-white shadow">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {currentMonthName} {currentYear}
              </h3>
              <p className="text-sm text-gray-600">Current Month</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/budgets/${currentMonthBudget._id}`)}
            className="border border-blue-200 bg-white hover:bg-blue-50 text-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Budget</p>
            <p className="text-xl font-bold text-teal-700">
              {currentMonthBudget.currencySym}
              {formatCurrency(currentMonthBudget.amountBudgeted)}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Spent</p>
            <p className="text-xl font-bold text-violet-700">
              {currentMonthBudget.currencySym}
              {formatCurrency(currentMonthBudget.amountSpent)}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <div className="flex items-center">
              <p
                className={`text-xl font-bold ${currentMonthBudget.budgetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                {currentMonthBudget.currencySym}
                {formatCurrency(Math.abs(currentMonthBudget.budgetVariance))}
              </p>
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${currentMonthBudget.budgetVariance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
              >
                {usagePercentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {hasMostUsedCategory && (
          <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Top Spending Category</p>
            <div className="flex justify-between items-center">
              <p className="text-md font-medium text-gray-800">
                {currentMonthBudget.mostUsedCategory.name}
              </p>
              <div className="flex items-center">
                <TrendingUp className="h-3.5 w-3.5 text-rose-500 mr-1" />
                <p className="text-rose-600 font-medium">
                  {currentMonthBudget.currencySym}
                  {formatCurrency(currentMonthBudget.mostUsedCategory.amountSpent)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-indigo-200/30 rounded-full blur-xl"></div>
      </div>
    </Card>
  );
};

export default CurrentMonthCard;
