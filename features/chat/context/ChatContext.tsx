import { useWebSocketChat, MessageStatusUpdatePayload } from "../hooks/useWebSocketChat";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useDataPreload } from "@/context/DataPreloadContext";
import {
  IncomingMessagePayload,
  SendMessagePayload,
  WebSocketConnectionStatus,
} from "../types/chat.types";

interface ChatContextType {
  isConnected: boolean;
  status: WebSocketConnectionStatus;
  sendMessage: (payload: SendMessagePayload) => void;
  lastMessage: IncomingMessagePayload | null;
  lastStatusUpdate: MessageStatusUpdatePayload | null;
  lastUpdateTrigger: number;
  connect: () => void;
  disconnect: () => void;
  markConversationAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  isConnected: false,
  status: "disconnected",
  sendMessage: () => {},
  lastMessage: null,
  lastStatusUpdate: null,
  lastUpdateTrigger: 0,
  connect: () => {},
  disconnect: () => {},
  markConversationAsRead: () => {},
});

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const {
    isConnected,
    status,
    sendMessage,
    lastMessage,
    lastStatusUpdate,
    lastUpdateTrigger,
    connect,
    disconnect,
    markConversationAsRead,
  } = useWebSocketChat();

  const { refreshChats } = useDataPreload();

  useEffect(() => {
    if (lastMessage) {
      refreshChats(true).catch(err =>
        console.error("Error updating chats on incoming message:", err),
      );
    }
  }, [lastMessage, refreshChats]);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        status,
        sendMessage,
        lastMessage,
        lastStatusUpdate,
        lastUpdateTrigger,
        connect,
        disconnect,
        markConversationAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
