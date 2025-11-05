import React from "react";
import { View, Text, Pressable } from "react-native";

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export function TabButton({ icon, label, active }: TabButtonProps) {
  return (
    <Pressable className="items-center min-w-[3.5rem]">
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center ${
          active ? "bg-blue-50" : "bg-transparent"
        }`}
      >
        {icon}
      </View>
      <Text className={`text-[10px] font-medium ${active ? "text-blue-600" : "text-slate-400"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
