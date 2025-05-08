import { Loader2 } from 'lucide-react';

export default function BannerLoading() {
  return (
    <div className="w-full max-w-full overflow-hidden min-h-[72px]">
      <div className="mb-1 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-300 rounded-lg shadow-md overflow-hidden sm:px-2 md:px-4 w-full max-w-full">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 text-slate-500 mr-4 animate-spin" />

            <div>
              <div className="h-4 w-48 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-3 w-64 bg-slate-200 rounded-md animate-pulse mt-2"></div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="px-4 py-1.5 h-8 w-28 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
