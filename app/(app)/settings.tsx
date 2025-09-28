import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

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
        <Text className="text-base font-conviven-semibold text-foreground">{title}</Text>
        {description && (
          <Text className="text-sm font-conviven text-muted-foreground mt-1">{description}</Text>
        )}
      </View>
      {showToggle && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.muted, true: colors.conviven.blue }}
          thumbColor={value ? colors.primary : colors.card}
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
  const [notifications, setNotifications] = React.useState(true);

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

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6 gap-6">
        <View>
          <Text className="px-4 pb-2 text-sm font-conviven-semibold text-muted-foreground uppercase">
            Preferences
          </Text>
          <View className="bg-card rounded-2xl border border-border">
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              showToggle
              showArrow={false}
              value={notifications}
              onValueChange={setNotifications}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              showToggle
              showArrow={false}
              value={theme === "dark"}
              onValueChange={value => setTheme(value ? "dark" : "light")}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="language-outline"
              title="Language"
              onPress={() => Alert.alert("Language", "Change language option would appear here")}
              description="English"
            />
          </View>
        </View>

        <View>
          <Text className="px-4 pb-2 text-sm font-conviven-semibold text-muted-foreground uppercase">
            Account
          </Text>
          <View className="bg-card rounded-2xl border border-border">
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              onPress={() => Alert.alert("Edit Profile", "Profile edit screen would appear here")}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() =>
                Alert.alert("Change Password", "Password change screen would appear here")
              }
            />
            <View className="h-px bg-border mx-4" />
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
          <Text className="px-4 pb-2 text-sm font-conviven-semibold text-muted-foreground uppercase">
            Support
          </Text>
          <View className="bg-card rounded-2xl border border-border">
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => Alert.alert("Help Center", "Help center screen would appear here")}
            />
            <View className="h-px bg-border mx-4" />
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
