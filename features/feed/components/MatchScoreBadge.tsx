import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

interface MatchScoreBadgeProps {
  score: number; // 0..100
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const { colors } = useTheme();
  return (
    <View
      className="px-3 py-1 rounded-full self-start"
      style={{ backgroundColor: `${colors.conviven.blue}1A` }}
    >
      <Text
        className="text-xs font-conviven-semibold tracking-wide"
        style={{ color: colors.conviven.blue }}
      >
        {score}% match
      </Text>
    </View>
  );
}
