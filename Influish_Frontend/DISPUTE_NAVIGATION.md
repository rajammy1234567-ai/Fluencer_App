# Dispute Management - Navigation Flow

## 🗺️ Screen Navigation Diagram

```
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
│  • Withdrawals                                             │
│  • ⚠️ DISPUTES  ← Tap this                                │
│  • Notifications                                           │
│  • Settings                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DISPUTES LIST SCREEN                           │
│─────────────────────────────────────────────────────────────│
│  ┌───────────────────────────────────────────────────┐    │
│  │  [5] Open  │  [2] Resolved  │  [0] Rejected      │    │
│  └───────────────────────────────────────────────────┘    │
│                                                            │
│  🔍 Search: ID, brand, influencer, campaign...             │
│  📊 Filters: All | Open | Resolved                         │
│                                                            │
│  ┌───────────────────────────────────────────────────┐    │
│  │ 🛡️ DIS001                        [Open Badge]     │    │
│  │ ⚠️ Content Rejection                              │    │
│  │ 🏢 Nike India     ⭐ Priya Sharma                 │    │
│  │ 📢 Summer Collection Launch                       │    │
│  │ 📅 20 Jan 2024                                    │    │
│  └───────────────────────────────────────────────────┘    │
│                         [Tap to review]                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DISPUTE DETAIL SCREEN                          │
│─────────────────────────────────────────────────────────────│
│            🛡️ DIS001            [Open Badge]              │
│            Content Rejection                               │
│                                                            │
│  📋 Dispute Parties                                         │
│  ├─ Brand: Nike India                                      │
│  ├─ Influencer: Priya Sharma                              │
│  └─ Campaign: Summer Collection Launch                    │
│                                                            │
│  💰 Financial Details                                       │
│  ├─ Payment Amount: ₹25,000                               │
│  ├─ Platform Commission (20%): ₹5,000                     │
│  └─ Influencer Share: ₹20,000                             │
│                                                            │
│  💼 Current Wallet State                                    │
│  ├─ Pending: ₹20,000   │  Available: ₹0                   │
│  └─ Status: LOCKED                                         │
│                                                            │
│  📜 Dispute Information                                     │
│  ├─ Brand's Reason: "Content quality does not meet..."    │
│  ├─ Influencer's Claim: "Content was delivered as per..." │
│  └─ Created: 20 Jan 2024, 02:30 PM                       │
│                                                            │
│  📎 Evidence & Details                                      │
│  ├─ Submitted Content: [Instagram Link] 🔗                │
│  ├─ Requirements: "Minimum 3 photos, brand logo..."       │
│  └─ Notes: "Influencer claims all requirements met"       │
│                                                            │
│  ┌───────────────────────────────────────────────┐        │
│  │  💬 View Chat History                →        │        │
│  └───────────────────────────────────────────────┘        │
│            ↓ Tap to view messages                         │
│  ┌───────────────────────────────────────────────┐        │
│  │  [✅ Approve Influencer] [✅ Approve Brand]   │        │
│  │  [❌ Reject Dispute]                          │        │
│  └───────────────────────────────────────────────┘        │
│            ↓ Tap any action                               │
│  ┌───────────────────────────────────────────────┐        │
│  │  Enter Reason (min 10 chars)                  │        │
│  │  [Cancel]  [Submit]                           │        │
│  └───────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                    (View Chat History)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              CHAT READ-ONLY SCREEN                          │
│─────────────────────────────────────────────────────────────│
│  ╔═══════════════════════════════════════════════╗         │
│  ║  👁️ Read-Only Mode - Admin View             ║         │
│  ╚═══════════════════════════════════════════════╝         │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🏢 Nike India       20 Jan, 10:00 AM    │              │
│  │ ┌───────────────────────────────────┐   │              │
│  │ │ Hi Priya, we need the summer     │   │              │
│  │ │ collection posts by this weekend  │   │              │
│  │ └───────────────────────────────────┘   │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│              ┌─────────────────────────────────────────┐  │
│              │       20 Jan, 10:15 AM    ⭐ Priya    │  │
│              │   ┌───────────────────────────────────┐│  │
│              │   │ Sure! I will have them ready by  ││  │
│              │   │ Saturday.                         ││  │
│              │   └───────────────────────────────────┘│  │
│              └─────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │ 🏢 Nike India       14 Jan, 11:00 AM    │              │
│  │ ┌───────────────────────────────────┐   │              │
│  │ │ The photos do not meet our       │   │              │
│  │ │ quality standards. Rejecting.     │   │              │
│  │ └───────────────────────────────────┘   │              │
│  └─────────────────────────────────────────┘              │
│                                                            │
│              ┌─────────────────────────────────────────┐  │
│              │       14 Jan, 11:30 AM    ⭐ Priya    │  │
│              │   ┌───────────────────────────────────┐│  │
│              │   │ I followed all requirements!     ││  │
│              │   │ This is unfair.                   ││  │
│              │   └───────────────────────────────────┘│  │
│              └─────────────────────────────────────────┘  │
│                                                            │
│  ┌───────────────────────────────────────────────┐        │
│  │  ● Brand    ● Influencer                      │        │
│  └───────────────────────────────────────────────┘        │
│                    (Legend)                                │
│                                                            │
│  🚫 NO MESSAGE INPUT - READ ONLY                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Action Flow Diagrams

### **Approve Influencer Flow**
```
Admin on Dispute Detail (Open)
        ↓
Taps "Approve Influencer" button
        ↓
Confirmation Alert:
"This will release ₹20,000 to influencer. Continue?"
        ↓ Confirms
Reason Modal Opens
        ↓
Admin types reason (min 10 chars):
"Content meets all requirements. Brand was too strict."
        ↓ Submits
Processing... (button disabled)
        ↓
Service Call: approveInfluencer(disputeId, reason)
        ↓
Mock Data Updated:
  - status: "Open" → "Resolved"
  - resolvedAt: current timestamp
  - adminAction: "Approved Influencer"
  - adminReason: saved
  - walletState.pending: ₹20,000 → ₹0
  - walletState.available: ₹0 → ₹20,000
  - walletState.status: "locked" → "released"
        ↓
Success Alert:
"Influencer approved. Wallet amount released."
        ↓
Navigate Back to Dispute List
        ↓
Dispute now shows "Resolved" badge
```

### **Approve Brand Flow**
```
Admin on Dispute Detail (Open)
        ↓
Taps "Approve Brand" button
        ↓
Confirmation Alert:
"This will refund payment to brand. Continue?"
        ↓ Confirms
Reason Modal Opens
        ↓
Admin types reason (min 10 chars):
"Content quality was significantly below standards."
        ↓ Submits
Processing...
        ↓
Service Call: approveBrand(disputeId, reason)
        ↓
Mock Data Updated:
  - status: "Open" → "Resolved"
  - resolvedAt: current timestamp
  - adminAction: "Approved Brand"
  - adminReason: saved
  - walletState.pending: ₹20,000 → ₹0
  - walletState.available: remains ₹0
  - walletState.status: "locked" → "refunded"
        ↓
Success Alert:
"Brand approved. Payment refunded."
        ↓
Navigate Back to Dispute List
        ↓
Dispute now shows "Resolved" badge
```

### **Reject Dispute Flow**
```
Admin on Dispute Detail (Open)
        ↓
Taps "Reject Dispute" button
        ↓
Reason Modal Opens (no confirmation alert)
        ↓
Admin types reason (min 10 chars):
"Both parties need to resolve this privately. Insufficient evidence."
        ↓ Submits
Processing...
        ↓
Service Call: rejectDispute(disputeId, reason)
        ↓
Mock Data Updated:
  - status: "Open" → "Rejected"
  - resolvedAt: current timestamp
  - adminAction: "Rejected Dispute"
  - adminReason: saved
  - walletState: NO CHANGE (still locked)
        ↓
Success Alert:
"Dispute rejected. No fund movement."
        ↓
Navigate Back to Dispute List
        ↓
Dispute now shows "Rejected" badge
```

---

## 📊 Status Badge Colors

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  OPEN       → 🟠 Orange (#FF9800)                   │
│  RESOLVED   → 🟢 Green (#4CAF50)                    │
│  REJECTED   → 🔴 Red (#F44336)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎭 Dispute Types & Icons

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Content Rejection             → 📄 file-alert      │
│  Fake Rejection                → ⚠️ alert-circle    │
│  Post-Payment Cancellation     → ❌ cancel          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💼 Wallet States

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  LOCKED     → Funds frozen, awaiting decision       │
│  RELEASED   → Funds moved to influencer available   │
│  REFUNDED   → Funds returned to brand               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Key User Interactions

### **List Screen**
1. Pull down → Refresh disputes
2. Type in search → Real-time filtering
3. Tap filter tab → Filter by status
4. Tap dispute card → Navigate to detail

### **Detail Screen**
1. Scroll → View all info
2. Tap evidence link → Open in browser
3. Tap "View Chat History" → Open read-only chat
4. Tap action button → Show reason modal
5. Type reason → Enable submit
6. Tap submit → Process action

### **Chat Screen**
1. Scroll → View message history
2. Notice read-only banner
3. No input field → Cannot send messages

---

## 🔍 Search Capabilities

Searches across:
- Dispute ID (DIS001, DIS002...)
- Brand name (Nike, Myntra, Zomato...)
- Influencer name (Priya, Rahul, Amit...)
- Campaign name (Summer Collection, Fashion Week...)
- Dispute type (Content Rejection, Fake Rejection...)

**Example Searches**:
- "Nike" → Returns DIS001
- "Priya" → Returns DIS001
- "DIS002" → Returns DIS002
- "Content" → Returns DIS001, DIS004
- "Fashion" → Returns DIS002

---

## 🚀 Testing Quick Guide

### **Test Dispute List**
1. Navigate: More Tab → Disputes
2. Verify stats cards show correct counts
3. Search for "Nike" → Should show DIS001
4. Filter by "Open" → Should show 3 disputes
5. Tap DIS001 → Should navigate to detail

### **Test Dispute Detail (Open)**
1. On DIS001 detail screen
2. Verify all info displays correctly
3. Tap "View Chat History" → Should open chat
4. Tap "Approve Influencer"
5. Confirm alert
6. Enter reason "Content is good"
7. Submit → Should show success & navigate back
8. Verify DIS001 now shows "Resolved"

### **Test Chat History**
1. Navigate to dispute detail
2. Tap "View Chat History"
3. Verify read-only banner shows
4. Verify messages display correctly
5. Verify brand messages on left (purple)
6. Verify influencer messages on right (green)
7. Verify no input field present

---

**🎉 Complete Navigation & Flow Documentation Ready!**
