import { ChatMessage } from "../types";
import { MessageStatus } from "../enums";
import { apiGet, apiPost, apiPatch } from "./apiHelper";

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

class ChatService {
  /**
   * Obtiene los mensajes de una conversación con otro usuario
   * Endpoint: GET /api/messages/:userId
   *
   * @param userId - UUID del otro usuario en la conversación
   * @returns Array de mensajes
   */
  async getMessages(userId: string): Promise<ChatMessage[]> {
    const data = await apiGet<GetMessagesResponse[] | { messages: GetMessagesResponse[] }>(
      `/messages/${userId}`,
    );

    // La respuesta puede ser un array directo o un objeto con propiedad messages
    const messages: GetMessagesResponse[] = Array.isArray(data) ? data : (data.messages ?? []);

    return messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      receiverId: userId,
      content: msg.content,
      status: msg.status,
      deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
      readAt: msg.readAt ? new Date(msg.readAt) : undefined,
      timestamp: new Date(msg.createdAt),
    }));
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
      receiverId: userId,
      content: msg.content,
      status: msg.status,
      deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
      readAt: msg.readAt ? new Date(msg.readAt) : undefined,
      timestamp: new Date(msg.createdAt),
    };
  }

  /**
   * Obtiene todas las conversaciones del usuario autenticado
   * Endpoint: GET /api/messages/me/conversations
   *
   * @returns Array de conversaciones con información del otro usuario y último mensaje
   */
  async getConversations(): Promise<any[]> {
    try {
      const data = await apiGet<ConversationResponse[] | { conversations: ConversationResponse[] }>(
        "/messages/me/conversations",
      );

      const conversations: ConversationResponse[] = Array.isArray(data)
        ? data
        : (data.conversations ?? []);

      return conversations.map(conv => {
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

        return {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Usuario",
          lastMessage: lastMessage.content,
          lastMessageStatus: lastMessage.status,
          time: timeAgo,
          unread: conv.unreadCount,
          avatar:
            otherUser.photoUrl ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.firstName + " " + otherUser.lastName)}&background=2563EB&color=fff`,
        };
      });
    } catch (error) {
      console.warn("No se pudieron cargar las conversaciones:", error);
      return [];
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
}

export default new ChatService();
