import { View, Pressable, Text, Platform, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ActionDockProps {
  onReject?: () => void;
  onContact?: () => void;
  tabBarHeight?: number;
  dockHeight?: number;
  stackWithTabBar?: boolean;
}

export function ActionDock({
  onReject,
  onContact,
  tabBarHeight = 64,
  dockHeight = 60,
  stackWithTabBar = false,
}: ActionDockProps) {
  const restingBottom =
    stackWithTabBar && tabBarHeight > 0
      ? tabBarHeight - dockHeight / 2
      : tabBarHeight > 0
        ? -tabBarHeight * 0.0
        : 8;

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0"
      style={{ bottom: restingBottom, height: dockHeight }}
    >
      <View
        className="h-full flex-row overflow-hidden"
        style={Platform.select({
          ios: {
            shadowColor: "#0f172a",
            shadowOpacity: 0.18,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 12 },
          },
          android: { elevation: 6 },
        })}
      >
        <Pressable
          accessibilityLabel="Descartar"
          className="h-full flex-row items-center justify-center"
          onPress={onReject}
          style={[styles.rejectButton, styles.rejectButtonSurface]}
        >
          <Feather name="x" size={16} color="#2563eb" />
          <Text className="ml-2 text-[18px] font-light text-conviven-blue">PASO</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Contactar"
          className="h-full flex-row items-center justify-center"
          onPress={onContact}
          style={[styles.contactButton, styles.contactButtonSurface]}
        >
          <Feather name="send" size={16} color="#ffffff" />
          <Text className="ml-2 text-white text-[18px] font-light">CONECTAR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rejectButton: {
    flex: 1.5,
  },
  contactButton: {
    flex: 3,
  },
  rejectButtonSurface: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.2)",
    borderWidth: 1,
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: -2, height: 2 },
    elevation: 2,
  },
  contactButtonSurface: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1e40af",
    borderWidth: 1,
    shadowColor: "rgba(30, 64, 175, 0.8)",
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 2, height: 8 },
    elevation: 5,
  },
});

