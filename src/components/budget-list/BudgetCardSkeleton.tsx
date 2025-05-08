import { Card } from '@/components/ui/card';

// Budget Card Skeleton Loader Component
const BudgetCardSkeleton = () => {
  return (
    <Card
      className="bg-white shadow-sm transition-all duration-300 overflow-hidden m-1"
      style={{
        borderRadius: '16px',
        borderLeft: `1px solid #f1f5f9`,
        borderTop: `1px solid #f1f5f9`,
        borderRight: `1px solid #e2e8f0`,
        borderBottom: `1px solid #e2e8f0`,
      }}
    >
      <div className="px-6 pt-6 pb-3 relative">
        {/* Subtle horizontal dividing line */}
        <div className="absolute -left-0 -right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Card Header Skeleton */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="h-7 w-36 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse mt-2"></div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Amount Display Skeleton */}
        <div className="mb-6">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <div className="h-10 w-36 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="flex items-center mt-3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full animate-pulse shadow-inner"></div>
              <div className="ml-3 h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Section Skeleton */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100/80">
        <div className="flex items-start">
          <div className="flex items-start gap-3 w-full">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mt-1 shadow-sm"></div>

            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="ml-2 h-4 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCardSkeleton;
