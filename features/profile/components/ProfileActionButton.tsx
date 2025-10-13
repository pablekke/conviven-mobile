import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface ProfileActionButtonProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  variant?: "default" | "primary";
  showPlusBadge?: boolean;
  onPress?: () => void;
}

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  icon,
  label,
  variant = "default",
  showPlusBadge = false,
  onPress,
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={isPrimary ? styles.primaryButtonIcon : styles.defaultButtonIcon}>
        <Feather name={icon} size={isPrimary ? 28 : 24} color={isPrimary ? "#ffffff" : "#666666"} />
        {showPlusBadge && (
          <View style={styles.plusIcon}>
            <Text style={styles.plusText}>+</Text>
          </View>
        )}
      </View>
      <Text style={[styles.actionButtonText, isPrimary && styles.primaryButtonText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  defaultButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  primaryButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  plusIcon: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#A0A0A0",
    fontWeight: "500",
    textAlign: "center",
  },
  primaryButtonText: {
    color: "#007BFF",
    fontWeight: "600",
  },
});
