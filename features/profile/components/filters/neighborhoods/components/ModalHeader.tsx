import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../../../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export const ModalHeader = memo(({ title, onClose }: ModalHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.placeholder} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeButton, { backgroundColor: colors.muted }]}
      >
        <Feather name="x" size={20} color={colors.foreground} />
      </TouchableOpacity>
    </View>
  );
});

ModalHeader.displayName = "ModalHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  placeholder: {
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
});
