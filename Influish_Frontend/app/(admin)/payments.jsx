/**
 * PaymentsScreen - REDIRECT
 * Redirects to tab-based payments screen
 */

import { Redirect } from 'expo-router';

export default function PaymentsRedirect() {
  return <Redirect href="/(admin)/(tabs)/payments" />;
}
