import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, MatchNotification } from "../types";
import { useAuth } from "@/context/AuthContext";
import {
  useNewConversationHandler,
  useMarkConversationAsRead,
  useMatchesRefresh,
  useMatchNotifications,
  useMessageStatusUpdates,
  useIncomingMessages,
  useChatWebSocketConnection,
} from "../hooks";

interface ChatContextProps {
  lastMessage: ChatMessage | null;
  lastStatusUpdate: any | null;
  lastMatchNotification: MatchNotification | null;
  isConnected: boolean;
  activeChatId: string | null;

  setActiveChatId: (id: string | null) => void;
  markConversationAsRead: (conversationId: string) => void;
  matchesRefreshTrigger: number;
  triggerMatchesRefresh: () => void;
}

const ChatContext = createContext<ChatContextProps>({
  lastMessage: null,
  lastStatusUpdate: null,
  lastMatchNotification: null,
  isConnected: false,
  activeChatId: null,
  setActiveChatId: () => {},

  markConversationAsRead: () => {},
  matchesRefreshTrigger: 0,
  triggerMatchesRefresh: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { handleNewConversation } = useNewConversationHandler();

  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<any | null>(null);
  const [lastMatchNotification, setLastMatchNotification] = useState<MatchNotification | null>(
    null,
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const { matchesRefreshTrigger, triggerMatchesRefresh } = useMatchesRefresh();

  const { markConversationAsRead } = useMarkConversationAsRead(setLastStatusUpdate);

  const { handleMatchNotification } = useMatchNotifications({
    setLastMatchNotification,
    triggerMatchesRefresh,
  });

  const { handleStatusUpdate } = useMessageStatusUpdates({
    setLastStatusUpdate,
  });

  const { handleIncomingMessage } = useIncomingMessages({
    setLastMessage,
    handleNewConversation,
    activeChatIdRef,
    userId: user?.id || "",
  });

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      const inputType = data.type;

      if (inputType === "NEW_MATCH") {
        handleMatchNotification(data as MatchNotification);
        return;
      }

      const inputId = data.id || data.messageId || data.message_id || data._id;
      const inputContent = data.content;
      const inputStatus = data.status;

      const isStatusUpdate =
        inputType === "MESSAGE_STATUS_UPDATE" ||
        inputId === "ALL" ||
        (inputId && inputStatus && !inputContent);

      if (isStatusUpdate) {
        handleStatusUpdate(data);
        return;
      }

      if (inputId && inputContent && data.senderId && !isStatusUpdate) {
        handleIncomingMessage(data);
      }
    },
    [handleMatchNotification, handleStatusUpdate, handleIncomingMessage],
  );

  const { isConnected } = useChatWebSocketConnection({
    userId: user?.id,
    onMessage: handleWebSocketMessage,
  });

  return (
    <ChatContext.Provider
      value={{
        lastMessage,
        lastStatusUpdate,
        lastMatchNotification,
        isConnected,
        activeChatId,
        setActiveChatId,

        markConversationAsRead,
        matchesRefreshTrigger,
        triggerMatchesRefresh,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
