# Official Reviewer & Test Accounts

This document contains the official reviewer and demo test accounts configured for App Store Connect, Google Play Console evaluation, and team end-to-end testing of the **Fluencer** platform.

---

## 🔐 Reviewer Accounts Overview

All test profiles are configured with verified Indian adult personas, realistic demographics, and complete profile data.

| Account Role | Email | Profile Name | Details & Purpose |
| :--- | :--- | :--- | :--- |
| **Creator (Pro Pass Active)** | `reviewer.creator@fluencer.app` | Pooja Sharma | Female Indian creator, Fashion & Lifestyle. Pre-activated Pro Pass for inspecting unlimited proposals, campaign details, and direct brand messaging. |
| **Brand Manager** | `reviewer.brand@fluencer.app` | Rajesh Kumar | Krishna Fashion Studio brand admin. Can post campaigns, review proposals, accept/reject creator submissions, and manage escrow contracts. |
| **Sandbox Purchase Tester** | `reviewer.purchase@fluencer.app` | Rohan Verma | Male Indian creator, Fitness & Lifestyle. **Non-Pro status** specifically designated for physical device testing of In-App Purchases (StoreKit Sandbox purchase and Restore Purchases). |

---

## 🛡️ Database Safety & Seeding Protocol

Reviewer accounts are seeded using the non-destructive [`seed_reviewer_accounts.mjs`](file:///c:/viz/app/fluencer/Fluencer_App/fluencer_Backend/seed_reviewer_accounts.mjs) utility script.

### Safety Guarantees Built Into the Script:
1. **Host-Only Logging:** The script sanitizes MongoDB connection strings, outputting only the host and database name. Passwords, auth secrets, and full URIs are never printed.
2. **Dry-Run Mode Available:** Run with `--dry-run` to preview actions (`CREATE`, `SKIP`, or `UPDATE`) without writing to the database.
3. **Zero Silent Overwrites:** If an account already exists, the script will skip it and leave existing passwords, roles, and profiles intact.
4. **Purchase Tester Protection:** If `reviewer.purchase@fluencer.app` has already completed a sandbox purchase during testing, re-running the script will **not** reset their Pro status unless `--reset-purchase-tester` is explicitly passed.

---

## 🚀 How to Seed / Verify Accounts

### Step 1: Run Dry-Run (Zero Database Writes)
```powershell
cd c:\viz\app\fluencer\Fluencer_App\fluencer_Backend
node seed_reviewer_accounts.mjs --dry-run
```

### Step 2: Live Seeding via Secure PowerShell Input
To prevent passwords from being recorded in your shell history, supply passwords securely via `Read-Host`:

```powershell
cd c:\viz\app\fluencer\Fluencer_App\fluencer_Backend

# Prompt securely for passwords without echoing to screen or command history
$secCreatorPass = Read-Host -Prompt "Enter password for reviewer.creator@fluencer.app" -AsSecureString
$secBrandPass   = Read-Host -Prompt "Enter password for reviewer.brand@fluencer.app"   -AsSecureString
$secTesterPass  = Read-Host -Prompt "Enter password for reviewer.purchase@fluencer.app" -AsSecureString

$env:REVIEWER_CREATOR_PASSWORD  = [System.Net.NetworkCredential]::new("", $secCreatorPass).Password
$env:REVIEWER_BRAND_PASSWORD    = [System.Net.NetworkCredential]::new("", $secBrandPass).Password
$env:REVIEWER_PURCHASE_PASSWORD = [System.Net.NetworkCredential]::new("", $secTesterPass).Password

# Run live seeding with explicit confirmation flag
node seed_reviewer_accounts.mjs --confirm-live-seed

# Clear environment variables immediately after run
Remove-Item Env:\REVIEWER_CREATOR_PASSWORD
Remove-Item Env:\REVIEWER_BRAND_PASSWORD
Remove-Item Env:\REVIEWER_PURCHASE_PASSWORD
```

---

## 📱 App Store & Play Store Review Notes

When submitting the app in **App Store Connect** (under *App Review Information*) or **Google Play Console** (under *App Access*), provide:

1. **Creator Review Account:**
   - **User Name / Email:** `reviewer.creator@fluencer.app`
   - **Password:** `<Password chosen during seeding>`
   - **Notes:** Use this account to review full creator capabilities including browsing live campaigns, submitting proposals, and chatting with brands.

2. **Brand Review Account:**
   - **User Name / Email:** `reviewer.brand@fluencer.app`
   - **Password:** `<Password chosen during seeding>`
   - **Notes:** Use this account to test brand campaign management, reviewing submitted influencer proposals, and managing contracts.

3. **In-App Purchase Testing:**
   - If Apple Review team conducts an end-to-end Sandbox purchase, they may log into `reviewer.purchase@fluencer.app` to see the un-upgraded state, tap "Unlock Pro Pass" (available in Campaigns or Liked Brands tab), complete StoreKit Sandbox purchase, and verify Restore Purchases.

