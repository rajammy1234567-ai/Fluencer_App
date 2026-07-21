/**
 * AdminDashboardScreen - REDIRECT
 * This file redirects to the tab-based dashboard
 * The actual dashboard is now at (admin)/(tabs)/dashboard.jsx
 */

import { Redirect } from 'expo-router';

export default function DashboardRedirect() {
  return <Redirect href="/(admin)/(tabs)/dashboard" />;
}
