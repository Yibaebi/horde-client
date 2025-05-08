import { useMemo } from 'react';
import { ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';

interface RecentTransactionsProps {
  limit?: number;
}

// Category data with icons and colors
const CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#8B5CF6' },
  { id: 'food', name: 'Food', icon: '🍔', color: '#EC4899' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#3B82F6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#F59E0B' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#10B981' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#6366F1' },
  { id: 'health', name: 'Health', icon: '⚕️', color: '#EF4444' },
  { id: 'personal', name: 'Personal', icon: '👤', color: '#14B8A6' },
];

// Merchant names by category
const MERCHANTS = {
  housing: ['Apartment Rentals', 'HomeLoan Bank', 'City Utilities', 'Property Management'],
  food: [
    'Grocery Market',
    'Whole Foodmart',
    'Corner Bistro',
    'Taco Heaven',
    'Pizza Palace',
    'Sushi Express',
  ],
  transportation: [
    'Rideshare Inc',
    'Metro Transit',
    'Gas Station',
    'Auto Service',
    'Parking Garage',
  ],
  entertainment: ['Cinema Complex', 'Music Streaming', 'Concert Tickets', 'Arcade Fun', 'Cable TV'],
  shopping: [
    'Department Store',
    'Online Marketplace',
    'Fashion Outlet',
    'Electronics Shop',
    'Home Goods',
  ],
  utilities: [
    'Electric Company',
    'Internet Provider',
    'Water Services',
    'Gas Utility',
    'Phone Carrier',
  ],
  health: ['Pharmacy Plus', 'Medical Center', 'Dental Clinic', 'Fitness Club', 'Health Insurance'],
  personal: ['Hair Salon', 'Nail Studio', 'Spa Center', 'Bookstore', 'Coffee Shop'],
};

// Transaction types
type TransactionType = 'expense' | 'income' | 'transfer';

// Transaction interface
interface Transaction {
  id: string;
  date: dayjs.Dayjs;
  merchant: string;
  amount: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  type: TransactionType;
  description: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ limit = 5 }) => {
  // Generate random transactions for the last 30 days
  const transactions = useMemo(() => {
    const result: Transaction[] = [];
    const today = dayjs();

    // Helper to get a random element from an array
    const getRandomElement = <T,>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)];
    };

    // Helper to get a random amount for a transaction
    const getRandomAmount = (min: number, max: number): number => {
      return parseFloat((min + Math.random() * (max - min)).toFixed(2));
    };

    // Generate a number of random transactions
    for (let i = 0; i < 40; i++) {
      // Randomly pick a date within the last 30 days
      const dayOffset = Math.floor(Math.random() * 30);
      const date = today.subtract(dayOffset, 'day');

      // Determine transaction type (mostly expenses, some income, few transfers)
      const typeRandom = Math.random();
      let type: TransactionType = 'expense';
      if (typeRandom > 0.85) type = 'income';
      else if (typeRandom > 0.8) type = 'transfer';

      // For income transactions, use different merchants
      let merchant = '';
      let categoryId = '';
      let amount = 0;

      if (type === 'income') {
        merchant = getRandomElement([
          'Employer Inc',
          'Freelance Client',
          'Dividend Payment',
          'Refund',
          'Sale Proceeds',
        ]);
        amount = getRandomAmount(100, 3000);
        // Income doesn't have a category
        categoryId = 'income';
      } else {
        // Select a random category for expense/transfer
        categoryId = getRandomElement(CATEGORIES).id;
        merchant = getRandomElement(MERCHANTS[categoryId as keyof typeof MERCHANTS]);

        // Amounts vary by category
        switch (categoryId) {
          case 'housing':
            amount = getRandomAmount(800, 2500);
            break;
          case 'food':
            amount = getRandomAmount(10, 150);
            break;
          case 'transportation':
            amount = getRandomAmount(5, 80);
            break;
          case 'utilities':
            amount = getRandomAmount(50, 200);
            break;
          default:
            amount = getRandomAmount(15, 300);
        }
      }

      // Find the full category object
      const categoryObj =
        type === 'income'
          ? { id: 'income', name: 'Income', icon: '💰', color: '#6366F1' }
          : CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

      // Generate a description
      const getDescription = () => {
        if (type === 'income') return `Payment from ${merchant}`;
        if (type === 'transfer') return `Transfer to Savings`;
        return `Purchase at ${merchant}`;
      };

      result.push({
        id: `tx-${i}`,
        date,
        merchant,
        amount: type === 'income' ? amount : -amount,
        category: categoryObj,
        type,
        description: getDescription(),
      });
    }

    // Sort by date (most recent first) and take the requested limit
    return result.sort((a, b) => b.date.valueOf() - a.date.valueOf()).slice(0, limit);
  }, [limit]);

  // Format currency
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    return `${value < 0 ? '-' : ''}$${absValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date (shorter version for the transaction list)
  const formatDate = (date: dayjs.Dayjs) => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');

    if (date.isSame(today, 'day')) {
      return 'Today';
    } else if (date.isSame(yesterday, 'day')) {
      return 'Yesterday';
    } else {
      return date.format('MMM D');
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach(transaction => {
      const dateKey = transaction.date.format('YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dayjs(dateB).valueOf() - dayjs(dateA).valueOf())
      .map(([dateString, txs]) => ({
        date: dayjs(dateString),
        transactions: txs,
      }));
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Transaction list */}
      <div className="space-y-6">
        {groupedTransactions.map(group => (
          <div key={group.date.valueOf()} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">{formatDate(group.date)}</h3>

            <div className="space-y-2">
              {group.transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-primary-5 transition-all duration-200 group relative overflow-hidden"
                >
                  {/* Subtle SVG Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 20C40 10 60 30 80 20M20 40C40 30 60 50 80 40M20 60C40 50 60 70 80 60"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="90" cy="20" r="3" fill="currentColor" />
                      <circle cx="10" cy="60" r="3" fill="currentColor" />
                    </svg>

                    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 30h60M20 50h60"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="1 6"
                      />
                      <circle cx="20" cy="30" r="3" fill="currentColor" />
                      <circle cx="80" cy="50" r="3" fill="currentColor" />
                    </svg>

                    <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10 80L40 20M50 80L80 20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="20" cy="40" r="2" fill="currentColor" />
                      <circle cx="60" cy="40" r="2" fill="currentColor" />
                      <circle cx="40" cy="60" r="2" fill="currentColor" />
                      <circle cx="80" cy="60" r="2" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Left side - merchant and category */}
                  <div className="flex items-center space-x-3 z-10">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-105 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${transaction.category.color}15, ${transaction.category.color}30)`,
                        border: `1px solid ${transaction.category.color}40`,
                      }}
                    >
                      <span className="text-xl">{transaction.category.icon}</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <p className="font-medium text-sm text-gray-800">{transaction.merchant}</p>
                        {transaction.type === 'income' && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-sm font-medium">
                            INCOME
                          </span>
                        )}
                        {transaction.type === 'transfer' && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-sm font-medium">
                            TRANSFER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <div
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                        <p className="text-xs text-gray-500 mr-2">{transaction.category.name}</p>
                        <p className="text-xs text-gray-400">{transaction.date.format('h:mm A')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - amount */}
                  <div className="flex items-center z-10">
                    <div
                      className={`flex items-center justify-end px-3 py-1.5 rounded-lg ${
                        transaction.amount < 0
                          ? 'bg-red-50 text-red-600 group-hover:bg-red-100/80'
                          : 'bg-green-50 text-green-600 group-hover:bg-green-100/80'
                      } transition-colors`}
                    >
                      {transaction.amount < 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1.5 stroke-2" />
                      ) : (
                        <ArrowDownLeft className="h-3.5 w-3.5 mr-1.5 stroke-2" />
                      )}
                      <span className="font-semibold text-sm whitespace-nowrap">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 ml-2 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full">
          <span className="text-sm font-medium text-primary mr-2">View All Transactions</span>
          <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default RecentTransactions;
