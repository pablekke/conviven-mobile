import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

function CustomTabBar(props: BottomTabBarProps) {
  return (
    <View style={tabBarStyles.wrapper}>
      <BottomTabBar {...props} />
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    borderTopColor: "transparent",
    // 👇 importante: no recortes el contenido
    // overflow: "hidden",
  },
  bar: {
    height: 70,
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    borderTopColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  background: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  const { colors } = useTheme();

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
        tabBarBackground: () => <View style={tabBarStyles.background} />,
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
