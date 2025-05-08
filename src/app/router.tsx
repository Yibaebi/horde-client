import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/Dashboard';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Notifications } from '@/pages/dashboard/Notifications';
import { Budgets } from '@/pages/dashboard/Budgets';
import { NewBudget } from '@/pages/dashboard/NewBudget';
import { BudgetDetails } from '@/pages/dashboard/BudgetDetails';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'budgets',
        children: [
          {
            index: true,
            element: <Budgets />,
          },
          {
            path: 'new',
            element: <NewBudget />,
          },
          {
            path: ':id',
            element: <BudgetDetails />,
          },
        ],
      },
    ],
  },
]);
