# 🚀 Admin Panel - Quick Reference Card

## Import Paths

```javascript
// Guards
import AdminAuthGuard from '../../../src/admin/guards/AdminAuthGuard';

// Permissions
import { ADMIN_PERMISSIONS, hasPermission } from '../../../src/admin/utils/adminPermissions';

// Formatting
import { formatCurrency } from '../../../src/admin/utils/formatCurrency';
import { formatDate } from '../../../src/admin/utils/formatDate';

// Components
import ConfirmModal from '../../../src/admin/components/ConfirmModal';
import LoadingState from '../../../src/admin/components/LoadingState';
import EmptyState from '../../../src/admin/components/EmptyState';
import ErrorState from '../../../src/admin/components/ErrorState';

// Logging
import { logUserBlock, logWithdrawalApproval } from '../../../src/admin/logs/adminActionLogger';
```

---

## Common Patterns

### 1. Protected Screen Template

```jsx
import React, { useState, useEffect } from 'react';
import LoadingState from '../../../src/admin/components/LoadingState';
import ErrorState from '../../../src/admin/components/ErrorState';
import EmptyState from '../../../src/admin/components/EmptyState';
import ConfirmModal from '../../../src/admin/components/ConfirmModal';
import { ADMIN_PERMISSIONS, hasPermission } from '../../../src/admin/utils/adminPermissions';
import { formatCurrency } from '../../../src/admin/utils/formatCurrency';
import { logUserBlock } from '../../../src/admin/logs/adminActionLogger';

const MyScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadData();
  }, []);

  const checkPermissions = async () => {
    const perm = await hasPermission(ADMIN_PERMISSIONS.CAN_BLOCK_USERS);
    setCanEdit(perm);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    setConfirmVisible(true);
  };

  const confirmAction = async () => {
    setProcessing(true);
    try {
      await performAction();
      await logUserBlock(userId, 'influencer', 'Reason here');
      await loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setProcessing(false);
      setConfirmVisible(false);
    }
  };

  // States
  if (loading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState onRetry={loadData} />;
  if (data.length === 0) return <EmptyState message="No data" />;

  return (
    <View>
      {/* Your UI */}
      {canEdit && <Button onPress={handleAction} />}

      <ConfirmModal
        visible={confirmVisible}
        title="Confirm"
        message="Are you sure?"
        onConfirm={confirmAction}
        onCancel={() => setConfirmVisible(false)}
        loading={processing}
      />
    </View>
  );
};
```

---

## 2. Permission Check

```jsx
const [canApprove, setCanApprove] = useState(false);

useEffect(() => {
  const check = async () => {
    const perm = await hasPermission(ADMIN_PERMISSIONS.CAN_APPROVE_WITHDRAWALS);
    setCanApprove(perm);
  };
  check();
}, []);

{canApprove && <Button title="Approve" />}
```

---

## 3. Action Logging

```jsx
// After any critical action:
await logUserBlock(userId, 'influencer', 'Spam detected');
await logWithdrawalApproval(withdrawalId, 5000, userId);
await logCommissionChange(20, 18, 'Promotional period');
```

---

## 4. Format Display

```jsx
<Text>{formatCurrency(amount)}</Text>
<Text>{formatDate(date, 'datetime')}</Text>
```

---

## 5. Confirmation Modal

```jsx
const [confirm, setConfirm] = useState({ visible: false });

const showConfirm = () => {
  setConfirm({
    visible: true,
    title: 'Block User',
    message: 'Are you sure?',
    onConfirm: handleBlock,
  });
};

<ConfirmModal
  {...confirm}
  onCancel={() => setConfirm({ visible: false })}
/>
```

---

## Permission Constants

```javascript
// User Management
ADMIN_PERMISSIONS.CAN_VIEW_USERS
ADMIN_PERMISSIONS.CAN_BLOCK_USERS
ADMIN_PERMISSIONS.CAN_UNBLOCK_USERS

// Payments
ADMIN_PERMISSIONS.CAN_APPROVE_WITHDRAWALS
ADMIN_PERMISSIONS.CAN_REJECT_WITHDRAWALS

// Disputes
ADMIN_PERMISSIONS.CAN_RESOLVE_DISPUTES

// Settings
ADMIN_PERMISSIONS.CAN_CHANGE_COMMISSION
ADMIN_PERMISSIONS.CAN_ENABLE_MAINTENANCE_MODE
```

---

## Action Types

```javascript
// User
ACTION_TYPES.USER_BLOCKED
ACTION_TYPES.USER_UNBLOCKED

// Payment
ACTION_TYPES.WITHDRAWAL_APPROVED
ACTION_TYPES.WITHDRAWAL_REJECTED

// Dispute
ACTION_TYPES.DISPUTE_RESOLVED

// Settings
ACTION_TYPES.COMMISSION_CHANGED
ACTION_TYPES.MAINTENANCE_MODE_ENABLED
```

---

## Format Examples

```javascript
// Currency
formatCurrency(1500)              → "₹1,500.00"
formatCurrencyCompact(150000)     → "₹1.5L"

// Date
formatDate(date, 'short')         → "15 Jan 2024"
formatDate(date, 'datetime')      → "15 Jan 2024, 10:30 AM"
formatRelativeTime(date)          → "2 hours ago"

// Percentage
formatPercentage(20)              → "20.0%"
```

---

## Component Props

### ConfirmModal
```jsx
visible={boolean}
title={string}
message={string}
danger={boolean}
loading={boolean}
onConfirm={function}
onCancel={function}
```

### LoadingState
```jsx
message={string}
size="large|small"
```

### EmptyState
```jsx
icon={string}
message={string}
description={string}
```

### ErrorState
```jsx
message={string}
description={string}
onRetry={function}
```

---

**Keep this card handy while integrating polish features! 🚀**
