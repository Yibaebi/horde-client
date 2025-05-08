import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Interface for tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const YearlyExpenseChart: React.FC = () => {
  // Generate random data for the year
  const yearlyData = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const baseBudget = 3500;

    // Create a seasonal pattern with higher spending in summer and winter holidays
    const seasonalFactor = (month: number) => {
      // Summer peak (June, July, August)
      if (month >= 5 && month <= 7) return 1.2;
      // Winter holidays peak (November, December)
      if (month >= 10) return 1.3;
      // Spring spending (March, April, May)
      if (month >= 2 && month <= 4) return 1.1;
      // Winter low (January, February)
      return 0.9;
    };

    return months.map((month, index) => {
      const budgetAmount = Math.round(baseBudget * (1 + (index % 3) * 0.02));

      // Create a pattern where actual spending sometimes exceeds budget
      const seasonal = seasonalFactor(index);
      const randomFactor = 0.9 + Math.random() * 0.3; // 0.9 to 1.2 random factor

      const actualAmount = Math.round(budgetAmount * seasonal * randomFactor);

      // Calculate the drift (difference between actual and budget)
      const drift = actualAmount - budgetAmount;
      const driftPercent = (actualAmount / budgetAmount - 1) * 100;

      return {
        month,
        budget: budgetAmount,
        actual: actualAmount,
        drift,
        driftPercent: parseFloat(driftPercent.toFixed(1)),
      };
    });
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const budgetValue = payload.find(p => p.name === 'budget')?.value || 0;
      const actualValue = payload.find(p => p.name === 'actual')?.value || 0;
      const driftValue = payload.find(p => p.name === 'drift')?.value || 0;
      const driftPercent = payload.find(p => p.name === 'driftPercent')?.value || 0;

      const isOverBudget = driftValue > 0;

      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold text-gray-700">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium">{formatCurrency(budgetValue as number)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Actual</p>
              <p className="text-sm font-medium">{formatCurrency(actualValue as number)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Difference</p>
              <p
                className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
              >
                {isOverBudget ? '+' : ''}
                {formatCurrency(driftValue as number)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Variance</p>
              <p
                className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
              >
                {isOverBudget ? '+' : ''}
                {driftPercent}%
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Total Annual Spending</span>
          <h3 className="text-xl font-bold">
            {formatCurrency(yearlyData.reduce((sum, month) => sum + month.actual, 0))}
          </h3>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            <span className="text-xs text-gray-500">Budget</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs text-gray-500">Actual</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-8 bg-gradient-to-r from-green-400 to-red-400 mr-2 rounded-sm"></div>
            <span className="text-xs text-gray-500">Variance</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={yearlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              width={60}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[-30, 30]}
              tickFormatter={value => `${value}%`}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Budget Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="budget"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1500}
            />

            {/* Actual Spending Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1500}
            />

            {/* Drift Bars - colored based on value */}
            <Bar
              yAxisId="right"
              dataKey="driftPercent"
              barSize={10}
              animationDuration={1500}
              fill="#8884d8"
              radius={[10, 10, 10, 10]}
              stroke="none"
              // Color bars based on over/under budget
              // fill={data => {
              //   const value = data.driftPercent;

              //   if (value > 15) return '#EF4444'; // Red for severely over budget
              //   if (value > 0) return '#F87171'; // Light red for over budget
              //   if (value > -10) return '#10B981'; // Green for under budget
              //   return '#047857'; // Dark green for well under budget
              // }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlyExpenseChart;
