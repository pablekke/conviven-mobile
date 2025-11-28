import { StyleSheet, View } from "react-native";

import Spinner from "./Spinner";
import { useTheme } from "../context/ThemeContext";

export default function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={[styles.fullScreen, { backgroundColor: colors.conviven.blue }]}
    >
      <Spinner size={52} color="#FFFFFF" trackColor="rgba(255,255,255,0.15)" thickness={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
});
