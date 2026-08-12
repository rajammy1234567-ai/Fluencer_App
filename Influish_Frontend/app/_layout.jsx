import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { isAuthenticated } from "../utils/storage";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";

// Suppress ExponentImagePicker web proxy warning & verbose debug noise globally across all components
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const isTarget = (msg) => typeof msg === 'string' && (msg.includes('ExponentImagePicker') || msg.includes('NativeModules') || msg.includes('pointerEvents') || msg.includes('resizeMode'));
  
  const origWarn = window.console.warn;
  window.console.warn = function (...args) {
    if (isTarget(args[0])) return;
    if (origWarn) origWarn.apply(window.console, args);
  };

  const origError = window.console.error;
  window.console.error = function (...args) {
    if (isTarget(args[0])) return;
    if (origError) origError.apply(window.console, args);
  };

  const origLog = window.console.log;
  window.console.log = function (...args) {
    const first = String(args[0] || '');
    if (
      first.includes('Campaigns Response:') ||
      first.includes('Fetching campaigns from:') ||
      first.includes('Auth headers:') ||
      first.includes('Fetching influencer profile from:') ||
      first.includes('Influencer profile response:') ||
      first.includes('Fetching brand profile') ||
      first.includes('Brand profile response') ||
      first.includes('Response status:') ||
      first.includes('Response text:') ||
      first.includes('🌐 API Call:') ||
      first.includes('📤 Request:') ||
      first.includes('📥 Response') ||
      first.includes('Not allowed to load local resource')
    ) {
      return;
    }
    if (origLog) origLog.apply(window.console, args);
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
        <Stack screenOptions={{ headerShown: false, animationEnabled: true, contentStyle: { backgroundColor: '#0B0B10' } }}>
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
