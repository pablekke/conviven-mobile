import React from "react";
import { View, StyleSheet } from "react-native";

export const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    marginVertical: 6,
  },
});

