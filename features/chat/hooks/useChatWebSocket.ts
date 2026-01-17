import { WebSocketClient } from "@/services/WebSocketClient";
import { useEffect, MutableRefObject } from "react";
import { chatService } from "../services";
import { MessageStatus } from "../enums";
import { AppState } from "react-native";
import { ChatMessage } from "../types";
import { User } from "@/types/user";

interface UseChatWebSocketProps {
  conversationId: string | null;
  userId: string;
  user: User | null;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  markConversationAsRead: (conversationId: string) => void;
  isFocusedRef: MutableRefObject<boolean>;
  pendingStatusUpdates: MutableRefObject<Map<string, MessageStatus>>;
}

export const useChatWebSocket = ({
  conversationId,
  userId,
  user,
  setMessages,
  markConversationAsRead,
  isFocusedRef,
  pendingStatusUpdates,
}: UseChatWebSocketProps) => {
  useEffect(() => {
    const wsClient = WebSocketClient.getInstance();

    const handleSocketMessage = (data: any) => {
      const inputId = data.id || data.messageId || data.message_id || data._id;
      const inputConversationId = data.conversationId || data.conversation_id;
      const inputSenderId = data.senderId || data.sender_id;
      const inputContent = data.content;
      const inputStatus = data.status;
      const inputType = data.type;
      const inputCreatedAt = data.createdAt || data.created_at || new Date().toISOString();

      // 1. MANEJO DE MENSAJES NUEVOS
      const isStatusUpdate =
        inputType === "MESSAGE_STATUS_UPDATE" ||
        inputId === "ALL" ||
        (inputId && inputStatus && !inputContent);

      if (inputId && inputContent && inputSenderId && !isStatusUpdate) {
        let msgContent = inputContent;

        // Si content es un objeto, extraer string
        if (typeof msgContent === "object") {
          msgContent =
            msgContent.content && typeof msgContent.content === "string"
              ? msgContent.content
              : JSON.stringify(msgContent);
        }

        // Construir mensaje normalizado
        const msg: ChatMessage = {
          id: inputId,
          conversationId: inputConversationId,
          senderId: inputSenderId,
          content: typeof msgContent === "string" ? msgContent : JSON.stringify(msgContent),
          createdAt: inputCreatedAt,
          status: (inputStatus as MessageStatus) || MessageStatus.SENT,
          deliveredAt: data.deliveredAt || data.delivered_at || null,
          readAt: data.readAt || data.read_at || null,
          updatedAt: data.updatedAt || data.updated_at || inputCreatedAt,
          liked: !!data.liked,
          timestamp: new Date(inputCreatedAt),
        };

        // Validación de relevancia
        const isRelevant = conversationId
          ? msg.conversationId === conversationId
          : msg.senderId === userId;

        if (isRelevant) {
          const newMessage = { ...msg, timestamp: new Date(msg.createdAt) };

          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [newMessage, ...prev];
          });

          // Si es mensaje del OTRO, marcar leído solo si estamos activos en el chat
          if (msg.senderId !== user?.id) {
            const isActive = AppState.currentState === "active" && isFocusedRef.current;
            if (isActive) {
              chatService.markAsRead(msg.id).catch(() => {});
              if (conversationId) markConversationAsRead(conversationId);
            }
          }
        }
      }

      // 2. MANEJO DE ESTADOS (READ/DELIVERED)
      if (isStatusUpdate) {
        // Check relevancia
        if (inputConversationId && conversationId && inputConversationId !== conversationId) {
          return;
        }

        const rawStatus = (inputStatus as string)?.toLowerCase();
        let netStatus: MessageStatus | null = null;
        if (rawStatus === "read") netStatus = MessageStatus.READ;
        else if (rawStatus === "delivered") netStatus = MessageStatus.DELIVERED;
        else if (rawStatus === "sent") netStatus = MessageStatus.SENT;

        if (netStatus) {
          setMessages(prev => {
            // Case A: ALL -> Actualizar todos mis mensajes pendientes
            if (inputId === "ALL") {
              return prev.map(msg => {
                const isMyMsg =
                  msg.senderId === user?.id || (user as any)?.profile?.id === msg.senderId;
                if (isMyMsg && msg.status !== MessageStatus.READ) {
                  return { ...msg, status: netStatus! };
                }
                return msg;
              });
            }

            // Case B: Mensaje individual
            const targetId = inputId;
            return prev.map(msg => {
              if (msg.id === targetId) {
                return { ...msg, status: netStatus! };
              }
              return msg;
            });
          });

          // Si no encontramos el mensaje (ej: sigue siendo optimistic con tempId), guardamos el update
          setMessages(currentMsgs => {
            const found = currentMsgs.some(m => m.id === inputId);
            if (!found && inputId !== "ALL") {
              pendingStatusUpdates.current.set(inputId, netStatus!);
            }
            return currentMsgs;
          });
        }
      }
    };

    const unsubscribe = wsClient.subscribe(handleSocketMessage);
    return () => unsubscribe();
  }, [
    conversationId,
    userId,
    user?.id,
    setMessages,
    markConversationAsRead,
    isFocusedRef,
    pendingStatusUpdates,
  ]);
};
