import { useDataPreload } from "@/context/DataPreloadContext";
import { useIsFocused } from "@react-navigation/native";
import { useChatWebSocket } from "./useChatWebSocket";
import { useMessageSender } from "./useMessageSender";
import { useChatMessages } from "./useChatMessages";
import { useChat } from "../context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { MessageStatus } from "../enums";
import { AppState } from "react-native";
import { ChatMessage } from "../types";

export interface UseChatConversationReturn {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  conversationId: string | null;
}

export const useChatConversation = (
  userId: string,
  partnerName?: string,
  partnerAvatar?: string,
): UseChatConversationReturn => {
  const { user } = useAuth();
  const { markConversationAsRead, isConnected, setActiveChatId, triggerMatchesRefresh } = useChat();
  const { updateChatsState } = useDataPreload();
  const appState = useRef(AppState.currentState);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);
  const pendingStatusUpdates = useRef<Map<string, MessageStatus>>(new Map());

  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  // 1. GESTIÓN DE MENSAJES (CARGA Y PAGINACIÓN)
  const {
    messages,
    setMessages,
    loading,
    error,
    conversationId,
    setConversationId,
    hasMore,
    isLoadingMore,
    loadMessages,
    loadMore,
  } = useChatMessages({
    userId,
    user,
    markConversationAsRead,
  });

  useEffect(() => {
    if (isFocused && conversationId) {
      setActiveChatId(conversationId);
    } else if (isFocused && userId) {
      setActiveChatId(userId);
    } else {
      setActiveChatId(null);
    }

    return () => {
      setActiveChatId(null);
    };
  }, [isFocused, conversationId, userId, setActiveChatId]);

  const { sendMessage, sending } = useMessageSender({
    userId,
    user,
    conversationId,
    setConversationId,
    setMessages,
    pendingStatusUpdates,
    updateChatsState,
    partnerName,
    partnerAvatar,
    triggerMatchesRefresh,
  });

  useChatWebSocket({
    conversationId,
    userId,
    user,
    setMessages,
    markConversationAsRead,
    isFocusedRef,
    pendingStatusUpdates,
  });

  useEffect(() => {
    loadMessages(true, false, true);
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        loadMessages(true, true, false);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isConnected, conversationId, userId, loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refreshMessages: () => loadMessages(true),
    loadMore,
    hasMore,
    isLoadingMore,
    conversationId,
  };
};
