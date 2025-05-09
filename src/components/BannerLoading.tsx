import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface BannerLoadingProps {
  isVisible?: boolean;
}

export default function BannerLoading({ isVisible = true }: BannerLoadingProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0, height: 0 }}
          animate={{ y: 0, opacity: 1, height: 'auto' }}
          exit={{
            y: -20,
            opacity: 0,
            height: 0,
            transition: { duration: 0.2, ease: 'easeInOut' },
          }}
          className="w-full max-w-full overflow-hidden h-[72px]"
        >
          <div className="mb-1 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-300 rounded-lg shadow-md overflow-hidden sm:px-2 md:px-4 w-full max-w-full">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 text-slate-500 mr-4 animate-spin" />

                <div>
                  <motion.div
                    animate={{
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
                    <div className="h-3 w-64 bg-slate-200 rounded-md mt-2"></div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                animate={{
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
                className="flex items-center"
              >
                <div className="px-4 py-1.5 h-8 w-28 bg-slate-200 rounded-md"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
