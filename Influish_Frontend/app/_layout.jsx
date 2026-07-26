import 'react-native-reanimated';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/storage";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";

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
      </Stack>
    </GlobalErrorBoundary>
  );
}
