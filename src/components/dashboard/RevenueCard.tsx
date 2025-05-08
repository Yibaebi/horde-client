import { ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueCardProps {
  title: string;
  amount: number;
  previousAmount?: number;
  icon: ReactNode;
  className?: string;
  trendPercentage?: number;
  trendType?: 'increase' | 'decrease' | 'neutral';
  trendLabel?: string;
}

const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  amount,
  previousAmount,
  icon,
  className = '',
  trendPercentage,
  trendType: propTrendType,
  trendLabel: propTrendLabel,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate trend if not provided but we have previous amount
  const displayTrendPercentage =
    trendPercentage !== undefined
      ? trendPercentage
      : previousAmount
        ? Math.abs(Math.round(((amount - previousAmount) / previousAmount) * 100))
        : 0;

  const displayTrendType =
    propTrendType !== undefined
      ? propTrendType
      : previousAmount
        ? amount > previousAmount
          ? 'increase'
          : amount < previousAmount
            ? 'decrease'
            : 'neutral'
        : 'neutral';

  const displayTrendLabel =
    propTrendLabel !== undefined ? propTrendLabel : previousAmount ? 'vs. previous period' : '';

  const getTrendStyles = () => {
    if (displayTrendType === 'increase') {
      return {
        wrapperClass: 'bg-green-50 text-green-600',
        icon: <ArrowUp size={14} className="mr-1" />,
      };
    } else if (displayTrendType === 'decrease') {
      return {
        wrapperClass: 'bg-red-50 text-red-600',
        icon: <ArrowDown size={14} className="mr-1" />,
      };
    } else {
      return {
        wrapperClass: 'bg-gray-50 text-gray-600',
        icon: null,
      };
    }
  };

  const { wrapperClass, icon: trendIcon } = getTrendStyles();

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
      </div>

      <div className="text-2xl font-bold mb-2">{formatCurrency(amount)}</div>

      {(displayTrendPercentage > 0 || displayTrendLabel) && (
        <div className="flex items-center">
          {displayTrendPercentage > 0 && (
            <span
              className={cn('text-xs px-2 py-1 rounded-full flex items-center mr-2', wrapperClass)}
            >
              {trendIcon}
              {displayTrendPercentage}%
            </span>
          )}
          {displayTrendLabel && <span className="text-xs text-gray-500">{displayTrendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default RevenueCard;
