import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  // Filter out hidden routes (href: null) and ensure exactly 5 tabs
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    // Exclude if href is explicitly null/undefined or if no tabBarIconName exists
    if (options.href === null || options.href === undefined && !options.tabBarIconName) {
      return false;
    }
    return options.tabBarIconName !== undefined;
  });

  // Check if we are on the campaigns tab to apply special styling
  const isCampaignsTab = state.routes[state.index].name === 'campaigns';

  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[
        styles.container,
        { bottom: 10 + insets.bottom },
      ]}
    >
      <View style={styles.tabContainer}>
        {visibleRoutes.map((route, index) => {
        const focused = state.index === state.routes.indexOf(route);
        const { options } = descriptors[route.key];

        const icon = options.tabBarIconName;
        const label = options.title;

        // Skip if no icon is defined
        if (!icon) return null;

        const onPress = () => {
          if (!focused) navigation.navigate(route.name);
        };

        if (focused) {
          return (
            <LinearGradient
              key={route.key}
              colors={['#3b82f6', '#3b82f6']}
              style={styles.activeTab}
            >
              <Ionicons
                name={icon}
                size={24}
                color={COLORS.textWhite}
              />
              <Text style={styles.activeLabel}>{label}</Text>
            </LinearGradient>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.inactiveTab}
          >
            <Ionicons
              name={`${icon}-outline`}
              size={24}
              color="#7C7474"
            />
          </Pressable>
        );
      })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    shadowColor: 'rgba(255, 107, 107, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  // containerCampaigns removed
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
// ... rest of styles


  activeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 24,
  },

  activeLabel: {
    marginLeft: 6,
    color: COLORS.textWhite,
    fontSize: 13,
    fontFamily: FONTS?.medium || 'System',
  },

  inactiveTab: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
