import { apiGet, apiPost, apiPatch } from "../../../services/apiHelper";
import { clearCachedValue } from "../../../services/resilience/cache";
import { MessageStatus } from "../enums";
import {
  ChatMessage,
  ChatPreview,
  Match,
  MatchResponse,
  PaginatedMessagesResponse,
} from "../types";

interface SendMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetMessagesResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationResponse {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    status: MessageStatus;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export class ChatService {
  /**
   * Obtiene los mensajes de una conversación de forma paginada
   * Endpoint: GET /api/messages/:conversationId
   *
   * @param conversationId - UUID de la conversación
   * @param limit - Cantidad de mensajes a traer (default: 50)
   * @param beforeMessageId - ID del mensaje más antiguo para paginación
   * @returns Respuesta paginada con mensajes y metadatos
   */
  async getPaginatedMessages(
    conversationId: string,
    limit: number = 50,
    beforeMessageId?: string,
  ): Promise<PaginatedMessagesResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (beforeMessageId) params.append("beforeMessageId", beforeMessageId);

    const data = await apiGet<PaginatedMessagesResponse>(
      `/messages/${conversationId}?${params.toString()}`,
      { useCache: !beforeMessageId },
    );

    return data;
  }

  /**
   * (Deprecado - Usar getPaginatedMessages)
   * Obtiene los mensajes de una conversación con otro usuario
   * Endpoint: GET /api/messages/:userId
   *
   * @param userId - UUID del otro usuario en la conversación
   * @returns Array de mensajes
   */
  async getMessages(userId: string, forceRefresh: boolean = false): Promise<ChatMessage[]> {
    const data = await apiGet<GetMessagesResponse[] | { messages: GetMessagesResponse[] }>(
      `/messages/${userId}`,
      { useCache: !forceRefresh },
    );

    // La respuesta puede ser un array directo o un objeto con propiedad messages
    const messages: GetMessagesResponse[] = Array.isArray(data) ? data : (data.messages ?? []);

    const mappedMessages: ChatMessage[] = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      status: msg.status,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      timestamp: new Date(msg.createdAt),
      liked: false,
    }));

    // Deduplicate by ID
    return Array.from(new Map(mappedMessages.map(m => [m.id, m])).values());
  }

  /**
   * Envía un mensaje a otro usuario
   * Endpoint: POST /api/messages/:userId
   *
   * Nota: Los mensajes crean automáticamente una conversación si no existe entre los dos usuarios.
   * Se envía una notificación push al destinatario cuando se envía un mensaje.
   *
   * @param userId - UUID del destinatario
   * @param content - Contenido del mensaje (1-1000 caracteres)
   * @returns El mensaje enviado
   * @throws Error si el contenido no cumple con la longitud requerida (1-1000 caracteres)
   */
  async sendMessage(userId: string, content: string): Promise<ChatMessage> {
    if (!content || content.length < 1 || content.length > 1000) {
      throw new Error("El contenido debe tener entre 1 y 1000 caracteres");
    }

    const msg = await apiPost<SendMessageResponse>(`/messages/${userId}`, {
      content,
    });

    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      status: msg.status,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      timestamp: new Date(msg.createdAt),
      liked: false,
    };
  }

  /**
   * Obtiene todas las conversaciones del usuario autenticado
   * Endpoint: GET /api/messages/me/conversations
   *
   * @returns Array de conversaciones con información del otro usuario y último mensaje
   */
  async getConversations(forceRefresh: boolean = false): Promise<ChatPreview[]> {
    try {
      const data = await apiGet<ConversationResponse[] | { conversations: ConversationResponse[] }>(
        "/messages/me/conversations",
        { useCache: !forceRefresh },
      );

      const conversations: ConversationResponse[] = Array.isArray(data)
        ? data
        : (data.conversations ?? []);

      const realChats = conversations
        .filter(conv => conv.lastMessage)
        .map(conv => ChatService.mapResponseToPreview(conv));
      const uniqueChats = Array.from(new Map(realChats.map(chat => [chat.id, chat])).values());
      return uniqueChats.sort((a, b) => {
        if (a.unread > 0 && b.unread === 0) return -1;
        if (a.unread === 0 && b.unread > 0) return 1;
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.warn("No se pudieron cargar las conversaciones:", error);
      return [];
    }
  }

  /**
   * Mapea una respuesta del backend a un objeto ChatPreview para la UI
   */
  static mapResponseToPreview(conv: ConversationResponse): ChatPreview {
    const { otherUser, lastMessage } = conv;
    const now = new Date();
    const messageDate = new Date(lastMessage.createdAt);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);

    // Calcular tiempo relativo
    let timeAgo: string;
    if (diffInMinutes < 1) {
      timeAgo = "Ahora";
    } else if (diffInMinutes < 60) {
      timeAgo = `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      timeAgo = `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      timeAgo = `${Math.floor(diffInMinutes / 1440)}d`;
    }

    const fullName = `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || "Usuario";
    const userPhotoUrl = otherUser.photoUrl?.trim();

    return {
      id: otherUser.id,
      name: fullName,
      lastMessage: lastMessage.content,
      lastMessageStatus: lastMessage.status,
      time: timeAgo,
      unread: conv.unreadCount,
      updatedAt: conv.updatedAt,
      avatar:
        userPhotoUrl && userPhotoUrl.length > 0
          ? userPhotoUrl
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563EB&color=fff&bold=true&size=128`,
      userFullInfo: {
        id: otherUser.id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        photoUrl: otherUser.photoUrl,
      },
      conversationId: conv.id,
    };
  }

  /**
   * Obtiene los matches (personas con las que hiciste match)
   * Endpoint: GET /api/matches
   *
   * @returns Array de matches con información sobre si tienen conversación
   */
  async getMatches(forceRefresh: boolean = false): Promise<Match[]> {
    try {
      // Obtener matches desde la API
      const matchesResponse = await apiGet<MatchResponse>("/matches", { useCache: !forceRefresh });

      // Validar estructura de respuesta
      if (!matchesResponse || !Array.isArray(matchesResponse.items)) {
        return [];
      }

      // Mapear los matches utilizando la data completa del usuario que viene en la respuesta
      const matches: Match[] = matchesResponse.items
        .filter(item => item.active !== false && item.user)
        .map(item => {
          try {
            const user = item.user;
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario";

            return {
              id: user.id || item.user.id,
              name,
              avatar:
                user.photoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&bold=true&size=128`,
              age: user.birthDate ? this.calculateAge(user.birthDate) : undefined,
              hasConversation: false,
            } as Match;
          } catch (itemError) {
            console.error("[ChatService] Error procesando match individual:", itemError, item);
            return null;
          }
        })
        .filter((match): match is Match => match !== null);

      // Deduplicate matches by ID
      const uniqueMatches = Array.from(new Map(matches.map(m => [m.id, m])).values());

      return uniqueMatches;
    } catch (error) {
      console.warn("[ChatService] Fallo al obtener matches (posible error de backend):", error);
      return [];
    }
  }

  /**
   * Calcula la edad a partir de una fecha de nacimiento
   */
  private calculateAge(birthDate: any): number | undefined {
    try {
      if (!birthDate || typeof birthDate !== "string") return undefined;
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return undefined;

      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    } catch {
      return undefined;
    }
  }

  /**
   * Marca un mensaje como entregado
   * Endpoint: PATCH /api/messages/:messageId/delivered
   *
   * Nota: Solo el receptor puede marcar mensajes como entregados
   *
   * @param messageId - UUID del mensaje
   */
  async markAsDelivered(messageId: string): Promise<void> {
    await apiPatch<{ message: string }>(`/messages/${messageId}/delivered`);
  }

  /**
   * Marca un mensaje como leído
   * Endpoint: PATCH /api/messages/:messageId/read
   *
   * Nota: Solo el receptor puede marcar mensajes como leídos.
   * Al marcar como "read", automáticamente se marca como "delivered" si no lo estaba.
   *
   * @param messageId - UUID del mensaje
   */
  async markAsRead(messageId: string): Promise<void> {
    await apiPatch<{ message: string }>(`/messages/${messageId}/read`);
  }

  /**
   * Marca todos los mensajes de una conversación como leídos
   * Endpoint: POST /api/messages/:userId/mark-all-read
   *
   * @param userId - UUID del otro usuario en la conversación
   * @returns Cantidad de mensajes marcados como leídos
   */
  async markAllAsRead(userId: string): Promise<number> {
    const response = await apiPost<{ message: string; count: number }>(
      `/messages/${userId}/mark-all-read`,
    );
    return response.count;
  }

  /**
   * Invalida el caché de mensajes para una conversación específica
   * Útil cuando se actualizan estados de mensajes por WebSocket
   *
   * @param conversationId - UUID de la conversación
   */
  async invalidateMessagesCache(conversationId: string): Promise<void> {
    try {
      await clearCachedValue(`/messages/${conversationId}`);
    } catch (error) {
      console.warn("[ChatService] Error al invalidar caché:", error);
    }
  }
}

export default new ChatService();
