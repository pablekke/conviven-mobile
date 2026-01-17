/**
 * Componente de encabezado para la pantalla de Chat
 */

import { Text, View } from "react-native";

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ subtitle}) => {
  return (
    <View className="px-6 pb-1">
      <Text className="text-xl font-conviven-bold text-white mt-1">{subtitle}</Text>
    </View>
  );
};
