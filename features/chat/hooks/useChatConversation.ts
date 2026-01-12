import { useCallback, useEffect, useState, useRef } from "react";
import { useDataPreload } from "@/context/DataPreloadContext";
import { WebSocketClient } from "@/services/WebSocketClient";
import { useIsFocused } from "@react-navigation/native";
import { useChat } from "../context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "../services";
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

export const useChatConversation = (userId: string): UseChatConversationReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useAuth();
  const { markConversationAsRead, isConnected, setActiveChatId } = useChat();
  const { updateChatsState } = useDataPreload();
  const appState = useRef(AppState.currentState);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);

  useEffect(() => {
    isFocusedRef.current = isFocused;

    if (isFocused && conversationId) {
      setActiveChatId(conversationId);
      chatService.markAllAsRead(userId).catch(() => {});
      markConversationAsRead(conversationId);
    } else if (isFocused && userId) {
      setActiveChatId(userId);
    } else {
      setActiveChatId(null);
    }

    return () => {
      setActiveChatId(null);
    };
  }, [isFocused, conversationId, userId, setActiveChatId, markConversationAsRead]);

  const pendingStatusUpdates = useRef<Map<string, MessageStatus>>(new Map());

  // --- CARGA INICIAL DE MENSAJES (HTTP) ---
  const loadMessages = useCallback(
    async (forceRefresh = false, silent = false) => {
      if (!userId) return;

      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        // Obtener mensajes (ordenados cronológicamente desde el back, o invertimos aquí)
        const fetchedMessages = await chatService.getMessages(userId, forceRefresh);
        const sortedMessages = fetchedMessages.reverse(); // Los queremos más recientes abajo visualmente

        setMessages(sortedMessages);

        // Detectar si hay más y guardar conversationId
        if (fetchedMessages.length > 0) {
          const foundId = fetchedMessages[0].conversationId;
          setConversationId(foundId);
          setHasMore(fetchedMessages.length >= 20); // Estimación simple

          // 🔥 CRÍTICO: Si acabo de abrir el chat y hay mensajes NO leídos del otro,
          // debo marcarlos como leídos YA.
          const hasUnread = fetchedMessages.some(
            m => m.senderId !== user?.id && m.status !== MessageStatus.READ,
          );

          if (hasUnread) {
            // Notificar al backend que leí todo
            chatService.markAllAsRead(userId).catch(() => {});
            // Actualizar contexto local de notificaciones
            if (foundId) markConversationAsRead(foundId);
          }
        }
      } catch (err) {
        if (!silent) setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [userId, user?.id, markConversationAsRead],
  );

  // --- PAGINACIÓN (LOAD MORE) ---
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !conversationId) return;

    try {
      setIsLoadingMore(true);
      const oldestMsg = messages[messages.length - 1]; // El último del array es el más viejo visualmente arriba
      if (!oldestMsg) return;

      const response = await chatService.getPaginatedMessages(conversationId, 50, oldestMsg.id);

      // Normalizar respuesta (Array vs Objeto paginado)
      let newMessages: ChatMessage[] = [];
      let newHasMore = false;

      if (Array.isArray(response.messages)) {
        newMessages = response.messages;
        newHasMore = response.hasMore;
      } else if (Array.isArray(response)) {
        newMessages = response as any[]; // Legacy fallback
      }

      if (newMessages.length > 0) {
        const mapped = newMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(prev => [...prev, ...mapped]);
        setHasMore(newHasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, conversationId, messages]);

  // --- SUSCRIPCIÓN DIRECTA A WEBSOCKET (Evita lagueo de Context) ---
  useEffect(() => {
    const wsClient = WebSocketClient.getInstance();

    const handleSocketMessage = (data: any) => {
      // Normalización de claves (camelCase vs snake_case) para robustez
      const inputId = data.id || data.messageId || data.message_id || data._id;
      const inputConversationId = data.conversationId || data.conversation_id;
      const inputSenderId = data.senderId || data.sender_id;
      const inputContent = data.content;
      const inputStatus = data.status;
      const inputType = data.type;
      const inputCreatedAt = data.createdAt || data.created_at || new Date().toISOString();

      // 1. MANEJO DE MENSAJES NUEVOS
      // Requiere id, content y senderId explícitos.
      // Excluímos si es una actualización de estado explícita.
      const isStatusUpdate =
        inputType === "MESSAGE_STATUS_UPDATE" ||
        inputId === "ALL" ||
        (inputId && inputStatus && !inputContent);

      if (inputId && inputContent && inputSenderId && !isStatusUpdate) {
        let msgContent = inputContent;

        // Si content es un objeto, extraer string
        if (typeof msgContent === "object") {
          if (msgContent.content && typeof msgContent.content === "string") {
            msgContent = msgContent.content;
          } else {
            msgContent = JSON.stringify(msgContent);
          }
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
  }, [conversationId, userId, user?.id]);

  // --- RECONEXIÓN Y ESTADO DE APP ---
  useEffect(() => {
    // Si la app vuelve a foreground o recupera conexión, refrezcar para sincronizar
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        loadMessages(true, true);
      }
      appState.current = nextAppState;
    });

    if (isConnected && isFocused) {
      // Pequeño debounce o check para no saturar
      // Solo marcar leído si estamos viendo la pantalla activamente
      if (conversationId) chatService.markAllAsRead(userId).catch(() => {});
    }

    return () => subscription.remove();
  }, [isConnected, conversationId, userId]);

  // --- ENVIAR MENSAJE (OPTIMISTIC UI) ---
  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim() || !user?.id) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversationId: conversationId || "",
        senderId: user.id,
        content: content.trim(),
        status: MessageStatus.PENDING, // Relojito
        deliveredAt: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date(),
        liked: false,
      };

      try {
        setSending(true);
        // 1. Agregar inmediatamente a la UI
        setMessages(prev => [optimisticMessage, ...prev]);

        // 2. Enviar real
        const sentMessage = await chatService.sendMessage(userId, content.trim());

        // Actualizar cache global para el listado
        updateChatsState(prev => {
          const index = prev.findIndex(
            c =>
              (sentMessage.conversationId && c.conversationId === sentMessage.conversationId) ||
              c.id === userId,
          );

          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: sentMessage.content,
            unread: 0,
            updatedAt: sentMessage.createdAt,
            lastMessageStatus: sentMessage.status as any,
            lastMessageSenderId: user.id,
          };

          return updated.sort(
            (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
          );
        });

        // 3. Reemplazar temp con real
        setMessages(prev => {
          // Chequear si llegaron updates (READ/DELIVERED) mientras se enviaba
          let finalMessage = sentMessage;
          if (pendingStatusUpdates.current.has(sentMessage.id)) {
            const pendingStatus = pendingStatusUpdates.current.get(sentMessage.id)!;
            finalMessage = { ...sentMessage, status: pendingStatus };
            pendingStatusUpdates.current.delete(sentMessage.id);
          }

          // Evitar duplicados si el WS ya insertó el mensaje real
          const alreadyExists = prev.some(m => m.id === sentMessage.id);
          if (alreadyExists) {
            return prev.filter(m => m.id !== tempId);
          }

          return prev.map(m => (m.id === tempId ? finalMessage : m));
        });

        if (!conversationId && sentMessage.conversationId) {
          setConversationId(sentMessage.conversationId);
        }
      } catch (err) {
        console.error("Error enviando:", err);
        // Marcar error visualmente
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...m, status: MessageStatus.ERROR } : m)),
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [userId, user?.id, conversationId],
  );

  // Carga inicial
  useEffect(() => {
    loadMessages(true, false);
  }, [userId]);

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
