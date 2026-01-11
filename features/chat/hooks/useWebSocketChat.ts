import { wsIncomingPayloadSchema, webSocketErrorSchema } from "../schemas/chat.schemas";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { WS_BASE_URL } from "@/config/env";
import {
  IncomingMessagePayload,
  MessageStatus,
  SendMessagePayload,
  WebSocketConnectionStatus,
} from "../types/chat.types";

const RECONNECT_INTERVAL_MS = 4000;
const MAX_RECONNECT_ATTEMPTS = 5;

const getWebSocketUrl = (userId: string) => {
  return `${WS_BASE_URL}/ws/chat?userId=${userId}`;
};

export interface MessageStatusUpdatePayload {
  type: "MESSAGE_STATUS_UPDATE";
  messageId: string;
  conversationId: string;
  status: MessageStatus;
}

interface UseWebSocketChatReturn {
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

export const useWebSocketChat = (): UseWebSocketChatReturn => {
  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<IncomingMessagePayload | null>(null);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<MessageStatusUpdatePayload | null>(null);
  const [lastUpdateTrigger, setLastUpdateTrigger] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shouldConnectRef = useRef(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);

      const errorValidation = webSocketErrorSchema.safeParse(parsed);
      if (errorValidation.success) {
        console.error("[Socket Chat] Error del servidor:", errorValidation.data);
        return;
      }

      const dataToValidate = parsed.type ? parsed : { ...parsed, type: "MESSAGE" };

      const payloadValidation = wsIncomingPayloadSchema.safeParse(dataToValidate);
      if (payloadValidation.success) {
        const data = payloadValidation.data;
        if (data.type === "MESSAGE") {
          setLastMessage(data as IncomingMessagePayload);
        } else if (data.type === "MESSAGE_STATUS_UPDATE") {
          setLastStatusUpdate(data as MessageStatusUpdatePayload);
          setLastUpdateTrigger(prev => prev + 1);
        } else if (data.type === "MARK_AS_READ_ACK") {
          // ACK silencioso
        }
      } else {
        console.warn("[Socket Chat] Falló validación:", payloadValidation.error);
      }
    } catch (err) {
      console.error("[Socket Chat] Error de análisis:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const connect = useCallback(() => {
    if (!user?.id) return;

    shouldConnectRef.current = true;

    if (socketRef.current?.readyState === WebSocket.OPEN || status === "connecting") {
      return;
    }

    setStatus("connecting");
    const connectionId = user.profile?.userId || user.id;
    const url = getWebSocketUrl(connectionId);

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        socketRef.current = null;

        if (shouldConnectRef.current) {
          setStatus("reconnecting");
          scheduleReconnect();
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = () => {
        if (status !== "reconnecting") {
          setStatus("error");
        }
      };

      ws.onmessage = handleMessage;
    } catch (err) {
      setStatus("error");
      scheduleReconnect();
    }
  }, [user?.id, handleMessage, status]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;

    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_INTERVAL_MS * Math.pow(1.5, reconnectAttemptsRef.current);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = undefined;
        reconnectAttemptsRef.current += 1;
        connect();
      }, delay);
    } else {
      console.log("[Socket Chat] Máximo de intentos de reconexión alcanzado");
      setStatus("disconnected");
      shouldConnectRef.current = false;
    }
  }, [connect]);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const payloadString = JSON.stringify({
          type: "MESSAGE",
          ...payload,
          senderId: user?.profile?.id || user?.id,
        });
        socketRef.current.send(payloadString);
      } else {
        console.warn("[Socket Chat] No se puede enviar el mensaje, socket cerrado");
      }
    },
    [user?.id],
  );

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (socketRef.current?.readyState === WebSocket.OPEN && user?.id) {
        const payload = {
          type: "MARK_AS_READ",
          conversationId,
          senderId: user?.profile?.id || user?.id,
        };
        socketRef.current.send(JSON.stringify(payload));
      } else {
        console.warn("🔴 [Socket Chat] No se pudo enviar MARK_AS_READ", {
          readyState: socketRef.current?.readyState,
          userId: user?.id,
          hasSocket: !!socketRef.current,
        });
      }
    },
    [user],
  );

  useEffect(() => {
    if (user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    isConnected: status === "connected",
    status,
    sendMessage,
    lastMessage,
    lastStatusUpdate,
    lastUpdateTrigger,
    connect,
    disconnect,
    markConversationAsRead,
  };
};
