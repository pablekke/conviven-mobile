import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";

interface PrimaryPhotoSectionProps {
  children: React.ReactNode;
}

export const PrimaryPhotoSection: React.FC<PrimaryPhotoSectionProps> = ({ children }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Foto Principal</Text>
      <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>
        Esta es la foto que los demás verán primero
      </Text>
      <View style={styles.primaryPhotoSection}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 16,
  },
  primaryPhotoSection: {
    alignItems: "center",
    marginTop: 8,
  },
});
