import { Calendar, ExternalLink } from 'lucide-react';
import { BadgeDollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { BudgetListItemProps } from '@/components/budget-list/BudgetTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumberToCommas, getMonthName } from '@/lib/utils';
import dayjs from 'dayjs';

// Budget Card Props
interface BudgetCardProps {
  budget: BudgetListItemProps;
}

// Beautiful gradient definitions for progress indicators
const GRADIENTS = {
  primary: 'linear-gradient(to right, #60a5fa, #3b82f6)',
  success: 'linear-gradient(to right, #34d399, #10b981)',
  warning: 'linear-gradient(to right, #fbbf24, #f59e0b)',
  danger: 'linear-gradient(to right, #f87171, #ef4444)',
  neutral: 'linear-gradient(to right, #d1d5db, #9ca3af)',
};

// Category colors for visualization
const CATEGORY_COLORS = {
  food: { color: '#8b5cf6', icon: BadgeDollarSign }, // purple
  housing: { color: '#3b82f6', icon: Calendar }, // blue
  transport: { color: '#f59e0b', icon: Calendar }, // amber
  entertainment: { color: '#ec4899', icon: Calendar }, // pink
  utilities: { color: '#14b8a6', icon: Calendar }, // teal
  misc: { color: '#9ca3af', icon: Calendar }, // gray
};

// Category mapping constants
const CATEGORY_MAPPING = {
  food: ['food', 'groc', 'meal', 'dining', 'restaurant'],
  housing: ['hous', 'rent', 'mortgage', 'property', 'home'],
  transport: ['trans', 'car', 'travel', 'gas', 'fuel', 'bus', 'train'],
  entertainment: ['ent', 'fun', 'leisure', 'recreation', 'movie', 'game'],
  utilities: ['util', 'bill', 'elect', 'water', 'gas', 'internet', 'phone'],
  misc: ['misc', 'other', 'random'],
};

// Get category ID from name for consistent colors
const getCategoryIdFromName = (categoryName: string): keyof typeof CATEGORY_COLORS => {
  const lowerCatName = categoryName.toLowerCase();

  for (const [key, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (keywords.some(keyword => lowerCatName.includes(keyword))) {
      return key as keyof typeof CATEGORY_COLORS;
    }
  }

  return 'misc';
};

// Get most used category data
const getMostUsedCategoryInfo = (budget: BudgetListItemProps) => {
  const { name, amountSpent } = budget.mostUsedCategory;
  const percentage = Math.round((amountSpent / budget.amountSpent) * 100) || 0;

  return {
    id: getCategoryIdFromName(name),
    name,
    percentage,
    amount: amountSpent,
  };
};

// Get visual styles and accent color based on budget status
const getVisualStyles = (isOverBudget: boolean, usagePercentage: number, budgetUnused: boolean) => {
  switch (true) {
    case isOverBudget:
      return {
        gradient: GRADIENTS.danger,
        color: '#ef4444', // Red
      };
    case usagePercentage > 80:
      return {
        gradient: GRADIENTS.warning,
        color: '#f59e0b', // Amber
      };
    case budgetUnused:
      return {
        gradient: GRADIENTS.neutral,
        color: '#9ca3af', // Gray
      };
    default:
      return {
        gradient: GRADIENTS.success,
        color: '#10b981', // Green
      };
  }
};

// Budget Card Component
const BudgetCard = ({ budget }: BudgetCardProps) => {
  const navigate = useNavigate();

  // Calculate budget status indicators
  const isOverBudget = budget.amountSpent > budget.amountBudgeted;
  const budgetUnused = budget.amountSpent === 0;
  const usagePercentage = Math.round((budget.amountSpent / budget.amountBudgeted) * 100);

  // Process category data
  const mostUsedCategoryInfo = getMostUsedCategoryInfo(budget);
  const categoryDetails = CATEGORY_COLORS[mostUsedCategoryInfo.id];
  const CategoryIcon = categoryDetails.icon;

  // Get visual styles and accent color based on budget status
  const { gradient, color } = getVisualStyles(isOverBudget, usagePercentage, budgetUnused);

  // Utility functions
  const lastDayOfMonth = dayjs().year(budget.year).month(budget.month).endOf('month').date();
  const navigateToDetails = () => navigate(`/dashboard/budgets/${budget._id}`);

  return (
    <Card
      className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative cursor-pointer group m-1"
      style={{
        borderRadius: '16px',
        borderLeft: `1px solid #f1f5f9`,
        borderTop: `1px solid #f1f5f9`,
        borderRight: `1px solid #e2e8f0`,
        borderBottom: `1px solid #e2e8f0`,
      }}
      onClick={navigateToDetails}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `
            linear-gradient(90deg, ${color}20 0%, transparent 50%),
            linear-gradient(180deg, ${color}20 0%, transparent 50%)
          `,
          borderRadius: '16px',
          opacity: 0.7,
        }}
      />

      <div className="px-6 pt-6 pb-3 group-hover:bg-gray-50/30 transition-colors relative">
        <div className="absolute -left-0 -right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {getMonthName(budget.month)} {budget.year}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Budget period: 1-{lastDayOfMonth} {getMonthName(budget.month)}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 rounded-xl h-9 px-4 text-sm font-medium transition-colors z-10"
            onClick={e => {
              e.stopPropagation();
              navigateToDetails();
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Details
          </Button>
        </div>

        {/* Amount display with beautiful typography */}
        <div className="mb-6">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-900 tracking-tighter">
                {budget.currencySym}
                {formatNumberToCommas(String(budget.amountSpent))}
              </span>

              <span className="text-base text-gray-500">
                of {budget.currencySym}
                {formatNumberToCommas(String(budget.amountBudgeted))}
              </span>
            </div>

            <div className="flex items-center mt-2">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(usagePercentage, 100)}%`,
                    background: gradient,
                  }}
                />
              </div>
              <span
                className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  isOverBudget
                    ? 'bg-red-100 text-red-700'
                    : usagePercentage > 80
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {usagePercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Category section */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100/80 group-hover:bg-gray-100/30 transition-colors">
        <div className="flex items-start">
          <div className="flex items-start gap-3 w-full">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
              style={{
                background: `radial-gradient(circle at center, ${categoryDetails?.color}30 0%, ${categoryDetails?.color}10 70%)`,
              }}
            >
              <CategoryIcon
                className="h-5 w-5"
                style={{ color: categoryDetails?.color || '#6366f1' }}
              />
            </div>

            <div>
              <div className="flex items-center">
                <h4 className="text-sm font-semibold text-gray-800">Most Used Category</h4>

                <span
                  className="ml-2 px-2 py-0.5 bg-white/80 text-gray-600 text-xs font-medium rounded-full shadow-sm"
                  style={{ borderLeft: `2px solid ${categoryDetails?.color}` }}
                >
                  {mostUsedCategoryInfo.percentage}%
                </span>
              </div>

              <p className="text-base font-medium text-gray-700 mt-0.5">
                {mostUsedCategoryInfo.name}
              </p>

              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-semibold">
                  {budget.currencySym}
                  {formatNumberToCommas(String(mostUsedCategoryInfo.amount))}
                </span>

                <span className="text-xs text-gray-500">spent in this category</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;
