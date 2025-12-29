import { View, StyleSheet, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import Spinner from "./Spinner";
import React from "react";

interface LoadingModalProps {
  visible: boolean;
  size?: number;
  color?: string;
  trackColor?: string;
  thickness?: number;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  size = 55,
  color = "#007BFF",
  trackColor = "rgba(0, 123, 255, 0.15)",
  thickness = 5,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <StatusBar style="light" />
      <View style={styles.overlay}>
        <Spinner size={size} color={color} trackColor={trackColor} thickness={thickness} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingModal;
