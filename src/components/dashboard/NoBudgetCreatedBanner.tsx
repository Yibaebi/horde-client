import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { getMonthName, getCurrentMonth, getCurrentYear } from '@/lib/utils';
import Banner from '@/components/ui/Banner';

interface NoBudgetCreatedBannerProps {
  budgetNotFound: boolean;
  month: number;
  year: number;
  isLoading?: boolean;
}

const NoBudgetCreatedBanner = ({ budgetNotFound, month, year }: NoBudgetCreatedBannerProps) => {
  const navigate = useNavigate();

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const currentMonthName = getMonthName(currentMonth);

  const shouldShowBanner = year === currentYear && month === currentMonth && budgetNotFound;

  return (
    shouldShowBanner && (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0, y: -30, scaleY: 0.8 }}
          animate={{ opacity: 1, height: 'auto', y: 0, scaleY: 1 }}
          exit={{
            opacity: 0,
            height: 0,
            y: -30,
            scaleY: 0.8,
            transition: {
              type: 'spring',
              damping: 20,
              stiffness: 300,
              duration: 0.3,
            },
          }}
          transition={{
            type: 'spring',
            damping: 12,
            stiffness: 250,
            mass: 1.2,
            bounce: 0.4,
            duration: 0.4,
          }}
          className="w-full max-w-full overflow-hidden"
        >
          <Banner
            title={`No Budget for ${currentMonthName}, ${currentYear}.`}
            message="You haven't created a budget for this month yet. Create a budget to track your spending and savings goals."
            variant="warning"
            ctaText="Create Budget"
            onCtaClick={() => navigate('/dashboard/budgets/new')}
            dismissible={false}
            className="border-amber-400 sm:px-2 md:px-4 w-full max-w-full"
            visible={true}
          />
        </motion.div>
      </AnimatePresence>
    )
  );
};

export default NoBudgetCreatedBanner;
