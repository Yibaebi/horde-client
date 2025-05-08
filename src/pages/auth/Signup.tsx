import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Sign Up</h2>
        <p className="text-sm text-muted-foreground mt-2">Let's get you started with Horde.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium space-y-1">
            Full Name<span className="text-destructive">*</span>
          </label>

          <Input
            id="fullName"
            placeholder="Enter your name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>

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
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password<span className="text-destructive">*</span>
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
        </div>

        <Button type="button">Create account</Button>

        <Button variant="outline" type="button">
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Sign in with Google
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};
