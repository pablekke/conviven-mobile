import { FlatList, StyleSheet } from "react-native";

import { ChatPreview } from "../types";
import { ChatPreviewItem } from "./ChatPreviewItem";
import { EmptyChatState } from "./EmptyChatState";

export interface ChatListProps {
  chats: ChatPreview[];
  onChatPress?: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onChatPress }) => {
  return (
    <FlatList
      data={chats}
      keyExtractor={item => item.id}
      contentContainerStyle={chats.length === 0 ? styles.emptyContent : styles.listContent}
      renderItem={({ item }) => <ChatPreviewItem chat={item} onPress={onChatPress} />}
      ListEmptyComponent={<EmptyChatState />}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  emptyContent: {
    flex: 1,
  },
});
