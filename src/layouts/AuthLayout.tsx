import { Link, Outlet, useLocation } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth/login';

  return (
    <div className="w-full h-screen">
      <div className="container relative mx-auto h-full">
        <div className="absolute top-4 left-4 md:left-8 flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">HORDE</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </Link>
        </div>

        <div className="absolute top-4 right-4 md:right-8 flex items-center gap-4">
          <Link
            to={isLoginPage ? '/auth/signup' : '/auth/login'}
            className={`${
              isLoginPage
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } px-4 py-2 rounded-md text-sm font-medium transition-colors`}
          >
            {isLoginPage ? 'Sign Up' : 'Login'}
          </Link>
        </div>

        <div className="h-full flex items-center justify-center">
          <div className="mx-auto w-full max-w-[480px] bg-white p-8 rounded-lg shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03),0px_20px_24px_-4px_rgba(16,24,40,0.08)]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
