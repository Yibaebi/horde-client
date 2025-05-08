import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Loader2,
} from 'lucide-react';
import { formatCurrencyWithSymbol } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Category } from '@/app/api/budgets';
import { ReactNode } from 'react';

import CategoryEditModal from '../dashboard/CategoryEditModal';

interface CategoryListProps {
  categories: Category[];
  currencySymbol: string;
  onUpdateCategory: (categoryId: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onAddCategory?: () => void;
}

type BudgetStatus = {
  icon: ReactNode;
  label: string;
  bgColor: string;
  textColor: string;
  progressColor: string;
};

export function CategoryList({
  categories,
  currencySymbol,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
}: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleSaveCategory = async (updatedData: Partial<Category>) => {
    if (editingCategory) {
      await onUpdateCategory(editingCategory._id, updatedData);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (onDeleteCategory) {
      try {
        setDeleting(categoryId);
        await onDeleteCategory(categoryId);
      } catch (error) {
        console.error('Failed to delete category:', error);
      } finally {
        setDeleting(null);
      }
    }
  };

  // Helper function to determine budget status
  const getBudgetStatus = (percentUsed: number): BudgetStatus => {
    switch (true) {
      case percentUsed > 100:
        return {
          icon: <TrendingUp size={12} />,
          label: 'Over Budget',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-600',
          progressColor: 'bg-rose-500',
        };

      case percentUsed >= 80:
        return {
          icon: <ArrowUpRight size={12} />,
          label: 'Near Limit',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-600',
          progressColor: 'bg-amber-500',
        };

      case percentUsed > 0:
        return {
          icon: <TrendingDown size={12} />,
          label: 'Under Budget',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          progressColor: 'bg-emerald-500',
        };

      default:
        return {
          icon: <span />,
          label: 'No Spending',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-600',
          progressColor: 'bg-slate-300',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
          <span>Budget Categories</span>

          <span className="text-xs text-slate-500 font-normal">({categories.length})</span>
        </h3>

        {onAddCategory && (
          <Button
            onClick={onAddCategory}
            variant="outline"
            size="sm"
            className="text-primary border-primary/20 hover:bg-primary-50"
          >
            <Plus size={14} className="mr-1" />
            Add Category
          </Button>
        )}
      </div>

      <div className="space-y-3.5">
        {categories.length === 0 ? (
          categories.map(category => {
            const percentUsed =
              category.amountBudgeted > 0
                ? (category.amountSpent / category.amountBudgeted) * 100
                : 0;

            const status = getBudgetStatus(percentUsed);

            return (
              <div
                key={category._id}
                className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm hover:shadow transition-shadow duration-200 relative overflow-hidden"
              >
                {/* Category accent color bar */}
                <div className={`absolute top-0 left-0 h-full w-1.5 ${status.progressColor}`} />

                <div className="flex justify-between items-start ml-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{category.name}</h4>

                    <div className="flex items-center gap-3 mt-1 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${status.bgColor} border border-${status.textColor.split('-')[1]}-200 ${status.textColor}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>

                      <span className="text-sm text-slate-500">
                        {formatCurrencyWithSymbol(category.amountSpent, currencySymbol, '0,0')} of{' '}
                        {formatCurrencyWithSymbol(category.amountBudgeted, currencySymbol, '0,0')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                      aria-label={`Edit ${category.name} category`}
                    >
                      <Pencil size={16} />
                    </button>

                    {onDeleteCategory && (
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          deleting === category._id
                            ? 'bg-rose-100 text-rose-600'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        disabled={deleting === category._id}
                        aria-label={`Delete ${category.name} category`}
                      >
                        {deleting === category._id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.progressColor} transition-all duration-300`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>

                <div className="flex justify-end mt-1.5">
                  <span className="text-xs font-medium text-slate-500">
                    {Math.round(percentUsed)}% used
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-gradient-to-b from-slate-50/80 to-white">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-3">
              <Tag size={20} className="text-primary" />
            </div>

            <p className="text-slate-700 font-medium mb-2">No categories found</p>

            <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">
              Create categories to track spending in different areas of your budget.
            </p>

            {onAddCategory && (
              <Button
                onClick={onAddCategory}
                variant="outline"
                className="flex items-center gap-1.5 border-primary/20 text-primary hover:bg-primary-50"
              >
                <Plus size={16} />
                Add your first category
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <CategoryEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        onSave={handleSaveCategory}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

export default CategoryList;
