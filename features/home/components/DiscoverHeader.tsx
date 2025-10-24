import React from "react";
import { Text, View } from "react-native";

export interface DiscoverHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  title = "Explora",
  subtitle = "Descubrí tu match",
}) => {
  return (
    <View className="px-6 pt-3 pb-2">
      <Text className="text-xs uppercase tracking-[3px] text-muted-foreground font-conviven">
        {title}
      </Text>
      <Text className="text-3xl font-conviven-bold text-foreground mt-1">{subtitle}</Text>
    </View>
  );
};
