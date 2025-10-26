/**
 * Componente de encabezado para la pantalla de Chat
 */

import React from "react";
import { Text, View } from "react-native";

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  subtitle = "Charlá, coordiná y fluí",
}) => {
  return (
    <View className="px-6 pt-4 pb-3">
      <Text className="text-3xl font-conviven-bold text-foreground mt-1">{subtitle}</Text>
    </View>
  );
};
