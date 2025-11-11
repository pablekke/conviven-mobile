import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { FeedScreen } from "../../features/feed";

export default function HomeScreen() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <FeedScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
