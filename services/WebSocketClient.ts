import { AppState, AppStateStatus } from "react-native";

type MessageHandler = (data: any) => void;

export class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private baseUrl: string = "";
  private userId: string = "";
  private reconnectInterval: any = null;
  private listeners: MessageHandler[] = [];
  private onReconnectCallback: (() => void) | null = null;
  private isAppActive: boolean = true;

  private constructor() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  /**
   * INICIALIZAR CONEXIÓN
   * @param baseUrl La URL base de la API (ej: "http://192.168.1.5:4000" o "https://api.midominio.com")
   * @param userId El UUID del usuario logueado
   */
  public connect(baseUrl: string, userId: string) {
    this.baseUrl = baseUrl;
    this.userId = userId;
    this.initSocket();
  }

  private initSocket() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (!this.baseUrl || !this.userId) {
      console.warn("⚠️ [WS] Falta URL o UserID para conectar.");
      return;
    }

    let finalUrl = this.baseUrl;

    // Asegurar param userId
    if (!finalUrl.includes("?")) {
      finalUrl += `?userId=${this.userId}`;
    } else {
      finalUrl += `&userId=${this.userId}`;
    }

    try {
      // @ts-ignore: React Native allows headers in options
      this.ws = new WebSocket(finalUrl, null, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      this.ws.onopen = () => {
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = event => {
        try {
          // Parseo seguro
          const textData = typeof event.data === "string" ? event.data : event.data.toString();
          // console.log("📩 [WS RAW] Mensaje recibido:", textData);
          const data = JSON.parse(textData);
          this.listeners.forEach(cb => cb(data));
        } catch (e) {
          console.error("❌ [WS] Error parseando mensaje:", e);
        }
      };

      this.ws.onerror = e => {
        const error = e as unknown as { message?: string };
        console.error("❌ [WS] ERROR SOCKET:", error.message || "Unknown error");
      };
    } catch (e) {
      console.error("☠️ [WS] Error fatal al crear socket:", e);
      this.handleReconnection();
    }
  }

  private handleReconnection() {
    if (!this.isAppActive) return; // No reconectar en background

    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.initSocket();
      }, 3000); // Intento cada 3 segundos
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    const wasBackground = !this.isAppActive;
    this.isAppActive = nextAppState === "active";

    if (this.isAppActive && wasBackground) {
      this.initSocket();
      if (this.onReconnectCallback) this.onReconnectCallback();
    } else if (!this.isAppActive) {
      this.ws?.close();
      this.ws = null;
    }
  };

  public send(payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn("🚫 [WS] No se pudo enviar mensaje: Socket desconectado");
    }
  }

  public subscribe(callback: MessageHandler) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}
