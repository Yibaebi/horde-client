import { FC } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { formatErrorMessage } from '@/lib/utils';
import { Button } from './ui/button';

interface ErrorCardProps {
  error: Error | null;
  reload: () => void;
}

/**
 * ErrorCard Component
 *
 * This component displays an error message in a card format.
 * It uses the AlertTriangle icon from Lucide and a custom error message.
 */

const ErrorCard: FC<ErrorCardProps> = ({ error, reload }) => {
  const { errorMessage, apiError } = formatErrorMessage(error);

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 relative">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-8 border-b border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Budgets</h2>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>

          {apiError && (
            <div className="px-6 py-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Error Details
                </h3>
              </div>
              <div className="bg-slate-50 rounded-md border border-slate-200 overflow-auto max-h-40 text-xs">
                <pre className="p-3 whitespace-pre-wrap text-slate-700">
                  {JSON.stringify(apiError, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 flex justify-center">
            <Button
              variant="outline"
              onClick={() => reload()}
              className="border-red-200 bg-white hover:bg-red-50 text-red-600 font-medium transition-colors"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
