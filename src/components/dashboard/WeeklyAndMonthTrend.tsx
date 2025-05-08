import * as echarts from 'echarts';
import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, LineChart, PieChart, BarChart, AlertCircle } from 'lucide-react';

import { formatCurrencyWithSymbol } from '@/lib/utils';
import useWindowResize from '@/hooks/useWindowResize';
import type { ICurrentMonthAnalyticsData } from '@/types/api';
import type { IBudgetProps } from '@/app/api/budgets';
import TransactionInfoCard, { TransactionInfoCardSkeleton } from './TransactionInfoCard';

// Define types for tooltip formatter
interface TooltipDataItem {
  name?: string;
  value?: number;
  data?: {
    actualValue?: number;
    contribution?: number;
  };
}

interface WeeklyAndMonthTrendProps {
  budget?: IBudgetProps | null;
  analytics?: ICurrentMonthAnalyticsData | null;
  isLoading: boolean;
}

const WeeklyAndMonthTrend = ({ analytics, isLoading, budget }: WeeklyAndMonthTrendProps) => {
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate total monthly spent for contribution percentage and summary
  const weeklySpent = analytics?.weeklyStats?.weeks?.map(week => week.totalSpent) || [];
  const hasWeeklySpent = weeklySpent.length > 0;
  const totalMonthlySpent = weeklySpent.reduce((sum, value) => sum + value, 0);
  const monthlyTrend = analytics?.monthlyTrend || 0;
  const totalTopCategorySpent = analytics?.topCategory?.totalSpent || 0;

  const topCategoryPercentage =
    totalTopCategorySpent && totalMonthlySpent
      ? ((totalTopCategorySpent / totalMonthlySpent) * 100).toFixed(1)
      : 0;

  const trendIsPositive = monthlyTrend > 0;
  const noMonthlyTrend = monthlyTrend === 0;
  const currencySymbol = budget?.currencySym;

  // Calculate the max spending week for the summary
  const maxSpendingWeek = hasWeeklySpent ? weeklySpent.indexOf(Math.max(...weeklySpent)) + 1 : 0;
  const maxSpendingAmount = hasWeeklySpent ? Math.max(...weeklySpent).toLocaleString() : '0';

  const maxContribution = hasWeeklySpent
    ? Math.round((Math.max(...weeklySpent) / totalMonthlySpent || 0) * 100)
    : 0;

  // Chart data
  const weeklyStats = analytics?.weeklyStats?.weeks;
  const xLabels = useMemo(() => weeklyStats?.map(week => `Week ${week.week}`) || [], [weeklyStats]);

  const chartData = useMemo(() => {
    return (
      weeklyStats?.map(week => ({
        value: week.totalSpent,
        actualValue: week.totalSpent,
        contribution: ((week.totalSpent / totalMonthlySpent) * 100).toFixed(1),
      })) || []
    );
  }, [weeklyStats, totalMonthlySpent]);

  // Initialize main chart with better error handling
  useEffect(() => {
    if (chartRef.current && analytics) {
      chartInstance.current = echarts.init(chartRef.current);

      // Chart options
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderWidth: 0,
          borderRadius: 8,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
          textStyle: { color: '#334155' },
          padding: [12, 16],
          extraCssText: 'backdrop-filter: blur(6px);',
          formatter: function (params: TooltipDataItem | TooltipDataItem[]) {
            // Handle array of params
            const param = Array.isArray(params) ? params[0] : params;

            // Get data with null checks
            const name = param.name || '';
            const data = param.data || {};
            const actualValue = data.actualValue || 0;

            // Calculate contribution percentage
            const contribution = ((actualValue / totalMonthlySpent) * 100 || 0).toFixed(1);

            // Colors
            const primaryColor = '#6057ff';

            return `
                <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 150px;">
                  <div style="font-weight: 600; font-size: 14px; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                    ${name}
                  </div>
                  
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="color: #64748b; font-size: 12px;">Total Spent:</span> 
                      <span style="font-weight: 600; color: ${primaryColor};">${currencySymbol}${actualValue.toLocaleString()}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-size: 12px;">Contribution:</span>
                      <span style="font-weight: 600; color: ${primaryColor};">${contribution}%</span>
                    </div>
                  </div>
                </div>
              `;
          },
          axisPointer: {
            type: 'shadow',
            shadowStyle: { color: 'rgba(0, 0, 0, 0.05)' },
          },
        },
        grid: {
          left: '8%',
          right: '4%',
          bottom: '15%',
          top: '12%',
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#94A3B8',
            fontSize: 11,
            margin: 12,
            fontFamily: 'Avenir, Helvetica, Arial, sans-serif',
          },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#EEF2FF', type: 'dashed' } },
          axisLabel: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            name: 'Weekly Spending',
            data: chartData,
            type: 'bar',
            barWidth: '45%',
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#8075ff' },
                { offset: 1, color: '#6057ff' },
              ]),
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#a59bff' },
                  { offset: 1, color: '#7a71ff' },
                ]),
              },
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(128, 117, 255, 0.2)',
              borderRadius: [6, 6, 0, 0],
            },
          },
        ],
      };

      // Set chart options
      chartInstance.current?.setOption(option);
    }

    // Cleanup
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [totalMonthlySpent, chartData, xLabels, analytics, currencySymbol, isLoading]);

  // Handle window resize to make chart responsive
  useWindowResize(() => chartInstance.current?.resize());

  if (isLoading) {
    return <WeeklyAndMonthTrendSkeleton />;
  }

  if (!analytics) {
    return <WeeklyAndMonthTrendEmpty />;
  }

  return (
    <div className="p-5 rounded-lg relative shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]">
      <div className="mb-5 flex justify-center items-center space-x-2">
        <span className="text-xs text-slate-500 font-medium">Weekly Spending</span>

        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-inner"></div>
        </div>
      </div>

      {/* Echarts Container */}
      <div
        ref={chartRef}
        className="h-[200px] w-full mx-auto"
        style={{ marginBottom: '-10px', marginLeft: '-10px' }}
      />

      {/* Chart summary info */}
      <div className="mt-4 p-3 rounded-lg text-xs text-slate-600 border border-primary-200">
        <div className="flex flex-col items-start">
          <span className="font-bold mb-1">Spending Insights</span>

          <span className="">
            Highest spending in{' '}
            <span className="text-primary-200 font-bold">
              Week {maxSpendingWeek} ({currencySymbol}
              {maxSpendingAmount})
            </span>
            , accounting for <span className="text-primary-200 font-bold">{maxContribution}%</span>{' '}
            of monthly total. Overall monthly spending:{' '}
            <span className="text-primary-200 font-bold">
              {currencySymbol}
              {totalMonthlySpent.toLocaleString()}
            </span>
            .
          </span>
        </div>
      </div>

      <div className="h-[1px] my-4 bg-primary-20"></div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.2,
            staggerChildren: 0.05,
          },
        }}
      >
        {/* Monthly Trend */}
        <motion.div
          className={`bg-gradient-to-br ${
            noMonthlyTrend
              ? 'from-gray-50 to-gray-100 border-gray-400'
              : trendIsPositive
                ? 'from-red-50 to-red-100 border-red-400'
                : 'from-green-50 to-green-100 border-green-400'
          } p-3 rounded-lg border`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className={`flex justify-between items-start ${
              noMonthlyTrend ? 'text-gray-600' : trendIsPositive ? 'text-red-600' : 'text-green-600'
            }`}
          >
            <div>
              <p className="text-xs font-medium">You spent</p>

              <div className="flex items-center mt-1">
                <p className="text-xl font-bold">{monthlyTrend?.toFixed(1)}%</p>

                <ArrowUpRight size={16} className="ml-1" />
              </div>
            </div>

            <LineChart size={18} />
          </div>

          <p
            className={`mt-1 text-xs ${
              noMonthlyTrend ? 'text-gray-500' : trendIsPositive ? 'text-red-600' : 'text-green-600'
            }`}
          >
            vs. previous month
          </p>
        </motion.div>

        {/* Top Category */}
        <motion.div
          className="bg-primary-10 p-3 rounded-lg border border-primary-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-primary-600">Top Category</p>

              <p className="text-xl font-bold text-primary-900 mt-1">
                {analytics?.topCategory?.categoryName || 'N/A'}
              </p>
            </div>

            <div className="text-primary-600">
              <PieChart size={18} />
            </div>
          </div>

          <p className="mt-1 text-xs text-primary-600">
            {formatCurrencyWithSymbol(totalTopCategorySpent, String(currencySymbol))} (
            {topCategoryPercentage}% of total)
          </p>
        </motion.div>
      </motion.div>

      <div className="h-[1px] my-4 bg-primary-20"></div>

      <TransactionInfoCard analytics={analytics} budget={budget} isLoading={isLoading} />
    </div>
  );
};

// Empty state component when no data is available
const WeeklyAndMonthTrendEmpty = () => {
  return (
    <div className="p-5 rounded-lg bg-transparent relative shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]">
      <div className="mb-5 flex justify-center items-center space-x-2">
        <span className="text-xs text-slate-500 font-medium">Weekly Spending</span>

        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-gray-300 shadow-inner"></div>
        </div>
      </div>

      {/* Empty state chart container */}
      <div className="h-[200px] w-full mx-auto flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center text-center px-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <BarChart className="text-gray-400 h-8 w-8" />
          </div>

          <h3 className="text-base font-semibold text-gray-700 mb-2">No Weekly Data Available</h3>

          <p className="text-xs text-gray-500 max-w-xs mb-0">
            Start making transactions to see your weekly spending patterns.
          </p>
        </div>
      </div>

      {/* Chart summary info placeholder */}
      <div className="mt-4 p-3 rounded-lg text-xs text-slate-600 border border-gray-200 bg-gray-100">
        <div className="flex flex-col items-start">
          <span className="font-medium mb-2">Spending Insights</span>

          <div className="flex justify-center items-start text-xs">
            <AlertCircle className="h-4 min-w-[16px] stroke-gray-500 mr-2 mt-0.5" />
            <span>Your weekly spending trends will appear here as you record transactions.</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] my-4 bg-gray-200"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Trend Placeholder */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Monthly Trend</p>
              <p className="text-xs font-medium text-gray-400 mt-1">No Data</p>
            </div>
            <div className="text-gray-300">
              <LineChart size={18} />
            </div>
          </div>
        </div>

        {/* Top Category Placeholder */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Top Category</p>
              <p className="text-xs font-medium text-gray-400 mt-1">No Data</p>
            </div>
            <div className="text-gray-300">
              <PieChart size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton component for loading state
const WeeklyAndMonthTrendSkeleton = () => {
  return (
    <div className="p-5 rounded-lg relative shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] bg-white">
      <div className="mb-5 flex justify-center items-center space-x-2">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Echarts Container Skeleton */}
      <div className="h-[200px] w-full mx-auto bg-gray-100 rounded-lg animate-pulse" />

      {/* Chart summary info Skeleton */}
      <div className="mt-4 p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col items-start">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>

      <div className="h-[1px] my-4 bg-gray-200"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Trend Skeleton */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32 mt-3 animate-pulse"></div>
        </div>

        {/* Top Category Skeleton */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32 mt-3 animate-pulse"></div>
        </div>
      </div>

      <TransactionInfoCardSkeleton />
    </div>
  );
};

export default WeeklyAndMonthTrend;
