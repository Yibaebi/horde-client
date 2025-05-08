import { User } from '@/types/api';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export const getStoredTokens = (): Tokens | null => {
  const tokens = localStorage.getItem(TOKEN_KEY);
  return tokens ? JSON.parse(tokens) : null;
};

export const setStoredTokens = (tokens: Tokens): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
