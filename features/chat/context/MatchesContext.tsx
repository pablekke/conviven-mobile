import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useWebSocketMatches } from "../hooks/useWebSocketMatches";
import { WebSocketConnectionStatus } from "../types/chat.types";
import { useDataPreload } from "@/context/DataPreloadContext";

interface MatchesContextType {
  isConnected: boolean;
  status: WebSocketConnectionStatus;
  connect: () => void;
  disconnect: () => void;
}

const MatchesContext = createContext<MatchesContextType>({
  isConnected: false,
  status: "disconnected",
  connect: () => {},
  disconnect: () => {},
});

interface MatchesProviderProps {
  children: ReactNode;
}

export const MatchesProvider: React.FC<MatchesProviderProps> = ({ children }) => {
  const { isConnected, status, connect, disconnect, lastEvent } = useWebSocketMatches();
  const { refreshMatches } = useDataPreload();

  useEffect(() => {
    if (lastEvent && lastEvent.type === "NEW_MATCH") {
      console.log("[MatchesProvider] Actualizando matches debido al evento NEW_MATCH");
      refreshMatches(true).catch(err =>
        console.error("Error actualizando matches al recibir evento:", err),
      );
    }
  }, [lastEvent, refreshMatches]);

  return (
    <MatchesContext.Provider
      value={{
        isConnected,
        status,
        connect,
        disconnect,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatchesSocket = () => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error("useMatchesSocket must be used within a MatchesProvider");
  }
  return context;
};
