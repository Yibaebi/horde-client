// Table Skeleton Component
const BudgetTableSkeleton = () => {
  // Generate skeleton rows
  const skeletonRows = Array(6).fill(0);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {/* Header cells for each column */}
            {['Month/Year', 'Budgeted', 'Spent', 'Remaining', 'Usage', 'Actions'].map(
              (header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {skeletonRows.map((_, rowIndex) => (
            <tr
              key={`skeleton-row-${rowIndex}`}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Month/Year Column */}
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/10">
                    <div className="h-3.5 w-3.5 bg-gray-200 rounded-sm animate-pulse"></div>
                  </div>
                  <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </td>

              {/* Budgeted Column */}
              <td className="px-4 py-3 text-sm">
                <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </td>

              {/* Spent Column */}
              <td className="px-4 py-3 text-sm">
                <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </td>

              {/* Remaining Column */}
              <td className="px-4 py-3 text-sm">
                <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </td>

              {/* Usage Column */}
              <td className="px-4 py-3 text-sm">
                <div className="w-full max-w-[150px]">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gray-200 animate-pulse"
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <div className="h-4 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </td>

              {/* Actions Column */}
              <td className="px-4 py-3 text-sm">
                <div className="h-7 w-20 bg-gray-200 rounded-md animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTableSkeleton;
