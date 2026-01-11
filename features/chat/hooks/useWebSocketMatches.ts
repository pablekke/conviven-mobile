import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketConnectionStatus } from "../types/chat.types";
import { useAuth } from "@/context/AuthContext";
import { WS_BASE_URL } from "@/config/env";

const RECONNECT_INTERVAL_MS = 4000;
const MAX_RECONNECT_ATTEMPTS = 5;

const getWebSocketUrl = (userId: string) => {
  return `${WS_BASE_URL}/ws/matches?userId=${userId}`;
};

interface UseWebSocketMatchesReturn {
  isConnected: boolean;
  status: WebSocketConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  lastEvent: any;
}

export const useWebSocketMatches = (): UseWebSocketMatchesReturn => {
  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketConnectionStatus>("disconnected");

  // Store the last event to trigger effects
  const [lastEvent, setLastEvent] = useState<any>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shouldConnectRef = useRef(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed?.type === "NEW_MATCH") {
        console.log("[Socket Matches] ¡Nuevo match recibido!", parsed);
        setLastEvent(parsed);
      }
    } catch (err) {
      console.error("[Socket Matches] Error de análisis:", err);
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
    const url = getWebSocketUrl(user.id);

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        //console.log("[Socket Matches] Conectado");
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = e => {
        //console.log(`[Socket Matches] Desconectado: código=${e.code}`);
        socketRef.current = null;
        if (shouldConnectRef.current) {
          setStatus("reconnecting");
          scheduleReconnect();
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = e => {
        console.error("[Socket Matches] Error:", e);
        if (status !== "reconnecting") {
          setStatus("error");
        }
      };

      ws.onmessage = handleMessage;
    } catch (err) {
      console.error("[Socket Matches] Falló la conexión:", err);
      setStatus("error");
      scheduleReconnect();
    }
  }, [user?.id, handleMessage, status]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;

    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_INTERVAL_MS * Math.pow(1.5, reconnectAttemptsRef.current);
      //console.log(`[Socket Matches] Programando reconexión en ${delay}ms`);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = undefined;
        reconnectAttemptsRef.current += 1;
        connect();
      }, delay);
    } else {
      setStatus("disconnected");
      shouldConnectRef.current = false;
    }
  }, [connect]);

  useEffect(() => {
    if (user?.id) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [user?.id]);

  return {
    isConnected: status === "connected",
    status,
    connect,
    disconnect,
    lastEvent,
  };
};
