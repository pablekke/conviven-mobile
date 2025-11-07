import { View, Text, Platform } from "react-native";

interface PillProps {
  children: React.ReactNode;
}

export function Pill({ children }: PillProps) {
  return (
    <View
      className="px-3.5 py-2 bg-white rounded-full mr-2"
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
      <Text className="text-dark-900 text-[13px] font-light">{children}</Text>
    </View>
  );
}
