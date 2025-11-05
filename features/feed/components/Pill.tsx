import React from "react";
import { View, Text, Platform } from "react-native";

interface PillProps {
  children: React.ReactNode;
}

export function Pill({ children }: PillProps) {
  return (
    <View
      className="px-3 py-1.5 bg-white/95 rounded-full mr-2"
      style={Platform.select({
        ios: {
          shadowColor: "#1e3a8a",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 1 },
      })}
    >
      <Text className="text-blue-900 text-[12px] font-semibold">{children}</Text>
    </View>
  );
}
