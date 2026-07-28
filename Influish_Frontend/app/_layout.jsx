import 'react-native-reanimated';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { isAuthenticated } from "../utils/storage";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";

// Suppress ExponentImagePicker web warning globally
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ExponentImagePicker')) {
      return;
    }
    originalWarn(...args);
  };
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    // Check if user is logged in from storage
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await isAuthenticated();
    setIsLoggedIn(authenticated);
  };

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        <Stack screenOptions={{ headerShown: false, animationEnabled: true }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(brand-tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="selected-brands" />
          <Stack.Screen name="conversation" options={{ headerShown: false }} />
          <Stack.Screen name="applications" />
          <Stack.Screen name="wallet" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="brand-notifications" />
          <Stack.Screen name="brand-onboarding" />
        </Stack>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
