import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export interface FeedTopBarProps {
  totalRoomies: number;
  currentIndex: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function FeedTopBar({ totalRoomies, currentIndex, isLoading, onRefresh }: FeedTopBarProps) {
  const { colors } = useTheme();
  const cardsLeft = Math.max(totalRoomies - currentIndex, 0);

  const progress = React.useMemo(() => {
    if (totalRoomies === 0) return 0;
    const current = Math.min(currentIndex + 1, totalRoomies);
    return current / totalRoomies;
  }, [currentIndex, totalRoomies]);

  const progressWidth = totalRoomies === 0 ? 0 : Math.max(progress * 100, 8);
  const refreshButtonStyle = React.useMemo(
    () => ({ backgroundColor: colors.card, borderColor: colors.border }),
    [colors.border, colors.card],
  );

  return (
    <View className="px-6 pt-4 pb-3 gap-5">
      <View className="flex-row items-center justify-between">
        <View className="gap-1.5">
          <Text
            className="text-3xl font-conviven-extrabold"
            style={{ color: colors.foreground }}
          >
            Descubre
          </Text>
          <Text className="text-sm font-conviven" style={{ color: colors.mutedForeground }}>
            Explora perfiles curados según tus preferencias y haz match en segundos.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recargar feed"
          onPress={onRefresh}
          disabled={isLoading}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={[styles.refreshButton, refreshButtonStyle]}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={isLoading ? colors.mutedForeground : colors.primary}
          />
        </Pressable>
      </View>

      <View>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-conviven-semibold" style={{ color: colors.mutedForeground }}>
            En cola
          </Text>
          <Text className="text-xs font-conviven-semibold" style={{ color: colors.foreground }}>
            {cardsLeft} perfiles disponibles
          </Text>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.muted }}
        >
          <View
            style={{ width: `${progressWidth}%`, backgroundColor: colors.primary }}
            className="h-full"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    borderWidth: 1,
  },
});
