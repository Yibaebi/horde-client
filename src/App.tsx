import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { router } from '@/app/router';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}

export default App;
