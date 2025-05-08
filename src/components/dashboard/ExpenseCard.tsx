import { ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ExpenseCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  previousAmount?: number;
  trendType?: 'positive' | 'negative' | 'neutral';
  trendPercentage?: number;
  trendLabel?: string;
  className?: string;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  title,
  amount,
  icon,
  previousAmount,
  trendType = 'neutral',
  trendPercentage,
  trendLabel,
  className = '',
}) => {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate trend data if not explicitly provided
  const displayTrendPercentage =
    trendPercentage !== undefined
      ? trendPercentage
      : previousAmount
        ? Math.abs(Math.round(((amount - previousAmount) / previousAmount) * 100))
        : 0;

  const displayTrendType =
    trendType !== 'neutral'
      ? trendType
      : previousAmount
        ? amount >= previousAmount
          ? 'positive'
          : 'negative'
        : 'neutral';

  const displayTrendLabel =
    trendLabel ||
    (displayTrendType === 'positive'
      ? 'increase'
      : displayTrendType === 'negative'
        ? 'decrease'
        : 'no change');

  // Style based on trend type
  const getTrendStyles = () => {
    switch (displayTrendType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="text-gray-400">{icon}</div>
      </div>

      <div className="text-2xl font-bold mb-2">{formatCurrency(amount)}</div>

      {displayTrendType !== 'neutral' && (
        <div className="flex items-center">
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendStyles()}`}
          >
            {displayTrendType === 'positive' ? (
              <ArrowUp size={12} className="mr-1" />
            ) : (
              <ArrowDown size={12} className="mr-1" />
            )}
            {displayTrendPercentage}%
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {displayTrendLabel} {previousAmount ? `from ${formatCurrency(previousAmount)}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
