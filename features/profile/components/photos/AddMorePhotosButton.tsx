import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export const AddMorePhotosButton: React.FC = () => {
  return (
    <>
      <View style={styles.addMoreIconContainer}>
        <Feather name="plus" size={18} color="#000000" />
      </View>
      <Text style={styles.addMoreButtonText}>Agregar más fotos</Text>
    </>
  );
};

const styles = StyleSheet.create({
  addMoreIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  addMoreButtonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
});
