import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    if (options.href === null || (options.href === undefined && !options.tabBarIconName)) {
      return false;
    }
    return options.tabBarIconName !== undefined;
  });

  const activeRoute = state.routes[state.index];

  return (
    <View style={[styles.wrapper, { bottom: 12 + insets.bottom }]}>
      <BlurView intensity={40} tint="dark" style={[styles.container, { backgroundColor: 'rgba(18, 18, 24, 0.95)' }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.04)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowRing} />
        <View style={styles.tabContainer}>
          {visibleRoutes.map((route) => {
            const focused = activeRoute && activeRoute.key === route.key;
            const { options } = descriptors[route.key];
            const icon = options.tabBarIconName;
            const label = options.title;

            if (!icon) return null;

            const onPress = () => {
              if (!focused) navigation.navigate(route.name);
            };

            if (focused) {
              const isDeck = route.name === "campaigns";
              return (
                <LinearGradient
                  key={route.key}
                  colors={isDeck ? COLORS.gradient.sunset : COLORS.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTab}
                >
                  <Ionicons name={isDeck ? "albums" : icon} size={18} color="#FFFFFF" />
                  <Text style={styles.activeLabel}>{isDeck ? "Deck" : label}</Text>
                </LinearGradient>
              );
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.inactiveTab}>
                <Ionicons name={`${icon}-outline`} size={22} color="rgba(255,255,255,0.42)" />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 18,
    right: 18,
  },
  container: {
    height: 70,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.28)",
    backgroundColor: "rgba(18, 18, 24, 0.82)",
    shadowColor: "#6D28FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 14,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  activeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    gap: 4,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  activeLabel: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: FONTS?.medium || "System",
    letterSpacing: 0.2,
  },
  inactiveTab: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
});
