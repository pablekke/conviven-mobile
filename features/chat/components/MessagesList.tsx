import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, View } from "react-native";
import { MessageStatus as MessageStatusEnum } from "../enums";
import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatMessage } from "../types";

export interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  loadMore,
  hasMore,
  isLoadingMore,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === currentUserId;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    const showDateSeparator =
      !nextMessage || item.timestamp.toDateString() !== nextMessage.timestamp.toDateString();

    return (
      <View style={{ transform: [{ scaleY: 1 }] }}>
        {showDateSeparator && renderDateSeparator(item.timestamp)}
        <MessageBubble
          content={item.content}
          timestamp={item.timestamp}
          isOwn={isOwn}
          status={isOwn ? (item.status as MessageStatusEnum) : undefined}
        />
      </View>
    );
  };

  const renderDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateText = "";
    if (date.toDateString() === today.toDateString()) {
      dateText = "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateText = "Ayer";
    } else {
      dateText = date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
      });
    }

    return (
      <View style={styles.dateSeparator}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{dateText}</Text>
        <View style={styles.dateLine} />
      </View>
    );
  };

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay mensajes aún</Text>
        <Text style={styles.emptySubtext}>¡Envía el primer mensaje para comenzar la charla!</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      inverted
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#64748B",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#94A3B8",
    marginHorizontal: 12,
  },
  loadingFooter: {
    padding: 10,
    alignItems: "center",
  },
});
