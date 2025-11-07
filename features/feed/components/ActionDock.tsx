import { View, Pressable, Text, Platform } from "react-native";
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
          className="basis-1/4 h-full flex-row items-center justify-center bg-red-400"
          onPress={onReject}
        >
          <Feather name="x" size={16} color="#ffffff" />
          <Text className="ml-2 text-[18px] font-light text-white">NO</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Contactar"
          className="flex-1 h-full flex-row items-center justify-center bg-blue-600"
          onPress={onContact}
        >
          <Feather name="send" size={16} color="#ffffff" />
          <Text className="ml-2 text-white text-[18px] font-light">CONECTAR</Text>
        </Pressable>
      </View>
    </View>
  );
}
