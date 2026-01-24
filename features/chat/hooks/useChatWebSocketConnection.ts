import { WebSocketClient } from "@/services/WebSocketClient";
import { API_BASE_URL_WS } from "@/config/env";
import { useEffect, useState } from "react";

interface UseChatWebSocketConnectionProps {
  userId: string | undefined;
  onMessage: (data: any) => void;
}

export const useChatWebSocketConnection = ({
  userId,
  onMessage,
}: UseChatWebSocketConnectionProps) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const wsClient = WebSocketClient.getInstance();
    const wsUrl = API_BASE_URL_WS;

    wsClient.connect(wsUrl, userId);
    setIsConnected(true);

    const unsubscribe = wsClient.subscribe(onMessage);

    return () => {
      unsubscribe();
    };
  }, [userId, onMessage]);

  return { isConnected };
};
