import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";
import { ChatPreview } from "../types";
import { MessageTicks } from "./MessageTicks";

export interface ChatPreviewItemProps {
  chat: ChatPreview;
  onPress?: (chatId: string) => void;
}

export const ChatPreviewItem: React.FC<ChatPreviewItemProps> = ({ chat, onPress }) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(chat.id);
    } else {
      router.push({
        pathname: "/[id]",
        params: {
          id: chat.id,
          name: chat.name,
          avatar: chat.avatar,
        },
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="flex-row items-center gap-4 px-4 py-4 rounded-2xl border"
      style={{
        backgroundColor: colors.card,
        borderColor: chat.unread > 0 ? colors.conviven.blue : colors.border,
      }}
    >
      <Image source={{ uri: chat.avatar }} className="w-14 h-14 rounded-full" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-conviven-semibold text-foreground">{chat.name}</Text>
          <Text className="text-xs font-conviven text-muted-foreground">{chat.time}</Text>
        </View>
        <View className="flex-row items-center gap-1 mt-1">
          {chat.lastMessageStatus && <MessageTicks status={chat.lastMessageStatus} size={14} />}
          <Text className="text-sm font-conviven text-muted-foreground flex-1" numberOfLines={1}>
            {chat.lastMessage}
          </Text>
        </View>
      </View>
      {chat.unread > 0 ? (
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.conviven.blue }}
        >
          <Text className="text-xs font-conviven-semibold text-white">{chat.unread}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};
