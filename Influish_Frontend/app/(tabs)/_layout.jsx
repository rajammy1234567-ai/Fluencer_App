// REFACTORED: Corrected Influencer tab structure
// EXACTLY 5 TABS - No more, no less
// TAB 1: Home - Dashboard overview
// TAB 2: Chat - Brand conversations  
// TAB 3: Campaigns - Discovery & applied campaigns
// TAB 4: Liked Brands - Saved brands
// TAB 5: Profile - Account & wallet
//
// NOTES:
// - Notifications page exists at app/notifications.jsx (NOT a tab)
// - Accessible via notification icon badge in Home navbar
// - Badge shows unread count and updates dynamically
// - No extra/hidden tabs registered

import React, { useEffect } from "react";
import { Tabs, router } from "expo-router";
import FloatingTabBar from "../../components/bar";
import { storage } from "../../utils/storage";

export default function TabsLayout() {
  useEffect(() => {
    storage.getRole().then(role => {
      if (role === 'brand' || role === 'business') {
        router.replace('/(brand-tabs)/home');
      }
    });
  }, []);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {/* TAB 1: HOME - Dashboard Overview */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIconName: "home",
        }}
      />

      {/* TAB 2: CHAT - Brand Conversations */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIconName: "chatbubbles",
        }}
      />

      {/* TAB 3: CAMPAIGNS - Discovery & Applied */}
      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          tabBarIconName: "megaphone",
        }}
      />

      {/* TAB 4: LIKED BRANDS - Saved Brands */}
      <Tabs.Screen
        name="liked-brands"
        options={{
          title: "Liked",
          tabBarIconName: "heart-circle",
        }}
      />

      {/* TAB 5: PROFILE - Account & Wallet */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIconName: "person",
        }}
      />

      {/* Removed unintended extra tab - Notifications page exists but not rendered as tab */}
    </Tabs>
  );
}
