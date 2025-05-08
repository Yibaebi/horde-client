import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error && 'errorDetails' in error) {
        // Handle AuthError with field-specific errors
        const authError = error as Error & { errorDetails?: Record<string, string> };
        if (authError.errorDetails) {
          setErrors(authError.errorDetails);
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
        <p className="text-sm text-muted-foreground mt-2">Welcome back to Horde.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address<span className="text-destructive">*</span>
          </label>

          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={`bg-background ${errors.email ? 'border-destructive' : ''}`}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password<span className="text-destructive">*</span>
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={`bg-background ${errors.password ? 'border-destructive' : ''}`}
              aria-invalid={!!errors.password}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};
