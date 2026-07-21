# Notifications & Settings - Quick Navigation Guide

## 🗺️ Screen Routes & User Flows

---

## Notifications Screen Flow

### **Route:** `/(admin)/notifications`

```
Admin Panel Home
      ↓
More Tab → Notifications
      ↓
┌─────────────────────────────────────────────────┐
│  NOTIFICATIONS SCREEN                           │
│─────────────────────────────────────────────────│
│  Header: 🔔 Notifications      [📤 Send]        │
│                                                 │
│  Stats Cards (Scroll Horizontally):             │
│  [📊 15 Total] [⭐ 8 Influencers] [🏢 5 Brands]│
│  [👤 2 Specific] [🕒 3 Last 7D]                │
│                                                 │
│  🔍 Search: [Type to search...]        [×]      │
│                                                 │
│  Filters: [All 15] [Influencers 8] [Brands 5]  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔔 NOTIF001               [✓ Sent]       │ │
│  │ Welcome to Influish Platform             │ │
│  │ We are excited to have you on board!...  │ │
│  │ ● All Influencers 👥 1247  🕒 2 days ago │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [15 more notification cards...]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Send Notification Flow

```
Notifications Screen
      ↓ [Tap "Send" button]
      ↓
┌─────────────────────────────────────────────────┐
│  SEND NOTIFICATION MODAL (Full Screen)          │
│─────────────────────────────────────────────────│
│  [×]   Send Notification                        │
│                                                 │
│  Target Audience                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ▼ All Influencers                       │  │
│  └─────────────────────────────────────────┘  │
│     Options: All Influencers, All Brands,      │
│              Specific Influencer, Specific Brand│
│                                                 │
│  [IF Specific Influencer selected:]            │
│  Select Influencer                              │
│  ┌─────────────────────────────────────────┐  │
│  │ ▼ Choose an influencer...               │  │
│  └─────────────────────────────────────────┘  │
│     Options: Priya Sharma, Rahul Verma, etc.   │
│                                                 │
│  Title                                          │
│  ┌─────────────────────────────────────────┐  │
│  │ Platform Update                         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Message                                        │
│  ┌─────────────────────────────────────────┐  │
│  │ We have rolled out new features for    │  │
│  │ better campaign management...           │  │
│  │                                         │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│  145/500                                        │
│                                                 │
│  Preview                                        │
│  ┌─────────────────────────────────────────┐  │
│  │ 🔔  Platform Update                     │  │
│  │     We have rolled out new features...  │  │
│  │     To: All Influencers                 │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │      [📤 Send Notification]             │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
      ↓ [Tap "Send Notification"]
      ↓
  ⚠️ Confirm Send
  Send notification to All Influencers?
      [Cancel]  [Send]
      ↓ [Tap "Send"]
      ↓
  💾 Sending... (loading state)
      ↓
  ✅ Success
  Notification sent successfully!
      ↓
  Modal closes, notification history updates
```

---

## Settings Screen Flow

### **Route:** `/(admin)/settings`

```
Admin Panel Home
      ↓
More Tab → Settings
      ↓
┌─────────────────────────────────────────────────┐
│  SETTINGS SCREEN                                │
│─────────────────────────────────────────────────│
│  Header: ⚙️ Global Settings                    │
│          🕒 Last updated: 20 Jan, 10:00 AM      │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  💰 PLATFORM SETTINGS                           │
│  Configure platform-wide financial settings.    │
│  Changes apply to new transactions only.        │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [%] Platform Commission Percentage      │  │
│  │     Commission charged on new campaigns  │  │
│  │     ┌──────────────────────┐            │  │
│  │     │        20           %│            │  │
│  │     └──────────────────────┘            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [₹] Minimum Withdrawal Amount           │  │
│  │     Minimum amount influencers can...    │  │
│  │     ┌──────────────────────┐            │  │
│  │     │       500           ₹│            │  │
│  │     └──────────────────────┘            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [#] Max Campaigns Per Brand (Optional)  │  │
│  │     Leave empty for unlimited           │  │
│  │     ┌──────────────────────┐            │  │
│  │     │ Unlimited            │            │  │
│  │     └──────────────────────┘            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🛡️ SECURITY SETTINGS                          │
│  Emergency controls. Use with caution.          │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [✓] Enable Withdrawals      [ ON  ●]   │  │
│  │     Allow influencers to request...     │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [✓] Enable Campaign Creation [ ON  ●]  │  │
│  │     Allow brands to create new...       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  📱 APP SETTINGS                                │
│  App-wide configurations and maintenance.       │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [🔧] Maintenance Mode       [OFF ○]    │  │
│  │      Block all user access             │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [⚠️] Show Notice Banner     [OFF ○]    │  │
│  │      Display notice to all users       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ⚠️ IMPORTANT                                  │
│  • Changes apply only to NEW actions           │
│  • Existing deals are NOT affected             │
│  • All changes are logged for audit            │
│                                                 │
└─────────────────────────────────────────────────┘

[NO CHANGES YET - SaveBar hidden]
```

---

## Settings Save Flow

```
Settings Screen
      ↓ [Admin changes commission to 18%]
      ↓
┌─────────────────────────────────────────────────┐
│  SETTINGS SCREEN (with SaveBar)                 │
│─────────────────────────────────────────────────│
│  [All settings sections as above...]            │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ [%] Platform Commission Percentage      │  │
│  │     ┌──────────────────────┐            │  │
│  │     │        18           %│  ← Changed │  │
│  │     └──────────────────────┘            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [Rest of settings...]                          │
│                                                 │
├─────────────────────────────────────────────────┤
│ ⚠️ SAVEBAR (Animated slide-in)                 │
│ ⚠️ You have unsaved changes                    │
│                     [Discard]  [💾 Save]       │
└─────────────────────────────────────────────────┘
      ↓ [Tap "Save"]
      ↓
┌─────────────────────────────────────────────────┐
│  CONFIRMATION MODAL (Overlay)                   │
│─────────────────────────────────────────────────│
│  ┌───────────────────────────────────────────┐ │
│  │ ⚠️ Confirm Settings Change                │ │
│  │                                           │ │
│  │ Are you sure you want to save these      │ │
│  │ changes?                                  │ │
│  │                                           │ │
│  │ ┌───────────────────────────────────────┐│ │
│  │ │ Impact:                               ││ │
│  │ │                                       ││ │
│  │ │ All NEW campaigns will have 18%       ││ │
│  │ │ platform commission. Existing         ││ │
│  │ │ campaigns are not affected.           ││ │
│  │ └───────────────────────────────────────┘│ │
│  │                                           │ │
│  │  [Cancel]          [✓ Confirm]           │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
      ↓ [Tap "Confirm"]
      ↓
  💾 Saving... (button loading state)
      ↓
  ✅ Success
  Settings saved successfully!
      ↓
  Settings updated, SaveBar disappears
```

---

## Settings Discard Flow

```
Settings Screen (with unsaved changes)
      ↓ [Tap "Discard" in SaveBar]
      ↓
  ⚠️ Discard Changes
  Are you sure you want to discard all
  unsaved changes?
      [Cancel]  [Discard]
      ↓ [Tap "Discard"]
      ↓
  All values reset to original
  SaveBar disappears
```

---

## Settings Validation Flow

```
Settings Screen
      ↓ [Admin enters invalid commission: 75%]
      ↓
┌─────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────┐  │
│  │ [%] Platform Commission Percentage      │  │
│  │     ┌──────────────────────┐            │  │
│  │     │        75           %│            │  │
│  │     └──────────────────────┘            │  │
│  │     ⚠️ Commission must be between 0-50% │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
      ↓ [Tap "Save"]
      ↓
  ⚠️ Validation Error
  Please fix the errors before saving
      [OK]
      ↓
  User must correct the value
```

---

## Color Coding

### Notifications

| Element | Color | Usage |
|---------|-------|-------|
| All Influencers | 🟢 Green | Badge, stats card |
| All Brands | 🔵 Blue | Badge, stats card |
| Specific Influencer | 🟠 Orange | Badge |
| Specific Brand | 🟣 Purple | Badge |
| Sent Status | 🟢 Green | Status badge |

### Settings

| Element | Color | Usage |
|---------|-------|-------|
| Platform Settings | 🟢 Green | Section icon |
| Security Settings | 🔴 Red | Section icon, warnings |
| App Settings | 🟣 Purple | Section icon |
| SaveBar | 🟠 Orange | Warning icon |
| Save Button | 🟢 Green | Action button |
| Discard Button | ⚪ Gray | Action button |

---

## Icon Reference

### Notifications
- `bell-ring` - Screen title, notifications
- `send` - Send button
- `account-star` - Influencers
- `office-building` - Brands
- `account-check` - Specific users
- `clock-outline` - Last 7 days, timestamps
- `magnify` - Search
- `close-circle` - Clear search
- `bell-off` - Empty state

### Settings
- `cog` - Screen title
- `currency-inr` - Platform settings
- `percent` - Commission
- `cash` - Withdrawal amount
- `counter` - Max campaigns
- `shield-check` - Security section
- `cash-check` - Withdrawals toggle
- `plus-circle` - Campaign creation toggle
- `application-cog` - App settings
- `wrench` - Maintenance mode
- `alert` - Notice banner
- `message-text` - Notice message
- `alert-circle` - Warning box, confirmation
- `content-save` - Save button
- `check` - Confirm button

---

## Testing User Journeys

### Journey 1: Send Broadcast Notification
1. Navigate to Notifications screen
2. Tap "Send" button
3. Keep "All Influencers" selected
4. Enter title: "New Feature Released"
5. Enter message: "Check out our new campaign dashboard!"
6. Review preview
7. Tap "Send Notification"
8. Confirm in alert
9. Verify notification appears in history with 1247 recipients

**Expected:** Notification sent, history updated, modal closed

---

### Journey 2: Send Specific Notification
1. Navigate to Notifications screen
2. Tap "Send" button
3. Select "Specific Influencer"
4. Choose "Priya Sharma" from dropdown
5. Enter title: "Account Verification"
6. Enter message: "Please verify your recent activity"
7. Review preview (shows "To: Priya Sharma")
8. Tap "Send Notification"
9. Confirm in alert
10. Verify notification appears with 1 recipient

**Expected:** Targeted notification sent successfully

---

### Journey 3: Change Commission Rate
1. Navigate to Settings screen
2. Note current commission: 20%
3. Tap commission input, change to "18"
4. Observe SaveBar slide in
5. Tap "Save"
6. Read impact message in confirmation modal
7. Tap "Confirm"
8. Wait for success message
9. Verify commission updated to 18%
10. Verify SaveBar disappeared

**Expected:** Commission updated, audit logged

---

### Journey 4: Enable Maintenance Mode
1. Navigate to Settings screen
2. Scroll to App Settings section
3. Tap "Maintenance Mode" toggle (OFF → ON)
4. Observe warning styling (red icon)
5. Observe SaveBar appear
6. Tap "Save"
7. Read impact: "⚠️ WARNING: App will enter maintenance mode..."
8. Tap "Confirm"
9. Verify toggle stays ON
10. Verify SaveBar disappeared

**Expected:** Maintenance mode enabled, warning displayed

---

### Journey 5: Discard Changes
1. Navigate to Settings screen
2. Change commission to "15"
3. Change min withdrawal to "1000"
4. Observe SaveBar appear
5. Tap "Discard"
6. Confirm in alert
7. Verify commission reset to "20"
8. Verify min withdrawal reset to "500"
9. Verify SaveBar disappeared

**Expected:** All changes discarded, values restored

---

**🎉 Navigation Guide Complete!**
