import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { AxiosError } from 'axios';

/**
 * Merge class names
 * @param inputs - The class values to merge
 * @returns The merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the name of a month from a number
 * @param month - The month number (1-12)
 * @returns The name of the month
 */
export function getMonthName(month?: number) {
  return month ? dayjs().month(month).format('MMMM') : dayjs().format('MMMM');
}

/**
 * Get the current month
 * @returns The current month
 */
export function getCurrentMonth() {
  return dayjs().month();
}

/**
 * Get the current year
 * @returns The current year
 */
export function getCurrentYear() {
  return dayjs().year();
}

/**
 * Format a number as currency
 * @param amount - The number to format
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, format = '0,0a') {
  return numeral(amount).format(format);
}

/**
 * Format a number as currency with a symbol
 * @param amount - The number to format
 * @param symbol - The currency symbol
 * @param format - The format to use
 * @returns The formatted currency string
 */
export function formatCurrencyWithSymbol(amount: number, symbol: string, format = '0,0.00a') {
  const isNegative = amount < 0;
  const absValue = Math.abs(amount);
  const formattedValue = numeral(absValue).format(format);
  const formattedValueWithSymbol = `${symbol}${formattedValue}`;

  return isNegative ? `-${formattedValueWithSymbol}` : formattedValueWithSymbol;
}

/**
 * Format a number to commas
 * @param inputString - The number to format
 * @param roundingFunction - The rounding function to use
 * @returns The formatted number
 */
export function formatNumberToCommas(
  inputString?: string,
  roundingFunction?: numeral.RoundingFunction
) {
  return numeral(inputString).format('0,0', roundingFunction);
}

/**
 * Format an error message
 * @param error - The error object
 * @returns The formatted error message
 */
export function formatErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return {
      status: error.response?.status,
      message: error.response?.data.message,
      apiError: error.response?.data,
    };
  }

  return {
    status: 500,
    message: 'An unknown error occurred',
    apiError: error,
  };
}

/**
 * Get the start and end date of a month
 * @param month - The month number (1-12)
 * @param year - The year
 * @returns The start and end date of the month
 */
export function getMonthAndYearDate(month: number, year: number) {
  return dayjs().date(1).month(month).year(year);
}

/**
 * Get the start and end date of a month
 * @param month - The month number (0-11)
 * @param year - The year
 * @returns The start and end date of the month
 */
export function getMonthAndYearDateRange(month: number, year: number) {
  return [
    dayjs().date(1).month(month).year(year).startOf('month').toDate(),
    dayjs().date(1).month(month).year(year).endOf('month').toDate(),
  ];
}
