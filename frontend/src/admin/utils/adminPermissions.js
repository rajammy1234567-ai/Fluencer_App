/**
 * Admin Permissions & Role Management System
 * 
 * Future-ready permission structure for role-based access control.
 * Even with single admin currently, this enables easy scaling.
 * 
 * SECURITY NOTE:
 * - Client-side permission checks are for UI/UX only
 * - Backend API must enforce all permissions
 * - Never expose sensitive data based solely on client checks
 */

/**
 * Admin Permission Constants
 * Define all possible admin actions that can be permission-controlled
 */
export const ADMIN_PERMISSIONS = {
  // User Management
  CAN_VIEW_USERS: 'CAN_VIEW_USERS',
  CAN_BLOCK_USERS: 'CAN_BLOCK_USERS',
  CAN_UNBLOCK_USERS: 'CAN_UNBLOCK_USERS',
  CAN_DELETE_USERS: 'CAN_DELETE_USERS',
  CAN_EDIT_USER_DETAILS: 'CAN_EDIT_USER_DETAILS',

  // Payment & Wallet Management
  CAN_VIEW_PAYMENTS: 'CAN_VIEW_PAYMENTS',
  CAN_APPROVE_WITHDRAWALS: 'CAN_APPROVE_WITHDRAWALS',
  CAN_REJECT_WITHDRAWALS: 'CAN_REJECT_WITHDRAWALS',
  CAN_PROCESS_REFUNDS: 'CAN_PROCESS_REFUNDS',
  CAN_VIEW_WALLET_TRANSACTIONS: 'CAN_VIEW_WALLET_TRANSACTIONS',

  // Campaign Management
  CAN_VIEW_CAMPAIGNS: 'CAN_VIEW_CAMPAIGNS',
  CAN_CANCEL_CAMPAIGNS: 'CAN_CANCEL_CAMPAIGNS',
  CAN_MODIFY_CAMPAIGNS: 'CAN_MODIFY_CAMPAIGNS',

  // Dispute Management
  CAN_VIEW_DISPUTES: 'CAN_VIEW_DISPUTES',
  CAN_RESOLVE_DISPUTES: 'CAN_RESOLVE_DISPUTES',
  CAN_ESCALATE_DISPUTES: 'CAN_ESCALATE_DISPUTES',
  CAN_VIEW_CHAT_MESSAGES: 'CAN_VIEW_CHAT_MESSAGES',

  // Platform Settings
  CAN_CHANGE_COMMISSION: 'CAN_CHANGE_COMMISSION',
  CAN_CHANGE_WITHDRAWAL_LIMITS: 'CAN_CHANGE_WITHDRAWAL_LIMITS',
  CAN_ENABLE_MAINTENANCE_MODE: 'CAN_ENABLE_MAINTENANCE_MODE',
  CAN_DISABLE_FEATURES: 'CAN_DISABLE_FEATURES',

  // Notifications
  CAN_SEND_NOTIFICATIONS: 'CAN_SEND_NOTIFICATIONS',
  CAN_SEND_BROADCAST: 'CAN_SEND_BROADCAST',

  // Reports & Analytics
  CAN_VIEW_REPORTS: 'CAN_VIEW_REPORTS',
  CAN_EXPORT_DATA: 'CAN_EXPORT_DATA',

  // Admin Management (for multi-admin setup)
  CAN_CREATE_ADMINS: 'CAN_CREATE_ADMINS',
  CAN_DELETE_ADMINS: 'CAN_DELETE_ADMINS',
  CAN_CHANGE_ADMIN_ROLES: 'CAN_CHANGE_ADMIN_ROLES',
};

/**
 * Admin Role Definitions
 * Each role has a set of permissions
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to all platform features',
    permissions: Object.values(ADMIN_PERMISSIONS), // All permissions
  },

  ADMIN: {
    name: 'Admin',
    description: 'Standard admin with most permissions',
    permissions: [
      // User Management
      ADMIN_PERMISSIONS.CAN_VIEW_USERS,
      ADMIN_PERMISSIONS.CAN_BLOCK_USERS,
      ADMIN_PERMISSIONS.CAN_UNBLOCK_USERS,

      // Payment & Wallet
      ADMIN_PERMISSIONS.CAN_VIEW_PAYMENTS,
      ADMIN_PERMISSIONS.CAN_APPROVE_WITHDRAWALS,
      ADMIN_PERMISSIONS.CAN_REJECT_WITHDRAWALS,
      ADMIN_PERMISSIONS.CAN_VIEW_WALLET_TRANSACTIONS,

      // Campaigns
      ADMIN_PERMISSIONS.CAN_VIEW_CAMPAIGNS,
      ADMIN_PERMISSIONS.CAN_CANCEL_CAMPAIGNS,

      // Disputes
      ADMIN_PERMISSIONS.CAN_VIEW_DISPUTES,
      ADMIN_PERMISSIONS.CAN_RESOLVE_DISPUTES,
      ADMIN_PERMISSIONS.CAN_VIEW_CHAT_MESSAGES,

      // Notifications
      ADMIN_PERMISSIONS.CAN_SEND_NOTIFICATIONS,

      // Reports
      ADMIN_PERMISSIONS.CAN_VIEW_REPORTS,
    ],
  },

  SUPPORT_ADMIN: {
    name: 'Support Admin',
    description: 'Limited to support tasks (disputes, user queries)',
    permissions: [
      ADMIN_PERMISSIONS.CAN_VIEW_USERS,
      ADMIN_PERMISSIONS.CAN_VIEW_CAMPAIGNS,
      ADMIN_PERMISSIONS.CAN_VIEW_DISPUTES,
      ADMIN_PERMISSIONS.CAN_RESOLVE_DISPUTES,
      ADMIN_PERMISSIONS.CAN_VIEW_CHAT_MESSAGES,
      ADMIN_PERMISSIONS.CAN_SEND_NOTIFICATIONS,
      ADMIN_PERMISSIONS.CAN_VIEW_REPORTS,
    ],
  },

  FINANCE_ADMIN: {
    name: 'Finance Admin',
    description: 'Focused on payments and financial operations',
    permissions: [
      ADMIN_PERMISSIONS.CAN_VIEW_PAYMENTS,
      ADMIN_PERMISSIONS.CAN_APPROVE_WITHDRAWALS,
      ADMIN_PERMISSIONS.CAN_REJECT_WITHDRAWALS,
      ADMIN_PERMISSIONS.CAN_PROCESS_REFUNDS,
      ADMIN_PERMISSIONS.CAN_VIEW_WALLET_TRANSACTIONS,
      ADMIN_PERMISSIONS.CAN_VIEW_REPORTS,
      ADMIN_PERMISSIONS.CAN_EXPORT_DATA,
    ],
  },
};

/**
 * Get admin role from storage or default to SUPER_ADMIN
 * @returns {Promise<string>} Admin role key
 */
export const getAdminRole = async () => {
  try {
    // TODO: Fetch from AsyncStorage or backend
    // const role = await AsyncStorage.getItem('adminRole');
    // return role || 'SUPER_ADMIN';

    // For now, default to SUPER_ADMIN (single admin setup)
    return 'SUPER_ADMIN';
  } catch (error) {
    console.error('Error getting admin role:', error);
    return 'SUPER_ADMIN';
  }
};

/**
 * Get permissions for a specific role
 * @param {string} roleKey - Role key (e.g., 'SUPER_ADMIN')
 * @returns {Array<string>} Array of permission strings
 */
export const getRolePermissions = (roleKey) => {
  const role = ADMIN_ROLES[roleKey];
  return role ? role.permissions : [];
};

/**
 * Check if admin has a specific permission
 * @param {string} permission - Permission to check
 * @param {string} roleKey - Admin role (optional, fetches from storage if not provided)
 * @returns {Promise<boolean>} True if admin has permission
 * 
 * @example
 * const canBlock = await hasPermission(ADMIN_PERMISSIONS.CAN_BLOCK_USERS);
 * if (canBlock) {
 *   // Show block button
 * }
 */
export const hasPermission = async (permission, roleKey = null) => {
  try {
    const role = roleKey || (await getAdminRole());
    const permissions = getRolePermissions(role);
    return permissions.includes(permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * Check if admin has any of the specified permissions
 * @param {Array<string>} permissionList - List of permissions to check
 * @returns {Promise<boolean>} True if admin has at least one permission
 */
export const hasAnyPermission = async (permissionList) => {
  try {
    const role = await getAdminRole();
    const permissions = getRolePermissions(role);
    return permissionList.some((perm) => permissions.includes(perm));
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * Check if admin has all specified permissions
 * @param {Array<string>} permissionList - List of permissions to check
 * @returns {Promise<boolean>} True if admin has all permissions
 */
export const hasAllPermissions = async (permissionList) => {
  try {
    const role = await getAdminRole();
    const permissions = getRolePermissions(role);
    return permissionList.every((perm) => permissions.includes(perm));
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * React Hook: Check permission in component
 * @param {string} permission - Permission to check
 * @returns {boolean} True if admin has permission
 * 
 * @example
 * const canBlock = usePermission(ADMIN_PERMISSIONS.CAN_BLOCK_USERS);
 * 
 * return (
 *   <>
 *     {canBlock && <Button title="Block User" />}
 *   </>
 * );
 */
export const usePermission = (permission) => {
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    checkPermission();
  }, [permission]);

  const checkPermission = async () => {
    const access = await hasPermission(permission);
    setHasAccess(access);
  };

  return hasAccess;
};

/**
 * Get permission label for display
 * @param {string} permission - Permission constant
 * @returns {string} Human-readable label
 */
export const getPermissionLabel = (permission) => {
  const labels = {
    [ADMIN_PERMISSIONS.CAN_VIEW_USERS]: 'View Users',
    [ADMIN_PERMISSIONS.CAN_BLOCK_USERS]: 'Block Users',
    [ADMIN_PERMISSIONS.CAN_UNBLOCK_USERS]: 'Unblock Users',
    [ADMIN_PERMISSIONS.CAN_DELETE_USERS]: 'Delete Users',
    [ADMIN_PERMISSIONS.CAN_EDIT_USER_DETAILS]: 'Edit User Details',
    [ADMIN_PERMISSIONS.CAN_VIEW_PAYMENTS]: 'View Payments',
    [ADMIN_PERMISSIONS.CAN_APPROVE_WITHDRAWALS]: 'Approve Withdrawals',
    [ADMIN_PERMISSIONS.CAN_REJECT_WITHDRAWALS]: 'Reject Withdrawals',
    [ADMIN_PERMISSIONS.CAN_PROCESS_REFUNDS]: 'Process Refunds',
    [ADMIN_PERMISSIONS.CAN_VIEW_WALLET_TRANSACTIONS]: 'View Wallet Transactions',
    [ADMIN_PERMISSIONS.CAN_VIEW_CAMPAIGNS]: 'View Campaigns',
    [ADMIN_PERMISSIONS.CAN_CANCEL_CAMPAIGNS]: 'Cancel Campaigns',
    [ADMIN_PERMISSIONS.CAN_MODIFY_CAMPAIGNS]: 'Modify Campaigns',
    [ADMIN_PERMISSIONS.CAN_VIEW_DISPUTES]: 'View Disputes',
    [ADMIN_PERMISSIONS.CAN_RESOLVE_DISPUTES]: 'Resolve Disputes',
    [ADMIN_PERMISSIONS.CAN_ESCALATE_DISPUTES]: 'Escalate Disputes',
    [ADMIN_PERMISSIONS.CAN_VIEW_CHAT_MESSAGES]: 'View Chat Messages',
    [ADMIN_PERMISSIONS.CAN_CHANGE_COMMISSION]: 'Change Commission',
    [ADMIN_PERMISSIONS.CAN_CHANGE_WITHDRAWAL_LIMITS]: 'Change Withdrawal Limits',
    [ADMIN_PERMISSIONS.CAN_ENABLE_MAINTENANCE_MODE]: 'Enable Maintenance Mode',
    [ADMIN_PERMISSIONS.CAN_DISABLE_FEATURES]: 'Disable Features',
    [ADMIN_PERMISSIONS.CAN_SEND_NOTIFICATIONS]: 'Send Notifications',
    [ADMIN_PERMISSIONS.CAN_SEND_BROADCAST]: 'Send Broadcast Messages',
    [ADMIN_PERMISSIONS.CAN_VIEW_REPORTS]: 'View Reports',
    [ADMIN_PERMISSIONS.CAN_EXPORT_DATA]: 'Export Data',
    [ADMIN_PERMISSIONS.CAN_CREATE_ADMINS]: 'Create Admins',
    [ADMIN_PERMISSIONS.CAN_DELETE_ADMINS]: 'Delete Admins',
    [ADMIN_PERMISSIONS.CAN_CHANGE_ADMIN_ROLES]: 'Change Admin Roles',
  };

  return labels[permission] || permission;
};

/**
 * IMPLEMENTATION NOTES:
 * 
 * 1. Current Setup (Single Admin):
 *    - All admins have SUPER_ADMIN role
 *    - All permission checks return true
 *    - Structure is ready for future role expansion
 * 
 * 2. Future Multi-Admin Setup:
 *    - Store admin role in AsyncStorage during login
 *    - Backend returns role in authentication response
 *    - UI conditionally renders based on permissions
 *    - Add admin management screen for role assignment
 * 
 * 3. Backend Integration:
 *    - All permissions must be verified server-side
 *    - Client checks are UI-only (show/hide buttons)
 *    - API endpoints should validate permissions
 *    - Log all permission-based actions for audit
 * 
 * 4. Best Practices:
 *    - Use hasPermission() before showing sensitive UI
 *    - Always verify on backend before executing actions
 *    - Log permission denials for security monitoring
 *    - Regularly audit role permissions
 */
