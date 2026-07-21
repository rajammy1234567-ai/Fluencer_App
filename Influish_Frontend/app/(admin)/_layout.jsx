import { Stack } from 'expo-router';
import { COLORS } from '../../constants/colors';
import AdminAuthGuard from '../../src/admin/guards/AdminAuthGuard';

/**
 * Admin Navigation Layout
 * Handles routing for all admin screens with tabs and standalone pages
 * 
 * SECURITY:
 * - Protected by AdminAuthGuard to prevent unauthorized access
 * - Redirects to login if admin is not authenticated
 * - Login screen is accessible without authentication
 */
export default function AdminLayout() {
  return (
    <AdminAuthGuard>
      <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          title: 'Admin Login'
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          title: 'Admin Panel'
        }} 
      />
      <Stack.Screen 
        name="influencers" 
        options={{ 
          headerShown: false,
          title: 'Influencers'
        }} 
      />
      <Stack.Screen 
        name="brands" 
        options={{ 
          headerShown: false,
          title: 'Brands'
        }} 
      />
      <Stack.Screen 
        name="influencer-detail" 
        options={{ 
          headerShown: false,
          title: 'Influencer Details'
        }} 
      />
      <Stack.Screen 
        name="brand-detail" 
        options={{ 
          headerShown: false,
          title: 'Brand Details'
        }} 
      />
      <Stack.Screen 
        name="withdrawals" 
        options={{ 
          headerShown: false,
          title: 'Withdrawals'
        }} 
      />
      <Stack.Screen 
        name="disputes" 
        options={{ 
          headerShown: false,
          title: 'Disputes'
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          headerShown: false,
          title: 'Notifications'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: 'Settings'
        }} 
      />
    </Stack>
    </AdminAuthGuard>
  );
}
