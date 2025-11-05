import React from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ActionDockProps {
  onReject?: () => void;
  onContact?: () => void;
  tabBarHeight?: number;
  dockHeight?: number;
}

export function ActionDock({
  onReject,
  onContact,
  tabBarHeight = 64,
  dockHeight = 60,
}: ActionDockProps) {
  return (
    <View className="absolute left-4 right-4" style={{ bottom: 8, height: dockHeight }}>
      <View
        className="h-full bg-white rounded-2xl border border-slate-200 flex-row overflow-hidden"
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
          className="basis-1/4 h-full flex-row items-center justify-center bg-slate-50 border-r border-slate-200"
          onPress={onReject}
        >
          <Feather name="x" size={16} color="#334155" />
          <Text className="ml-2 text-[12px] font-bold text-slate-700">No</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Contactar"
          className="basis-3/4 h-full flex-row items-center justify-center bg-blue-600"
          onPress={onContact}
        >
          <Feather name="send" size={16} color="#ffffff" />
          <Text className="ml-2 text-white text-[12px] font-extrabold">Contactar</Text>
        </Pressable>
      </View>
    </View>
  );
}
