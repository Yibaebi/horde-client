import { useEffect } from 'react';
import { X, Edit2, Tag, DollarSign, Clock } from 'lucide-react';
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

// Props for the CategoryEditModal component
interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSave: (updatedCategory: Partial<Category>) => Promise<void>;
  currencySymbol: string;
}

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  amountBudgeted: z.number().nonnegative('Amount budgeted must be a positive number'),
});

type FormData = z.infer<typeof formSchema>;

export function CategoryEditModal({
  isOpen,
  onClose,
  category,
  onSave,
  currencySymbol,
}: CategoryEditModalProps) {
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amountBudgeted: 0,
    },
  });

  // Set form data when category changes
  useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('amountBudgeted', category.amountBudgeted);
    }
  }, [category, setValue]);

  // Watch the current value of amountBudgeted for usage calculations
  const currentBudgetAmount = watch('amountBudgeted');

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      await onSave({
        name: data.name,
        amountBudgeted: data.amountBudgeted,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  // Format current spending for display
  const formattedSpending = category
    ? formatCurrencyWithSymbol(category.amountSpent, currencySymbol, '0,0')
    : formatCurrencyWithSymbol(0, currencySymbol, '0,0');

  // Format last updated date if available
  const lastUpdated = category?.updatedAt
    ? dayjs(category.updatedAt).format('MMM D, YYYY')
    : 'Never';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center justify-between text-lg font-medium">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                <Edit2 size={15} />
              </div>
              Edit Category
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </DialogTitle>

          <DialogDescription className="mt-1.5">
            Update the category name or budgeted amount.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 py-5">
            {/* Category Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                <Tag size={13} className="text-primary-600" /> Category Name
              </Label>

              <Input
                id="name"
                {...register('name')}
                className={`${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 focus:border-primary-400 focus:ring-primary-400'
                } transition-all duration-200`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Amount Budgeted Field */}
            <div className="space-y-2">
              <Label
                htmlFor="amountBudgeted"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <DollarSign size={13} className="text-primary-600" /> Budget Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  id="amountBudgeted"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('amountBudgeted', {
                    valueAsNumber: true,
                  })}
                  className={`pl-7 ${
                    errors.amountBudgeted
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:border-primary-400 focus:ring-primary-400'
                  } transition-all duration-200`}
                />
              </div>
              {errors.amountBudgeted && (
                <p className="text-red-500 text-xs mt-1">{errors.amountBudgeted.message}</p>
              )}
            </div>

            {/* Current Status Section */}
            {category && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Status</h4>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Spending</p>
                    <p className="text-base font-medium text-gray-800">{formattedSpending}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-base font-medium text-gray-800 flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      {lastUpdated}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Budget Usage</span>
                    <span>
                      {currentBudgetAmount > 0
                        ? `${Math.round((category.amountSpent / currentBudgetAmount) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary transition-all duration-300 ease-out`}
                      style={{
                        width: `${
                          currentBudgetAmount > 0
                            ? Math.min(100, (category.amountSpent / currentBudgetAmount) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-600 text-white"
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
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryEditModal;
