/**
 * Currency Formatting Utilities for Admin Panel
 * 
 * Provides consistent currency formatting across all admin screens.
 * Uses Indian Rupee (INR) as default currency.
 */

/**
 * Format amount to Indian Rupee format
 * @param {number|string} amount - Amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1500) // "₹1,500.00"
 * formatCurrency(1500, false) // "₹1,500"
 * formatCurrency(150000) // "₹1,50,000.00"
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0.00';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '₹0.00';
  }

  // Indian numbering system (lakhs and crores)
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return `₹${formatted}`;
};

/**
 * Format amount to compact format (K, L, Cr)
 * @param {number} amount - Amount to format
 * @returns {string} Compact currency string
 * 
 * @example
 * formatCurrencyCompact(1500) // "₹1.5K"
 * formatCurrencyCompact(150000) // "₹1.5L"
 * formatCurrencyCompact(15000000) // "₹1.5Cr"
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '₹0';
  }

  // Crores (10 million)
  if (numAmount >= 10000000) {
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`;
  }

  // Lakhs (100 thousand)
  if (numAmount >= 100000) {
    return `₹${(numAmount / 100000).toFixed(1)}L`;
  }

  // Thousands
  if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }

  return `₹${numAmount.toFixed(0)}`;
};

/**
 * Parse formatted currency string to number
 * @param {string} currencyString - Formatted currency string
 * @returns {number} Numeric amount
 * 
 * @example
 * parseCurrency("₹1,500.00") // 1500
 * parseCurrency("1,500") // 1500
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbol, commas, and parse
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  const amount = parseFloat(cleanString);

  return isNaN(amount) ? 0 : amount;
};

/**
 * Format percentage value
 * @param {number} value - Percentage value
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage string
 * 
 * @example
 * formatPercentage(20) // "20.0%"
 * formatPercentage(15.5, 2) // "15.50%"
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0%';
  }

  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Validate if amount is within valid range
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum allowed amount
 * @param {number} max - Maximum allowed amount
 * @returns {object} Validation result {valid: boolean, error: string|null}
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  if (amount === null || amount === undefined || amount === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (numAmount < min) {
    return { valid: false, error: `Amount must be at least ${formatCurrency(min)}` };
  }

  if (numAmount > max) {
    return { valid: false, error: `Amount cannot exceed ${formatCurrency(max)}` };
  }

  return { valid: true, error: null };
};
