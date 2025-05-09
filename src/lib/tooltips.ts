import dayjs from 'dayjs';
import { formatCurrencyWithSymbol } from './utils';

export const getDailyTrendTooltip = (
  params: echarts.DefaultLabelFormatterCallbackParams[],
  dates: string[],
  descriptions: string[],
  days: string[],
  currencySymbol: string
) => {
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
};
