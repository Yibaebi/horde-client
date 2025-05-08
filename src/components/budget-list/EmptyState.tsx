import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Empty State Component
const EmptyBudgetListState = () => {
  return (
    <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl">
      <div className="p-4 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-medium mb-2">No budgets found</h3>
        <p className="text-muted-foreground mb-6">
          Create your first budget to start tracking your finances
        </p>
        <Link to="/dashboard/budgets/new">
          <Button className="shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create your first budget
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default EmptyBudgetListState;
