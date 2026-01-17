import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useChatPreviewItem } from "../hooks";
import { MessageTicks } from "./MessageTicks";
import { MessageStatus } from "../enums";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ChatPreview } from "../types";

export interface ChatPreviewItemProps {
  chat: ChatPreview;
  onPress?: (chatId: string) => void;
}

export const ChatPreviewItem: React.FC<ChatPreviewItemProps> = ({ chat: initialChat, onPress }) => {
  const chat = useChatPreviewItem(initialChat);
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const avatarUrl =
    chat.avatar && chat.avatar.trim().length > 0
      ? chat.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=2563EB&color=fff&bold=true&size=128`;

  const handlePress = () => {
    if (onPress) {
      onPress(chat.id);
    } else {
      router.push({
        pathname: "/(app)/conversation/[id]",
        params: {
          id: chat.id,
          name: chat.name,
          avatar: avatarUrl,
        },
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isOwnLastMessage = chat.lastMessageSenderId === user?.id;

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
      <View
        className="w-14 h-14 rounded-full overflow-hidden items-center justify-center"
        style={{ backgroundColor: colors.muted }}
      >
        <Image
          source={{
            uri: imageError
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=2563EB&color=fff&bold=true&size=128`
              : avatarUrl,
          }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
          onError={handleImageError}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-conviven-semibold text-foreground">{chat.name}</Text>
          <Text className="text-xs font-conviven text-muted-foreground">{chat.time}</Text>
        </View>
        <View className="flex-row items-center gap-1 mt-1">
          {chat.lastMessageStatus && isOwnLastMessage && (
            <MessageTicks status={chat.lastMessageStatus as unknown as MessageStatus} size={14} />
          )}
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
