import { useState } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  X,
  Tag,
  DollarSign,
  Loader2,
} from 'lucide-react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyWithSymbol } from '@/lib/utils';
import type { Category } from '@/app/api/budgets';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currencySymbol: string;
  onAddCategory?: (data: { name: string; amountBudgeted: number }) => Promise<void>;
  onUpdateCategory?: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
  currentMonthName?: string;
  currentYear?: number;
}

// Form validation schema for categories
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  amountBudgeted: z.number().positive('Amount budgeted must be greater than zero'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

enum ModalMode {
  List,
  Add,
  Edit,
}

export function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  currencySymbol,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  currentMonthName = dayjs().format('MMMM'),
  currentYear = dayjs().year(),
}: CategoryManagementModalProps) {
  const [mode, setMode] = useState<ModalMode>(ModalMode.List);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      amountBudgeted: 0,
    },
  });

  // Switch to add mode
  const handleAddMode = () => {
    reset({ name: '', amountBudgeted: 0 });
    setMode(ModalMode.Add);
  };

  // Switch to edit mode for a specific category
  const handleEditMode = (category: Category) => {
    setSelectedCategory(category);
    setValue('name', category.name);
    setValue('amountBudgeted', category.amountBudgeted);
    setMode(ModalMode.Edit);
  };

  // Handle form submission
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (mode === ModalMode.Add && onAddCategory) {
        await onAddCategory(data);
        resetModal();
      } else if (mode === ModalMode.Edit && selectedCategory && onUpdateCategory) {
        await onUpdateCategory(selectedCategory._id, data);
        resetModal();
      }
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  // Handle category delete
  const handleDeleteCategory = async (categoryId: string) => {
    if (onDeleteCategory) {
      try {
        setCategoryToDelete(categoryId);
        await onDeleteCategory(categoryId);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
        setCategoryToDelete(null);
      }
    }
  };

  // Reset modal state
  const resetModal = () => {
    setMode(ModalMode.List);
    setSelectedCategory(null);
    reset();
  };

  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Get budget status details with softer colors
  const getBudgetStatus = (percentUsed: number) => {
    switch (true) {
      case percentUsed > 100:
        return {
          icon: <TrendingUp size={16} className="ml-1 text-rose-600" />,
          label: 'Over Budget',
          gradient: 'from-rose-50 to-rose-100',
          border: 'border-rose-400',
          text: 'text-rose-600',
          boldText: 'text-rose-700',
          buttonBg: 'bg-rose-500',
          buttonText: 'text-white',
        };

      case percentUsed >= 80:
        return {
          icon: <ArrowUpRight size={16} className="ml-1 text-amber-600" />,
          label: 'Near Limit',
          gradient: 'from-amber-50 to-amber-100',
          border: 'border-amber-400',
          text: 'text-amber-600',
          boldText: 'text-amber-700',
          buttonBg: 'bg-amber-500',
          buttonText: 'text-white',
        };

      case percentUsed > 0:
        return {
          icon: <TrendingDown size={16} className="ml-1 text-emerald-600" />,
          label: 'Under Budget',
          gradient: 'from-emerald-50 to-emerald-100',
          border: 'border-emerald-400',
          text: 'text-emerald-600',
          boldText: 'text-emerald-700',
          buttonBg: 'bg-emerald-500',
          buttonText: 'text-white',
        };

      default:
        return {
          icon: <DollarSign size={16} className="ml-1 text-slate-600" />,
          label: 'No Spending',
          gradient: 'from-slate-50 to-slate-100',
          border: 'border-slate-400',
          text: 'text-slate-600',
          boldText: 'text-slate-700',
          buttonBg: 'bg-slate-500',
          buttonText: 'text-white',
        };
    }
  };

  // Render different content based on mode
  const renderContent = () => {
    switch (mode) {
      case ModalMode.Add:
      case ModalMode.Edit:
        return (
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-5">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-medium text-slate-800">
                  {mode === ModalMode.Add ? 'Add New Category' : 'Edit Category'}
                </DialogTitle>

                <button
                  onClick={() => setMode(ModalMode.List)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <DialogDescription className="mt-1 text-slate-500">
                <span className="inline-block">
                  {mode === ModalMode.Add
                    ? `Create a new budget category for ${currentMonthName} ${currentYear}`
                    : `Update category for ${currentMonthName} ${currentYear}`}
                </span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              <div className="px-6 py-4 flex-1 space-y-5">
                {/* Category Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium flex items-center gap-1.5 text-slate-700"
                  >
                    <Tag size={13} className="text-primary" /> Category Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Groceries, Utilities, Entertainment"
                    {...register('name')}
                    className={`${
                      errors.name
                        ? 'border-rose-200 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-primary/30 focus:ring-primary/20'
                    } transition-all duration-200 bg-white/80`}
                  />

                  {errors.name && (
                    <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Amount Budgeted Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="amountBudgeted"
                    className="text-sm font-medium flex items-center gap-1.5 text-slate-700"
                  >
                    <DollarSign size={13} className="text-primary" /> Budget Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {currencySymbol}
                    </span>
                    <Input
                      id="amountBudgeted"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register('amountBudgeted', {
                        valueAsNumber: true,
                      })}
                      className={`pl-7 ${
                        errors.amountBudgeted
                          ? 'border-rose-200 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-primary/30 focus:ring-primary/20'
                      } transition-all duration-200 bg-white/80`}
                    />
                  </div>
                  {errors.amountBudgeted && (
                    <p className="text-rose-500 text-xs mt-1">{errors.amountBudgeted.message}</p>
                  )}
                </div>

                {/* Current Spending (Read-only) - Only for Edit mode */}
                {mode === ModalMode.Edit && selectedCategory && (
                  <div className="mt-2 p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">
                      Current Budget Status
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Spent</p>
                        <p className="text-base font-medium text-slate-800">
                          {formatCurrencyWithSymbol(
                            selectedCategory.amountSpent,
                            currencySymbol,
                            '0,0'
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Budget</p>
                        <p className="text-base font-medium text-slate-800">
                          {formatCurrencyWithSymbol(
                            selectedCategory.amountBudgeted,
                            currencySymbol,
                            '0,0'
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Percentage Used</span>
                        <span>
                          {Math.round(
                            (selectedCategory.amountSpent /
                              (selectedCategory.amountBudgeted || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative mt-auto">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <DialogFooter className="px-6 py-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode(ModalMode.List)}
                    className="border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {mode === ModalMode.Add ? 'Adding...' : 'Updating...'}
                      </span>
                    ) : (
                      <>{mode === ModalMode.Add ? 'Add Category' : 'Update Category'}</>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </div>
        );

      case ModalMode.List:
      default:
        return (
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between text-slate-600">
                <div>
                  <DialogTitle className="text-xl font-medium ">Budget Categories</DialogTitle>

                  <DialogDescription className="mt-1">
                    <span className="inline-block">
                      Manage your budget categories for {currentMonthName} {currentYear}
                    </span>
                  </DialogDescription>
                </div>

                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </DialogHeader>

            <div className="h-[1px] bg-slate-200 w-11/12 mx-auto my-4"></div>

            <div className="px-6 pb-4 flex-1 overflow-hidden">
              {/* Add New Category Button */}
              {onAddCategory && (
                <Button
                  onClick={handleAddMode}
                  variant="outline"
                  className="justify-self-end mb-4 w-fit flex items-center justify-center gap-1.5 border-primary-50 hover:border-primary-100 text-primary"
                >
                  <Plus size={15} />

                  <span>Add New Category</span>
                </Button>
              )}

              {/* Category List */}
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-12 border border-dashed border-slate-200 rounded-lg bg-gradient-to-b from-slate-50/80 to-white">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 text-slate-600">
                      <Tag size={20} className="text-primary" />
                    </div>

                    <p className="font-medium mb-2">No categories found</p>

                    <p className="text-sm mb-4 max-w-xs mx-auto">
                      Create categories to track spending in different areas of your budget.
                    </p>

                    {onAddCategory && (
                      <Button
                        onClick={handleAddMode}
                        variant="outline"
                        className="mb-4 w-fit flex items-center justify-center gap-1.5 border-primary-50 hover:border-primary-100 text-primary"
                      >
                        <Plus size={15} />

                        <span>Add New Category</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map(category => {
                      const percentUsed =
                        category.amountBudgeted > 0
                          ? (category.amountSpent / category.amountBudgeted || 0) * 100
                          : 0;

                      const status = getBudgetStatus(percentUsed);

                      const amountSpent = formatCurrencyWithSymbol(
                        category.amountSpent,
                        currencySymbol,
                        '0,0'
                      );

                      const amountBudgeted = formatCurrencyWithSymbol(
                        category.amountBudgeted,
                        currencySymbol,
                        '0,0'
                      );

                      return (
                        <div
                          key={category._id}
                          className={`bg-gradient-to-br ${status.gradient} p-3 rounded-lg border ${status.border} flex-shrink-0`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`text-xs font-medium ${status.text}`}>
                                {category.name}
                              </p>
                              <div className="flex items-center mt-1">
                                <p className={`text-lg font-bold ${status.boldText}`}>
                                  {Math.round(percentUsed)}%
                                </p>
                                {status.icon}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {onUpdateCategory && (
                                <button
                                  onClick={() => handleEditMode(category)}
                                  className={`p-1.5 rounded-md bg-white/80 ${status.text} hover:bg-white shadow-sm transition-colors`}
                                  aria-label={`Edit ${category.name} category`}
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}

                              {onDeleteCategory && (
                                <button
                                  onClick={() => handleDeleteCategory(category._id)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    categoryToDelete === category._id
                                      ? 'bg-white/80 text-rose-600 animate-pulse'
                                      : 'bg-white/80 text-rose-500 hover:bg-white hover:text-rose-600 shadow-sm'
                                  }`}
                                  disabled={categoryToDelete === category._id}
                                  aria-label={`Delete ${category.name} category`}
                                >
                                  {categoryToDelete === category._id ? (
                                    <Loader2 className="animate-spin" size={16} />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {amountSpent} of {amountBudgeted}
                              </span>
                              <span className={`text-xs ${status.text}`}>{status.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="relative mt-auto">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <DialogFooter className="px-6 py-4">
                <Button
                  onClick={handleClose}
                  type="button"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm p-0">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export default CategoryManagementModal;
