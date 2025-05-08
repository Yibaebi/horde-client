import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import {
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Plane,
  CreditCard,
  Heart,
  Smartphone,
  Droplets,
  LucideIcon,
} from 'lucide-react';

interface TopCategoriesProps {
  selectedMonth: number;
}

interface CategoryData {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

// Define categories with consistent colors and icons
const CATEGORIES: CategoryData[] = [
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: '#FF6384' },
  { id: 'housing', name: 'Housing & Utilities', icon: Home, color: '#36A2EB' },
  { id: 'transportation', name: 'Transportation', icon: Car, color: '#FFCE56' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: '#4BC0C0' },
  { id: 'travel', name: 'Travel', icon: Plane, color: '#9966FF' },
  { id: 'entertainment', name: 'Entertainment', icon: Heart, color: '#FF9F40' },
  { id: 'bills', name: 'Bills & Payments', icon: CreditCard, color: '#C9CBCF' },
  { id: 'health', name: 'Health & Wellness', icon: Droplets, color: '#7FD8BE' },
  { id: 'tech', name: 'Technology', icon: Smartphone, color: '#75A3CD' },
];

// Define the interface for custom tooltip props
interface CustomPieTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
      percent: number;
    };
  }>;
}

const TopCategories: React.FC<TopCategoriesProps> = ({ selectedMonth }) => {
  // Generate random spending data with seasonal variations
  const categorySpending = useMemo(() => {
    const seasonalFactors: Record<string, number[]> = {
      food: [1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.1, 1.2, 1.3], // More in summer/holidays
      housing: [1.2, 1.2, 1.1, 1.0, 0.9, 0.9, 0.9, 0.9, 1.0, 1.1, 1.2, 1.3], // More in winter
      transportation: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.2, 1.0, 0.9, 0.8, 0.8], // More in summer
      shopping: [0.8, 0.7, 0.9, 1.0, 1.1, 1.0, 0.9, 1.2, 1.1, 1.0, 1.3, 1.8], // More during holidays
      travel: [0.6, 0.7, 1.0, 1.1, 1.2, 1.5, 1.8, 1.5, 1.1, 0.8, 0.7, 1.2], // Summer and December
      entertainment: [0.9, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.3, 1.1, 1.0, 1.0, 1.2],
      bills: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // Consistent
      health: [1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3], // More in winter
      tech: [0.8, 0.7, 0.9, 1.0, 0.9, 0.8, 0.9, 1.1, 1.2, 1.3, 1.5, 1.7], // More in Q4
    };

    const data = CATEGORIES.map(category => {
      // Base spending amount that varies by category
      let baseAmount = 0;
      switch (category.id) {
        case 'food':
          baseAmount = 600;
          break;
        case 'housing':
          baseAmount = 1200;
          break;
        case 'transportation':
          baseAmount = 400;
          break;
        case 'shopping':
          baseAmount = 300;
          break;
        case 'travel':
          baseAmount = 250;
          break;
        case 'entertainment':
          baseAmount = 200;
          break;
        case 'bills':
          baseAmount = 350;
          break;
        case 'health':
          baseAmount = 180;
          break;
        case 'tech':
          baseAmount = 150;
          break;
        default:
          baseAmount = 200;
      }

      // Apply seasonal factor
      const seasonalFactor = seasonalFactors[category.id]?.[selectedMonth] || 1.0;

      // Add some randomness (±15%)
      const randomFactor = 0.85 + Math.random() * 0.3;

      const amount = Math.round(baseAmount * seasonalFactor * randomFactor);

      return {
        ...category,
        value: amount,
      };
    });

    // Calculate total and percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return data.map(item => ({
      ...item,
      percent: +((item.value / total) * 100).toFixed(1),
    }));
  }, [selectedMonth]);

  // Sort categories by value (highest first)
  const sortedCategories = useMemo(() => {
    return [...categorySpending].sort((a, b) => b.value - a.value);
  }, [categorySpending]);

  // Calculate total spending
  const totalSpending = useMemo(() => {
    return categorySpending.reduce((sum, category) => sum + category.value, 0);
  }, [categorySpending]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: CustomPieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500">{data.percent}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Top Spending Categories</h3>
        <div className="text-sm font-medium">
          <span className="text-gray-500">Total: </span>
          <span>{formatCurrency(totalSpending)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={750}
                animationBegin={0}
              >
                {categorySpending.map(entry => (
                  <Cell key={entry.id} fill={entry.color} stroke={entry.color} strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {sortedCategories.map(category => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon size={16} style={{ color: category.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.percent}%</p>
                  </div>
                </div>
                <div className="text-sm font-medium">{formatCurrency(category.value)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopCategories;
