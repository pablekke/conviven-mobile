import { FlatList, StyleSheet } from "react-native";
import { ChatPreviewItem } from "./ChatPreviewItem";
import { EmptyChatState } from "./EmptyChatState";
import { ChatPreview } from "../types";

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
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  emptyContent: {
    flex: 1,
  },
});
