import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Pagination Props
export interface PaginationProps {
  handlePageChange: (page: number) => void;
  pageCount: number;
  pagination: {
    pageIndex: number;
  };
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
}

// Table Pagination Component
const Pagination = ({
  pagination,
  handlePageChange,
  pageCount,
  itemsPerPage = 10,
  onItemsPerPageChange,
}: PaginationProps) => {
  const currentPage = pagination.pageIndex + 1;

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(Number(value));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 p-4 bg-white/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-200/60">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-0">
        <p className="text-sm font-medium text-gray-600">
          Page {currentPage} of {pageCount}
        </p>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-500">Items per page:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="h-8 w-[70px] border-gray-200 bg-white shadow-sm">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-gray-200 bg-white hover:bg-gray-50 h-8 w-8 p-0 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-lg border border-primary/20">
          {currentPage} / {pageCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
          className="border-gray-200 bg-white hover:bg-gray-50 h-8 w-8 p-0 rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
