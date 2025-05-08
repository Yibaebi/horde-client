import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

export interface ExpenseCategory {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface ExpenseDistributionChartProps {
  data: ExpenseCategory[];
  className?: string;
  height?: number;
  showLegend?: boolean;
}

// Define a type for the chart data item
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Define a type for the tooltip payload
interface CustomTooltipPayload {
  name: string;
  value: number;
  payload: ChartDataItem;
}

const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({
  data,
  className,
  height = 300,
  showLegend = true,
}) => {
  // Transform data for recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    color: item.color,
  }));

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: CustomTooltipPayload[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-medium">{data.name}: </span>
            <span className="ml-1">${data.value.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('w-full rounded-lg overflow-hidden', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconSize={10}
              iconType="circle"
              formatter={value => <span className="text-sm text-gray-700">{value}</span>}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseDistributionChart;
