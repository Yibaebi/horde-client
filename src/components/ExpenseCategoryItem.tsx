import React from 'react';

interface ExpenseCategoryItemProps {
  name: string;
  amount: number;
  currencySym: string;
  color: string;
  icon: React.ReactNode;
  percentage?: number;
}

export const ExpenseCategoryItem = ({
  name,
  amount,
  currencySym,
  color,
  icon,
  percentage = 75,
}: ExpenseCategoryItemProps) => {
  return (
    <div className="overflow-hidden bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{name}</h4>
              <p className="text-sm text-gray-500">Category</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {currencySym}
              {amount.toLocaleString()}
            </p>
            <div className="inline-flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{percentage}% of total</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(to right, ${color}99, ${color})`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
