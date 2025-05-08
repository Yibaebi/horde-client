import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/app/api/axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  Calendar,
  DollarSign,
  Trash2,
  TrendingUp,
  ShoppingCart,
  ArrowLeft,
  Wallet,
  BadgeDollarSign,
  LightbulbIcon,
  CheckCircle2,
  BarChart3,
  PieChart,
  Sparkles,
  Plus,
} from 'lucide-react';

interface CategoryInput {
  name: string;
  amount: number;
  id: string; // client-side ID for handling the form
}

interface IncomeSourceInput {
  name: string;
  amount: number;
  description: string;
  recurring: boolean;
  frequency: 'monthly' | 'one-time';
  id: string; // client-side ID for handling the form
}

type BudgetFormData = {
  month: number;
  year: number;
  currency: string;
  categories: CategoryInput[];
  incomeSources: IncomeSourceInput[];
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: dayjs().month(i).format('MMMM'),
}));

const YEARS = Array.from({ length: 3 }, (_, i) => ({
  value: dayjs().year() + i,
  label: String(dayjs().year() + i),
}));

export const NewBudget = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    currency: 'USD',
    categories: [{ name: '', amount: 0, id: crypto.randomUUID() }],
    incomeSources: [
      {
        name: '',
        amount: 0,
        description: '',
        recurring: true,
        frequency: 'monthly',
        id: crypto.randomUUID(),
      },
    ],
  });
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const CURRENCY_OPTIONS = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const currencySymbol =
    CURRENCY_OPTIONS[formData.currency as keyof typeof CURRENCY_OPTIONS] || '₦';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate categories and income sources
    if (formData.categories.some(cat => !cat.name.trim())) {
      toast.error('Please fill in all category names');
      return;
    }
    if (formData.incomeSources.some(source => !source.name.trim())) {
      toast.error('Please fill in all income source names');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/user/budget', {
        year: formData.year,
        month: formData.month,
        categories: formData.categories,
        budgetSources: formData.incomeSources,
        currency: formData.currency,
      });
      toast.success('Budget created successfully');
      navigate('/dashboard/budgets');
    } catch (error: unknown) {
      console.error('Error creating budget:', error instanceof Error ? error.message : error);

      // Check for the specific error message in the response
      const errorResponse = error as {
        response?: {
          data?: { message?: string; errorDetails?: { duplicateBudget?: { _id?: string } } };
        };
      };
      const errorMessage = errorResponse.response?.data?.message;
      const duplicateBudgetId = errorResponse.response?.data?.errorDetails?.duplicateBudget?._id;

      if (errorMessage?.includes('already been created')) {
        toast.error('Budget Already Exists', {
          description: `A budget for ${MONTHS[formData.month].label} ${formData.year} has already been created.`,
          action: {
            label: 'View Budget',
            onClick: () =>
              navigate(
                duplicateBudgetId ? `/dashboard/budgets/${duplicateBudgetId}` : '/dashboard/budgets'
              ),
          },
          classNames: {
            actionButton:
              '!border !border-[#E60000] !text-[#E60000] !bg-white hover:!bg-red-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
          },
          duration: 50000,
        });
      } else {
        toast.error('Failed to Create Budget', {
          description:
            errorMessage || 'Please try again or contact support if the problem persists.',
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', amount: 0, id: crypto.randomUUID() }],
    }));
  };

  const removeCategory = (index: number) => {
    if (formData.categories.length === 1) return;
    const newCategories = [...formData.categories];
    newCategories.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      categories: newCategories,
    }));
    calculateTotals(newCategories, formData.incomeSources);
  };

  const addIncomeSource = () => {
    setFormData(prev => ({
      ...prev,
      incomeSources: [
        ...prev.incomeSources,
        {
          name: '',
          amount: 0,
          description: '',
          recurring: true,
          frequency: 'monthly',
          id: crypto.randomUUID(),
        },
      ],
    }));
  };

  const removeIncomeSource = (index: number) => {
    if (formData.incomeSources.length === 1) return;
    const newIncomeSources = [...formData.incomeSources];
    newIncomeSources.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      incomeSources: newIncomeSources,
    }));
    calculateTotals(formData.categories, newIncomeSources);
  };

  const updateCategory = (index: number, field: keyof CategoryInput, value: string | number) => {
    const newCategories = [...formData.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      categories: newCategories,
    }));
    calculateTotals(newCategories, formData.incomeSources);
  };

  const updateIncomeSource = (
    index: number,
    field: keyof IncomeSourceInput,
    value: string | number
  ) => {
    const newIncomeSources = [...formData.incomeSources];
    newIncomeSources[index] = { ...newIncomeSources[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      incomeSources: newIncomeSources,
    }));
    calculateTotals(formData.categories, newIncomeSources);
  };

  const calculateTotals = (cats: CategoryInput[], sources: IncomeSourceInput[]) => {
    const budgetedTotal = cats.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0);
    const incomeTotal = sources.reduce((sum, source) => sum + (Number(source.amount) || 0), 0);
    setTotalBudgeted(budgetedTotal);
    setTotalIncome(incomeTotal);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 relative">
      {/* Background Illustrations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 text-primary/10">
          <DollarSign className="w-12 h-12" />
        </div>
        <div className="absolute bottom-40 left-10 text-green-500/10">
          <BadgeDollarSign className="w-16 h-16" />
        </div>
        <div className="absolute bottom-20 right-40 text-blue-500/10">
          <PieChart className="w-14 h-14" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-indigo-500/10">
          <BarChart3 className="w-12 h-12" />
        </div>

        <div className="absolute bottom-60 right-20 text-emerald-500/10">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        {/* Subtle patterns */}
        <div className="absolute top-1/3 right-1/3">
          <div className="grid grid-cols-3 gap-3 opacity-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-primary"></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/3">
          <div className="grid grid-cols-2 gap-4 opacity-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-3 rounded-full bg-green-500"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/budgets')}
            className="mb-2 text-muted-foreground hover:text-foreground transition-colors bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            Create New Budget
            <Sparkles className="h-5 w-5 text-amber-400 mt-1" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up your financial plan for {MONTHS[formData.month].label} {formData.year}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/budgets')}
            className="border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            form="budget-form"
            className="px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-md transition-all hover:shadow-lg"
          >
            {isLoading ? 'Creating...' : 'Create Budget'}
          </Button>
        </div>
      </div>

      {/* Budget Tip - Moved to top */}
      <Card className="shadow-lg border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-white backdrop-blur-sm mb-8 relative overflow-hidden rounded-xl">
        <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-amber-200/30 blur-lg"></div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-amber-200/40 blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 opacity-5">
          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
          <div className="h-2 w-2 rounded-full bg-amber-500 mt-4 ml-3"></div>
          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 ml-1"></div>
        </div>
        <CardContent className="p-3 flex items-center">
          <div className="mr-4 flex-shrink-0 bg-amber-100 p-2.5 rounded-full shadow-md">
            <LightbulbIcon className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Budget Planning Tip</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Consider the 50/30/20 rule: Allocate 50% of your income to necessities, 30% to wants,
              and 20% to savings and debt repayment for a balanced budget.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Period and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Budget Period Card */}
        <Card className="shadow-lg border border-purple-200/50 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-purple-100/50 rounded-full blur-xl"></div>
          <CardHeader className="pb-2 border-b border-purple-100">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <div className="p-2 rounded-md bg-purple-500/10 text-purple-700 shadow-sm">
                <Calendar className="h-5 w-5" />
              </div>
              Budget Preferences
            </CardTitle>
            <CardDescription>Select month, year and currency for this budget</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 inline-block">
                    Month
                  </Label>
                  <Select
                    value={String(formData.month)}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, month: Number(value) }))
                    }
                  >
                    <SelectTrigger className="h-9 border-purple-200 bg-white shadow-sm focus:border-purple-400 focus:ring-purple-400">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 inline-block">
                    Year
                  </Label>
                  <Select
                    value={String(formData.year)}
                    onValueChange={value => setFormData(prev => ({ ...prev, year: Number(value) }))}
                  >
                    <SelectTrigger className="h-9 border-purple-200 bg-white shadow-sm focus:border-purple-400 focus:ring-purple-400">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(year => (
                        <SelectItem key={year.value} value={String(year.value)}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1 inline-block">
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={value => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="h-9 border-purple-200 bg-white shadow-sm focus:border-purple-400 focus:ring-purple-400">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_OPTIONS).map(([code, symbol]) => (
                      <SelectItem key={code} value={code}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{code}</span>
                          <span className="text-muted-foreground">({symbol})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="shadow-lg border border-blue-200/50 bg-white/80 backdrop-blur-sm lg:col-span-2 rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-blue-100/50 rounded-full blur-xl"></div>
          <CardHeader className="pb-2 border-b border-blue-100">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
              <div className="p-2 rounded-md bg-blue-500/10 text-blue-700 shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              Budget Summary
            </CardTitle>
            <CardDescription>Overview of your budget allocation</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100/30 border border-teal-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <BadgeDollarSign className="h-3.5 w-3.5 text-teal-600" />
                  Income
                </p>
                <p className="text-lg font-semibold text-teal-600">
                  {currencySymbol}
                  {totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                  Budgeted
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {currencySymbol}
                  {totalBudgeted.toLocaleString()}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-lg shadow-sm ${
                  totalIncome >= totalBudgeted
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100'
                    : 'bg-gradient-to-br from-rose-50 to-rose-100/30 border border-rose-100'
                }`}
              >
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  {totalIncome >= totalBudgeted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-rose-600" />
                  )}
                  Remaining
                </p>
                <p
                  className={`text-lg font-semibold ${
                    totalIncome >= totalBudgeted ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {currencySymbol}
                  {Math.abs(totalIncome - totalBudgeted).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Budget Utilization</span>
                <span
                  className={`font-medium px-2 py-0.5 rounded-full text-xs shadow-sm ${
                    totalBudgeted > totalIncome
                      ? 'bg-rose-100 text-rose-700'
                      : totalBudgeted === 0
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {totalIncome > 0 ? Math.round((totalBudgeted / totalIncome) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 ${
                    totalBudgeted > totalIncome
                      ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      totalIncome > 0 ? (totalBudgeted / totalIncome) * 100 : 0,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500">
                {totalBudgeted > totalIncome
                  ? `Over budget by ${currencySymbol}${(totalBudgeted - totalIncome).toLocaleString()}`
                  : totalBudgeted === 0
                    ? 'Start adding categories and income sources'
                    : `You have ${currencySymbol}${(totalIncome - totalBudgeted).toLocaleString()} left to allocate`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <form id="budget-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Income Sources */}
          <Card className="shadow-lg border border-teal-200/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100/20 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-20 left-10">
              <div className="grid grid-cols-3 gap-1 opacity-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                ))}
              </div>
            </div>
            <CardHeader className="border-b border-teal-100 bg-white/90 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <div className="p-2 rounded-md bg-teal-500/10 text-teal-700 shadow-sm">
                    <Wallet className="h-5 w-5" />
                  </div>
                  Income Sources
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Total:</span>
                  <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-md shadow-md">
                    {currencySymbol}
                    {totalIncome.toLocaleString()}
                  </span>
                </div>
              </div>
              <CardDescription>Add your sources of income</CardDescription>
            </CardHeader>
            <CardContent className="p-4 relative">
              <div className="space-y-3">
                {formData.incomeSources.map((source, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white border border-teal-100 shadow-md hover:border-teal-300 transition-all hover:shadow-lg relative"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-teal-50/50 rounded-bl-full rounded-tr-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-2 relative">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-xs mr-2 shadow-md">
                          {index + 1}
                        </div>
                        <p className="font-medium text-gray-800 text-sm">Income Source</p>
                      </div>
                      {formData.incomeSources.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIncomeSource(index)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor={`source-name-${index}`}
                          className="text-xs font-medium text-gray-600 mb-0.5 inline-block"
                        >
                          Source Name
                        </Label>

                        <Input
                          id={`source-name-${index}`}
                          value={source.name}
                          onChange={e => updateIncomeSource(index, 'name', e.target.value)}
                          placeholder="e.g., Salary, Freelance, Business"
                          className="h-8 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor={`source-amount-${index}`}
                          className="text-xs font-medium text-gray-600 mb-0.5 inline-block"
                        >
                          Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-teal-600 font-medium">
                            {currencySymbol}
                          </span>
                          <Input
                            id={`source-amount-${index}`}
                            type="number"
                            value={source.amount}
                            onChange={e =>
                              updateIncomeSource(index, 'amount', Number(e.target.value))
                            }
                            placeholder="0"
                            className="pl-5 h-8 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIncomeSource}
                  className="w-full border-teal-200 border-dashed text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-colors py-2 h-auto text-sm mt-1 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Income Source
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Budget Categories */}
          <Card className="shadow-lg border border-violet-200/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-20 left-10">
              <div className="grid grid-cols-3 gap-1 opacity-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                ))}
              </div>
            </div>
            <CardHeader className="border-b border-violet-100 bg-white/90 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <div className="p-2 rounded-md bg-violet-500/10 text-violet-700 shadow-sm">
                    <PieChart className="h-5 w-5" />
                  </div>
                  Budget Categories
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Total:</span>
                  <span className="text-sm font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded-md shadow-md">
                    {currencySymbol}
                    {totalBudgeted.toLocaleString()}
                  </span>
                </div>
              </div>
              <CardDescription>Define your spending categories</CardDescription>
            </CardHeader>
            <CardContent className="p-4 relative">
              <div className="space-y-3">
                {formData.categories.map((category, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white border border-violet-100 shadow-md hover:border-violet-300 transition-all hover:shadow-lg relative"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-violet-50/50 rounded-bl-full rounded-tr-lg pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-2 relative">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-xs mr-2 shadow-md">
                          {index + 1}
                        </div>
                        <p className="font-medium text-gray-800 text-sm">Expense Category</p>
                      </div>
                      {formData.categories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(index)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor={`category-name-${index}`}
                          className="text-xs font-medium text-gray-600 mb-0.5 inline-block"
                        >
                          Category Name
                        </Label>
                        <Input
                          id={`category-name-${index}`}
                          value={category.name}
                          onChange={e => updateCategory(index, 'name', e.target.value)}
                          placeholder="e.g., Food, Transport, Entertainment"
                          className="h-8 text-sm border-violet-200 focus:border-violet-500 focus:ring-violet-500 bg-white shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor={`category-amount-${index}`}
                          className="text-xs font-medium text-gray-600 mb-0.5 inline-block"
                        >
                          Budgeted Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-violet-600 font-medium">
                            {currencySymbol}
                          </span>
                          <Input
                            id={`category-amount-${index}`}
                            type="number"
                            value={category.amount}
                            onChange={e => updateCategory(index, 'amount', Number(e.target.value))}
                            placeholder="0"
                            className="pl-5 h-8 text-sm border-violet-200 focus:border-violet-500 focus:ring-violet-500 bg-white shadow-sm"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  className="w-full border-violet-200 border-dashed text-violet-700 hover:bg-violet-50 hover:text-violet-800 transition-colors py-2 h-auto text-sm mt-1 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end mt-8">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/budgets')}
              className="border-gray-200 bg-white/90 shadow-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-6 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
