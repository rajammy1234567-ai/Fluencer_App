# Dispute & Report Management System

## 📋 Overview

Complete Dispute Management module for the Influencer Admin Panel. Allows admins to review disputes between brands and influencers, view evidence, review chat history, and make informed decisions.

---

## 🗂️ File Structure

```
services/
  └── disputeAdmin.service.js         # Mock dispute data & admin actions

components/admin/
  ├── DisputeCard.jsx                 # List item card for disputes
  ├── EvidenceLink.jsx                # Evidence section with links
  └── AdminDecisionBar.jsx            # 3-action decision bar

app/(admin)/
  ├── disputes.jsx                    # Dispute list screen
  ├── dispute-detail.jsx              # Dispute detail & decision screen
  └── chat-readonly.jsx               # Read-only chat history
```

---

## 🎯 Features Implemented

### 1. **Dispute List Screen** (`disputes.jsx`)
- **Stats Dashboard**: Open, Resolved, Rejected counts
- **Search**: By dispute ID, brand, influencer, campaign, type
- **Filters**: All, Open, Resolved
- **Pull-to-Refresh**: Reload latest data
- **Navigation**: Tap dispute card → Detail screen

### 2. **Dispute Detail Screen** (`dispute-detail.jsx`)
- **Complete Info**:
  - Dispute ID, status, type
  - Brand, Influencer, Campaign details
  - Payment amount, commission breakdown
  - Current wallet state (pending/available)
  - Brand's rejection reason
  - Influencer's claim
  
- **Evidence Section**:
  - Submitted content link (opens in browser)
  - Campaign requirements
  - Additional notes
  
- **Admin Actions** (only for Open disputes):
  - **Approve Influencer**: Release wallet amount
  - **Approve Brand**: Refund payment
  - **Reject Dispute**: No fund movement
  - All actions require reason (min 10 chars)

- **Chat History Link**: Opens read-only chat view

### 3. **Chat Read-Only Screen** (`chat-readonly.jsx`)
- **Read-Only Mode**: Clear indicator, no message input
- **Message Bubbles**: 
  - Brand (left, purple)
  - Influencer (right, green)
- **Timestamps**: Date + time for each message
- **Legend**: Color-coded sender types

### 4. **Reusable Components**

#### **DisputeCard** (`DisputeCard.jsx`)
```jsx
<DisputeCard
  dispute={disputeObject}
  onPress={() => navigateToDetail(id)}
/>
```
- Dispute ID with shield icon
- Status badge (color-coded)
- Type badge (Content Rejection, Fake Rejection, etc.)
- Brand, Influencer, Campaign info
- Created date
- Chevron for navigation

#### **EvidenceSection** (`EvidenceLink.jsx`)
```jsx
<EvidenceSection dispute={disputeObject} />
```
- Content link (clickable, opens browser)
- Campaign requirements (text)
- Additional notes (highlighted)
- Clean card layout with dividers

#### **AdminDecisionBar** (`AdminDecisionBar.jsx`)
```jsx
<AdminDecisionBar
  onApproveInfluencer={(reason) => {}}
  onApproveBrand={(reason) => {}}
  onRejectDispute={(reason) => {}}
  disabled={processing}
/>
```
- 3 action buttons:
  - **Approve Influencer** (green)
  - **Approve Brand** (blue)
  - **Reject Dispute** (red)
- Confirmation alerts before action
- Reason modal with validation (min 10 chars)
- Disabled state during processing

---

## 📊 Mock Data Structure

### **disputeAdmin.service.js**

#### Disputes (5 samples):
1. **DIS001** - Content Rejection (Open)
   - Nike India vs Priya Sharma
   - ₹25,000 payment
   - Wallet: ₹20,000 pending (locked)

2. **DIS002** - Fake Rejection (Open)
   - Myntra vs Rahul Verma
   - ₹18,500 payment
   - Wallet: ₹14,800 pending (locked)

3. **DIS003** - Post-Payment Cancellation (Resolved - Influencer Approved)
   - Zomato vs Amit Kumar
   - ₹30,000 payment
   - Wallet: ₹24,000 available (released)

4. **DIS004** - Content Rejection (Resolved - Brand Approved)
   - Amazon India vs Sneha Patel
   - ₹22,000 payment
   - Wallet: ₹0 (refunded to brand)

5. **DIS005** - Fake Rejection (Open)
   - Boat Lifestyle vs Vikram Singh
   - ₹15,000 payment
   - Wallet: ₹12,000 pending (locked)

#### Chat History:
- **DIS001**: 5 messages (Brand-Influencer conversation)
- **DIS002**: 5 messages (Timeline dispute)
- Other disputes: Empty chat (can be extended)

---

## 🔄 Business Logic Flow

### **Approve Influencer**
```
1. Admin views Open dispute
2. Reviews evidence & chat history
3. Clicks "Approve Influencer"
4. Confirmation alert appears
5. Admin enters reason (min 10 chars)
6. System:
   - Changes status to "Resolved"
   - Records admin action & reason
   - Updates wallet: pending → available
   - Adds resolution timestamp
7. Success alert → Navigate back to list
```

### **Approve Brand**
```
1. Admin views Open dispute
2. Reviews evidence & determines brand is right
3. Clicks "Approve Brand"
4. Confirmation alert appears
5. Admin enters reason (min 10 chars)
6. System:
   - Changes status to "Resolved"
   - Records admin action & reason
   - Updates wallet: pending → 0 (refunded)
   - Marks wallet status as "refunded"
   - Adds resolution timestamp
7. Success alert → Navigate back to list
```

### **Reject Dispute**
```
1. Admin views Open dispute
2. Determines dispute is invalid
3. Clicks "Reject Dispute"
4. Modal opens for reason
5. Admin enters reason (min 10 chars)
6. System:
   - Changes status to "Rejected"
   - Records admin action & reason
   - NO fund movement (wallet stays locked)
   - Adds resolution timestamp
7. Success alert → Navigate back to list
```

---

## 🎨 UI/UX Design

### **Color Coding**
- **Open**: Orange (`COLORS.warning`)
- **Resolved**: Green (`COLORS.success`)
- **Rejected**: Red (`COLORS.error`)

### **Icons**
- 🛡️ `shield-alert` - Dispute ID
- 🏢 `office-building` - Brand
- ⭐ `account-star` - Influencer
- 📢 `bullhorn` - Campaign
- 📄 `file-alert` - Content Rejection
- ⚠️ `alert-circle` - Fake Rejection
- ❌ `cancel` - Post-Payment Cancellation
- 💬 `message-text` - Chat history
- 👁️ `eye` - Read-only mode
- 💰 `wallet` - Wallet state

### **Status Badges**
```jsx
Open      → Orange background, white text
Resolved  → Green background, white text
Rejected  → Red background, white text
```

### **Action Buttons**
```jsx
Approve Influencer → Green (`COLORS.success`)
Approve Brand     → Purple (`COLORS.primary`)
Reject Dispute    → Red (`COLORS.error`)
```

---

## 🔗 Navigation Routes

| Screen | Route | Access |
|--------|-------|--------|
| Dispute List | `/(admin)/disputes` | More Tab → Disputes |
| Dispute Detail | `/(admin)/dispute-detail?id={disputeId}` | Tap dispute card |
| Chat History | `/(admin)/chat-readonly?disputeId={id}` | "View Chat History" button |

---

## 🧪 Service API Functions

### **disputeAdmin.service.js**

```javascript
// Get all disputes with optional filters
getAllDisputes(filters)
// filters: { status: 'Open' | 'Resolved' }
// Returns: { success, data: [...disputes] }

// Get single dispute by ID
getDisputeById(disputeId)
// Returns: { success, data: dispute }

// Search disputes
searchDisputes(query)
// Searches: ID, brand, influencer, campaign, type
// Returns: { success, data: [...results] }

// Admin actions
approveInfluencer(disputeId, reason)
// Returns: { success, message }

approveBrand(disputeId, reason)
// Returns: { success, message }

rejectDispute(disputeId, reason)
// Validates: reason >= 10 chars
// Returns: { success, message }

// Get chat history
getChatHistory(disputeId)
// Returns: { success, data: [...messages] }

// Get stats
getDisputeStats()
// Returns: { success, data: { open, resolved, rejected, total } }

// Utilities
formatCurrency(amount)
getStatusColor(status)
```

---

## 📱 Screen States

### **Loading State**
```
┌─────────────────────────────┐
│                             │
│        [Spinner]            │
│    Loading disputes...      │
│                             │
└─────────────────────────────┘
```

### **Empty State**
```
┌─────────────────────────────┐
│     [Shield Check Icon]     │
│                             │
│   No disputes found         │
│                             │
└─────────────────────────────┘
```

### **Read-Only Notice Bar**
```
┌─────────────────────────────┐
│ 👁️ Read-Only Mode - Admin  │
└─────────────────────────────┘
```

---

## ⚙️ Validation Rules

### **Reason Input** (All Actions)
- **Minimum**: 10 characters
- **Type**: Plain text (multiline)
- **Required**: Yes
- **Error Message**: "Reason must be at least 10 characters"

### **Dispute Status** (for actions)
- Only **Open** disputes can be acted upon
- **Resolved/Rejected** disputes show read-only view
- Action bar hidden for non-Open disputes

---

## 🚀 Integration Points

### **Drawer Menu Link**
File: `components/admin/AdminDrawer.jsx`
```jsx
{
  id: 5,
  title: 'Disputes',
  icon: 'alert-circle',
  route: '/(admin)/disputes',
}
```

### **Future Backend Integration**
When replacing mock data with real APIs:

1. **API Endpoints Needed**:
   ```
   GET  /admin/disputes                    → getAllDisputes
   GET  /admin/disputes/:id                → getDisputeById
   GET  /admin/disputes/:id/chat           → getChatHistory
   POST /admin/disputes/:id/approve-influencer
   POST /admin/disputes/:id/approve-brand
   POST /admin/disputes/:id/reject
   ```

2. **Request/Response Format**:
   ```javascript
   // Approve Influencer
   POST /admin/disputes/:id/approve-influencer
   Body: { reason: "Content meets all requirements..." }
   Response: { success: true, message: "..." }
   ```

3. **Update Service File**:
   - Replace mock arrays with API calls
   - Add authentication headers
   - Handle loading/error states
   - Implement real-time updates (WebSocket/polling)

---

## 🔐 Security Considerations

### **Admin-Only Access**
- All dispute routes require admin authentication
- Verify admin role before showing action buttons
- Log all admin actions with timestamps

### **Data Validation**
- Reason length: 10+ characters
- DisputeId must exist
- Status must be "Open" for actions

### **Audit Trail**
Each action stores:
- Admin ID (future)
- Action type (Approve Influencer/Brand, Reject)
- Reason provided
- Timestamp
- Previous status
- New status

---

## 📊 Data Models (Reference)

### **Dispute Object**
```javascript
{
  id: 'DIS001',
  type: 'Content Rejection' | 'Fake Rejection' | 'Post-Payment Cancellation',
  status: 'Open' | 'Resolved' | 'Rejected',
  createdAt: '2024-01-20T14:30:00',
  resolvedAt: '2024-01-22T10:00:00', // if resolved/rejected
  
  // Parties
  brandId: 'BRD001',
  brandName: 'Nike India',
  influencerId: 'INF001',
  influencerName: 'Priya Sharma',
  campaignId: 'CAMP001',
  campaignName: 'Summer Collection Launch',
  
  // Financial
  paymentAmount: 25000,
  commissionRate: 20,
  platformCommission: 5000,
  influencerShare: 20000,
  
  // Wallet
  walletState: {
    pending: 20000,
    available: 0,
    status: 'locked' | 'released' | 'refunded',
  },
  
  // Dispute Details
  rejectionReason: "Content quality does not meet...",
  influencerClaim: "Content was delivered as per...",
  contentLink: "https://instagram.com/p/sample123",
  campaignRequirements: "Minimum 3 photos...",
  additionalNotes: "Influencer claims all requirements...",
  
  // Admin Resolution (if resolved/rejected)
  adminAction: 'Approved Influencer' | 'Approved Brand' | 'Rejected Dispute',
  adminReason: "Content met all requirements...",
}
```

### **Chat Message Object**
```javascript
{
  id: 'MSG001',
  senderId: 'BRD001',
  senderName: 'Nike India',
  senderType: 'brand' | 'influencer',
  message: 'Hi Priya, we need the summer...',
  timestamp: '2024-01-10T10:00:00',
}
```

---

## 🎯 Testing Checklist

### **Dispute List Screen**
- [ ] Stats cards display correct counts
- [ ] Search filters disputes correctly
- [ ] Status filters work (All/Open/Resolved)
- [ ] Pull-to-refresh reloads data
- [ ] Empty state shows when no disputes
- [ ] Tap dispute card navigates to detail
- [ ] Loading spinner displays during fetch

### **Dispute Detail Screen**
- [ ] All dispute info displays correctly
- [ ] Wallet state shows pending/available
- [ ] Evidence links open in browser
- [ ] Chat history button works
- [ ] Action bar only shows for Open disputes
- [ ] Confirmation alerts appear before action
- [ ] Reason modal validates 10+ characters
- [ ] Success alert shows after action
- [ ] Navigates back after successful action

### **Chat Read-Only Screen**
- [ ] Read-only notice bar visible
- [ ] Messages display in correct order
- [ ] Brand messages align left (purple)
- [ ] Influencer messages align right (green)
- [ ] Timestamps formatted correctly
- [ ] Legend shows at bottom
- [ ] Empty state shows when no messages
- [ ] No message input field present

### **Components**
- [ ] DisputeCard renders all info
- [ ] Status badges color-coded correctly
- [ ] Type badges display proper icons
- [ ] EvidenceSection links work
- [ ] AdminDecisionBar shows 3 buttons
- [ ] Reason modal validates input
- [ ] Disabled state works during processing

---

## 📈 Future Enhancements

1. **Real-Time Updates**
   - WebSocket for live dispute status
   - Push notifications for new disputes

2. **Advanced Filtering**
   - Filter by dispute type
   - Date range filters
   - Brand/Influencer filters

3. **Bulk Actions**
   - Select multiple disputes
   - Bulk approve/reject

4. **Analytics**
   - Dispute resolution time
   - Success rate by admin
   - Common dispute types

5. **Export**
   - Download dispute report (PDF/Excel)
   - Chat history export

6. **Escalation**
   - Flag high-priority disputes
   - Assign to specific admins

---

## ✅ Summary

**Created Files**: 7
- 1 Service (disputeAdmin.service.js)
- 3 Components (DisputeCard, EvidenceLink, AdminDecisionBar)
- 3 Screens (disputes, dispute-detail, chat-readonly)

**Mock Data**: 
- 5 Disputes (3 Open, 2 Resolved)
- 2 Chat histories (10 messages total)

**Features**:
- Search & filter disputes
- View complete dispute details
- Review evidence & chat history
- 3-way admin decisions (Approve Influencer/Brand, Reject)
- Reason validation
- Wallet state management

**Zero Errors** ✅

---

**🎉 Dispute Management Module is COMPLETE and ready for testing!**
