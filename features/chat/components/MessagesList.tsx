import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ChatMessage } from "../types";
import { MessageBubble } from "./MessageBubble";

export interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, currentUserId }) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === currentUserId;
    const showDateSeparator =
      index === 0 || messages[index - 1].timestamp.toDateString() !== item.timestamp.toDateString();

    return (
      <>
        {showDateSeparator && renderDateSeparator(item.timestamp)}
        <MessageBubble
          content={item.content}
          timestamp={item.timestamp}
          isOwn={isOwn}
          status={isOwn ? item.status : undefined}
        />
      </>
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
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
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
});
