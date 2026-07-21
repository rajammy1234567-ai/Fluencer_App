# Admin Payment & Wallet System

## Overview
Complete payment, withdrawal, and wallet management system for the Influish Admin Panel. Built with mock data services following enterprise patterns.

## 📁 Architecture

### Services Layer (`/services/`)
All business logic isolated in service modules:

#### 1. **paymentAdmin.service.js**
Manages brand-to-platform payments
- `getAllPayments(filters)` - List all payments with status/brand filtering
- `getPaymentById(id)` - Single payment details
- `searchPayments(query)` - Search by brand/campaign/transaction/influencer
- `getPaymentStats()` - Revenue, commission, payout statistics
- `formatCurrency(amount)` - ₹ formatting helper

**Mock Data:**
- 5 sample payments (Nike, Myntra, Zomato, Amazon)
- Razorpay transaction IDs
- Commission breakdown (20% default)
- Refund tracking with reasons

#### 2. **withdrawalAdmin.service.js**
Manages influencer withdrawal requests
- `getAllWithdrawals(filters)` - List with status/influencer filtering
- `getWithdrawalById(id)` - Single withdrawal details
- `searchWithdrawals(query)` - Search by influencer/bank/ID
- `approveWithdrawal(id)` - Approve and generate transaction ID
- `rejectWithdrawal(id, reason)` - Reject with mandatory reason (10+ chars)
- `getInfluencerWallet(influencerId)` - Wallet balances + transaction history
- `getWithdrawalStats()` - Pending/approved/rejected counts

**Mock Data:**
- 5 withdrawal requests (Pending/Approved/Rejected)
- Bank account details (Account Number, IFSC, Bank Name)
- 2 influencer wallets with transaction history
- Wallet structure: pending, available, withdrawn balances

#### 3. **commission.service.js**
Platform commission rate management
- `getCommissionRate()` - Current rate (20% default)
- `updateCommissionRate(newRate, reason)` - Update with validation (10-30%)
- `calculateCommission(amount, rate)` - Breakdown: platform vs influencer
- `getCommissionHistory()` - Change log with reasons
- `validateCommissionRate(rate)` - Range validation

**Mock Data:**
- Current rate: 20%
- Min/Max: 10% - 30%
- Commission history with timestamps and reasons

---

### Components Layer (`/components/admin/`)
Reusable UI components:

#### 1. **AmountBadge.jsx**
Currency display component
```jsx
<AmountBadge amount={25000} size="large" />
```
- Props: `amount` (number), `size` ('small' | 'medium' | 'large')
- Features: ₹ icon, purple background, formatted text
- Variants: 
  - small: 12px font
  - medium: 16px font  
  - large: 20px font

#### 2. **PaymentStatusBadge.jsx**
Status indicator for payments/withdrawals/transactions
```jsx
<PaymentStatusBadge status="Success" type="payment" />
<PaymentStatusBadge status="Pending" type="withdrawal" />
<PaymentStatusBadge status="Completed" type="transaction" />
```
- Props: `status` (string), `type` ('payment' | 'withdrawal' | 'transaction')
- Payment statuses: Success (green), Refunded (yellow), Pending (orange), Failed (red)
- Withdrawal statuses: Pending (orange), Approved (green), Rejected (red)
- Transaction statuses: Completed (green), Pending (orange)

#### 3. **ApproveRejectBar.jsx**
Action bar for withdrawal approval/rejection
```jsx
<ApproveRejectBar 
  onApprove={() => handleApprove()} 
  onReject={(reason) => handleReject(reason)}
  disabled={false}
/>
```
- Props: `onApprove` (function), `onReject` (function with reason param), `disabled` (boolean)
- Features:
  - Approve button: Green with confirmation alert
  - Reject button: Red with modal for reason input
  - Validation: Minimum 10 characters required for rejection reason
  - Fixed position at bottom of screen

#### 4. **TransactionRow.jsx**
Transaction history display component
```jsx
<TransactionRow 
  transaction={{
    id, description, amount, type, date, status
  }}
  isLast={false}
/>
```
- Props: `transaction` (object), `isLast` (boolean)
- Features:
  - Credit: Green with arrow-down icon
  - Debit: Red with arrow-up icon
  - Date formatting: DD MMM YYYY
  - Status badge integration
  - Bottom border (except last item)

---

### Screens Layer (`/app/(admin)/`)

#### 1. **payments.jsx** (Tab 4)
Payment list screen with search and filters
- **Location:** `(admin)/(tabs)/payments.jsx`
- **Features:**
  - Search bar (brand/campaign/transaction/influencer)
  - Filter tabs: All, Success, Refunded
  - Payment cards showing:
    - Brand name with icon
    - Campaign name
    - Total amount (large, bold)
    - Influencer name
    - Payment date
    - Transaction ID (monospace)
    - Status badge
  - Pull-to-refresh
  - Empty state
  - Navigation to detail screen

#### 2. **payment-detail.jsx**
Single payment transaction details
- **Location:** `(admin)/payment-detail.jsx`
- **Route:** `/(admin)/payment-detail?id={paymentId}`
- **Features:**
  - Header with status badge and total amount
  - Campaign details section (brand, campaign, influencer)
  - Commission breakdown:
    - Total amount (highlighted)
    - Platform commission (with percentage)
    - Influencer share
  - Refund info (if refunded):
    - Refund date
    - Refund reason (if available)
  - Payment information (date, method, gateway)
  - Back button

#### 3. **withdrawals.jsx**
Withdrawal request list screen
- **Location:** `(admin)/withdrawals.jsx`
- **Access:** More Tab → Withdrawals
- **Features:**
  - Search bar (influencer/bank/ID)
  - Filter tabs: All, Pending, Approved, Rejected
  - Withdrawal cards showing:
    - Influencer name with icon
    - Withdrawal amount
    - Bank account number
    - Request date
    - Approval/Rejection date (if processed)
    - Status badge
    - Withdrawal ID
  - Pull-to-refresh
  - Empty state
  - Navigation to detail screen

#### 4. **withdrawal-detail.jsx**
Single withdrawal request details with actions
- **Location:** `(admin)/withdrawal-detail.jsx`
- **Route:** `/(admin)/withdrawal-detail?id={withdrawalId}`
- **Features:**
  - Header with status badge and amount
  - Influencer details (name, ID)
  - Bank account details:
    - Bank name
    - Account number (copyable)
    - IFSC code (copyable)
    - Account holder name
  - Request information:
    - Requested date
    - Approved/Rejected date (if processed)
    - Transaction ID (if approved)
    - Rejection reason (if rejected)
  - **Approve/Reject Bar** (only for Pending status):
    - Approve: Confirmation alert → generates transaction ID
    - Reject: Modal with reason input (10+ chars) → doesn't deduct wallet
  - Success alerts on action completion

#### 5. **wallet-detail.jsx**
Influencer wallet overview with transaction history
- **Location:** `(admin)/wallet-detail.jsx`
- **Route:** `/(admin)/wallet-detail?influencerId={id}`
- **Features:**
  - Header with influencer name and ID
  - Balance cards (3-column grid):
    - **Pending:** Orange badge with clock icon
    - **Available:** Green badge with check icon
    - **Withdrawn:** Purple badge with transfer icon
  - Total lifetime earnings card (purple, prominent)
  - Transaction history:
    - All transactions with TransactionRow component
    - Credit (green, down arrow): Campaign payments
    - Debit (red, up arrow): Withdrawals
    - Date, amount, description, status
  - Empty state for no transactions
  - Pull-to-refresh

---

## 🎨 UI/UX Patterns

### Color Coding
- **Primary (Purple):** Amounts, headers, total earnings
- **Success (Green):** Approved, success, credit transactions
- **Warning (Orange):** Pending, awaiting approval
- **Error (Red):** Rejected, failed, debit transactions
- **Gray:** Secondary text, labels, placeholders

### Typography
- **Headers:** 20-32px, bold
- **Body:** 14-16px, regular
- **Labels:** 12px, gray
- **IDs/Codes:** 12px, monospace

### Spacing
- Card padding: 16px
- Section margin: 16px
- Grid gap: 12px
- Icon gap: 8px

### Animations
- Card press: opacity 0.7
- Pull-to-refresh: native
- Modal slide: 300ms ease

---

## 📊 Data Flow

### Payment Flow
```
Brand pays via Razorpay
  ↓
Payment recorded in system
  ↓
Commission calculated (20%)
  ↓
Platform share: 20%
Influencer share: 80%
  ↓
Payment marked as Success
```

### Withdrawal Flow
```
Influencer requests withdrawal
  ↓
Admin reviews request
  ↓
APPROVE                    REJECT
  ↓                          ↓
Generate transaction ID     Require reason (10+ chars)
Deduct from wallet         Don't deduct from wallet
Mark as Approved           Mark as Rejected
```

### Wallet Balance Logic
```
Pending: Campaign completed, payment not yet from brand
Available: Payment received from brand, ready to withdraw
Withdrawn: Already withdrawn to bank account

Total Earnings = Pending + Available + Withdrawn
```

---

## 🔌 Integration Points

### Future Backend Integration
Replace mock service calls with real API endpoints:

```javascript
// Instead of:
const result = await getAllPayments(filters);

// Call:
const response = await fetch('/api/admin/payments', {
  method: 'POST',
  body: JSON.stringify(filters)
});
const result = await response.json();
```

### Database Schema (Reference)
```sql
-- Payments table
CREATE TABLE payments (
  id VARCHAR PRIMARY KEY,
  brand_id VARCHAR,
  campaign_id VARCHAR,
  influencer_id VARCHAR,
  total_amount DECIMAL,
  platform_commission DECIMAL,
  influencer_share DECIMAL,
  commission_rate INT,
  payment_status ENUM('Success', 'Refunded', 'Pending', 'Failed'),
  payment_method VARCHAR,
  razorpay_transaction_id VARCHAR,
  payment_date TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_reason TEXT
);

-- Withdrawals table
CREATE TABLE withdrawals (
  id VARCHAR PRIMARY KEY,
  influencer_id VARCHAR,
  amount DECIMAL,
  status ENUM('Pending', 'Approved', 'Rejected'),
  bank_name VARCHAR,
  bank_account_number VARCHAR,
  ifsc_code VARCHAR,
  account_holder_name VARCHAR,
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  transaction_id VARCHAR
);

-- Wallets table
CREATE TABLE wallets (
  influencer_id VARCHAR PRIMARY KEY,
  pending DECIMAL DEFAULT 0,
  available DECIMAL DEFAULT 0,
  withdrawn DECIMAL DEFAULT 0
);

-- Transactions table
CREATE TABLE transactions (
  id VARCHAR PRIMARY KEY,
  influencer_id VARCHAR,
  description TEXT,
  amount DECIMAL,
  type ENUM('credit', 'debit'),
  status ENUM('Completed', 'Pending'),
  date TIMESTAMP
);

-- Commission settings table
CREATE TABLE commission_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rate INT DEFAULT 20,
  min_rate INT DEFAULT 10,
  max_rate INT DEFAULT 30,
  updated_at TIMESTAMP,
  updated_by VARCHAR,
  reason TEXT
);
```

---

## 🧪 Testing Checklist

### Payment Screens
- ✅ Load all payments
- ✅ Filter by status (All/Success/Refunded)
- ✅ Search by brand/campaign/transaction/influencer
- ✅ Navigate to detail screen
- ✅ View commission breakdown
- ✅ Display refund information
- ✅ Pull-to-refresh

### Withdrawal Screens
- ✅ Load all withdrawals
- ✅ Filter by status (All/Pending/Approved/Rejected)
- ✅ Search by influencer/bank/ID
- ✅ Navigate to detail screen
- ✅ View bank account details
- ✅ Approve withdrawal (Pending only)
- ✅ Reject withdrawal with reason (Pending only, 10+ chars)
- ✅ Display approval/rejection info
- ✅ Pull-to-refresh

### Wallet Screen
- ✅ Load influencer wallet
- ✅ Display pending/available/withdrawn balances
- ✅ Calculate total lifetime earnings
- ✅ Show transaction history
- ✅ Credit transactions (green)
- ✅ Debit transactions (red)
- ✅ Empty state for no transactions
- ✅ Pull-to-refresh

### Commission System
- ✅ Get current commission rate (20%)
- ✅ Calculate commission breakdown
- ✅ Validate rate range (10-30%)
- ✅ Update rate with reason
- ✅ View commission history

---

## 🚀 Usage Examples

### Navigate to Payment Detail
```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push(`/(admin)/payment-detail?id=PAY001`);
```

### Navigate to Withdrawal Detail
```javascript
router.push(`/(admin)/withdrawal-detail?id=WD001`);
```

### Navigate to Wallet Detail
```javascript
router.push(`/(admin)/wallet-detail?influencerId=INF001`);
```

### Approve Withdrawal
```javascript
import { approveWithdrawal } from '../../services/withdrawalAdmin.service';

const handleApprove = async (withdrawalId) => {
  const result = await approveWithdrawal(withdrawalId);
  if (result.success) {
    // Show success message
    // Navigate back or refresh
  }
};
```

### Reject Withdrawal
```javascript
import { rejectWithdrawal } from '../../services/withdrawalAdmin.service';

const handleReject = async (withdrawalId, reason) => {
  if (reason.length < 10) {
    Alert.alert('Error', 'Reason must be at least 10 characters');
    return;
  }
  
  const result = await rejectWithdrawal(withdrawalId, reason);
  if (result.success) {
    // Show success message
    // Navigate back or refresh
  }
};
```

---

## 📝 File Structure

```
Influish_Frontend/
├── app/
│   └── (admin)/
│       ├── (tabs)/
│       │   └── payments.jsx          # Tab 4: Payment list
│       ├── payment-detail.jsx        # Payment transaction details
│       ├── withdrawals.jsx           # Withdrawal request list
│       ├── withdrawal-detail.jsx     # Withdrawal details + approve/reject
│       └── wallet-detail.jsx         # Influencer wallet + history
│
├── components/
│   └── admin/
│       ├── AmountBadge.jsx           # Currency display
│       ├── PaymentStatusBadge.jsx    # Status indicators
│       ├── ApproveRejectBar.jsx      # Approval action bar
│       └── TransactionRow.jsx        # Transaction history row
│
└── services/
    ├── paymentAdmin.service.js       # Payment business logic
    ├── withdrawalAdmin.service.js    # Withdrawal & wallet logic
    └── commission.service.js         # Commission management
```

---

## 🔒 Business Rules

1. **Commission Rate:**
   - Default: 20%
   - Range: 10% - 30%
   - Only affects new deals
   - Change requires reason

2. **Withdrawal Approval:**
   - Only Pending requests can be approved/rejected
   - Approval generates transaction ID
   - Rejection requires reason (minimum 10 characters)
   - Approved: Deducts from wallet
   - Rejected: Amount stays in wallet

3. **Wallet Balances:**
   - **Pending:** Campaign done, brand payment pending
   - **Available:** Brand paid, influencer can withdraw
   - **Withdrawn:** Already transferred to bank

4. **Payment Status:**
   - **Success:** Brand paid successfully
   - **Refunded:** Payment refunded to brand (influencer doesn't get paid)
   - **Pending:** Payment processing
   - **Failed:** Payment failed

5. **Search Capabilities:**
   - Payments: Brand name, campaign name, transaction ID, influencer name
   - Withdrawals: Influencer name, bank account number, withdrawal ID

---

## 🎯 Next Steps (Future Enhancements)

1. **Real API Integration:**
   - Replace mock services with backend APIs
   - Add authentication headers
   - Handle loading states and errors

2. **Razorpay Integration:**
   - Real transaction tracking
   - Webhook handling
   - Refund processing

3. **Advanced Features:**
   - Bulk withdrawal approval
   - Export to Excel/PDF
   - Email notifications
   - SMS alerts for approvals/rejections

4. **Analytics:**
   - Revenue charts
   - Commission trends
   - Withdrawal patterns
   - Top earning influencers

5. **Filters & Sorting:**
   - Date range picker
   - Amount range filter
   - Sort by date/amount/status

6. **Admin Permissions:**
   - Role-based access (Super Admin, Finance Manager)
   - Audit logs
   - Two-factor approval for large amounts

---

## ✅ Completion Status

| Module | Status | Notes |
|--------|--------|-------|
| Services Layer | ✅ Complete | 3 services with mock data |
| Components | ✅ Complete | 4 reusable components |
| Payment List | ✅ Complete | Search, filter, cards |
| Payment Detail | ✅ Complete | Full breakdown, refund info |
| Withdrawal List | ✅ Complete | Search, filter, cards |
| Withdrawal Detail | ✅ Complete | Approve/reject actions |
| Wallet Detail | ✅ Complete | Balances, transaction history |
| Commission System | ✅ Complete | Rate management, history |

---

## 📞 Support

For questions or issues:
1. Check mock data in service files
2. Review component props and usage
3. Verify route parameters
4. Check console logs for errors

**Built with ❤️ for Influish Admin Panel**
