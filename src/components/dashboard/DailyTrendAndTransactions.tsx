import * as echarts from 'echarts';
import { BarChart3, Wallet, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

import { formatCurrencyWithSymbol } from '@/lib/utils';
import useWindowResize from '@/hooks/useWindowResize';
import type { ICurrentMonthAnalyticsData } from '@/types/api';
import type { IBudgetProps } from '@/app/api/budgets';

// Remove problematic import - ECharts 5 includes calendar by default
// import 'echarts/lib/component/calendar';

interface DailyTrendAndTransactionsProps {
  budget?: IBudgetProps | null;
  analytics?: ICurrentMonthAnalyticsData | null;
  isLoading?: boolean;
}

const DailyTrendAndTransactions = ({ analytics, budget }: DailyTrendAndTransactionsProps) => {
  const dailyChartRef = useRef<HTMLDivElement>(null);
  const dailyChartInstance = useRef<echarts.ECharts | null>(null);

  // Scroll container ref and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollUp: false, canScrollDown: false });

  // Default to $ if no currency symbol is available
  const currencySymbol = String(budget?.currencySym);

  // Handle scroll events to update button visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

      setScrollState({
        canScrollUp: scrollTop > 0,
        canScrollDown: scrollTop < scrollHeight - clientHeight - 5,
      });
    }
  };

  // Scroll handlers
  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: -100,
        behavior: 'smooth',
      });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: 100,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (dailyChartRef.current && analytics?.dailyStats) {
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 0,
          textStyle: { color: '#6057ff' },
          formatter: function (params: echarts.DefaultLabelFormatterCallbackParams[]) {
            const valueParam = params[0];
            const avgParam = params[1];
            const index = valueParam.dataIndex as number;
            const fullDate = dayjs(dates[index]).format('MMM D, YYYY');
            const description = descriptions[index];

            return `
                <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 150px;">
                  <div style="font-weight: 600; font-size: 14px; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                    ${days[index]} (${fullDate})
                    <br/>
                    <span style="font-weight: 600; color: #6057ff; font-size: 12px;">${description}</span>
                  </div>
                  
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="color: #64748b; font-size: 12px;">Amount:</span> 
                      <span style="font-weight: 600; color: #6057ff;">${formatCurrencyWithSymbol(valueParam.value as number, currencySymbol)}</span>
                    </div>
                    
                    ${
                      avgParam
                        ? `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #64748b; font-size: 12px;">Daily Average:</span>
                      <span style="font-weight: 600; color: #6057ff;">${formatCurrencyWithSymbol(avgParam.value as number, currencySymbol)}</span>
                    </div>`
                        : ''
                    }
                  </div>
                </div>
              `;
          },
        },
        grid: {
          left: 5,
          right: 10,
          top: 10,
          bottom: 5,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: days,
          show: false,
          axisLabel: {
            fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
          },
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            formatValue: (value: number) => formatCurrencyWithSymbol(value, currencySymbol),
            itemStyle: { color: '#6057ff' },
            lineStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#8075ff' },
                { offset: 1, color: '#6057ff' },
              ]),
              width: 3,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(128, 117, 255, 0.5)' },
                { offset: 1, color: 'rgba(96, 87, 255, 0.1)' },
              ]),
            },
          },
          {
            data: averageLine,
            type: 'line',
            symbol: 'none',
            lineStyle: {
              color: '#9CA3AF',
              width: 1,
              type: 'dashed',
            },
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
  }, [currencySymbol, analytics]);

  // Check scroll state on mount and when budget sources change
  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
    }
  }, [budget?.budgetSources]);

  // Resize the chart when the window is resized
  useWindowResize(() => {
    if (dailyChartInstance.current) {
      dailyChartInstance.current.resize();
    }
  });

  // Prepare the data to display
  const dailyAverage = analytics?.dailyStats?.dailyAverageTransaction || 0;

  // Calculate total income from budget sources
  const totalIncome = budget?.budgetSources?.reduce((sum, source) => sum + source.amount, 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Daily Average with Echarts */}
      <motion.div
        className="h-full bg-gradient-to-br from-white to-primary/20 p-4 rounded-lg border border-primary-200 h-full"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}
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
          <div ref={dailyChartRef} className="h-[200px] w-full mt-2" />
        </div>
      </motion.div>

      {/* Income Sources Card */}
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

          {budget?.budgetSources && budget.budgetSources.length > 0 ? (
            <div className="mb-3 relative">
              {/* Scroll up indicator */}
              {scrollState.canScrollUp && (
                <button
                  onClick={scrollUp}
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
                  aria-label="Scroll up"
                >
                  <ChevronUp size={14} className="text-primary-600 z-10" />
                </button>
              )}

              {/* Top shadow when scrollable */}
              {scrollState.canScrollUp && (
                <div
                  className="absolute -top-1 left-0 right-0 h-12 pointer-events-none z-1 transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.5) 65%, rgba(255, 255, 255, 0) 100%)',
                    backdropFilter: 'blur(1px)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                />
              )}

              {/* Scrollable container for income sources */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative"
              >
                <div className="grid grid-cols-1 gap-2">
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
              </div>

              {/* Bottom shadow when scrollable */}
              {scrollState.canScrollDown && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10 transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.5) 65%, rgba(255, 255, 255, 0) 100%)',
                    backdropFilter: 'blur(1px)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                  }}
                />
              )}

              {/* Scroll down indicator */}
              {scrollState.canScrollDown && (
                <button
                  onClick={scrollDown}
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center border border-primary-100 hover:bg-primary-50 transition-all shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]"
                  aria-label="Scroll down"
                >
                  <ChevronDown size={14} className="text-primary-600 z-10" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 bg-primary-50/50 rounded-md border border-primary-100 mb-3">
              <span className="text-xs text-primary-600">No income sources available</span>
            </div>
          )}

          <div className="flex justify-start items-center text-xs text-primary-700 gap-1">
            <div className="h-2 w-2 rounded-full bg-primary-400"></div>
            <span>Income Summary</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyTrendAndTransactions;
