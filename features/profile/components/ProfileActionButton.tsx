import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={[styles.iconContainer, isPrimary ? styles.primaryIcon : styles.defaultIcon]}>
        <Feather name={icon} size={24} color={isPrimary ? "#ffffff" : "#64748B"} />
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
    minWidth: 70,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  defaultIcon: {
    backgroundColor: "#F1F5F9",
  },
  primaryIcon: {
    backgroundColor: "#007BFF",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  plusIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  plusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  primaryButtonText: {
    color: "#007BFF",
    fontFamily: "Inter-SemiBold",
  },
});
