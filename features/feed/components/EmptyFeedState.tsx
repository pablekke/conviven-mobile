import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyFeedStateProps {
  onRefresh: () => void;
}

export function EmptyFeedState({ onRefresh }: EmptyFeedStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="heart-dislike-outline" size={48} color="#9CA3AF" />
      <Text className="text-lg text-muted-foreground font-conviven-semibold mt-3">
        No hay más perfiles por ahora
      </Text>
      <Text className="text-center text-muted-foreground mt-1">
        Ajustá tus filtros o volvé a intentar más tarde.
      </Text>

      <Pressable
        onPress={onRefresh}
        className="px-5 py-3 rounded-full mt-5 bg-primary"
        accessibilityRole="button"
      >
        <Text className="text-primary-foreground font-conviven-semibold">Actualizar</Text>
      </Pressable>
    </View>
  );
}
