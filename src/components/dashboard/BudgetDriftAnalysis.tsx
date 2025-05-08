import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BudgetDriftAnalysisProps {
  selectedMonth: number;
}

// Category names and their monthly budget allocations
const CATEGORIES = [
  { name: 'Housing', budget: 1500, icon: '🏠' },
  { name: 'Food', budget: 800, icon: '🍔' },
  { name: 'Transportation', budget: 400, icon: '🚗' },
  { name: 'Entertainment', budget: 300, icon: '🎬' },
  { name: 'Shopping', budget: 350, icon: '🛍️' },
  { name: 'Utilities', budget: 200, icon: '💡' },
  { name: 'Health', budget: 150, icon: '⚕️' },
  { name: 'Personal', budget: 120, icon: '👤' },
];

const BudgetDriftAnalysis: React.FC<BudgetDriftAnalysisProps> = ({ selectedMonth }) => {
  // Generate random data for the selected month with some categories over and some under budget
  const categoryDriftData = useMemo(() => {
    // Seasonal adjustments based on month (e.g., higher entertainment in summer, higher utilities in winter)
    const getSeasonalAdjustment = (category: string, month: number) => {
      // Winter months (Nov-Feb)
      if (month === 10 || month === 11 || month === 0 || month === 1) {
        if (category === 'Utilities') return 1.3; // Higher utilities in winter
        if (category === 'Shopping') return 1.4; // Higher shopping in holiday season (Nov, Dec)
        if (category === 'Entertainment') return 0.8; // Lower entertainment in winter
      }

      // Summer months (Jun-Aug)
      if (month >= 5 && month <= 7) {
        if (category === 'Entertainment') return 1.5; // Higher entertainment in summer
        if (category === 'Transportation') return 1.3; // More travel in summer
        if (category === 'Utilities') return 0.9; // Lower utilities in summer
      }

      // Spring/Fall
      return 1.0;
    };

    // Calculate the actual amount spent for each category with seasonal and random factors
    return (
      CATEGORIES.map(category => {
        const seasonalFactor = getSeasonalAdjustment(category.name, selectedMonth);
        const randomFactor = 0.85 + Math.random() * 0.4; // Random factor between 0.85 and 1.25

        const actualAmount = Math.round(category.budget * seasonalFactor * randomFactor);
        const difference = actualAmount - category.budget;
        const percentDrift = (actualAmount / category.budget - 1) * 100;

        return {
          ...category,
          actual: actualAmount,
          difference,
          percentDrift: parseFloat(percentDrift.toFixed(1)),
          isOverBudget: actualAmount > category.budget,
        };
      })
        // Sort by most over budget to most under budget
        .sort((a, b) => b.percentDrift - a.percentDrift)
    );
  }, [selectedMonth]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="pb-1">
        <span className="text-sm text-gray-500">
          {categoryDriftData.filter(cat => cat.isOverBudget).length} of {categoryDriftData.length}{' '}
          categories over budget
        </span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {categoryDriftData.map(category => (
          <div
            key={category.name}
            className={`p-3 rounded-lg border ${
              category.isOverBudget
                ? 'border-red-100 bg-red-50/50'
                : 'border-green-100 bg-green-50/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-lg mr-2" aria-hidden="true">
                  {category.icon}
                </span>
                <div>
                  <h4 className="text-sm font-medium">{category.name}</h4>
                  <div className="flex items-center mt-0.5">
                    <span className="text-xs text-gray-500 mr-2">
                      Budget: {formatCurrency(category.budget)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Actual: {formatCurrency(category.actual)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center ${
                  category.isOverBudget ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {category.isOverBudget ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {category.isOverBudget ? '+' : '-'}
                  {formatCurrency(Math.abs(category.difference))}
                </span>
                <span className="text-xs ml-1">({Math.abs(category.percentDrift)}%)</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  category.isOverBudget
                    ? 'bg-gradient-to-r from-red-300 to-red-500'
                    : 'bg-gradient-to-r from-green-300 to-green-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.abs(category.percentDrift) * 3)}%`,
                  minWidth: '15%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetDriftAnalysis;
