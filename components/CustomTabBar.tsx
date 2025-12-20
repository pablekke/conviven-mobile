import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSegments } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { useTheme } from "../context/ThemeContext";

export function CustomTabBar(props: BottomTabBarProps) {
  const segments = useSegments();
  const currentRoute = segments.join("/");
  const { isDark } = useTheme();
  const shouldHideTabBar =
    currentRoute.includes("conversation") ||
    currentRoute.includes("profile/edit-profile") ||
    currentRoute.includes("profile/filters") ||
    currentRoute.includes("profile/photos") ||
    currentRoute.includes("settings");

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View style={tabBarStyles.wrapper} collapsable={false}>
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={tabBarStyles.blurBackground}
      />
      <View style={tabBarStyles.tabBarContent}>
        <BottomTabBar {...props} style={tabBarStyles.transparentBar} />
      </View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContent: {
    backgroundColor: "transparent",
    zIndex: 1,
  },
  transparentBar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDump: {
    width: 36,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
});
