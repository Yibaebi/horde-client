import { ReactElement } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  className?: string;
}

export interface NotificationOptions {
  description?: string;
  action?: NotificationAction;
  duration?: number;
  id?: string | number;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  render?: (id: number | string) => ReactElement;
}

// Button styles for different notification types
const buttonStyles = {
  error: {
    base: '!border !border-rose-500 !text-rose-600 !bg-white',
    hover: 'hover:!bg-rose-50',
  },
  success: {
    base: '!border !border-emerald-500 !text-emerald-600 !bg-white',
    hover: 'hover:!bg-emerald-50',
  },
  info: {
    base: '!border !border-primary !text-primary !bg-white',
    hover: 'hover:!bg-primary-50',
  },
  warning: {
    base: '!border !border-amber-500 !text-amber-600 !bg-white',
    hover: 'hover:!bg-amber-50',
  },
};

// Common style for action buttons
const commonButtonStyle = 'px-3 py-1.5 rounded-md text-xs font-medium transition-colors';

// Get the class names for the action button
const getActionBtnClassNames = (type: 'success' | 'error' | 'info' | 'warning') => {
  const { base, hover } = buttonStyles[type];

  return `${base} ${hover} ${commonButtonStyle}`;
};

/**
 * Shows a success notification with optional description and action
 */
export const showSuccess = (message: string, options: NotificationOptions = {}) => {
  const { description, action, duration, id, onDismiss, onAutoClose } = options;

  return toast.success(message, {
    description,
    icon: <CheckCircle className="text-emerald-500 max-w-[20px] max-h-[20px]" />,
    action,
    duration: duration || 5000,
    id,
    onDismiss,
    onAutoClose,
    classNames: {
      actionButton: getActionBtnClassNames('success'),
    },
  });
};

/**
 * Shows an error notification with optional description and action
 */
export const showError = (message: string, options: NotificationOptions = {}) => {
  const { description, action, duration, id, onDismiss, onAutoClose } = options;

  return toast.error(message, {
    description,
    icon: <AlertCircle className="text-rose-500 max-w-[20px] max-h-[20px]" />,
    action,
    duration: duration || 8000,
    id,
    onDismiss,
    onAutoClose,
    classNames: {
      icon: '!mr-3',
      actionButton: getActionBtnClassNames('error'),
    },
  });
};

/**
 * Shows an info notification with optional description and action
 */
export const showInfo = (message: string, options: NotificationOptions = {}) => {
  const { description, action, duration, id, onDismiss, onAutoClose } = options;

  return toast(message, {
    description,
    icon: <Info className="text-primary max-w-[20px] max-h-[20px]" />,
    action,
    duration: duration || 500000,
    id,
    onDismiss,
    onAutoClose,
    className: '!text-primary !border !border-primary-50',
    classNames: {
      icon: '!mr-3 ',
      actionButton: getActionBtnClassNames('info'),
    },
  });
};

/**
 * Shows a warning notification with optional description and action
 */
export const showWarning = (message: string, options: NotificationOptions = {}) => {
  const { description, action, duration, id, onDismiss, onAutoClose } = options;

  return toast.warning(message, {
    description,
    icon: <AlertTriangle className="text-amber-500 max-w-[20px] max-h-[20px]" />,
    action,
    duration: duration || 7000, // Warnings stay a bit longer
    id,
    onDismiss,
    onAutoClose,
    classNames: {
      icon: '!mr-3',
      actionButton: getActionBtnClassNames('warning'),
    },
  });
};

/**
 * Shows a custom notification with full control
 */
export const showCustom = (message: string, options: NotificationOptions = {}) => {
  const { description, duration, id, onDismiss, onAutoClose, render } = options;

  return toast.custom(
    render ||
      (id => (
        <div className="bg-white shadow-lg rounded-lg p-4 border-l-4 border-gray-500">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{message}</p>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
              </div>
            </div>

            <button onClick={() => toast.dismiss(id)} className="text-gray-400 hover:text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>
      )),
    {
      id,
      duration: duration || 5000,
      onDismiss,
      onAutoClose,
    }
  );
};

/**
 * Single main export for all notification functions
 */
export const notifications = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  custom: showCustom,
};
