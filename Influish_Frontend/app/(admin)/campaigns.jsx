/**
 * CampaignListScreen - REDIRECT
 * Redirects to tab-based campaigns screen
 */

import { Redirect } from 'expo-router';

export default function CampaignsRedirect() {
  return <Redirect href="/(admin)/(tabs)/campaigns" />;
}
