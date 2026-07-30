import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

export default function BrandTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const safeBottomInset = insets && Number.isFinite(insets.bottom) ? insets.bottom : 0;

  const visibleRoutes = state.routes
    ? state.routes.filter((route) => {
        const { options } = descriptors[route.key] || {};
        if (options.href === null) return false;
        return typeof options.tabBarIcon === 'function';
      })
    : [];

  const activeRoute = state.routes[state.index];

  return (
    <View style={[styles.wrapper, { bottom: 12 + safeBottomInset }]}>
      <BlurView intensity={40} tint="dark" style={[styles.container, { backgroundColor: 'rgba(18, 18, 24, 0.95)' }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.04)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.tabContainer}>
          {visibleRoutes.map((route) => {
            const focused = activeRoute && activeRoute.key === route.key;
            const { options } = descriptors[route.key] || {};
            const icon = options.tabBarIcon;
            const label = options.title || route.name;

            const onPress = () => {
              if (!focused) navigation.navigate(route.name);
            };

            if (focused) {
              return (
                <View key={route.key} style={styles.activeTabShadow}>
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    style={styles.activeTab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {typeof icon === 'function' && icon({ color: "#FFFFFF", size: 20 })}
                    <Text style={styles.activeLabel}>{label}</Text>
                  </LinearGradient>
                </View>
              );
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.inactiveTab}>
                {typeof icon === 'function' && icon({ color: "rgba(255,255,255,0.42)", size: 22 })}
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
    height: 72,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.28)",
    shadowColor: "#6D28FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 14,
    backgroundColor: "rgba(18, 18, 24, 0.82)",
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  activeTabShadow: {
    borderRadius: 22,
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  activeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 22,
    gap: 6,
  },
  activeLabel: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    height: 46,
  },
});
