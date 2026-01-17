import { ChatMessage, ChatPreview, Match, ConversationResponse, MessageStatus } from "../types";
import { apiGet, apiPost, apiPatch } from "../../../services/apiHelper";

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

interface MatchResponse {
  userAId: string;
  userBId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedMessagesResponse {
  messages: GetMessagesResponse[];
  hasMore: boolean;
}

class ChatService {
  /**
   * Obtiene los mensajes de una conversación con otro usuario
   * Endpoint: GET /api/messages/:userId
   *
   * @param userId - UUID del otro usuario en la conversación
   * @param forceRefresh - (Opcional) Forzar recarga desde el servidor
   * @returns Array de mensajes
   */
  async getMessages(userId: string, _forceRefresh = false): Promise<ChatMessage[]> {
    // Nota: forceRefresh se puede implementar con headers de caché si es necesario,
    // o simplemente ignorando la caché local si la hubiera.
    const data = await apiGet<GetMessagesResponse[] | { messages: GetMessagesResponse[] }>(
      `/messages/${userId}`,
    );

    // La respuesta puede ser un array directo o un objeto con propiedad messages
    const messages: GetMessagesResponse[] = Array.isArray(data) ? data : (data.messages ?? []);

    return messages.map(msg => ({
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
  }

  /**
   * Obtiene mensajes paginados de una conversación
   * Endpoint: GET /api/messages/conversation/:conversationId
   */
  async getPaginatedMessages(
    conversationId: string,
    limit: number = 50,
    beforeId?: string,
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });
    if (beforeId) {
      queryParams.append("beforeId", beforeId);
    }

    const data = await apiGet<PaginatedMessagesResponse>(
      `/messages/conversation/${conversationId}?${queryParams.toString()}`,
    );

    const mappedMessages = data.messages.map(msg => ({
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

    return {
      messages: mappedMessages,
      hasMore: data.hasMore,
    };
  }

  /**
   * Envía un mensaje a otro usuario
   * Endpoint: POST /api/messages/:userId
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
  async getConversations(): Promise<ChatPreview[]> {
    try {
      const data = await apiGet<ConversationResponse[] | { conversations: ConversationResponse[] }>(
        "/messages/me/conversations",
      );

      const conversations: ConversationResponse[] = Array.isArray(data)
        ? data
        : (data.conversations ?? []);

      const realChats = conversations
        .filter(conv => conv.lastMessage)
        .map(conv => {
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

          const fullName =
            `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || "Usuario";
          const userPhotoUrl = otherUser.photoUrl?.trim();

          const avatar =
            userPhotoUrl && userPhotoUrl.length > 0
              ? userPhotoUrl
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563EB&color=fff&bold=true&size=128`;

          const safeContent =
            typeof lastMessage.content === "string"
              ? lastMessage.content
              : JSON.stringify(lastMessage.content);

          return {
            id: otherUser.id,
            conversationId: conv.id,
            name: fullName,
            lastMessage: safeContent,
            lastMessageStatus: (lastMessage.status || "sent") as MessageStatus,
            lastMessageSenderId: lastMessage.senderId,
            time: timeAgo,
            unread: conv.unreadCount,
            updatedAt: conv.updatedAt,
            avatar,
            userFullInfo: otherUser,
          };
        });

      // Sort: unread first, then by most recent
      return realChats.sort((a, b) => {
        // First sort by unread count (unread conversations first)
        if (a.unread > 0 && b.unread === 0) return -1;
        if (a.unread === 0 && b.unread > 0) return 1;

        // Then sort by most recent (updatedAt)
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
   * Obtiene los matches (personas con las que hiciste match)
   * Endpoint: GET /api/matches
   *
   * @returns Array de matches con información sobre si tienen conversación
   */
  async getMatches(): Promise<Match[]> {
    try {
      const response = await apiGet<any>("/matches");

      let matchesData: MatchResponse[] = [];
      if (Array.isArray(response)) {
        matchesData = response;
      } else if (response.matches && Array.isArray(response.matches)) {
        matchesData = response.matches;
      } else if (response.data && Array.isArray(response.data)) {
        matchesData = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        matchesData = response.items;
      }

      // Obtener el ID del usuario actual
      // Obtener conversaciones para saber si ya hablamos (para el punto amarillo)
      const conversations = await this.getConversations();
      const conversationUserIds = new Set(conversations.map(conv => conv.id));

      // Mapear respuesta del endpoint /matching directamente a objetos Match
      // La estructura es { items: [ { user: { id, firstName, photoUrl... }, score... } ] }
      const matches: Match[] = matchesData.map((item: any) => {
        // Soporte tanto para item.user (nuevo endpoint /matching) como match directo
        const user = item.user || item;

        // Extracción segura de datos
        const id = user.id || "unknown";
        const firstName = user.firstName || "Usuario";
        // const lastName = user.lastName || "";
        const fullName = firstName; // En matches card solo mostramos primer nombre usualmente

        const avatar = user.photoUrl
          ? user.photoUrl
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=2563EB&color=fff&bold=true&size=128`;

        const birthDate = user.birthDate || user.profile?.birthDate;

        return {
          id: id,
          name: fullName,
          avatar: avatar,
          age: birthDate ? this.calculateAge(birthDate) : undefined,
          hasConversation: conversationUserIds.has(id),
        };
      });

      // Ordenar: primero los que NO tienen conversación (nuevos matches), luego los que ya tienen chat
      return matches.sort((a, b) => {
        if (!a.hasConversation && b.hasConversation) return -1;
        if (a.hasConversation && !b.hasConversation) return 1;
        return 0;
      });
    } catch (error) {
      console.error("Error al obtener matches:", error);
      return [];
    }
  }

  /**
   * Calcula la edad a partir de una fecha de nacimiento
   */
  private calculateAge(birthDate: string): number | undefined {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return undefined;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : undefined;
  }

  /**
   * Marca un mensaje como entregado
   * Endpoint: PATCH /api/messages/:messageId/delivered
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
   * Invalida la caché de mensajes para una conversación específica
   * Útil cuando se reciben mensajes por WebSocket
   */
  async invalidateMessagesCache(_conversationId: string): Promise<void> {
    // Implementación futura si usamos TanStack Query o similar
  }
}

export default new ChatService();
