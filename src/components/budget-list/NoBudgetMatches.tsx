import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BudgetListFilterState } from '@/pages/dashboard/Budgets';

// No Matches State Component
interface NoBudgetMatchesProps {
  resetFilters: () => void;
  budgetAmountFilter: BudgetListFilterState['budgetAmountFilter'];
  yearFilter: number | 'all';
  searchQuery: string;
}

const NoBudgetMatches = ({
  resetFilters,
  budgetAmountFilter,
  yearFilter,
  searchQuery,
}: NoBudgetMatchesProps) => {
  const getFilterMessage = () => {
    const filters = [];

    if (searchQuery) {
      filters.push(`matching "${searchQuery}"`);
    }

    if (budgetAmountFilter !== 'all') {
      const filterLabels = {
        over: 'over budget',
        under: 'under budget',
        unused: 'unused',
      };

      filters.push(filterLabels[budgetAmountFilter]);
    }

    if (yearFilter !== 'all') {
      filters.push(`from ${yearFilter}`);
    }

    return filters.length > 0
      ? `No budgets found that are ${filters.join(' and ')}.`
      : 'No budgets match your current filter criteria.';
  };

  return (
    <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-md border border-gray-200/50 rounded-xl">
      <div className="p-4 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">No matching budgets</h3>

        <p className="text-muted-foreground mb-6">{getFilterMessage()}</p>

        <Button
          variant="outline"
          className="shadow-sm bg-white hover:bg-blue-50 border-blue-200"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </Card>
  );
};

export default NoBudgetMatches;
