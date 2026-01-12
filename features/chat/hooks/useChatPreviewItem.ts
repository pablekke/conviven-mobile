import { useState, useEffect, useRef } from "react";
import { ChatPreview } from "../types";
import { MessageStatus } from "../enums";
import { useChat } from "../context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export const useChatPreviewItem = (initialChat: ChatPreview) => {
  const [chat, setChat] = useState<ChatPreview>(initialChat);
  const { lastMessage, lastStatusUpdate, activeChatId } = useChat();
  const { user } = useAuth();

  const lastProcessedMessageId = useRef<string | null>(null);
  const lastProcessedStatusId = useRef<string | null>(null);

  useEffect(() => {
    setChat(initialChat);
  }, [
    initialChat.unread,
    initialChat.lastMessage,
    initialChat.updatedAt,
    initialChat.lastMessageStatus,
  ]);

  useEffect(() => {
    if (!lastMessage || !user) return;
    if (lastMessage.id === lastProcessedMessageId.current) return;

    const isThisChat =
      (lastMessage.conversationId && lastMessage.conversationId === chat.conversationId) ||
      lastMessage.senderId === chat.id;

    const isMyMessageToThisChat =
      lastMessage.senderId === user.id && lastMessage.conversationId === chat.conversationId;

    if (isThisChat || isMyMessageToThisChat) {
      lastProcessedMessageId.current = lastMessage.id;

      const safeContent =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      // Si el chat está activo, el contador debe mantenerse en 0
      const isActive = activeChatId === chat.conversationId || activeChatId === chat.id;

      setChat(prev => ({
        ...prev,
        lastMessage: safeContent,
        lastMessageStatus: lastMessage.status as unknown as MessageStatus,
        lastMessageSenderId: lastMessage.senderId,
        time: "Ahora",
        unread: isActive ? 0 : prev.unread, // Don't increment locally to avoid double counting with global state
        updatedAt: lastMessage.createdAt || new Date().toISOString(),
      }));
    }
  }, [lastMessage, chat.id, chat.conversationId, user, activeChatId]);

  useEffect(() => {
    if (!lastStatusUpdate) return;

    const dedupKey = `${lastStatusUpdate.conversationId}-${lastStatusUpdate.messageId}-${lastStatusUpdate.status}`;
    if (dedupKey === lastProcessedStatusId.current) return;
    lastProcessedStatusId.current = dedupKey;

    const isThisChat =
      (lastStatusUpdate.conversationId &&
        lastStatusUpdate.conversationId === chat.conversationId) ||
      lastStatusUpdate.senderId === chat.id ||
      (lastStatusUpdate.local && lastStatusUpdate.conversationId === chat.conversationId);

    if (isThisChat) {
      const normalizedStatus = lastStatusUpdate.status.toLowerCase() as MessageStatus;
      setChat(prev => ({
        ...prev,
        unread: normalizedStatus === "read" ? 0 : prev.unread,
        lastMessageStatus: normalizedStatus,
      }));
    }
  }, [lastStatusUpdate, chat.id, chat.conversationId]);

  return chat;
};
