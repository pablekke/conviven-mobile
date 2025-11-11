import { View, Text, Platform, StyleSheet } from "react-native";

interface PillProps {
  children: React.ReactNode;
}

export function Pill({ children }: PillProps) {
  const shadowStyle =
    Platform.OS === "ios"
      ? styles.shadowIOS
      : Platform.OS === "android"
        ? styles.shadowAndroid
        : null;

  return (
    <View style={[styles.container, shadowStyle]}>
      <Text className="font-light" style={styles.label} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: "#e8f1ff",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  label: {
    color: "#1d4ed8",
    fontSize: 13,
  },
  shadowIOS: {
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  shadowAndroid: {
    elevation: 2,
  },
});
