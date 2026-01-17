import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useDataPreload } from "@/context/DataPreloadContext";
import { WebSocketClient } from "@/services/WebSocketClient";
import { ChatMessage, MatchNotification } from "../types";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { API_BASE_URL_WS } from "@/config/env";
import { MessageStatus } from "../enums";

interface ChatContextProps {
  lastMessage: ChatMessage | null;
  lastStatusUpdate: any | null;
  lastMatchNotification: MatchNotification | null;
  isConnected: boolean;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  markConversationAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextProps>({
  lastMessage: null,
  lastStatusUpdate: null,
  lastMatchNotification: null,
  isConnected: false,
  activeChatId: null,
  setActiveChatId: () => {},
  markConversationAsRead: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { updateChatsState } = useDataPreload();
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<any | null>(null);
  const [lastMatchNotification, setLastMatchNotification] = useState<MatchNotification | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (user?.id) {
      const wsClient = WebSocketClient.getInstance();

      const wsUrl = API_BASE_URL_WS;
      wsClient.connect(wsUrl, user.id);
      setIsConnected(true);

      const unsubscribe = wsClient.subscribe(data => {
        const inputType = data.type;

        // MANEJO DE NUEVO MATCH
        if (inputType === "NEW_MATCH") {
          const matchNotification = data as MatchNotification;
          setLastMatchNotification(matchNotification);

          // Mostrar notificación visual
          Toast.show({
            type: "success",
            text1: "¡Es un Match! 🎉",
            text2: "Has conectado con alguien nuevo",
            visibilityTime: 4000,
            onPress: () => {
              // Navegar al listado de chats/matches
              router.push("/chat");
            },
          });
          return;
        }

        const inputId = data.id || data.messageId || data.message_id || data._id;
        const inputConversationId = data.conversationId || data.conversation_id;
        const inputSenderId = data.senderId || data.sender_id;
        const inputContent = data.content;
        const inputStatus = data.status;

        const isStatusUpdate =
          inputType === "MESSAGE_STATUS_UPDATE" ||
          inputId === "ALL" ||
          (inputId && inputStatus && !inputContent);

        if (isStatusUpdate) {
          const updateData = {
            messageId: inputId,
            conversationId: inputConversationId,
            status: inputStatus,
            deliveredAt: data.deliveredAt || data.delivered_at || null,
            readAt: data.readAt || data.read_at || null,
            local: data.local || false,
          };
          if (updateData.messageId && updateData.status) {
            setLastStatusUpdate(updateData);

            updateChatsState(prev =>
              prev.map(c => {
                if (c.conversationId === updateData.conversationId || c.id === inputSenderId) {
                  return {
                    ...c,
                    unread: updateData.status === "read" ? 0 : c.unread,
                    lastMessageStatus: updateData.status as MessageStatus,
                  };
                }
                return c;
              }),
            );
          }
        }

        if (inputId && inputContent && inputSenderId && !isStatusUpdate) {
          let msgContent = inputContent;
          if (typeof msgContent === "object") {
            if (msgContent.content && typeof msgContent.content === "string") {
              msgContent = msgContent.content;
            } else {
              msgContent = JSON.stringify(msgContent);
            }
          }

          const normalizedMsg: ChatMessage = {
            id: inputId,
            conversationId: inputConversationId,
            senderId: inputSenderId,
            content: typeof msgContent === "string" ? msgContent : JSON.stringify(msgContent),
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            status: inputStatus || "sent",
            deliveredAt: data.deliveredAt || data.delivered_at || null,
            readAt: data.readAt || data.read_at || null,
            updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
            liked: !!data.liked,
            timestamp: new Date(),
          };

          setLastMessage(normalizedMsg);

          updateChatsState(prev => {
            const index = prev.findIndex(
              c =>
                (normalizedMsg.conversationId &&
                  c.conversationId === normalizedMsg.conversationId) ||
                c.id === normalizedMsg.senderId,
            );

            if (index === -1) return prev;

            const updated = [...prev];
            const chat = updated[index];

            const isTargetActive =
              activeChatIdRef.current === chat.conversationId ||
              activeChatIdRef.current === chat.id;

            updated[index] = {
              ...chat,
              lastMessage: normalizedMsg.content,
              unread: normalizedMsg.senderId !== user.id && !isTargetActive ? chat.unread + 1 : 0,
              updatedAt: normalizedMsg.createdAt,
              lastMessageStatus: normalizedMsg.status as any,
              lastMessageSenderId: normalizedMsg.senderId,
            };

            return updated.sort(
              (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
            );
          });
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user, updateChatsState]);

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      const updateData = {
        messageId: "ALL",
        conversationId,
        status: "read",
        local: true,
      };
      setLastStatusUpdate(updateData);

      updateChatsState(prev =>
        prev.map(c =>
          c.conversationId === conversationId || c.id === conversationId ? { ...c, unread: 0 } : c,
        ),
      );
    },
    [updateChatsState],
  );

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
