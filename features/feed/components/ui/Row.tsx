import { View, Text, Platform } from "react-native";

interface RowProps {
  title: string;
  value: string;
  hint?: string;
}

export function Row({ title, value, hint }: RowProps) {
  return (
    <View
      className="flex-row items-baseline justify-between bg-white border border-slate-100 rounded-xl px-3 py-2"
      style={Platform.select({
        ios: {
          shadowColor: "#1e3a8a",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
        },
        android: {
          elevation: 4,
        },
      })}
    >
      <Text className="text-[12px] font-semibold text-blue-700 uppercase tracking-wide mr-3">
        {title}
      </Text>
      <Text numberOfLines={1} className="text-[13px] text-slate-800 font-medium truncate">
        {value} {hint ?? ""}
      </Text>
    </View>
  );
}

