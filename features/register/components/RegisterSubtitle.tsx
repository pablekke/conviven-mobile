import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const RegisterSubtitle: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Completá tus datos para comenzar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter",
    opacity: 0.9,
  },
});
