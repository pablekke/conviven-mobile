import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { useTheme } from "../../context/ThemeContext";

/**
 * This is the layout for the authenticated app with tab navigation
 */
export default function AppLayout() {
  const { colors } = useTheme();

  const getTabBarIcon = (name: keyof typeof Ionicons.glyphMap) => {
    return ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={name} size={size} color={color} />
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          paddingVertical: 5,
          backgroundColor: colors.sidebarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.sidebarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
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
          tabBarLabel: "Chats",
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
    </Tabs>
  );
}
