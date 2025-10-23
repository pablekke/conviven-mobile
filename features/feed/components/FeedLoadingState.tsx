import React from "react";
import { View } from "react-native";

export function FeedLoadingState() {
  return (
    <View className="px-4">
      <View className="h-[520px] rounded-3xl bg-neutral-800/30 animate-pulse" />
      <View className="flex-row justify-between px-10 mt-6">
        <View className="w-16 h-16 rounded-full bg-neutral-800/30 animate-pulse" />
        <View className="w-20 h-20 rounded-full bg-neutral-800/30 animate-pulse" />
        <View className="w-16 h-16 rounded-full bg-neutral-800/30 animate-pulse" />
      </View>
    </View>
  );
}
