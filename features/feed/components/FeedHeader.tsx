import React from "react";
import { View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Roomie } from "../types";

interface FeedHeaderProps {
  roomie: Roomie | null;
  onClose?: () => void;
  onInfo?: () => void;
}

export function FeedHeader({ onClose, onInfo }: FeedHeaderProps) {
  return (
    <View className="absolute top-0 left-0 right-0">
      <LinearGradient
        colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.35)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-30 pt-4"
      >
        <View className="px-4 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            onPress={onInfo}
            className="w-10 h-10 rounded-full items-center justify-center bg-white/12"
          >
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center bg-white/12"
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
