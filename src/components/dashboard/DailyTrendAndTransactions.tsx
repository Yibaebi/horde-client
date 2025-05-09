import * as echarts from 'echarts';
import { BarChart3, Wallet, LineChart } from 'lucide-react';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { formatCurrencyWithSymbol } from '@/lib/utils';
import { getDailyTrendTooltip } from '@/lib/tooltips';
import { Colors } from '@/constants/colors';
import useWindowResize from '@/hooks/useWindowResize';
import ScrollableContainer from '@/components/ScrollableContainer';

import type { ICurrentMonthAnalyticsData } from '@/types/api';
import type { IBudgetProps } from '@/app/api/budgets';

interface DailyTrendAndTransactionsProps {
  budget?: IBudgetProps | null;
  analytics?: ICurrentMonthAnalyticsData | null;
  isLoading?: boolean;
}

const DailyTrendAndTransactions = ({
  analytics,
  budget,
  isLoading,
}: DailyTrendAndTransactionsProps) => {
  const dailyChartRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const dailyChartInstance = useRef<echarts.ECharts | null>(null);
  const [chartIsMounted, setChartIsMounted] = useState(false);

  // Default to $ if no currency symbol is available
  const currencySymbol = String(budget?.currencySym);

  useEffect(() => {
    if (dailyChartRef.current && analytics?.dailyStats && chartIsMounted) {
      // Dispose of any existing instance to prevent duplicates
      if (dailyChartInstance.current) {
        dailyChartInstance.current.dispose();
      }

      dailyChartInstance.current = echarts.init(dailyChartRef.current);

      // Extract actual data from the unique expense dates
      const uniqueDates = analytics.dailyStats.uniqueExpenseDates;
      const days = uniqueDates.map(date => {
        const d = new Date(date.date);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });

      const dates = uniqueDates.map(date => date.date);
      const descriptions = uniqueDates.map(date => date.description);
      const values = uniqueDates.map(date => date.amount);
      const averageAmount = analytics.dailyStats.dailyAverageTransaction;
      const averageLine = Array(days.length).fill(averageAmount);

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: Colors.WHITE_90,
          borderWidth: 0,
          textStyle: { color: Colors.PRIMARY },
          formatter: (params: echarts.DefaultLabelFormatterCallbackParams[]) =>
            getDailyTrendTooltip(params, dates, descriptions, days, currencySymbol),
        },
        grid: { left: 5, right: 10, top: 10, bottom: 5, containLabel: false },
        xAxis: {
          type: 'category',
          data: days,
          show: false,
          axisLabel: { fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif' },
        },
        yAxis: { type: 'value', show: false },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            formatValue: (value: number) => formatCurrencyWithSymbol(value, currencySymbol),
            itemStyle: { color: Colors.PRIMARY },
            lineStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: Colors.PRIMARY_LIGHT },
                { offset: 1, color: Colors.PRIMARY },
              ]),
              width: 3,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: Colors.PRIMARY_50 },
                { offset: 1, color: Colors.PRIMARY_10 },
              ]),
            },
          },
          {
            data: averageLine,
            type: 'line',
            symbol: 'none',
            lineStyle: { color: Colors.GRAY, width: 1, type: 'dashed' },
          },
        ],
      } as echarts.EChartsOption;

      // Set chart options
      dailyChartInstance.current.setOption(option);
    }

    return () => {
      dailyChartInstance.current?.dispose();
      dailyChartInstance.current = null;
    };
  }, [currencySymbol, analytics, chartIsMounted]);

  // Resize the chart when the window is resized
  useWindowResize(() => {
    if (dailyChartInstance.current) {
      dailyChartInstance.current.resize();
    }
  });

  // Prepare the data to display
  const dailyStats = analytics?.dailyStats;
  const uniqueExpenseDates = dailyStats?.uniqueExpenseDates;
  const budgetSources = budget?.budgetSources;
  const dailyAverage = dailyStats?.dailyAverageTransaction || 0;

  // Calculate total income from budget sources
  const totalIncome = budget?.budgetSources?.reduce((sum, source) => sum + source.amount, 0) || 0;

  // Show loading state if data is loading
  if (isLoading) {
    return <LoadingState />;
  }

  // Check if we have daily stats data
  const hasDailyStats = uniqueExpenseDates && uniqueExpenseDates.length > 0;
  const hasBudgetSources = budgetSources && budgetSources.length > 0;

  // If no data at all, show complete empty state
  if (!hasDailyStats && !hasBudgetSources) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Daily Average with Echarts */}
      {hasDailyStats ? (
        <motion.div
          className="bg-gradient-to-br from-white to-primary/20 p-4 rounded-lg border border-primary-200 h-full"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ boxShadow: `0 4px 12px ${Colors.SHADOW_BLUE}` }}
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                Daily Average
              </p>

              <div className="flex items-center mt-1">
                <p className="text-xl font-bold text-primary">
                  {formatCurrencyWithSymbol(dailyAverage, currencySymbol, '0,0')}
                </p>

                <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">
                  Per Day
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-primary bg-primary/10 p-1.5 rounded-full">
                <BarChart3 size={16} />
              </div>

              <span className="text-[10px] text-primary mt-1">30-day trend</span>
            </div>
          </div>

          {/* Echarts Container */}
          <div className="flex items-center justify-center bg-primary/10 border border-primary/20 w-full rounded-lg p-2 mt-4">
            <div
              ref={el => {
                dailyChartRef.current = el;
                setChartIsMounted(true);
              }}
              className="h-[200px] w-full mt-2"
            />
          </div>
        </motion.div>
      ) : (
        <DailyAverageEmptyState customClassName="h-full" />
      )}

      {/* Income Sources Card */}
      {hasBudgetSources ? (
        <motion.div
          className="bg-white rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Income Sources
                </span>

                <span className="text-2xl font-bold text-primary-900 mt-1">
                  {formatCurrencyWithSymbol(totalIncome, currencySymbol, '0,0')}{' '}
                  <span className="text-sm font-medium text-primary-600">total</span>
                </span>
              </div>

              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-300 to-primary-400 text-white shadow-lg">
                <Wallet size={22} />
              </div>
            </div>

            <ScrollableContainer containerClassName="pr-1 mb-4">
              <div className="grid grid-cols-1 gap-2 max-h-[160px]">
                {budget.budgetSources.map(source => (
                  <div
                    key={source._id}
                    className="flex items-center justify-between p-2 bg-primary-50/50 rounded-md border border-primary-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-primary-900">{source.name}</span>
                      <span className="text-2xs text-primary-600">
                        {source.recurring ? `${source.frequency}` : 'one-time'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary-900">
                      {formatCurrencyWithSymbol(source.amount, currencySymbol, '0,0')}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollableContainer>

            <div className="flex justify-start items-center text-xs text-primary-700 gap-1">
              <div className="h-2 w-2 rounded-full bg-primary-400"></div>
              <span>Income Summary</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <IncomeSourcesEmptyState customClassName="h-1/2" />
      )}
    </div>
  );
};

const DailyAverageEmptyState = ({ customClassName }: { customClassName?: string }) => {
  return (
    <motion.div
      className={`bg-gradient-to-br from-white to-primary/20 p-4 rounded-lg border border-primary-200 h-1/2 ${customClassName}`}
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ boxShadow: `0 4px 12px ${Colors.SHADOW_BLUE}` }}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Daily Average</p>
          <div className="flex items-center mt-1">
            <p className="text-xl font-bold text-primary">----</p>
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">
              Per Day
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-primary/50 bg-primary/10 p-1.5 rounded-full">
            <BarChart3 size={16} />
          </div>
          <span className="text-[10px] text-primary/50 mt-1">30-day trend</span>
        </div>
      </div>

      <div className="flex items-center justify-center w-full rounded-lg p-8 mt-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <LineChart className="w-8 h-8 text-primary/50" />
          </div>
          <p className="text-sm font-medium text-primary">No transaction data available</p>
          <p className="text-xs text-primary/80 mt-2 max-w-[200px]">
            Start adding transactions to see your daily spending trends and analytics
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const IncomeSourcesEmptyState = ({ customClassName }: { customClassName?: string }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)] h-1/2 ${customClassName}`}
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-primary uppercase tracking-wider">
              Income Sources
            </p>

            <p className="text-lg font-bold text-primary mt-1">
              {0} <span className="text-sm font-medium">total</span>
            </p>
          </div>

          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-300/50 to-primary-400/50 text-white/50 shadow-lg">
            <Wallet size={22} />
          </div>
        </div>

        <div className="min-h-64 flex items-center justify-center bg-primary-50/20 rounded-md  mb-3 h-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-primary/50" />
            </div>

            <p className="text-sm font-medium text-primary">No income sources added yet</p>

            <p className="text-xs text-primary/80 mt-2 max-w-[200px]">
              Add your income sources to track your earnings and manage your budget effectively
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading State Component
const LoadingState = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Daily Average Loading State */}
      <motion.div
        className="bg-gradient-to-br from-white to-primary/20 p-4 rounded-lg border border-primary-200 h-full"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ boxShadow: `0 4px 12px ${Colors.SHADOW_BLUE}` }}
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="h-4 w-24 bg-primary/20 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-primary/20 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="h-3 w-16 bg-primary/20 rounded mt-1 animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-primary/10 border border-primary/20 w-full rounded-lg p-8 mt-4">
          <div className="w-full h-[200px] bg-primary/10 rounded animate-pulse"></div>
        </div>
      </motion.div>

      {/* Income Sources Loading State */}
      <motion.div
        className="bg-white rounded-xl shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <div className="h-4 w-24 bg-primary/20 rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-primary/20 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-primary/10 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Daily Average Empty State */}
      <DailyAverageEmptyState />

      {/* Income Sources Empty State */}
      <IncomeSourcesEmptyState />
    </div>
  );
};

export default DailyTrendAndTransactions;
