import { motion } from 'framer-motion';
import { ArrowUpRight, ReceiptText } from 'lucide-react';
import { formatCurrencyWithSymbol } from '@/lib/utils';
import { ICurrentMonthAnalyticsData } from '@/types/api';
import { IBudgetProps } from '@/app/api/budgets';

interface TransactionInfoCardProps {
  analytics?: ICurrentMonthAnalyticsData | null;
  budget?: IBudgetProps | null;
  isLoading: boolean;
}

const TransactionInfoCard = ({ analytics, budget }: TransactionInfoCardProps) => {
  const totalTransactions = analytics?.totalExpensesCount || 0;
  const avgTransactionAmount = analytics?.avgExpenseAmount || 0;
  const largestTransaction = analytics?.largestTransaction || 0;
  const currencySymbol = budget?.currencySym || '';

  // If there are no transactions, show the empty state
  if (!budget) {
    return <TransactionInfoCardEmpty />;
  }

  return (
    <motion.div
      className="border border-primary-80 bg-primary-5 rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Transactions
            </span>

            <span className="text-2xl font-bold text-primary-900 mt-1">
              {totalTransactions}{' '}
              <span className="text-sm font-medium text-primary-600">total</span>
            </span>
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-300 to-primary-400 text-white shadow-lg">
            <ArrowUpRight size={22} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-primary-800">Average Amount</span>

            <span className="text-base font-semibold text-primary-900">
              {formatCurrencyWithSymbol(avgTransactionAmount, currencySymbol, '0,0')}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-primary-800">Largest Transaction</span>

            <span className="text-base font-semibold text-primary-900">
              {formatCurrencyWithSymbol(largestTransaction, currencySymbol, '0,0')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading skeleton component for TransactionInfoCard
export const TransactionInfoCardSkeleton = () => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] border border-slate-200"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 animate-pulse"></div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty state component for TransactionInfoCard
const TransactionInfoCardEmpty = () => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] border border-slate-200"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="p-5 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <ReceiptText className="h-6 w-6 text-gray-400" />
        </div>

        <h3 className="text-sm font-medium text-gray-700 mb-1">No Transactions Yet</h3>
        <p className="text-xs text-gray-500 mb-2 max-w-[220px]">
          Start tracking your spending to see transaction statistics here.
        </p>

        <div className="w-full mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Average Amount</p>
              <p className="text-base font-medium text-gray-400">--</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Largest Transaction</p>
              <p className="text-base font-medium text-gray-400">--</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionInfoCard;
