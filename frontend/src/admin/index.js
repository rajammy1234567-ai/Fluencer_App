/**
 * Admin Utilities - Centralized Export
 * 
 * Import everything you need from one place:
 * import { 
 *   AdminAuthGuard, 
 *   ConfirmModal, 
 *   hasPermission, 
 *   formatCurrency 
 * } from '../../../src/admin';
 */

// Guards
export { default as AdminAuthGuard } from './guards/AdminAuthGuard';

// Components
export { default as ConfirmModal } from './components/ConfirmModal';
export { default as LoadingState } from './components/LoadingState';
export { default as EmptyState } from './components/EmptyState';
export { default as ErrorState } from './components/ErrorState';

// Permission System
export {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAdminRole,
  getRolePermissions,
  getPermissionLabel,
  usePermission,
} from './utils/adminPermissions';

// Formatting Utilities
export {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrency,
  formatPercentage,
  validateAmount,
} from './utils/formatCurrency';

export {
  formatDate,
  formatRelativeTime,
  formatDateRange,
  getGreeting,
  isToday,
  isWithinDays,
  formatDuration,
} from './utils/formatDate';

// Action Logging
export {
  ACTION_TYPES,
  logAdminAction,
  logUserBlock,
  logUserUnblock,
  logWithdrawalApproval,
  logWithdrawalRejection,
  logDisputeResolution,
  logCommissionChange,
  logMaintenanceModeToggle,
  logNotificationBroadcast,
  getActionTypeLabel,
  getLocalLogs,
  clearLocalLogs,
} from './logs/adminActionLogger';
