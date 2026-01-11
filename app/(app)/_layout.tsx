import { CustomTabBar } from "../../components/CustomTabBar";
import { useTheme } from "../../context/ThemeContext";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const iconStyles = StyleSheet.create({
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

export default function AppLayout() {
  const { colors } = useTheme();

  const getTabBarIcon = (name: keyof typeof Ionicons.glyphMap) => {
    return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
      const primaryColor = colors.primary ?? "#2563EB";
      const iconColor = focused ? primaryColor : color;
      const backgroundColor = focused ? `${primaryColor}22` : "transparent";

      return (
        <View style={iconStyles.iconDump}>
          <View style={[iconStyles.iconContainer, { backgroundColor }]}>
            <Ionicons name={name} size={focused ? size + 2 : size} color={iconColor} />
          </View>
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
        lazy: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarStyle: {
          height: 70,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => null,
        tabBarHideOnKeyboard: true,
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
      <Tabs.Screen name="conversation/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/edit-profile/index" options={{ href: null }} />
      <Tabs.Screen name="profile/photos/index" options={{ href: null }} />
      <Tabs.Screen name="profile/filters/index" options={{ href: null }} />
    </Tabs>
  );
}

