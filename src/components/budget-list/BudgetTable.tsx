import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Calendar, ArrowDownCircle, ArrowUpCircle, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { formatCurrency, getMonthName } from '@/lib/utils';

export interface BudgetListItemProps {
  _id: string;
  year: number;
  month: number;
  currency: string;
  currencySym: string;
  amountBudgeted: number;
  amountSpent: number;
  budgetVariance: number;
  updatedAt: string;
  mostUsedCategory: {
    name: string;
    amountSpent: number;
    amountBudgeted: number;
  };
}

export interface Pagination {
  totalItemsCount: number;
  totalPages: number;
  currentPageCount: number;
  page: number;
  limit: number;
}

export interface BudgetsListResponse {
  budgets: BudgetListItemProps[];
  pagination: Pagination;
}

const columnHelper = createColumnHelper<BudgetListItemProps>();

const columns = [
  columnHelper.accessor(row => ({ month: row.month, year: row.year }), {
    id: 'monthYear',
    header: 'Month/Year',
    cell: info => (
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-blue-500/10 text-blue-700">
          <Calendar className="h-3.5 w-3.5" />
        </div>

        <span>
          {getMonthName(info.getValue().month)} {info.getValue().year}
        </span>
      </div>
    ),
  }),

  columnHelper.accessor('amountBudgeted', {
    header: 'Budgeted',
    cell: info => (
      <div className="font-medium text-teal-700">
        {info.row.original.currencySym}
        {formatCurrency(info.getValue())}
      </div>
    ),
  }),

  columnHelper.accessor('amountSpent', {
    header: 'Spent',
    cell: info => (
      <div className="font-medium text-violet-700">
        {info.row.original.currencySym}
        {formatCurrency(info.getValue())}
      </div>
    ),
  }),

  columnHelper.accessor('budgetVariance', {
    header: 'Remaining',
    cell: info => {
      const value = info.getValue();
      const isPositive = value >= 0;

      return (
        <div
          className={`font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {isPositive ? (
            <ArrowDownCircle className="h-3 w-3" />
          ) : (
            <ArrowUpCircle className="h-3 w-3" />
          )}
          {info.row.original.currencySym}
          {formatCurrency(Math.abs(value))}
        </div>
      );
    },
  }),

  columnHelper.accessor(row => Math.round((row.amountSpent / row.amountBudgeted) * 100) || 0, {
    id: 'usagePercentage',
    header: 'Usage',
    cell: info => {
      const value = info.getValue();
      const isOverBudget = value > 100;

      return (
        <div className="w-full max-w-[150px]">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>

          <div className="flex justify-end mt-1">
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded-full shadow-sm ${
                isOverBudget
                  ? 'bg-rose-100 text-rose-700'
                  : value === 0
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {value}%
            </span>
          </div>
        </div>
      );
    },
  }),

  columnHelper.accessor('_id', {
    header: 'Actions',
    cell: info => (
      <Link to={`/dashboard/budgets/${info.getValue()}`}>
        <Button
          variant="outline"
          size="sm"
          className="border border-blue-200 bg-white/80 hover:bg-blue-50 transition-all shadow-sm h-7 px-2 text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Details
        </Button>
      </Link>
    ),
  }),
];

// Budget Table Component
const BudgetTable = ({ budgets }: { budgets: BudgetListItemProps[] }) => {
  const table = useReactTable({
    data: budgets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
