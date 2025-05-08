import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChartBar,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Droplets,
  HeartPulse,
  User,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Home,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

// Import Recharts components
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import NoBudgetCreatedBanner from '@/components/dashboard/NoBudgetCreatedBanner';
import { useQuery } from '@tanstack/react-query';
import { budgetApi } from '@/app/api/budgets';
import { formatErrorMessage, getMonthName } from '@/lib/utils';
import MonthlyBudgetCard from '@/components/dashboard/MonthlyBudgetCard';
import WeeklyAndMonthTrend from '@/components/dashboard/WeeklyAndMonthTrend';
import Banner from '@/components/ui/Banner';
import DailyTrendAndTransactions from '@/components/dashboard/DailyTrendAndTransactions';
import dayjs from 'dayjs';
import useDeferredLoading from '@/hooks/useDeferredLoading';
import BannerLoading from '@/components/BannerLoading';
import ManagementCard from '@/components/dashboard/BudgetManagement/ManagementCard';

export const Dashboard: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentMonthName = getMonthName();
  const [chartsCollapsed, setChartsCollapsed] = useState<boolean>(false);

  // Get month and year from URL query params or default to current month/year
  const [year, setYear] = useState(() => Number(searchParams.get('year')) || dayjs().get('year'));
  const [month, setMonth] = useState(
    () => Number(searchParams.get('month')) || dayjs().get('month')
  );

  // Update URL when month or year changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    params.set('month', month.toString());
    params.set('year', year.toString());

    setSearchParams(params);
  }, [month, year, searchParams, setSearchParams]);

  // Use the mock data for category drift
  const categoryDriftData = useMemo(
    () => [
      // Under budget (positive)
      {
        category: 'Housing',
        budget: 1500,
        spent: 975,
        drift: 525,
        driftPercent: 35.0,
        positive: true,
        status: 'positive',
        icon: <Home size={18} />,
      },
      {
        category: 'Food',
        budget: 800,
        spent: 600,
        drift: 200,
        driftPercent: 25.0,
        positive: true,
        status: 'positive',
        icon: <Utensils size={18} />,
      },

      // Warning level - slightly over budget
      {
        category: 'Transport',
        budget: 400,
        spent: 440,
        drift: -40,
        driftPercent: 10.0,
        positive: false,
        status: 'warning',
        icon: <Car size={18} />,
      },
      {
        category: 'Entertainment',
        budget: 1000,
        spent: 1080,
        drift: -80,
        driftPercent: 8.0,
        positive: false,
        status: 'warning',
        icon: <Film size={18} />,
      },

      // Significantly over budget (negative)
      {
        category: 'Shopping',
        budget: 1350,
        spent: 1755,
        drift: -405,
        driftPercent: 30.0,
        positive: false,
        status: 'negative',
        icon: <ShoppingBag size={18} />,
      },
      {
        category: 'Utilities',
        budget: 200,
        spent: 280,
        drift: -80,
        driftPercent: 40.0,
        positive: false,
        status: 'negative',
        icon: <Droplets size={18} />,
      },

      // Unused categories
      {
        category: 'Health',
        budget: 150,
        spent: 0,
        drift: 150,
        driftPercent: 100,
        positive: true,
        status: 'unused',
        icon: <HeartPulse size={18} />,
      },
      {
        category: 'Personal',
        budget: 100,
        spent: 0,
        drift: 100,
        driftPercent: 100,
        positive: true,
        status: 'unused',
        icon: <User size={18} />,
      },
    ],
    []
  );

  // Initialize and handle scroll controls for drift cards
  useEffect(() => {
    const initScrollControls = () => {
      const container = document.getElementById('drift-cards-container');
      const upButton = document.getElementById('drift-scroll-up-btn');
      const downButton = document.getElementById('drift-scroll-down-btn');

      // Initial state: hide up button, check if down button should be visible
      if (upButton) {
        upButton.classList.add('opacity-0', 'invisible');
      }

      if (downButton && container) {
        const isAtBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 20;
        if (isAtBottom) {
          downButton.classList.remove('opacity-100', 'visible');
          downButton.classList.add('opacity-0', 'invisible');
        }
      }
    };

    // Run once after component mounts
    setTimeout(initScrollControls, 300); // Short delay to ensure DOM is ready
  }, []);

  // Animation variants
  const headerIconVariants = {
    expanded: {
      rotate: 180,
      scale: 0.9,
      transition: { type: 'spring', stiffness: 200, damping: 10 },
    },
    collapsed: {
      rotate: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 10 },
    },
  };

  const contentVariants = {
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: {
          type: 'spring',
          stiffness: 100,
          damping: 20,
          duration: 0.6,
        },
        opacity: {
          duration: 0.4,
          ease: 'easeIn',
        },
      },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
          ease: 'easeOut',
        },
      },
    },
  };

  const summaryVariants = {
    expanded: {
      height: 0,
      opacity: 0,
      y: -20,
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.2 },
        y: { duration: 0.3 },
      },
    },
    collapsed: {
      height: 'auto',
      opacity: 1,
      y: 0,
      transition: {
        height: {
          type: 'spring',
          stiffness: 150,
          damping: 15,
          duration: 0.5,
        },
        opacity: {
          duration: 0.4,
          delay: 0.1,
        },
        y: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: 0.05,
        },
      },
    },
  };

  const labelVariants = {
    expanded: {
      opacity: 1,
      marginRight: 12,
      transition: {
        opacity: { duration: 0.3, delay: 0.2 },
        width: { duration: 0.3, delay: 0.1 },
        marginRight: { duration: 0.3, delay: 0.1 },
      },
    },
    collapsed: {
      opacity: 0,
      width: 0,
      marginRight: 0,
      transition: {
        opacity: { duration: 0.2 },
        width: { duration: 0.3, delay: 0.1 },
        marginRight: { duration: 0.3 },
      },
    },
  };

  // Get current month budget
  const {
    data: budget,
    error,
    isLoading,
  } = useQuery({
    enabled: true,
    queryKey: ['currMonthBudget', month, year],
    queryFn: async ({ queryKey }) => {
      const [, month, year] = queryKey;
      const budget = await budgetApi.getBudgetByMonthAndYear(month, year);

      return budget;
    },
  });

  const { status } = formatErrorMessage(error);
  const budgetNotFound = status === 404;

  // Get current month analytics
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    enabled: true,
    queryKey: ['currMonthAnalytics', month, year],
    queryFn: async ({ queryKey }) => {
      const [, month, year] = queryKey;
      const analytics = await budgetApi.getCurrentMonthAnalytics(month, year);

      return analytics;
    },
  });

  // Check if spending exceeds budget
  const isOverBudget = Number(budget?.amountSpent) > Number(budget?.amountBudgeted);
  const isFetchingData = useDeferredLoading(isLoading || isAnalyticsLoading, 500);

  return (
    <div className="relative space-y-4 pb-10 max-w-7xl mx-auto">
      {isFetchingData ? (
        <BannerLoading />
      ) : (
        <>
          {isOverBudget && (
            <Banner
              variant="error"
              title="You're over budget!"
              message="Please adjust your budget to avoid overspending."
              dismissible={false}
              className="mb-4"
            />
          )}

          <NoBudgetCreatedBanner budgetNotFound={budgetNotFound} />
        </>
      )}

      {/* Budget Management Card */}

      {/* Redesigned Header Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 my-2">
        <div className="flex flex-col gap-4 h-full">
          <div className="col-span-1 bg-gradient-to-br from-primary to-violet-600 rounded-lg p-6 shadow-lg relative text-white">
            <ManagementCard
              budget={budget}
              defaultMonth={month}
              defaultYear={year}
              onTimelineChange={date => {
                setMonth(dayjs(date).month());
                setYear(dayjs(date).year());
              }}
            />
          </div>

          <MonthlyBudgetCard
            dashboardMonth={month}
            dashboardYear={year}
            budget={budget}
            isLoading={isFetchingData}
          />
        </div>

        <WeeklyAndMonthTrend isLoading={isFetchingData} budget={budget} analytics={analytics} />

        {/* Financial Summary Cards */}
        <DailyTrendAndTransactions
          isLoading={isFetchingData}
          budget={budget}
          analytics={analytics}
        />
      </div>

      <div className="flex flex-row flex-wrap my-2 gap-6 my-8">
        <div className="sm:w-full md:w-1/2 lg:w-1/2 xl:w-1/2 sm:min-w-[500px] flex gap-2">
          {/* Budget Analysis */}
          <div className="w-full rounded-xl bg-white shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] transition-all duration-300 h-auto">
            <div className="rounded-t-xl bg-gradient-to-br from-violet-600 to-primary text-white p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <ChartBar size={18} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Budget Performance Analysis
                  </h3>

                  <p className="text-xs text-white mt-0.5 opacity-90">
                    Visualizes actual spending vs budget across different categories.
                  </p>
                </div>
              </div>
            </div>

            {/* Modern Budget Visualization */}
            <div className="min-h-[400px] flex flex-col gap-4 p-1 p-4">
              <div className="relative inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-xl z-0 border border-primary/10">
                {/* Decorative background icons */}
                <div className="absolute inset-0 -z-1 overflow-hidden rounded-xl">
                  <ShoppingBag className="absolute bottom-20 left-10 text-primary-50/10 w-10 h-10" />
                  <Utensils className="absolute top-20 right-10 text-primary-50/10 w-8 h-8" />
                  <Droplets className="absolute bottom-5 right-20 text-primary-50/10 w-9 h-9" />
                  <HeartPulse className="absolute top-1/2 right-5 text-primary-50/10 w-10 h-10" />
                  <Car className="absolute bottom-10 left-1/3 text-primary-50/10 w-11 h-11" />
                  <User className="absolute top-10 right-1/3 text-primary-50/10 w-8 h-8" />
                  <Film className="absolute bottom-1/3 right-1/4 text-primary-50/10 w-9 h-9" />
                </div>

                <div className="w-full flex flex-col items-center justify-center">
                  {/* Create flex container for chart and right-side cards */}
                  <div className="w-full flex flex-col justify-between p-4">
                    {/* Radar chart container with full width */}
                    <div className="w-full bg-primary-10/10 rounded-lg">
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart
                          outerRadius={130}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                          data={(() => {
                            const categories = [
                              'Housing',
                              'Food',
                              'Transport',
                              'Entertainment',
                              'Shopping',
                              'Utilities',
                              'Health',
                              'Personal',
                            ];

                            const budgetData = [1500, 800, 400, 1000, 1350, 200, 150, 100];
                            const actualData = [1500, 920, 350, 1480, 1090, 500, 130, 1000];

                            // Calculate max value for domain
                            const maxValue = Math.max(...budgetData, ...actualData) * 1.2;

                            // Prepare data for radar chart
                            return categories.map((category, index) => {
                              const budget = budgetData[index];
                              const actual = actualData[index];
                              const diff = actual - budget;

                              const percentDiff =
                                budget > 0 ? Math.round((actual / budget - 1) * 100) : 0;

                              // Determine status for coloring
                              let status;
                              if (actual === 0) {
                                status = 'unused';
                              } else if (diff > 0 && Math.abs(diff) / budget > 0.05) {
                                status = 'over'; // Over budget
                              } else if (diff < 0 && Math.abs(diff) / budget > 0.05) {
                                status = 'under'; // Under budget
                              } else {
                                status = 'on'; // On budget
                              }

                              return {
                                category,
                                budget,
                                actual,
                                diff,
                                percentDiff,
                                status,
                                fullMark: maxValue,
                              };
                            });
                          })()}
                        >
                          <defs>
                            <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(96, 87, 255, 0.7)" />
                              <stop offset="100%" stopColor="rgba(96, 87, 255, 0.1)" />
                            </linearGradient>

                            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(128, 117, 255, 0.9)" />
                              <stop offset="100%" stopColor="rgba(128, 117, 255, 0.2)" />
                            </linearGradient>

                            <filter id="glow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />

                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          <PolarGrid stroke="#e2e8f0" strokeWidth={1} />

                          <PolarAngleAxis
                            dataKey="category"
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                            stroke="rgba(0,0,0,0)"
                          />

                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 'auto']}
                            tick={{ fill: '#94a3b8', fontSize: 9 }}
                            tickFormatter={value => `$${value}`}
                            stroke="#cbd5e1"
                            strokeWidth={0.5}
                            axisLine={false}
                          />

                          <Radar
                            name="Budget"
                            dataKey="budget"
                            stroke="#6057ff40"
                            fill="url(#budgetGradient)"
                            fillOpacity={0.6}
                            strokeWidth={1.5}
                            dot={{ r: 0 }}
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />

                          <Radar
                            name="Actual"
                            dataKey="actual"
                            stroke="#8075ff"
                            fill="url(#actualGradient)"
                            fillOpacity={0.7}
                            strokeWidth={1.5}
                            dot={{
                              r: 3,
                              fill: '#8075ff',
                              strokeWidth: 2,
                              stroke: 'white',
                              filter: 'url(#glow)',
                            }}
                            isAnimationActive={true}
                            animationBegin={300}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          />

                          <Tooltip
                            formatter={(value, name) => [`$${value}`, name]}
                            labelFormatter={label => `${label}`}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              fontSize: '11px',
                              backdropFilter: 'blur(4px)',
                              zIndex: 1000,
                            }}
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const categoryData = payload[0].payload;
                                const { budget, actual, status } = categoryData;

                                // Calculate difference
                                const diff = actual - budget;
                                const diffPercent =
                                  budget > 0 ? Math.round((actual / budget - 1) * 100) : 0;
                                const diffPrefix = diff >= 0 ? '+' : '';

                                // Determine status colors and icons
                                let statusColor, statusIcon;
                                if (status === 'unused') {
                                  statusColor = '#6B7280';
                                  statusIcon = <Droplets className="inline-block ml-1 h-3 w-3" />;
                                } else if (status === 'over') {
                                  statusColor = '#EF4444';
                                  statusIcon = <TrendingUp className="inline-block ml-1 h-3 w-3" />;
                                } else if (status === 'under') {
                                  statusColor = '#10B981';
                                  statusIcon = (
                                    <TrendingDown className="inline-block ml-1 h-3 w-3" />
                                  );
                                } else {
                                  statusColor = '#6057FF';
                                  statusIcon = (
                                    <ChevronRight className="inline-block ml-1 h-3 w-3" />
                                  );
                                }

                                return (
                                  <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-lg p-3 z-50">
                                    <div className="font-medium text-gray-900 border-b border-gray-100 pb-1.5 mb-1.5 flex items-center">
                                      {label} {statusIcon}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                      <div className="text-gray-500">Budget:</div>
                                      <div className="text-right font-medium text-primary-600">
                                        ${budget}
                                      </div>

                                      <div className="text-gray-500">Actual:</div>
                                      <div
                                        className="text-right font-medium"
                                        style={{ color: statusColor }}
                                      >
                                        ${actual}
                                      </div>

                                      {status !== 'unused' && (
                                        <>
                                          <div className="text-gray-500">Difference:</div>
                                          <div
                                            className="text-right font-medium"
                                            style={{ color: statusColor }}
                                          >
                                            {diffPrefix}${Math.abs(diff)} ({diffPrefix}
                                            {Math.abs(diffPercent)}%)
                                          </div>
                                        </>
                                      )}

                                      <div className="text-gray-500">Status:</div>
                                      <div
                                        className="text-right font-medium"
                                        style={{ color: statusColor }}
                                      >
                                        {status === 'unused'
                                          ? 'Unused'
                                          : status === 'over'
                                            ? 'Overspent'
                                            : status === 'under'
                                              ? 'Underspent'
                                              : 'On Budget'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>

                      {/* Budget Legend */}
                      <div className="flex justify-center gap-6 mt-3 mb-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-primary opacity-60"></div>
                          <span className="text-gray-600">Budget</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-primary/90"></div>
                          <span className="text-gray-600">Actual</span>
                        </div>
                      </div>
                    </div>

                    {/* Budget Insights Card  */}
                    <div className="flex flex-col items-start mt-4 rounded-lg text-xs text-slate-600 border border-primary-200 p-3">
                      <p className="font-bold mb-1 flex items-center">Budget Insights</p>

                      <span>
                        Peak spending in{' '}
                        <span className="text-primary-600 font-bold">Week 4 ($1,900)</span>, with an
                        overall upward trend. Weekly average at{' '}
                        <span className="text-primary-600 font-bold">$1,550</span>.
                      </span>
                    </div>

                    {/* divider */}
                    <div className="w-full h-[1px] bg-gray-200 my-4"></div>

                    {/* Horizontal Scrollable Drift Cards Container */}

                    <div className="flex flex-col items-start rounded-lg text-xs text-slate-600 p-2 pt-0">
                      <p className="font-bold mb-1 flex items-center">
                        How is each category doing?
                      </p>

                      <span>See how each category is doing compared to the budget.</span>
                    </div>

                    <div className="relative">
                      {/* Left Arrow Button */}
                      <button
                        id="drift-scroll-left-btn"
                        className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all opacity-0 invisible shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
                        onClick={() => {
                          const container = document.getElementById('drift-cards-container');
                          if (container) {
                            container.scrollBy({ left: -200, behavior: 'smooth' });
                          }
                        }}
                      >
                        <ChevronUp size={14} className="text-primary-600 -rotate-90 z-10" />
                      </button>

                      {/* Container with scroll shadows */}
                      <div className="relative rounded-lg overflow-hidden">
                        {/* Left Shadow Gradient */}
                        <div
                          id="drift-left-shadow"
                          className="absolute inset-y-0 left-0 w-12 pointer-events-none opacity-0 z-1 transition-opacity duration-300"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, rgba(240,240,245,0.9), rgba(240,240,245,0))',
                            borderTopLeftRadius: '8px',
                            borderBottomLeftRadius: '8px',
                          }}
                        ></div>

                        {/* Scrollable Container */}
                        <div
                          id="drift-cards-container"
                          className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-primary-100 scrollbar-track-transparent pb-2"
                          style={{
                            maxWidth: '100%',
                            WebkitOverflowScrolling: 'touch',
                          }}
                          onScroll={e => {
                            const container = e.currentTarget;
                            const leftButton = document.getElementById('drift-scroll-left-btn');
                            const rightButton = document.getElementById('drift-scroll-right-btn');
                            const leftShadow = document.getElementById('drift-left-shadow');
                            const rightShadow = document.getElementById('drift-right-shadow');

                            // Show/hide left button and shadow based on scroll position
                            if (leftButton && leftShadow) {
                              if (container.scrollLeft > 20) {
                                leftButton.classList.remove('opacity-0', 'invisible');
                                leftButton.classList.add('opacity-100', 'visible');

                                leftShadow.classList.remove('opacity-0');
                                leftShadow.classList.add('opacity-100');
                              } else {
                                leftButton.classList.remove('opacity-100', 'visible');
                                leftButton.classList.add('opacity-0', 'invisible');

                                leftShadow.classList.remove('opacity-100');
                                leftShadow.classList.add('opacity-0');
                              }
                            }

                            // Show/hide right button and shadow based on scroll position
                            if (rightButton && rightShadow) {
                              const isAtEnd =
                                container.scrollWidth -
                                  container.scrollLeft -
                                  container.clientWidth <
                                20;
                              if (isAtEnd) {
                                rightButton.classList.remove('opacity-100', 'visible');
                                rightButton.classList.add('opacity-0', 'invisible');

                                rightShadow.classList.remove('opacity-100');
                                rightShadow.classList.add('opacity-0');
                              } else {
                                rightButton.classList.remove('opacity-0', 'invisible');
                                rightButton.classList.add('opacity-100', 'visible');

                                rightShadow.classList.remove('opacity-0');
                                rightShadow.classList.add('opacity-100');
                              }
                            }
                          }}
                        >
                          <div className="flex flex-row gap-3 py-2 px-1 min-w-max">
                            {categoryDriftData.map((drift, idx) => {
                              // Determine color scheme based on drift status
                              let colorScheme, icon, statusText;

                              switch (drift.status) {
                                case 'positive':
                                  colorScheme = {
                                    gradient: 'from-emerald-50 to-emerald-100',
                                    border: 'border-emerald-400',
                                    text: 'text-emerald-600',
                                    boldText: 'text-emerald-700',
                                  };
                                  icon = (
                                    <TrendingDown size={16} className="ml-1 text-emerald-600" />
                                  );
                                  statusText = `Untouched $${drift.drift} of $${drift.budget}`;
                                  break;
                                case 'warning':
                                  colorScheme = {
                                    gradient: 'from-amber-50 to-amber-100',
                                    border: 'border-amber-400',
                                    text: 'text-amber-600',
                                    boldText: 'text-amber-700',
                                  };
                                  icon = <TrendingUp size={16} className="ml-1 text-amber-600" />;
                                  statusText = `Slightly over by $${Math.abs(drift.drift)}`;
                                  break;
                                case 'negative':
                                  colorScheme = {
                                    gradient: 'from-rose-50 to-rose-100',
                                    border: 'border-rose-400',
                                    text: 'text-rose-600',
                                    boldText: 'text-rose-700',
                                  };
                                  icon = <TrendingUp size={16} className="ml-1 text-rose-600" />;
                                  statusText = `Exceeded by $${Math.abs(drift.drift)}`;
                                  break;
                                case 'unused':
                                  colorScheme = {
                                    gradient: 'from-slate-50 to-slate-100',
                                    border: 'border-slate-400',
                                    text: 'text-slate-600',
                                    boldText: 'text-slate-700',
                                  };
                                  icon = (
                                    <CircleDollarSign size={16} className="ml-1 text-slate-600" />
                                  );
                                  statusText = `Unused budget: $${drift.budget}`;
                                  break;
                                default:
                                  colorScheme = {
                                    gradient: 'from-primary-50 to-primary-100',
                                    border: 'border-primary-400',
                                    text: 'text-primary-600',
                                    boldText: 'text-primary-700',
                                  };
                                  icon = (
                                    <ChevronRight size={16} className="ml-1 text-primary-600" />
                                  );
                                  statusText = `$${Math.abs(drift.drift)} difference`;
                              }

                              return (
                                <motion.div
                                  key={drift.category}
                                  className={`bg-gradient-to-br ${colorScheme.gradient} p-3 rounded-lg border ${colorScheme.border} flex-shrink-0`}
                                  style={{ width: '200px' }}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + idx * 0.05 }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className={`text-xs font-medium ${colorScheme.text}`}>
                                        {drift.category}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        <p className={`text-lg font-bold ${colorScheme.boldText}`}>
                                          {drift.status === 'unused'
                                            ? '0%'
                                            : `${drift.status === 'positive' ? '' : '-'}${drift.driftPercent}%`}
                                        </p>
                                        {icon}
                                      </div>
                                    </div>
                                    <div className={colorScheme.text}>{drift.icon}</div>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-600">{statusText}</p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right Shadow Gradient */}
                        <div
                          id="drift-right-shadow"
                          className="absolute inset-y-0 right-0 w-12 pointer-events-none opacity-100 z-1 transition-opacity duration-300"
                          style={{
                            backgroundImage:
                              'linear-gradient(to left, rgba(240,240,245,0.9), rgba(240,240,245,0))',
                            borderTopRightRadius: '8px',
                            borderBottomRightRadius: '8px',
                          }}
                        ></div>
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        id="drift-scroll-right-btn"
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-20 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all opacity-100 visible shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
                        onClick={() => {
                          const container = document.getElementById('drift-cards-container');
                          if (container) {
                            container.scrollBy({ left: 200, behavior: 'smooth' });
                          }
                        }}
                      >
                        <ChevronDown size={14} className="text-primary-600 -rotate-90 z-10" />
                      </button>
                    </div>
                  </div>

                  {/* Centered Budget Summary */}
                  <div className="absolute top-0 -right-20 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="w-[100px] h-[100px] rounded-full bg-white shadow-lg flex flex-col items-center justify-center border border-primary/10">
                      <CircleDollarSign className="text-primary size-5 mb-0.5" />

                      <div className="text-sm font-bold text-gray-900">$3,770</div>
                      <div className="text-[10px] text-gray-500">of $3,820</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions - Collapsible Section with Framer Motion Animation */}
        <motion.div
          className="bg-white rounded-xl overflow-hidden shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          {/* Collapsible Section Header with Toggle */}
          <motion.div
            className="bg-gradient-to-br from-primary to-violet-600 text-white px-6 py-4 cursor-pointer relative overflow-hidden"
            onClick={() => setChartsCollapsed(!chartsCollapsed)}
            whileHover={{
              backgroundPosition: ['0% 0%', '100% 100%'],
              transition: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' },
            }}
            whileTap={{ scale: 0.985 }}
          >
            <motion.div
              className="absolute bg-gradient-to-r from-primary-100/0 via-white/5 to-primary-300/0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                ease: 'linear',
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            <div className="flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                  variants={headerIconVariants}
                  animate={chartsCollapsed ? 'collapsed' : 'expanded'}
                  whileHover={{
                    boxShadow: '0 0 8px 2px rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <CreditCard size={18} />
                </motion.div>

                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Recent Expenses</h3>

                  <p className="text-xs text-white mt-0.5 opacity-90">Your latest expenses</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.div
                  className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1 text-xs backdrop-blur-sm overflow-hidden"
                  variants={labelVariants}
                  animate={chartsCollapsed ? 'collapsed' : 'expanded'}
                >
                  <span className="whitespace-nowrap">All Categories</span>
                </motion.div>

                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <AnimatePresence mode="wait" initial={false}>
                    {chartsCollapsed ? (
                      <motion.div
                        key="down"
                        initial={{ opacity: 0, y: -20, rotate: -90 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, y: 10, rotate: 90 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="up"
                        initial={{ opacity: 0, y: 20, rotate: 90 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, y: -10, rotate: -90 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <ChevronUp size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Animated Content Container */}
          <motion.div
            ref={contentRef}
            variants={contentVariants}
            initial="collapsed"
            animate={chartsCollapsed ? 'collapsed' : 'expanded'}
            className="overflow-hidden"
          >
            {/* Transactions Content - Expanded View */}
            <div className="p-5">
              <RecentTransactions limit={5} />
            </div>
          </motion.div>

          {/* Animated Summary - Collapsed View */}
          <motion.div
            variants={summaryVariants}
            initial="expanded"
            animate={chartsCollapsed ? 'collapsed' : 'expanded'}
            className="overflow-hidden border-t border-indigo-100"
          >
            <div className="w-full flex flex-col gap-4 p-5">
              <div className="flex flex-col">
                <div className="grid grid-cols-1 gap-4">
                  {/* Quick transaction summary cards */}
                  <div className="bg-gradient-to-br from-primary-5 to-primary-10 p-3 rounded-lg border border-primary-100">
                    <p className="text-xs font-medium text-primary-600">Today</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">3 Transactions</p>
                    <p className="text-xs text-primary-500 mt-1">Total: -$142.55</p>
                  </div>

                  <div className="bg-gradient-to-br from-primary-5 to-primary-10 p-3 rounded-lg border border-primary-100">
                    <p className="text-xs font-medium text-primary-600">This Week</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">12 Transactions</p>
                    <p className="text-xs text-primary-500 mt-1">Total: -$324.67</p>
                  </div>

                  <div className="bg-gradient-to-br from-primary-5 to-primary-10 p-3 rounded-lg border border-primary-100">
                    <p className="text-xs font-medium text-primary-600">Most Spent On</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">Housing</p>
                    <p className="text-xs text-primary-500 mt-1">$1,200.00 this month</p>
                  </div>
                </div>
              </div>

              {/* View More Button */}
              <Button>
                <span className="text-sm font-medium mr-2">
                  View All {currentMonthName} Transactions
                </span>
                <ChevronRight className="h-4 w-4 text-inherit group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
