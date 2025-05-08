import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { XIcon, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error';

export interface BannerProps {
  /**
   * Banner title/heading
   */
  title: string;

  /**
   * Optional banner description/message
   */
  message?: string;

  /**
   * Banner color variant
   */
  variant?: BannerVariant;

  /**
   * Custom icon to display instead of the default variant icon
   */
  icon?: ReactNode;

  /**
   * Whether the banner can be dismissed (shows a close button)
   */
  dismissible?: boolean;

  /**
   * Text for the primary call-to-action button
   */
  ctaText?: string;

  /**
   * Click handler for the call-to-action button
   */
  onCtaClick?: () => void;

  /**
   * Additional CSS classes to apply to the banner
   */
  className?: string;

  /**
   * Whether the banner is visible - controlled externally
   */
  visible?: boolean;

  /**
   * Optional callback when banner is dismissed
   */
  onDismiss?: () => void;
}

const getBannerColors = (variant: BannerVariant) => {
  switch (variant) {
    case 'success':
      return {
        gradient: 'from-green-50 to-green-100',
        border: 'border-green-500',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700',
        ctaColors: 'bg-green-500 hover:bg-green-600 text-white',
        closeColor: 'text-green-600 hover:text-green-800',
      };

    case 'error':
      return {
        gradient: 'from-red-50 to-red-100',
        border: 'border-red-500',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700',
        ctaColors: 'bg-red-500 hover:bg-red-600 text-white',
        closeColor: 'text-red-600 hover:text-red-800',
      };

    case 'warning':
      return {
        gradient: 'from-amber-50 to-amber-100',
        border: 'border-amber-500',
        iconColor: 'text-amber-600',
        titleColor: 'text-amber-800',
        messageColor: 'text-amber-700',
        ctaColors: 'bg-amber-500 hover:bg-amber-600 text-white',
        closeColor: 'text-amber-600 hover:text-amber-800',
      };

    case 'info':
    default:
      return {
        gradient: 'from-primary-10 to-primary-50',
        border: 'border-primary',
        iconColor: 'text-primary',
        titleColor: 'text-primary-500',
        messageColor: 'text-primary-500',
        ctaColors: 'bg-primary-300 hover:bg-primary-400 text-white',
        closeColor: 'text-primary hover:text-primary-300',
      };
  }
};

const getDefaultIcon = (variant: BannerVariant, colorClass: string) => {
  const iconProps = { className: `h-6 w-6 ${colorClass} mr-4` };

  switch (variant) {
    case 'success':
      return <CheckCircle {...iconProps} />;

    case 'error':
      return <AlertCircle {...iconProps} />;

    case 'warning':
      return <AlertTriangle {...iconProps} />;

    case 'info':
    default:
      return <Info {...iconProps} />;
  }
};

const Banner = ({
  title,
  message,
  variant = 'info',
  icon,
  dismissible = true,
  ctaText,
  onCtaClick,
  className = '',
  visible = true,
  onDismiss,
}: BannerProps) => {
  // Get the banner colors
  const { gradient, border, iconColor, titleColor, messageColor, ctaColors, closeColor } =
    getBannerColors(variant);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={`mb-1 bg-gradient-to-r ${gradient} border-l-4 ${border} rounded-lg shadow-md overflow-hidden ${className}`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {icon || getDefaultIcon(variant, iconColor)}

              <div>
                <h3 className={`${titleColor} font-medium text-sm`}>{title}</h3>
                {message && <p className={`${messageColor} text-xs mt-1`}>{message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {ctaText && onCtaClick && (
                <button
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors cursor-pointer ${ctaColors}`}
                  onClick={onCtaClick}
                >
                  {ctaText}
                </button>
              )}

              {dismissible && (
                <button
                  className={`${closeColor} cursor-pointer`}
                  onClick={onDismiss}
                  aria-label="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Banner;
