import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi } from '@/app/api/auth';
import { User } from '@/types/api';
import { getStoredTokens, getStoredUser } from '@/app/api/storage';
import { socketService } from '@/app/socket';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  userPreferences: User['preferences'] | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing tokens and user data on mount
  useEffect(() => {
    const initializeAuth = () => {
      const tokens = getStoredTokens();
      const storedUser = getStoredUser();

      if (tokens?.accessToken && storedUser) {
        setIsAuthenticated(true);
        setUser(storedUser);

        // Connect socket if we have valid auth
        socketService.connect();
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn({ email, password });
      setIsAuthenticated(true);
      setUser(response.user);

      // Connect socket after successful login
      socketService.connect();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = async (_email: string, _password: string) => {
    // TODO: Implement signup logic using authApi
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.signOut();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      socketService.disconnect();
    }
  };

  const isAdmin = user?.roles.includes('admin') ?? false;
  const userPreferences = user?.preferences ?? null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user,
        userPreferences,
        isAdmin,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
