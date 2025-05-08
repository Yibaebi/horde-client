import { api } from './axios';
import { ApiResponse, LoginResponse, ApiErrorResponse } from '../../types/api';
import { setStoredTokens, setStoredUser, clearAuthStorage } from './storage';
import axios, { AxiosError } from 'axios';
import { socketService } from '../socket';
import { toast } from 'sonner';

interface SignInCredentials {
  email: string;
  password: string;
}

export const authApi = {
  async signIn(credentials: SignInCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      const { meta: tokens, user } = response.data.data;

      // Store both tokens and user data
      setStoredTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      setStoredUser(user);

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          toast.error(errorData.message);

          throw error;
        }
      }

      toast.error('An unexpected error occurred. Please try again.');

      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      socketService.disconnect();
      await api.post('/auth/signout');
    } finally {
      clearAuthStorage();
    }
  },
};
