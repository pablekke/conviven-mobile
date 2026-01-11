import { useChat } from "../context/ChatContext";
import { Text, View } from "react-native";

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ subtitle }) => {
  const { status } = useChat();

  let statusText: string | null = null;
  if (status === "connecting") statusText = "Conectando...";
  else if (status === "reconnecting") statusText = "Reconectando...";
  else if (status === "disconnected") statusText = "Desconectado";

  return (
    <View className="px-6 pt-2 pb-1 flex-row justify-between items-center">
      <View>
        <Text className="text-xl font-conviven-bold text-white mt-1">{subtitle}</Text>
      </View>
      {statusText && (
        <Text className="text-xs text-white/70 font-conviven-medium">{statusText}</Text>
      )}
    </View>
  );
};
