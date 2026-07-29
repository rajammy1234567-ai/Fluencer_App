/**
 * Date Formatting Utilities for Admin Panel
 * 
 * Provides consistent date and time formatting across all admin screens.
 * Handles relative time, absolute dates, and various display formats.
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time', 'datetime'
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate('2024-01-15T10:30:00', 'short') // "15 Jan 2024"
 * formatDate('2024-01-15T10:30:00', 'long') // "15 January 2024"
 * formatDate('2024-01-15T10:30:00', 'time') // "10:30 AM"
 * formatDate('2024-01-15T10:30:00', 'datetime') // "15 Jan 2024, 10:30 AM"
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    short: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
    long: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    datetime: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  };

  const selectedOptions = options[format] || options.short;

  return dateObj.toLocaleString('en-IN', selectedOptions);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 * 
 * @example
 * formatRelativeTime('2024-01-26T10:00:00') // "2 hours ago" (if now is 12:00)
 * formatRelativeTime('2024-01-25T10:00:00') // "1 day ago"
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now - dateObj;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
};

/**
 * Format date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 * 
 * @example
 * formatDateRange('2024-01-15', '2024-01-20') // "15 Jan - 20 Jan 2024"
 * formatDateRange('2024-01-15', '2024-02-15') // "15 Jan - 15 Feb 2024"
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid Date Range';
  }

  const startFormatted = formatDate(start, 'short');
  const endFormatted = formatDate(end, 'short');

  // Same month and year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleString('en-IN', { month: 'short' });
    const year = start.getFullYear();
    return `${startDay} - ${endDay} ${month} ${year}`;
  }

  // Same year
  if (start.getFullYear() === end.getFullYear()) {
    const startPart = start.toLocaleString('en-IN', { day: '2-digit', month: 'short' });
    const endPart = end.toLocaleString('en-IN', { day: '2-digit', month: 'short' });
    const year = start.getFullYear();
    return `${startPart} - ${endPart} ${year}`;
  }

  // Different years
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Get time of day greeting
 * @returns {string} Greeting message
 * 
 * @example
 * getGreeting() // "Good morning" (if between 5 AM - 12 PM)
 */
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is within last N days
 * @param {string|Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if date is within range
 */
export const isWithinDays = (date, days) => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
};

/**
 * Format duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 * 
 * @example
 * formatDuration(90000) // "1m 30s"
 * formatDuration(3600000) // "1h 0m"
 */
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
};
