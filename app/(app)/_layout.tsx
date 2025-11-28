import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useSegments } from "expo-router";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

function CustomTabBar(props: BottomTabBarProps) {
  const segments = useSegments();
  const currentRoute = segments.join("/");
  const shouldHideTabBar =
    currentRoute.includes("conversation") ||
    currentRoute.includes("edit-profile") ||
    currentRoute.includes("settings");

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View style={tabBarStyles.wrapper}>
      <BottomTabBar {...props} />
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderTopColor: "transparent",
  },
  bar: {
    height: 70,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderTopColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  blurOverlayLight: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  blurOverlayDark: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function AppLayout() {
  const { colors, isDark } = useTheme();

  const getTabBarIcon = (name: keyof typeof Ionicons.glyphMap) => {
    return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
      const primaryColor = colors.primary ?? "#2563EB";
      const iconColor = focused ? primaryColor : color;
      const backgroundColor = focused ? `${primaryColor}22` : "transparent";

      return (
        <View style={[tabBarStyles.iconContainer, { backgroundColor }]}>
          <Ionicons name={name} size={focused ? size + 2 : size} color={iconColor} />
        </View>
      );
    };
  };

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarStyle: tabBarStyles.bar,
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              tabBarStyles.blurBackground,
              isDark ? tabBarStyles.blurOverlayDark : tabBarStyles.blurOverlayLight,
            ]}
          />
        ),
        sceneStyle: {
          backgroundColor: "transparent",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Descubre",
          tabBarIcon: getTabBarIcon("home-outline"),
          tabBarLabel: "Descubre",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: getTabBarIcon("chatbubbles-outline"),
          tabBarLabel: "Roomies",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: getTabBarIcon("person-circle-outline"),
          tabBarLabel: "Perfil",
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="conversation/[id]" options={{ href: null }} />
      <Tabs.Screen name="edit-profile/index" options={{ href: null }} />
    </Tabs>
  );
}
