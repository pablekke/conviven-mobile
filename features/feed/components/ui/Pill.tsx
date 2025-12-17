import { View, Text, Platform, StyleSheet } from "react-native";

interface PillProps {
  children: React.ReactNode;
}

export function Pill({ children }: PillProps) {
  return (
    <View style={[styles.base]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 7 : 6,
    borderRadius: 24,
    backgroundColor: "#e8f1ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    marginRight: 8,
    marginBottom: 8,
    shadowColor: Platform.OS === "ios" ? "#1d4ed8" : undefined,
    shadowOpacity: Platform.OS === "ios" ? 0.12 : undefined,
    shadowRadius: Platform.OS === "ios" ? 10 : undefined,
    shadowOffset: Platform.OS === "ios" ? { width: 0, height: 6 } : undefined,
    elevation: Platform.OS === "android" ? 2 : undefined,
  },
  text: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

