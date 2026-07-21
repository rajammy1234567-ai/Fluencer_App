import { View, Text, Pressable, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

// Premium clean white theme colors
const THEME = {
  gradientStart: '#FFFFFF',
  gradientMid: '#F8FAFC',
  gradientEnd: '#EDF2F7',
  blue: '#3B82F6',
  blueLight: '#93C5FD',
  blueDark: '#2563EB',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  text: '#1F2937',
  textLight: '#6B7280',
};

export default function BrandTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  // Filter out hidden routes (href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  return (
    <View style={[styles.wrapper, { bottom: 12 + insets.bottom }]}>
      <Shadow
        distance={15}
        startColor="rgba(0, 0, 0, 0.08)"
        endColor="rgba(0, 0, 0, 0)"
        offset={[0, 4]}
        style={styles.shadowContainer}
      >
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            {visibleRoutes.map((route, index) => {
              const focused = state.index === state.routes.indexOf(route);
              const { options } = descriptors[route.key];

              const icon = options.tabBarIcon;
              const label = options.title;

              const onPress = () => {
                if (!focused) navigation.navigate(route.name);
              };

              if (focused) {
                return (
                  <Shadow
                    key={route.key}
                    distance={6}
                    startColor="rgba(59, 130, 246, 0.15)"
                    endColor="rgba(59, 130, 246, 0)"
                    offset={[0, 2]}
                    style={styles.activeTabShadow}
                  >
                    <LinearGradient
                      colors={[THEME.blue, THEME.blueDark]}
                      style={styles.activeTab}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {icon && icon({ color: '#FFFFFF', size: 22 })}
                      <Text style={styles.activeLabel}>{label}</Text>
                    </LinearGradient>
                  </Shadow>
                );
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.inactiveTab}
                >
                  {icon && icon({ color: THEME.textLight, size: 22 })}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  shadowContainer: {
    width: '100%',
  },
  container: {
    height: 75,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  activeTabShadow: {
    borderRadius: 24,
  },
  activeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 25,
  },
  activeLabel: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 50,
  },
});
