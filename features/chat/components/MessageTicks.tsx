import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MessageStatus } from "../enums";
import { useTheme } from "@/context/ThemeContext";

export interface MessageTicksProps {
  status: MessageStatus | string;
  size?: number;
  color?: string;
}

export const MessageTicks: React.FC<MessageTicksProps> = ({ status, size = 16, color }) => {
  const { colors } = useTheme();

  // Normalize status
  const normalizedStatus = (status as string).toLowerCase();

  const getIcon = () => {
    switch (normalizedStatus) {
      case "pending":
        return "time-outline";
      case "sent":
        return "checkmark";
      case "delivered":
      case "read":
        return "checkmark-done";
      case "error":
        return "alert-circle";
      default:
        return "time-outline";
    }
  };

  const getColor = () => {
    if (color) return color;

    switch (normalizedStatus) {
      case "read":
        return colors.conviven.orange; // Conviven Orange for read
      case "error":
        return "#EF4444"; // Red for error
      case "pending":
        return "#94A3B8"; // Slate-400 for pending
      default:
        return "#94A3B8"; // Slate-400 for sent/delivered
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name={getIcon()} size={size} color={getColor()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
