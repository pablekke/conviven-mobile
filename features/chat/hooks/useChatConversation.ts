import { useCallback, useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useChat } from "../context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "../services";
import { MessageStatus } from "../enums";
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
}

/**
 * Hook para manejar la conversación con un usuario específico
 */
export const useChatConversation = (userId: string): UseChatConversationReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useAuth();

  const { lastMessage, lastStatusUpdate, markConversationAsRead, isConnected, lastUpdateTrigger } =
    useChat();

  const appState = useRef(AppState.currentState);
  const convIdRef = useRef<string | null>(null);

  // Mantener el ref actualizado
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  const loadMessages = useCallback(
    async (forceRefresh = false, silent = false) => {
      if (!userId) return;

      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const currentConvId = conversationId || convIdRef.current;

        if (currentConvId) {
          const response = await chatService.getPaginatedMessages(currentConvId, 50);

          if (response && Array.isArray(response.messages)) {
            const mappedMessages = response.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.createdAt),
            }));

            // SI ES SILENCIOSO: Solo actualizamos si obtuvimos datos válidos para evitar borrar el chat por error
            if (silent) {
              if (mappedMessages.length > 0) {
                setMessages(mappedMessages);
              }
            } else {
              setMessages(mappedMessages);
            }
            setHasMore(response.hasMore);
          } else if (Array.isArray(response) && response.length > 0) {
            const mappedMessages = (response as any[]).map(msg => ({
              ...msg,
              timestamp: new Date(msg.createdAt),
            }));
            setMessages(mappedMessages);
          }
        } else {
          const fetchedMessages = await chatService.getMessages(userId, forceRefresh);
          if (fetchedMessages.length > 0 || !silent) {
            const mapped = fetchedMessages.reverse();
            setMessages(mapped);

            const foundId = mapped[0]?.conversationId;
            if (foundId) {
              setConversationId(foundId);
              setHasMore(mapped.length >= 20);
            }
          }
        }

        // Marcar leídos al cargar
        if (!silent) {
          const targetConvId = conversationId || convIdRef.current;
          if (targetConvId) {
            markConversationAsRead(targetConvId);
            chatService
              .markAllAsRead(userId)
              .catch(e => console.warn("Error markAllAsRead init:", e));
          }
        }
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        if (!silent) {
          setError(err instanceof Error ? err : new Error("Error desconocido"));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [userId, conversationId, markConversationAsRead],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !conversationId) return;

    try {
      setIsLoadingMore(true);
      const oldestMsg = messages[messages.length - 1];
      if (!oldestMsg) return;

      const response = await chatService.getPaginatedMessages(conversationId, 50, oldestMsg.id);

      if (Array.isArray(response.messages)) {
        const newOldMessages = response.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));

        setMessages(prev => [...prev, ...newOldMessages]);
        setHasMore(response.hasMore);
      } else if (Array.isArray(response)) {
        const newOldMessages = (response as any[]).map(msg => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(prev => [...prev, ...newOldMessages]);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, conversationId, messages]);

  // Manejo de nuevos mensajes entrantes (tiempo real)
  useEffect(() => {
    const isRelevant = conversationId
      ? lastMessage?.conversationId === conversationId
      : lastMessage?.senderId === userId;

    if (lastMessage && isRelevant) {
      const newMessage: ChatMessage = {
        ...lastMessage,
        timestamp: new Date(lastMessage.createdAt),
      };

      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [newMessage, ...prev];
      });

      // Marcar como leído tanto por WebSocket como por HTTP
      const convIdToMark = lastMessage.conversationId || conversationId;
      if (convIdToMark) {
        markConversationAsRead(convIdToMark);
      }

      chatService.markAsRead(lastMessage.id).catch(err => {
        console.error("Error al marcar mensaje como leído:", err);
      });
    }
  }, [lastMessage, userId, conversationId, markConversationAsRead]);

  // FIXME: LÓGICA CRÍTICA DE STATUS UPDATE (TICKS)
  useEffect(() => {
    if (lastStatusUpdate) {
      const payloadConvId = lastStatusUpdate.conversationId;
      const isCorrectConversation = !payloadConvId || payloadConvId === conversationId;

      if (isCorrectConversation) {
        // 1. Normalización estricta del status
        const statusStr = (lastStatusUpdate.status as string).toLowerCase();
        let netStatus: MessageStatus = statusStr as MessageStatus;

        if (statusStr === "read") netStatus = MessageStatus.READ;
        else if (statusStr === "delivered") netStatus = MessageStatus.DELIVERED;
        else if (statusStr === "sent") netStatus = MessageStatus.SENT;
        else if (statusStr === "pending") netStatus = MessageStatus.PENDING;
        else if (statusStr === "error") netStatus = MessageStatus.ERROR;

        // Caso 1: Actualización MASIVA (ALL) -> "Visto" general
        if (lastStatusUpdate.messageId === "ALL") {
          setMessages(prev => {
            const updated = prev.map(msg => {
              const myAuthId = user?.id;
              const myProfileId = user?.profile?.id;

              // Es mío si: coincide con mi AuthID OR coincide con mi ProfileID OR NO es del otro.
              const isMyMessage =
                msg.senderId === myAuthId ||
                (!!myProfileId && msg.senderId === myProfileId) ||
                msg.senderId !== userId;

              if (isMyMessage && msg.status !== netStatus) {
                return {
                  ...msg,
                  status: netStatus,
                  readAt: netStatus === MessageStatus.READ ? new Date().toISOString() : msg.readAt,
                };
              }
              return msg;
            });

            const myLastMsg = updated.find(m => m.senderId !== userId);
            if (myLastMsg) {
              console.log(
                `✅ [PROPIO] ID: ${myLastMsg.id.slice(-4)} | ST: ${myLastMsg.status} | Net: ${netStatus}`,
              );
            }
            return updated;
          });

          if (conversationId && netStatus === MessageStatus.READ) {
            chatService.invalidateMessagesCache(conversationId).catch(() => {});
          }
        }
        // Caso 2: Actualización INDIVIDUAL por ID
        else if (lastStatusUpdate.messageId) {
          setMessages(prev => {
            const updated = prev.map(msg =>
              msg.id === lastStatusUpdate.messageId
                ? {
                    ...msg,
                    status: netStatus,
                    deliveredAt:
                      netStatus === MessageStatus.DELIVERED
                        ? new Date().toISOString()
                        : msg.deliveredAt,
                    readAt:
                      netStatus === MessageStatus.READ ? new Date().toISOString() : msg.readAt,
                  }
                : msg,
            );

            const target = updated.find(m => m.id === lastStatusUpdate.messageId);
            if (target) {
              console.log(
                `📊 [IND] ${target.content.slice(0, 10)}... | ID: ${target.id.slice(-4)} | ST: ${target.status} (net: ${netStatus})`,
              );
            }
            return updated;
          });
        }
        // Caso 3: Fallback (match por ConversationId sin MessageId específico)
        else if (payloadConvId === conversationId) {
          setMessages(prev =>
            prev.map(msg => {
              const isMyMessage =
                msg.senderId === user?.id ||
                (user?.profile?.id && msg.senderId === user.profile.id);
              if (isMyMessage && msg.status !== MessageStatus.READ) {
                return { ...msg, status: netStatus };
              }
              return msg;
            }),
          );
        }
      }
    }
  }, [lastStatusUpdate, conversationId, user]);

  useEffect(() => {
    if (isConnected && conversationId) {
      markConversationAsRead(conversationId);
      chatService.markAllAsRead(userId).catch(() => {});
    }
  }, [isConnected, conversationId, markConversationAsRead, userId]);

  // Handle AppState change
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (conversationId) {
          markConversationAsRead(conversationId);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [conversationId, markConversationAsRead]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim() || !user?.id) {
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversationId: conversationId || "",
        senderId: user.id,
        content: content.trim(),
        status: MessageStatus.PENDING,
        deliveredAt: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date(),
        liked: false,
      };

      try {
        setSending(true);
        setError(null);

        setMessages(prev => [optimisticMessage, ...prev]);

        const sentMessage = await chatService.sendMessage(userId, content.trim());
        setMessages(prev => {
          // Si el mensaje real ya llegó por el socket, quitamos el temporal para no tener duplicados
          if (prev.some(m => m.id === sentMessage.id)) {
            return prev.filter(m => m.id !== tempId);
          }
          // Si no, reemplazamos el temporal por el real
          return prev.map(m => (m.id === tempId ? sentMessage : m));
        });

        // polling de confirmación (fallback para iOS)
        const intervals = [5000, 10000, 15000, 20000, 25000, 30000, 45000, 60000];
        intervals.forEach(delay => {
          setTimeout(() => {
            setMessages(current => {
              // Verificamos si alguno de los últimos 25 mensajes propios sigue sin estar leído
              const hasUnreadOwn = current.slice(0, 25).some(m => {
                const isMyMsg =
                  m.senderId === user?.id || (user?.profile?.id && m.senderId === user.profile.id);
                return isMyMsg && m.status !== MessageStatus.READ;
              });

              if (hasUnreadOwn) {
                // Hacemos el fetch silencioso (loadMessages trae los últimos 50)
                loadMessages(true, true);
              }
              return current;
            });
          }, delay);
        });

        // Si era la primera vez, guardamos el conversationId devuelto
        if (!conversationId && sentMessage.conversationId) {
          setConversationId(sentMessage.conversationId);
        }
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...m, status: MessageStatus.ERROR } : m)),
        );
        setError(err instanceof Error ? err : new Error("Error al enviar mensaje"));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [userId, user?.id, conversationId],
  );

  const refreshMessages = useCallback(async () => {
    await loadMessages(true, false);
  }, [loadMessages]);

  useEffect(() => {
    loadMessages(true, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refreshMessages,
    loadMore,
    hasMore,
    isLoadingMore,
  };
};
