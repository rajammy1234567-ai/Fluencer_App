import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to splash screen on app startup
  return <Redirect href="/splash" />;
}
