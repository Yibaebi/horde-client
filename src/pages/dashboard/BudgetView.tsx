import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart4 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryList from '@/components/dashboard/CategoryList';
import type { Category, IBudgetProps } from '@/app/api/budgets';

// Mock API call to fetch budget data
const fetchBudget = async (): Promise<IBudgetProps> => {
  // In a real app, you would fetch from your API
  return {
    _id: 'budget-123',
    user: 'user-123',
    currency: 'USD',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    currencySym: '$',
    amountBudgeted: 3000,
    amountSpent: 1750,
    budgetVariance: 1250,
    budgetSources: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: [
      {
        _id: 'cat-1',
        name: 'Housing',
        amountBudgeted: 1200,
        amountSpent: 1200,
        expensesStats: {
          totalAmount: 1200,
          count: 1,
          averageAmount: 1200,
          minAmount: 1200,
          maxAmount: 1200,
        },
        key: 'housing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cat-2',
        name: 'Food & Dining',
        amountBudgeted: 600,
        amountSpent: 450,
        expensesStats: {
          totalAmount: 450,
          count: 12,
          averageAmount: 37.5,
          minAmount: 15,
          maxAmount: 85,
        },
        key: 'food',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cat-3',
        name: 'Transportation',
        amountBudgeted: 400,
        amountSpent: 100,
        expensesStats: {
          totalAmount: 100,
          count: 4,
          averageAmount: 25,
          minAmount: 15,
          maxAmount: 40,
        },
        key: 'transportation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    lastExpenseDate: new Date(),
  };
};

// Mock API call to update a category
const updateCategory = async (categoryId: string, data: Partial<Category>): Promise<void> => {
  console.log('Updating category:', categoryId, data);
  // In a real app, you would call your API here
};

// Mock API call to delete a category
const deleteCategory = async (categoryId: string): Promise<void> => {
  console.log('Deleting category:', categoryId);
  // In a real app, you would call your API here
};

export function BudgetView() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<IBudgetProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBudget = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBudget();
        setBudget(data);
      } catch (error) {
        console.error('Failed to load budget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudget();
  }, []);

  const handleUpdateCategory = async (categoryId: string, data: Partial<Category>) => {
    if (!budget) return;

    try {
      await updateCategory(categoryId, data);

      // Update local state to reflect changes
      const updatedCategories = budget.categories.map(cat => {
        if (cat._id === categoryId) {
          return { ...cat, ...data };
        }
        return cat;
      });

      setBudget({
        ...budget,
        categories: updatedCategories,
        // Recalculate total budgeted amount if it changed
        amountBudgeted: data.amountBudgeted
          ? budget.amountBudgeted +
            (data.amountBudgeted -
              budget.categories.find(c => c._id === categoryId)!.amountBudgeted)
          : budget.amountBudgeted,
      });
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!budget) return;

    try {
      await deleteCategory(categoryId);

      // Remove category from local state
      const categoryToDelete = budget.categories.find(c => c._id === categoryId);
      if (!categoryToDelete) return;

      const updatedCategories = budget.categories.filter(cat => cat._id !== categoryId);

      setBudget({
        ...budget,
        categories: updatedCategories,
        amountBudgeted: budget.amountBudgeted - categoryToDelete.amountBudgeted,
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleAddCategory = () => {
    navigate('/dashboard/categories/new');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart4 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Budget Found</h3>
          <p className="mt-1 text-sm text-gray-500">Create a budget to get started.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard/budgets/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create Budget
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CategoryList
            categories={budget.categories}
            currencySymbol={budget.currencySym}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddCategory={handleAddCategory}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-3">Budget Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Month</span>
                <span className="font-medium">
                  {new Date(0, budget.month).toLocaleString('default', { month: 'long' })}{' '}
                  {budget.year}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-medium">
                  {budget.currencySym}
                  {budget.amountBudgeted.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium">
                  {budget.currencySym}
                  {budget.amountSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium text-green-600">
                  {budget.currencySym}
                  {(budget.amountBudgeted - budget.amountSpent).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600">Budget Usage</span>
                <span className="font-medium">
                  {Math.round((budget.amountSpent / budget.amountBudgeted) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(100, (budget.amountSpent / budget.amountBudgeted) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 mb-3">Category Count</h3>
            <div className="text-center py-3">
              <span className="text-3xl font-bold text-primary">{budget.categories.length}</span>
              <p className="text-sm text-gray-500 mt-1">Active budget categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetView;
