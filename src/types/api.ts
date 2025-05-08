export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  success: boolean;
  meta: {
    requestID: string;
    timestamp: string;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  currency: string;
  currencySym: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  userName?: string;
  preferences: UserPreferences;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  meta: AuthTokens;
}

export interface ApiErrorResponse {
  status: number;
  errorCode: string;
  errorDetails?: Record<string, string>;
  success: false;
  meta: {
    requestID: string;
    timestamp: string;
  };
  message: string;
}

// Socket event types
export interface SocketEventMap {
  // Add your socket event types here
  'notification:new': { id: string; message: string };
  'notification:read': { id: string };
  // Add more event types as needed
}

/**
 * ===============
 * CURRENT MONTH RESPONSEANALYTICS TYPES
 * ===============
 */

export interface ICurrentMonthAnalyticsData {
  year: number;
  monthName: string;
  weeklyStats: ICurrentMonthWeeklyStats;
  monthlyTrend: number;
  topCategory: ICurrentMonthTopCategory;
  dailyStats: ICurrentMonthDailyStats;
  totalExpensesCount: number;
  totalExpensesSum: number;
  avgExpenseAmount: number;
  largestTransaction: number;
}

export interface ICurrentMonthDailyStats {
  dailyAverageTransaction: number;
  totalDayCount: number;
  uniqueExpenseDates: ICurrentMonthUniqueExpenseDate[];
}

export interface ICurrentMonthUniqueExpenseDate {
  date: string;
  amount: number;
  count: number;
  description: string;
}

export interface ICurrentMonthRecentTransaction {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
  categoryName: string;
  formattedDate: string;
}

export interface ICurrentMonthTopCategory {
  _id: string;
  categoryName: string;
  totalSpent: number;
  count: number;
}

export interface ICurrentMonthWeeklyStats {
  averageWeeklySpending: number;
  peakSpendingWeek: ICurrentMonthWeek;
  weeks: ICurrentMonthWeek[];
}

export interface ICurrentMonthWeek {
  totalSpent: number;
  count: number;
  week: number;
  dateRange: ICurrentMonthDateRange;
}

export interface ICurrentMonthDateRange {
  start: string;
  end: string;
}

export interface ICurrentMonthOverallStat {
  totalExpensesCount: number;
  totalExpensesSum: number;
  avgExpenseAmount: number;
  largestTransaction: number;
  totalDayCount: number;
  uniqueDays: ICurrentMonthUniqueExpenseDate[];
}
