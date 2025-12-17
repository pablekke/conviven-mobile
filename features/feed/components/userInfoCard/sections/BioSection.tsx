import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BioSectionProps {
  bio?: string;
}

export const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  if (!bio) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.bioText}>{bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  icon: {
    fontSize: 20,
  },
  bioText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#1E293B",
    fontWeight: "400",
    letterSpacing: 0.1,
  },
});

