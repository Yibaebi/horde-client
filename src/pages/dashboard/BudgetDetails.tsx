import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/app/api/axios';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ArrowLeft,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Loader2,
  BadgeDollarSign,
  Wallet,
  ShoppingCart,
  CircleDollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  BarChart3,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useState, useEffect } from 'react';

interface CategoryExpensesStats {
  totalAmount: number;
  count: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
}

interface Category {
  _id: string;
  key: string;
  name: string;
  amountBudgeted: number;
  amountSpent: number;
  expensesStats: CategoryExpensesStats;
}

interface BudgetSource {
  _id: string;
  name: string;
  amount: number;
  description: string;
  recurring: boolean;
  frequency: 'monthly' | 'one-time';
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  _id: string;
  user: string;
  currency: string;
  year: number;
  month: number;
  currencySym: string;
  categories: Category[];
  budgetSources: BudgetSource[];
  createdAt: string;
  updatedAt: string;
  amountSpent: number;
  budgetVariance: number;
  amountBudgeted: number;
}

export const BudgetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categorySort, setCategorySort] = useState<
    'name' | 'budgeted' | 'spent' | 'remaining' | 'percentage'
  >('name');
  const [categoryOrder, setCategoryOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'over' | 'under' | 'unused'>('all');
  const [sourceSort, setSourceSort] = useState<'name' | 'amount' | 'percentage'>('name');
  const [sourceOrder, setSourceOrder] = useState<'asc' | 'desc'>('asc');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'recurring' | 'one-time'>('all');

  const fetchBudget = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ data: Budget }>(`/user/budget/d/${id}`);
      setBudget(response.data.data);
    } catch (error) {
      console.error('Failed to fetch budget:', error);
      toast.error('Failed to load budget details');
      navigate('/dashboard/budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const formatCurrency = (amount: number, currencySym: string) => {
    return `${currencySym}${amount.toLocaleString()}`;
  };

  const getMonthName = (month: number) => {
    return dayjs().month(month).format('MMMM');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      setIsLoading(true);
      await api.delete(`/user/budget/${id}`);
      toast.success('Budget deleted successfully');
      navigate('/dashboard/budgets');
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate pie chart data for budget
  const getPieChartData = (budget: Budget) => {
    // Create data for the categories pie chart
    return budget.categories.map(category => ({
      name: category.name,
      value: category.amountSpent,
      budgeted: category.amountBudgeted,
      fill: generateCategoryColor(category.name),
    }));
  };

  // Generate a consistent color based on category name
  const generateCategoryColor = (name: string) => {
    const colors = [
      '#8b5cf6', // violet-500
      '#06b6d4', // cyan-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ec4899', // pink-500
      '#6366f1', // indigo-500
      '#14b8a6', // teal-500
      '#f43f5e', // rose-500
      '#0ea5e9', // sky-500
      '#84cc16', // lime-500
    ];

    // Simple hash function to consistently map strings to a number
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Function to generate income sources distribution data
  const getIncomeSourcesData = (budget: Budget) => {
    return budget.budgetSources.map(source => ({
      name: source.name,
      amount: source.amount,
      fill: generateCategoryColor(source.name),
    }));
  };

  // Custom tooltip for the pie chart
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        budgeted: number;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length && budget) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100 text-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-violet-600">Spent: {formatCurrency(data.value, budget.currencySym)}</p>
          <p className="text-blue-600">
            Budgeted: {formatCurrency(data.budgeted, budget.currencySym)}
          </p>
        </div>
      );
    }

    return null;
  };

  // Add filter and sort functions
  const getFilteredCategories = () => {
    if (!budget) return [];

    let filtered = [...budget.categories];

    // Apply filter
    switch (categoryFilter) {
      case 'over':
        filtered = filtered.filter(cat => cat.amountSpent > cat.amountBudgeted);
        break;
      case 'under':
        filtered = filtered.filter(
          cat => cat.amountSpent <= cat.amountBudgeted && cat.amountSpent > 0
        );
        break;
      case 'unused':
        filtered = filtered.filter(cat => cat.amountSpent === 0);
        break;
      default:
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (categorySort) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'budgeted':
          aValue = a.amountBudgeted;
          bValue = b.amountBudgeted;
          break;
        case 'spent':
          aValue = a.amountSpent;
          bValue = b.amountSpent;
          break;
        case 'remaining':
          aValue = a.amountBudgeted - a.amountSpent;
          bValue = b.amountBudgeted - b.amountSpent;
          break;
        case 'percentage':
          aValue = (a.amountSpent / a.amountBudgeted) * 100;
          bValue = (b.amountSpent / b.amountBudgeted) * 100;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return categoryOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return categoryOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getFilteredSources = () => {
    if (!budget) return [];

    let filtered = [...budget.budgetSources];

    // Apply filter
    switch (sourceFilter) {
      case 'recurring':
        filtered = filtered.filter(src => src.recurring);
        break;
      case 'one-time':
        filtered = filtered.filter(src => !src.recurring);
        break;
      default:
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sourceSort) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'percentage': {
          const total = budget.budgetSources.reduce((sum, src) => sum + src.amount, 0);
          aValue = (a.amount / total) * 100;
          bValue = (b.amount / total) * 100;
          break;
        }
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sourceOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sourceOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading budget details...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Budget not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/budgets')}>
            Go back to budgets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 relative">
      {/* Enhanced Background Illustrations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 text-primary/10">
          <DollarSign className="w-16 h-16" />
        </div>
        <div className="absolute bottom-40 left-10 text-teal-500/10">
          <BadgeDollarSign className="w-20 h-20" />
        </div>
        <div className="absolute top-32 left-1/4 text-violet-500/10">
          <PieChartIcon className="w-14 h-14" />
        </div>
        <div className="absolute bottom-20 right-20 text-blue-500/10">
          <BarChart3 className="w-16 h-16" />
        </div>
        <div className="absolute top-1/2 right-1/4 text-emerald-500/10">
          <CheckCircle2 className="w-18 h-18" />
        </div>
        <div className="absolute bottom-60 left-1/3 text-amber-500/10">
          <CreditCard className="w-14 h-14" />
        </div>
        <div className="absolute bottom-1/3 right-10 text-rose-500/10">
          <Wallet className="w-12 h-12" />
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-40 left-20 opacity-10">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="60"
              cy="60"
              r="40"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            <circle
              cx="60"
              cy="60"
              r="30"
              stroke="currentColor"
              strokeWidth="2"
              className="text-teal-500"
            />
            <circle
              cx="60"
              cy="60"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              className="text-violet-500"
            />
          </svg>
        </div>
        <div className="absolute bottom-40 right-40 opacity-10">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              rx="8"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500"
            />
            <rect
              x="25"
              y="25"
              width="50"
              height="50"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-500"
            />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M150 20C79.3 20 20 79.3 20 150C20 220.7 79.3 280 150 280C220.7 280 280 220.7 280 150C280 79.3 220.7 20 150 20ZM150 260C90.3 260 40 209.7 40 150C40 90.3 90.3 40 150 40C209.7 40 260 90.3 260 150C260 209.7 209.7 260 150 260Z"
              fill="currentColor"
              className="text-primary"
            />
            <path
              d="M150 60C101.4 60 60 101.4 60 150C60 198.6 101.4 240 150 240C198.6 240 240 198.6 240 150C240 101.4 198.6 60 150 60ZM150 220C112.4 220 80 187.6 80 150C80 112.4 112.4 80 150 80C187.6 80 220 112.4 220 150C220 187.6 187.6 220 150 220Z"
              fill="currentColor"
              className="text-blue-500"
            />
            <path
              d="M150 100C123.5 100 100 123.5 100 150C100 176.5 123.5 200 150 200C176.5 200 200 176.5 200 150C200 123.5 176.5 100 150 100ZM150 180C134.5 180 120 165.5 120 150C120 134.5 134.5 120 150 120C165.5 120 180 134.5 180 150C180 165.5 165.5 180 150 180Z"
              fill="currentColor"
              className="text-violet-500"
            />
          </svg>
        </div>

        {/* Subtle patterns */}
        <div className="absolute top-1/3 right-1/3">
          <div className="grid grid-cols-3 gap-4 opacity-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-primary"></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/3">
          <div className="grid grid-cols-2 gap-5 opacity-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-3 rounded-full bg-teal-500"></div>
            ))}
          </div>
        </div>
        <div className="absolute top-2/3 right-1/4">
          <div className="grid grid-cols-4 gap-2 opacity-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
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
            {getMonthName(budget.month)} {budget.year} Budget
            <Sparkles className="h-5 w-5 text-amber-400 mt-1" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Last updated {dayjs(budget.updatedAt).format('MMMM D, YYYY')}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/budgets/${id}/edit`)}
            className="border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Budget
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="shadow-md transition-all hover:shadow-lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Budget
          </Button>
        </div>
      </div>

      {/* Hero Section with Key Stats - Split into separate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Income Card */}
        <Card className="shadow-md border border-teal-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-transparent pointer-events-none"></div>
          <CardContent className="p-4 flex items-center relative">
            <div className="p-2.5 rounded-full bg-teal-100/80 mr-4 shadow-sm">
              <BadgeDollarSign className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-xl font-bold text-teal-700">
                {formatCurrency(
                  budget.budgetSources.reduce((acc, src) => acc + src.amount, 0),
                  budget.currencySym
                )}
              </p>
              <p className="text-xs text-gray-500">
                {budget.budgetSources.length}{' '}
                {budget.budgetSources.length === 1 ? 'source' : 'sources'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budgeted Card */}
        <Card className="shadow-md border border-blue-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent pointer-events-none"></div>
          <CardContent className="p-4 flex items-center relative">
            <div className="p-2.5 rounded-full bg-blue-100/80 mr-4 shadow-sm">
              <CircleDollarSign className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Budgeted</p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(budget.amountBudgeted, budget.currencySym)}
              </p>
              <p className="text-xs text-gray-500">
                {budget.categories.length}{' '}
                {budget.categories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spent Card */}
        <Card className="shadow-md border border-violet-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-transparent pointer-events-none"></div>
          <CardContent className="p-4 flex items-center relative">
            <div className="p-2.5 rounded-full bg-violet-100/80 mr-4 shadow-sm">
              <ShoppingCart className="h-5 w-5 text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Spent</p>
              <p className="text-xl font-bold text-violet-700">
                {formatCurrency(budget.amountSpent, budget.currencySym)}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round((budget.amountSpent / budget.amountBudgeted) * 100)}% of budget
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Variance Card */}
        <Card className="shadow-md border border-gray-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${budget.budgetVariance >= 0 ? 'from-emerald-50/30' : 'from-rose-50/30'} to-transparent pointer-events-none`}
          ></div>
          <CardContent className="p-4 flex items-center relative">
            <div
              className={`p-2.5 rounded-full ${budget.budgetVariance >= 0 ? 'bg-emerald-100/80' : 'bg-rose-100/80'} mr-4 shadow-sm`}
            >
              {budget.budgetVariance >= 0 ? (
                <TrendingDown
                  className={`h-5 w-5 ${budget.budgetVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                />
              ) : (
                <TrendingUp className="h-5 w-5 text-rose-700" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p
                className={`text-xl font-bold ${budget.budgetVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {budget.budgetVariance >= 0 ? <span>Under Budget</span> : <span>Over Budget</span>}
              </p>
              <p className="text-xs text-gray-500">
                {budget.budgetVariance >= 0
                  ? formatCurrency(budget.budgetVariance, budget.currencySym)
                  : formatCurrency(Math.abs(budget.budgetVariance), budget.currencySym)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Card */}
      <Card className="shadow-md border border-gray-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-shadow mb-6">
        <CardHeader className="border-b border-gray-100 bg-white/90 p-4 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-800">
            <div
              className={`p-1.5 rounded-md ${budget.budgetVariance >= 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'} shadow-sm`}
            >
              {budget.budgetVariance >= 0 ? (
                <ArrowDownCircle className="h-4 w-4" />
              ) : (
                <ArrowUpCircle className="h-4 w-4" />
              )}
            </div>
            Budget Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between text-sm mb-2">
            <p className="text-sm text-gray-500">
              You've spent{' '}
              <span className="font-medium">
                {Math.round((budget.amountSpent / budget.amountBudgeted) * 100)}%
              </span>{' '}
              of your total budget
            </p>
            <span
              className={`font-medium px-2 py-0.5 rounded-full text-xs shadow-sm ${
                budget.amountSpent > budget.amountBudgeted
                  ? 'bg-rose-100 text-rose-700'
                  : budget.amountSpent === 0
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {formatCurrency(budget.amountSpent, budget.currencySym)} /{' '}
              {formatCurrency(budget.amountBudgeted, budget.currencySym)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ${
                budget.amountSpent > budget.amountBudgeted
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{
                width: `${Math.min((budget.amountSpent / budget.amountBudgeted) * 100, 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* VISUALIZATIONS ROW - ENHANCED CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {/* Spending by Category - Enhanced chart */}
        <Card className="shadow-lg border border-violet-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
          <CardHeader className="border-b border-violet-100 bg-white/90 p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-800">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-700 shadow-sm">
                <PieChartIcon className="h-4 w-4" />
              </div>
              Spending by Category
            </CardTitle>
            <CardDescription className="text-xs">Visual breakdown of your spending</CardDescription>
          </CardHeader>
          <CardContent className="p-3 bg-gradient-to-br from-white to-violet-50/10">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData(budget)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {getPieChartData(budget).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconSize={8}
                    iconType="circle"
                    formatter={value => <span className="text-xs font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income Sources - Enhanced chart */}
        <Card className="shadow-lg border border-teal-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
          <CardHeader className="border-b border-teal-100 bg-white/90 p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-800">
              <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-700 shadow-sm">
                <BarChartIcon className="h-4 w-4" />
              </div>
              Income Distribution
            </CardTitle>
            <CardDescription className="text-xs">Breakdown of your income sources</CardDescription>
          </CardHeader>
          <CardContent className="p-3 bg-gradient-to-br from-white to-teal-50/10">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getIncomeSourcesData(budget)}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={value => {
                      if (value >= 1000) return `${value / 1000}k`;
                      return value;
                    }}
                  />
                  <Tooltip
                    formatter={value => formatCurrency(Number(value), budget.currencySym)}
                    contentStyle={{
                      borderRadius: '0.375rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      border: '1px solid #f3f4f6',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={24}>
                    {getIncomeSourcesData(budget).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Status Card */}
        <Card className="shadow-lg border border-blue-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-shadow md:col-span-2 xl:col-span-1">
          <CardHeader className="border-b border-blue-100 bg-white/90 p-4 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-800">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-700 shadow-sm">
                <TrendingDown className="h-4 w-4" />
              </div>
              Budget Status
            </CardTitle>
            <CardDescription className="text-xs">Your current budget status</CardDescription>
          </CardHeader>
          <CardContent className="p-3 bg-gradient-to-br from-white to-blue-50/10">
            <p
              className={`text-lg font-bold flex items-center gap-1.5 ${budget.budgetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {budget.budgetVariance >= 0 ? (
                <>
                  <ArrowDownCircle className="h-4 w-4" />
                  <span>
                    Under Budget by {formatCurrency(budget.budgetVariance, budget.currencySym)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4" />
                  <span>
                    Over Budget by{' '}
                    {formatCurrency(Math.abs(budget.budgetVariance), budget.currencySym)}
                  </span>
                </>
              )}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500 text-xs">Budget Utilization</span>
                <span
                  className={`font-medium px-2 py-0.5 rounded-full text-xs shadow-sm ${
                    budget.amountSpent > budget.amountBudgeted
                      ? 'bg-rose-100 text-rose-700'
                      : budget.amountSpent === 0
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {Math.round((budget.amountSpent / budget.amountBudgeted) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 ${
                    budget.amountSpent > budget.amountBudgeted
                      ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min((budget.amountSpent / budget.amountBudgeted) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Income Sources - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Categories - Enhanced List View */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium flex items-center gap-2 text-gray-800">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-700 shadow-sm">
                <PieChartIcon className="h-4 w-4" />
              </div>
              Budget Categories
              <span className="text-xs font-medium ml-2 text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md shadow-sm">
                {formatCurrency(budget.amountBudgeted, budget.currencySym)}
              </span>
            </h3>
          </div>

          <Card className="shadow-md border border-violet-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden h-full">
            {/* Add filter controls */}
            <div className="p-3 bg-white border-b border-gray-100 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Filter:</div>
                <div className="flex items-center">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2 py-1 text-xs rounded-l-md border border-r-0 ${
                      categoryFilter === 'all'
                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCategoryFilter('over')}
                    className={`px-2 py-1 text-xs border-t border-b ${
                      categoryFilter === 'over'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Over Budget
                  </button>
                  <button
                    onClick={() => setCategoryFilter('under')}
                    className={`px-2 py-1 text-xs border-t border-b ${
                      categoryFilter === 'under'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Under Budget
                  </button>
                  <button
                    onClick={() => setCategoryFilter('unused')}
                    className={`px-2 py-1 text-xs rounded-r-md border border-l-0 ${
                      categoryFilter === 'unused'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Unused
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Sort by:</div>
                <select
                  value={categorySort}
                  onChange={e =>
                    setCategorySort(
                      e.target.value as 'name' | 'budgeted' | 'spent' | 'remaining' | 'percentage'
                    )
                  }
                  className="text-xs p-1 border border-gray-200 rounded bg-white"
                >
                  <option value="name">Name</option>
                  <option value="budgeted">Budgeted Amount</option>
                  <option value="spent">Spent Amount</option>
                  <option value="remaining">Remaining</option>
                  <option value="percentage">Usage %</option>
                </select>

                <button
                  onClick={() => setCategoryOrder(categoryOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
                >
                  {categoryOrder === 'asc' ? (
                    <ArrowUpCircle className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <CardHeader className="p-3 bg-violet-50/70 border-b border-violet-100">
              <div className="grid grid-cols-6 text-xs font-medium text-gray-500">
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-right">Budgeted</div>
                <div className="col-span-1 text-right">Spent</div>
                <div className="col-span-1 text-right">Left</div>
                <div className="col-span-1 text-right">Usage</div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative overflow-auto" style={{ maxHeight: '460px' }}>
              {getFilteredCategories().length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {getFilteredCategories().map(category => {
                    const remaining = category.amountBudgeted - category.amountSpent;
                    const isOverBudget = remaining < 0;
                    const percentage = Math.round(
                      (category.amountSpent / category.amountBudgeted) * 100
                    );

                    return (
                      <li
                        key={category._id}
                        className="relative px-3 py-2 grid grid-cols-6 items-center hover:bg-gray-50/70 transition-colors group"
                        style={{
                          borderLeft: `3px solid ${generateCategoryColor(category.name)}`,
                        }}
                      >
                        {/* Background progress indicator */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-50 to-transparent transition-all duration-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            opacity: 0.2,
                          }}
                        ></div>

                        {/* Content */}
                        <div className="col-span-2 relative flex items-center gap-2 pr-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: generateCategoryColor(category.name) }}
                          ></span>
                          <div>
                            <span
                              className="font-medium text-xs text-gray-800 truncate block max-w-[110px]"
                              title={category.name}
                            >
                              {category.name}
                            </span>
                            <p className="text-[10px] text-gray-500 hidden group-hover:block">
                              {category.expensesStats.count} transactions
                            </p>
                          </div>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <p className="text-xs font-medium">
                            {formatCurrency(category.amountBudgeted, budget.currencySym)}
                          </p>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <p className="text-xs font-medium">
                            {formatCurrency(category.amountSpent, budget.currencySym)}
                          </p>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <p
                            className={`text-xs font-medium ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}
                          >
                            {isOverBudget ? '-' : ''}
                            {formatCurrency(Math.abs(remaining), budget.currencySym)}
                          </p>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <span
                            className={`text-[10px] font-medium px-1 py-0.5 rounded-full ${
                              percentage > 100
                                ? 'bg-rose-100 text-rose-700'
                                : percentage === 0
                                  ? 'bg-gray-100 text-gray-700'
                                  : percentage > 80
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  {budget.categories.length === 0 ? (
                    <>
                      <PieChartIcon className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        No Budget Categories
                      </h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        You haven't created any budget categories yet. Add categories to start
                        tracking your spending.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate(`/dashboard/budgets/${id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit Budget
                      </Button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        No Matching Categories
                      </h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        No categories match your current filter criteria. Try changing the filters
                        or viewing all categories.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => setCategoryFilter('all')}
                      >
                        View All Categories
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Income Sources - Enhanced List View */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium flex items-center gap-2 text-gray-800">
              <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-700 shadow-sm">
                <Wallet className="h-4 w-4" />
              </div>
              Income Sources
              <span className="text-xs font-medium ml-2 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md shadow-sm">
                {formatCurrency(
                  budget.budgetSources.reduce((sum, source) => sum + source.amount, 0),
                  budget.currencySym
                )}
              </span>
            </h3>
          </div>

          <Card className="shadow-md border border-teal-200/50 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden h-full">
            {/* Add filter controls */}
            <div className="p-3 bg-white border-b border-gray-100 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Filter:</div>
                <div className="flex items-center">
                  <button
                    onClick={() => setSourceFilter('all')}
                    className={`px-2 py-1 text-xs rounded-l-md border ${
                      sourceFilter === 'all'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSourceFilter('recurring')}
                    className={`px-2 py-1 text-xs border-t border-b border-l-0 ${
                      sourceFilter === 'recurring'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Recurring
                  </button>
                  <button
                    onClick={() => setSourceFilter('one-time')}
                    className={`px-2 py-1 text-xs rounded-r-md border border-l-0 ${
                      sourceFilter === 'one-time'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    One-time
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">Sort by:</div>
                <select
                  value={sourceSort}
                  onChange={e => setSourceSort(e.target.value as 'name' | 'amount' | 'percentage')}
                  className="text-xs p-1 border border-gray-200 rounded bg-white"
                >
                  <option value="name">Name</option>
                  <option value="amount">Amount</option>
                  <option value="percentage">Share %</option>
                </select>

                <button
                  onClick={() => setSourceOrder(sourceOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
                >
                  {sourceOrder === 'asc' ? (
                    <ArrowUpCircle className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <CardHeader className="p-3 bg-teal-50/70 border-b border-teal-100">
              <div className="grid grid-cols-5 text-xs font-medium text-gray-500">
                <div className="col-span-2">Source</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1 text-right">Share</div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative overflow-auto" style={{ maxHeight: '460px' }}>
              {getFilteredSources().length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {getFilteredSources().map(source => {
                    const percentageOfTotal = Math.round(
                      (source.amount /
                        budget.budgetSources.reduce((sum, src) => sum + src.amount, 0)) *
                        100
                    );

                    return (
                      <li
                        key={source._id}
                        className="relative px-3 py-2 grid grid-cols-5 items-center hover:bg-gray-50/70 transition-colors group"
                        style={{
                          borderLeft: `3px solid ${generateCategoryColor(source.name)}`,
                        }}
                      >
                        {/* Background progress indicator */}
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-50 to-transparent transition-all duration-500"
                          style={{
                            width: `${percentageOfTotal}%`,
                            opacity: 0.2,
                          }}
                        ></div>

                        {/* Content */}
                        <div className="col-span-2 relative flex items-center gap-2 pr-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: generateCategoryColor(source.name) }}
                          ></span>
                          <div>
                            <span
                              className="font-medium text-xs text-gray-800 truncate block max-w-[110px]"
                              title={source.name}
                            >
                              {source.name}
                            </span>
                            {source.description && (
                              <p
                                className="text-[10px] text-gray-500 max-w-[150px] truncate group-hover:whitespace-normal transition-all duration-300"
                                title={source.description}
                              >
                                {source.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-span-1 relative">
                          <div className="flex items-center gap-1 text-[10px] text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{source.recurring ? 'Recurring' : 'One-time'}</span>
                          </div>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <p className="text-xs font-medium text-teal-700">
                            {formatCurrency(source.amount, budget.currencySym)}
                          </p>
                        </div>

                        <div className="col-span-1 text-right relative">
                          <span className="text-[10px] font-medium px-1 py-0.5 rounded-full bg-teal-50 text-teal-700">
                            {percentageOfTotal}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  {budget.budgetSources.length === 0 ? (
                    <>
                      <Wallet className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-600 mb-1">No Income Sources</h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        You haven't added any income sources yet. Add sources to track where your
                        money comes from.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate(`/dashboard/budgets/${id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit Budget
                      </Button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        No Matching Sources
                      </h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        No income sources match your current filter criteria. Try changing the
                        filters or viewing all sources.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSourceFilter('all')}
                      >
                        View All Sources
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
