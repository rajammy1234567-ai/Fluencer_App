# Payment & Wallet Navigation Flow

## 🗺️ Screen Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL HOME                         │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         Bottom Tab Navigation (5 tabs)            │    │
│  │  Dashboard | Users | Campaigns | PAYMENTS | More  │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              TAB 4: PAYMENTS (PaymentListScreen)            │
│─────────────────────────────────────────────────────────────│
│  🔍 Search: brand, campaign, transaction, influencer        │
│  📊 Filters: All | Success | Refunded                       │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ 🏢 Nike India               [Success Badge]       │    │
│  │ Summer Collection Launch                          │    │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │    │
│  │ Paid Amount: ₹25,000                              │    │
│  │ ⭐ Priya Sharma     📅 15 Jan 2024               │    │
│  │ pay_razorpay_txn_12345                           │    │
│  └───────────────────────────────────────────────────┘    │
│                         [Tap to view details]              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PAYMENT DETAIL SCREEN                       │
│─────────────────────────────────────────────────────────────│
│            [Success Badge]                                  │
│         Total Amount: ₹25,000                              │
│    pay_razorpay_txn_12345                                 │
│                                                            │
│  📋 Campaign Details                                        │
│  ├─ Brand: Nike India                                      │
│  ├─ Campaign: Summer Collection Launch                     │
│  └─ Influencer: Priya Sharma                              │
│                                                            │
│  💰 Commission Breakdown                                    │
│  ├─ Total Amount: ₹25,000                                 │
│  ├─ Platform Commission (20%): ₹5,000                     │
│  └─ Influencer Share: ₹20,000                             │
│                                                            │
│  📅 Payment Information                                     │
│  ├─ Payment Date: 15 Jan 2024, 10:30 AM                  │
│  ├─ Payment Method: UPI                                    │
│  └─ Payment Gateway: Razorpay                             │
│                                                            │
│         [← Back to Payments]                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL HOME                         │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         Bottom Tab Navigation (5 tabs)            │    │
│  │  Dashboard | Users | Campaigns | Payments | MORE  │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  MORE TAB (MoreScreen)                      │
│─────────────────────────────────────────────────────────────│
│  Menu Items:                                               │
│  • Dashboard                                               │
│  • Users                                                   │
│  • Campaigns                                               │
│  • Payments                                                │
│  • 💵 WITHDRAWALS  ← Tap this                             │
│  • Disputes                                                │
│  • Notifications                                           │
│  • Settings                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          WITHDRAWALS (WithdrawalListScreen)                 │
│─────────────────────────────────────────────────────────────│
│  🔍 Search: influencer, bank account, ID                    │
│  📊 Filters: All | Pending | Approved | Rejected            │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ ⭐ Priya Sharma           [Pending Badge]         │    │
│  │ Withdrawal Amount: ₹20,000                        │    │
│  │ 🏦 HDFC Bank - ****5678                          │    │
│  │ 📅 Requested: 16 Jan 2024                        │    │
│  │ ID: WD001                                         │    │
│  └───────────────────────────────────────────────────┘    │
│                         [Tap to review]                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              WITHDRAWAL DETAIL SCREEN                       │
│─────────────────────────────────────────────────────────────│
│            [Pending Badge]                                  │
│      Withdrawal Amount: ₹20,000                            │
│            ID: WD001                                        │
│                                                            │
│  ⭐ Influencer Details                                      │
│  ├─ Name: Priya Sharma                                     │
│  └─ Influencer ID: INF001                                 │
│                                                            │
│  🏦 Bank Account Details                                    │
│  ├─ Bank Name: HDFC Bank                                   │
│  ├─ Account Number: 12345678 [📋 Copy]                    │
│  ├─ IFSC Code: HDFC0001234 [📋 Copy]                     │
│  └─ Account Holder: Priya Sharma                          │
│                                                            │
│  📅 Request Information                                     │
│  └─ Requested At: 16 Jan 2024, 02:15 PM                  │
│                                                            │
│  ┌───────────────────────────────────────────────┐        │
│  │  [✓ APPROVE]          [✗ REJECT]              │        │
│  └───────────────────────────────────────────────┘        │
│            ↓                      ↓                        │
│    Shows confirmation      Opens modal for                │
│    alert, then approves    rejection reason               │
│                           (10+ chars required)            │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│           INFLUENCER DETAIL SCREEN (existing)               │
│─────────────────────────────────────────────────────────────│
│  Profile info, followers, campaigns, etc.                   │
│                                                             │
│  [💰 View Wallet]  ← New button added                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              WALLET DETAIL SCREEN                           │
│─────────────────────────────────────────────────────────────│
│            ⭐ Priya Sharma                                  │
│            ID: INF001                                       │
│                                                            │
│  💼 Wallet Balances                                         │
│  ┌─────────┬─────────┬─────────┐                          │
│  │⏰Pending│✓Available│💸Withdrawn│                         │
│  │₹15,000  │₹20,000  │₹45,000  │                          │
│  └─────────┴─────────┴─────────┘                          │
│                                                            │
│  ╔═══════════════════════════════╗                        │
│  ║ Total Lifetime Earnings       ║                        │
│  ║         ₹80,000               ║                        │
│  ╚═══════════════════════════════╝                        │
│                                                            │
│  📜 Transaction History                                     │
│  ┌───────────────────────────────────────────────┐        │
│  │ ↓ Campaign Payment                   ₹25,000  │        │
│  │   15 Jan 2024                   [Completed]   │        │
│  ├───────────────────────────────────────────────┤        │
│  │ ↑ Bank Withdrawal                    ₹15,000  │        │
│  │   10 Jan 2024                   [Completed]   │        │
│  ├───────────────────────────────────────────────┤        │
│  │ ↓ Campaign Payment                   ₹20,000  │        │
│  │   05 Jan 2024                   [Completed]   │        │
│  └───────────────────────────────────────────────┘        │
│                                                            │
│     ↓ = Credit (Green)    ↑ = Debit (Red)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Navigation Routes

### 1. Payments Flow
```
Tab 4: Payments
  ↓ (tap on payment card)
Payment Detail (?id=PAY001)
  ↓ (back button)
Tab 4: Payments
```

### 2. Withdrawals Flow
```
More Tab
  ↓ (tap Withdrawals)
Withdrawal List
  ↓ (tap on withdrawal card)
Withdrawal Detail (?id=WD001)
  ↓ (approve/reject action)
Alert → Back to Withdrawal List
```

### 3. Wallet Flow
```
Users Tab → Influencers List
  ↓ (tap on influencer)
Influencer Detail
  ↓ (tap "View Wallet" button)
Wallet Detail (?influencerId=INF001)
  ↓ (shows balances + transaction history)
```

---

## 🔄 Action Flows

### Approve Withdrawal
```
1. Admin views Withdrawal Detail (Pending status)
2. Taps "APPROVE" button
3. Confirmation alert appears
4. Admin confirms
5. System:
   - Changes status to "Approved"
   - Generates transaction ID (e.g., TXN_1234567890)
   - Deducts amount from wallet.available
   - Adds to wallet.withdrawn
   - Records approval timestamp
6. Success alert shown
7. Redirects back to Withdrawal List
```

### Reject Withdrawal
```
1. Admin views Withdrawal Detail (Pending status)
2. Taps "REJECT" button
3. Modal opens for rejection reason
4. Admin types reason (minimum 10 characters)
5. Taps "Submit"
6. System:
   - Changes status to "Rejected"
   - Stores rejection reason
   - Does NOT deduct from wallet
   - Records rejection timestamp
7. Success alert shown
8. Redirects back to Withdrawal List
```

### View Payment Details
```
1. Admin views Payment List
2. Searches/filters payments (optional)
3. Taps on payment card
4. Payment Detail screen opens
5. Views:
   - Campaign info
   - Commission breakdown
   - Payment method
   - Refund status (if applicable)
6. Taps "Back to Payments"
7. Returns to Payment List
```

### View Wallet & Transactions
```
1. Admin navigates to Influencer Detail
2. Taps "View Wallet" button
3. Wallet Detail screen opens
4. Views:
   - Pending balance (campaigns completed, payment pending)
   - Available balance (ready to withdraw)
   - Withdrawn balance (already transferred)
   - Total lifetime earnings
   - Full transaction history (credits & debits)
5. Pull to refresh for latest data
```

---

## 🎨 Visual Elements

### Status Badges
- **Success (Green):** ✓ with green background
- **Pending (Orange):** ⏰ with orange background
- **Rejected (Red):** ✗ with red background
- **Approved (Green):** ✓ with green background
- **Refunded (Yellow):** ↩ with yellow background

### Icons Used
- 🏢 `office-building` - Brand
- 💰 `cash-multiple` - Amount/Money
- ⭐ `account-star` - Influencer
- 🏦 `bank` - Bank/Financial
- 📅 `calendar` - Date
- 🔍 `magnify` - Search
- ✓ `check-circle` - Approved/Success
- ✗ `close-circle` - Rejected/Failed
- ⏰ `clock-outline` - Pending
- 💸 `bank-transfer` - Withdrawal
- ↓ `arrow-down` - Credit transaction
- ↑ `arrow-up` - Debit transaction
- 📋 `content-copy` - Copy to clipboard

---

## 📱 Screen States

### Loading State
```
┌─────────────────────────────┐
│                             │
│        [Spinner]            │
│    Loading data...          │
│                             │
└─────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────┐
│        [Large Icon]         │
│                             │
│   No payments found         │
│                             │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│    ⚠️ Error Loading Data    │
│                             │
│   [Retry Button]            │
└─────────────────────────────┘
```

---

## 🎯 User Interactions

### Pull to Refresh
- Available on all list screens
- Native refresh control
- Reloads data from service

### Search
- Real-time filtering
- Debounced input
- Clear button (X) appears when typing
- Searches across multiple fields

### Filter Tabs
- Horizontal scrollable tabs
- Active tab highlighted in purple
- Instant filtering without reload

### Card Tap
- Opacity animation (0.7)
- Navigates to detail screen
- Smooth transition

### Approve/Reject Actions
- Only visible for Pending status
- Approve: Confirmation alert → Action → Success alert
- Reject: Modal with text input → Validation → Action → Success alert

---

This navigation flow ensures admins can efficiently manage all payment-related operations! 🚀
