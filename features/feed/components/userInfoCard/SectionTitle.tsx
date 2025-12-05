import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <View style={styles.sectionTitleWrap}>
    <Text style={styles.sectionTitleText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionTitleWrap: {
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitleText: {
    color: "#1E3A8A",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: -0.4,
  },
});
