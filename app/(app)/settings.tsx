import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  showToggle?: boolean;
  showArrow?: boolean;
  description?: string;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  onPress,
  value,
  onValueChange,
  showToggle = false,
  showArrow = true,
  description,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 ${description ? "items-start" : "items-center"}`}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 items-center">
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-conviven-semibold" style={{ color: colors.foreground }}>
          {title}
        </Text>
        {description && (
          <Text className="text-sm font-conviven mt-1" style={{ color: colors.mutedForeground }}>
            {description}
          </Text>
        )}
      </View>
      {showToggle && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? colors.primaryForeground : colors.card}
        />
      )}
      {showArrow && !showToggle && (
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => logout(),
        style: "destructive",
      },
    ]);
  };

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View className="px-4 py-6 gap-6">
        <View>
          <Text
            style={{ color: colors.mutedForeground }}
            className="px-4 pb-2 text-sm font-conviven-semibold uppercase"
          >
            Preferences
          </Text>
          <View
            className="rounded-2xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              showToggle
              showArrow={false}
              value={notifications}
              onValueChange={setNotifications}
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              showToggle
              showArrow={false}
              value={theme === "dark"}
              onValueChange={value => setTheme(value ? "dark" : "light")}
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingItem
              icon="language-outline"
              title="Language"
              onPress={() => Alert.alert("Language", "Change language option would appear here")}
              description="English"
            />
          </View>
        </View>

        <View>
          <Text
            style={{ color: colors.mutedForeground }}
            className="px-4 pb-2 text-sm font-conviven-semibold uppercase"
          >
            Account
          </Text>
          <View
            className="rounded-2xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              onPress={() => Alert.alert("Edit Profile", "Profile edit screen would appear here")}
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() =>
                Alert.alert("Change Password", "Password change screen would appear here")
              }
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy Settings"
              onPress={() =>
                Alert.alert("Privacy Settings", "Privacy settings screen would appear here")
              }
            />
          </View>
        </View>

        <View>
          <Text
            style={{ color: colors.mutedForeground }}
            className="px-4 pb-2 text-sm font-conviven-semibold uppercase"
          >
            Support
          </Text>
          <View
            className="rounded-2xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => Alert.alert("Help Center", "Help center screen would appear here")}
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingItem
              icon="chatbubble-outline"
              title="Contact Us"
              onPress={() => Alert.alert("Contact Us", "Contact form would appear here")}
            />
          </View>
        </View>

        <Button label="Logout" onPress={handleLogout} variant="danger" />
      </View>
    </ScrollView>
  );
}
