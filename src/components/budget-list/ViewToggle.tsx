import { LayoutGrid } from 'lucide-react';
import { List } from 'lucide-react';

// View Toggle Component Props
interface BudgetListViewToggleProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

// View Toggle Component
const BudgetListViewToggle = ({ viewMode, setViewMode }: BudgetListViewToggleProps) => {
  return (
    <div className="flex items-center border rounded-lg p-1 shadow-sm bg-white">
      <button
        onClick={() => setViewMode('grid')}
        className={`flex items-center p-1.5 rounded text-sm ${
          viewMode === 'grid'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>

      <button
        onClick={() => setViewMode('table')}
        className={`flex items-center p-1.5 rounded text-sm ${
          viewMode === 'table'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BudgetListViewToggle;
