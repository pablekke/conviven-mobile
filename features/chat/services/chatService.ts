import { ChatMessage, ChatPreview, Match, ChatUser } from "../types";
import { MessageStatus } from "../enums";
import { apiGet, apiPost, apiPatch } from "../../../services/apiHelper";
import { mockConversations, mockMessages, mockMatches } from "../mocks";
import { MOCK_MODE } from "../../../config/env";
import AuthService from "../../../services/authService";
import UserService from "../../../services/userService";

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
    // En modo mock, solo usar mocks
    if (MOCK_MODE) {
      if (mockMessages[userId]) {
        // Obtener el ID del usuario actual para mapear "me"
        let currentUserId = "me";
        try {
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            currentUserId = currentUser.id;
          }
        } catch (error) {
          console.warn("No se pudo obtener el usuario actual, usando 'me' como fallback");
        }

        return mockMessages[userId].map(msg => ({
          ...msg,
          senderId: msg.senderId === "me" ? currentUserId : msg.senderId,
          timestamp: new Date(msg.createdAt),
        }));
      }
      return [];
    }

    // Check for mock messages first (fallback)
    if (mockMessages[userId]) {
      // Obtener el ID del usuario actual para mapear "me"
      let currentUserId = "me";
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          currentUserId = currentUser.id;
        }
      } catch (error) {
        console.warn("No se pudo obtener el usuario actual, usando 'me' como fallback");
      }

      return mockMessages[userId].map(msg => ({
        ...msg,
        senderId: msg.senderId === "me" ? currentUserId : msg.senderId,
        timestamp: new Date(msg.createdAt),
      }));
    }

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

    // En modo mock, simular el envío de mensaje
    if (MOCK_MODE) {
      let currentUserId = "me";
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          currentUserId = currentUser.id;
        }
      } catch (error) {
        console.warn("No se pudo obtener el usuario actual, usando 'me' como fallback");
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: `conv-${userId}`,
        senderId: currentUserId,
        content,
        status: MessageStatus.SENT,
        deliveredAt: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date(),
        liked: false,
      };

      // Agregar el mensaje a los mocks
      if (!mockMessages[userId]) {
        mockMessages[userId] = [];
      }
      mockMessages[userId].push({
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        senderId: "me", // Guardar como "me" en los mocks
        content: newMessage.content,
        status: newMessage.status,
        deliveredAt: newMessage.deliveredAt,
        readAt: newMessage.readAt,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
        liked: newMessage.liked,
      });

      return newMessage;
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
    // En modo mock, solo usar mocks
    if (MOCK_MODE) {
      const mockChats: ChatPreview[] = mockConversations
        .filter(conv => conv.lastMessage) // Only include conversations with messages
        .map(conv => {
          const { otherUser, lastMessage } = conv;

          let timeAgo = "";
          if (lastMessage) {
            const now = new Date();
            const messageDate = new Date(lastMessage.createdAt);
            const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);

            if (diffInMinutes < 1) {
              timeAgo = "Ahora";
            } else if (diffInMinutes < 60) {
              timeAgo = `${diffInMinutes}m`;
            } else if (diffInMinutes < 1440) {
              timeAgo = `${Math.floor(diffInMinutes / 60)}h`;
            } else {
              timeAgo = `${Math.floor(diffInMinutes / 1440)}d`;
            }
          }

          const fullName = `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Usuario";
          const userAvatar = otherUser.avatar?.trim();
          return {
            id: otherUser.id,
            name: fullName,
            lastMessage: lastMessage?.content || "",
            lastMessageStatus: lastMessage?.status,
            time: timeAgo,
            unread: conv.unreadCount,
            updatedAt: conv.updatedAt,
            avatar:
              userAvatar && userAvatar.length > 0
                ? userAvatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563EB&color=fff&bold=true&size=128`,
          };
        });

      // Sort: unread first, then by most recent
      return mockChats.sort((a, b) => {
        // First sort by unread count (unread conversations first)
        if (a.unread > 0 && b.unread === 0) return -1;
        if (a.unread === 0 && b.unread > 0) return 1;

        // Then sort by most recent (updatedAt)
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
    }

    try {
      const data = await apiGet<ConversationResponse[] | { conversations: ConversationResponse[] }>(
        "/messages/me/conversations",
      );

      const conversations: ConversationResponse[] = Array.isArray(data)
        ? data
        : (data.conversations ?? []);

      // Obtener información completa de todos los usuarios de las conversaciones
      const userIds = conversations.map(conv => conv.otherUser.id);
      const usersInfoMap = new Map<string, ChatUser>();

      // Obtener información de usuarios en paralelo
      await Promise.all(
        userIds.map(async userId => {
          try {
            const user = await UserService.getById(userId);
            const chatUser: ChatUser = {
              id: user.id,
              firstName: user.firstName || null,
              lastName: user.lastName || null,
              photoUrl: user.avatar || null,
              secondaryPhotoUrls: undefined, // Se puede agregar después si es necesario
              birthDate: user.birthDate || null,
              gender: user.gender || null,
            };
            usersInfoMap.set(userId, chatUser);
          } catch (error) {
            console.warn(`Error al obtener información del usuario ${userId}:`, error);
            // Crear un usuario básico si falla
            usersInfoMap.set(userId, {
              id: userId,
              firstName: null,
              lastName: null,
              photoUrl: null,
              birthDate: null,
              gender: null,
            });
          }
        }),
      );

      const realChats = conversations
        .filter(conv => conv.lastMessage) // Only include conversations with messages
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

          // Obtener información completa del usuario
          const userFullInfo = usersInfoMap.get(otherUser.id);
          const fullName = userFullInfo
            ? `${userFullInfo.firstName || ""} ${userFullInfo.lastName || ""}`.trim() || "Usuario"
            : `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Usuario";

          const userPhotoUrl = (userFullInfo?.photoUrl || otherUser.photoUrl)?.trim();

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
            // Guardar información completa del usuario para uso futuro
            userFullInfo,
          };
        });

      // Map mock conversations to ChatPreview (filter out those without messages)
      const mockChats: ChatPreview[] = mockConversations
        .filter(conv => conv.lastMessage) // Only include conversations with messages
        .map(conv => {
          const { otherUser, lastMessage } = conv;

          let timeAgo = "";
          if (lastMessage) {
            const now = new Date();
            const messageDate = new Date(lastMessage.createdAt);
            const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);

            if (diffInMinutes < 1) {
              timeAgo = "Ahora";
            } else if (diffInMinutes < 60) {
              timeAgo = `${diffInMinutes}m`;
            } else if (diffInMinutes < 1440) {
              timeAgo = `${Math.floor(diffInMinutes / 60)}h`;
            } else {
              timeAgo = `${Math.floor(diffInMinutes / 1440)}d`;
            }
          }

          const fullName = `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Usuario";
          const userAvatar = otherUser.avatar?.trim();
          return {
            id: otherUser.id,
            name: fullName,
            lastMessage: lastMessage?.content || "",
            lastMessageStatus: lastMessage?.status,
            time: timeAgo,
            unread: conv.unreadCount,
            updatedAt: conv.updatedAt,
            avatar:
              userAvatar && userAvatar.length > 0
                ? userAvatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563EB&color=fff&bold=true&size=128`,
          };
        });

      // Combine and sort: unread first, then by most recent
      const allChats = [...mockChats, ...realChats];
      return allChats.sort((a, b) => {
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
      // Return mocks even if real API fails (filter out those without messages)
      const mockChats: ChatPreview[] = mockConversations
        .filter(conv => conv.lastMessage) // Only include conversations with messages
        .map(conv => {
          const { otherUser, lastMessage } = conv;

          let timeAgo = "";
          if (lastMessage) {
            const now = new Date();
            const messageDate = new Date(lastMessage.createdAt);
            const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);

            if (diffInMinutes < 1) {
              timeAgo = "Ahora";
            } else if (diffInMinutes < 60) {
              timeAgo = `${diffInMinutes}m`;
            } else if (diffInMinutes < 1440) {
              timeAgo = `${Math.floor(diffInMinutes / 60)}h`;
            } else {
              timeAgo = `${Math.floor(diffInMinutes / 1440)}d`;
            }
          }

          const fullName = `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Usuario";
          const userAvatar = otherUser.avatar?.trim();
          return {
            id: otherUser.id,
            name: fullName,
            lastMessage: lastMessage?.content || "",
            lastMessageStatus: lastMessage?.status,
            time: timeAgo,
            unread: conv.unreadCount,
            updatedAt: conv.updatedAt,
            avatar:
              userAvatar && userAvatar.length > 0
                ? userAvatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563EB&color=fff&bold=true&size=128`,
          };
        });

      // Sort: unread first, then by most recent
      return mockChats.sort((a, b) => {
        // First sort by unread count (unread conversations first)
        if (a.unread > 0 && b.unread === 0) return -1;
        if (a.unread === 0 && b.unread > 0) return 1;

        // Then sort by most recent (updatedAt)
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
    }
  }

  /**
   * Obtiene los matches (personas con las que hiciste match)
   * Endpoint: GET /api/matches
   *
   * @returns Array de matches con información sobre si tienen conversación
   */
  async getMatches(): Promise<Match[]> {
    // En modo mock, devolver todos los matches marcando cuáles tienen conversación
    if (MOCK_MODE) {
      // Obtener IDs de usuarios que ya tienen conversación
      const conversationUserIds = new Set(mockConversations.map(conv => conv.otherUser.id));

      // Mapear todos los matches, marcando cuáles tienen conversación
      const matchesWithStatus = mockMatches.map(match => ({
        ...match,
        hasConversation: conversationUserIds.has(match.id),
      }));

      // Ordenar: primero los que NO tienen conversación (indicador amarillo), luego los que sí tienen
      return matchesWithStatus.sort((a, b) => {
        // Si a no tiene conversación y b sí, a va primero
        if (!a.hasConversation && b.hasConversation) return -1;
        // Si a tiene conversación y b no, b va primero
        if (a.hasConversation && !b.hasConversation) return 1;
        // Si ambos tienen el mismo estado, mantener el orden original
        return 0;
      });
    }

    try {
      // Obtener matches desde la API
      const matchesData = await apiGet<MatchResponse[]>("/matches");

      // Obtener el ID del usuario actual
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // Filtrar solo matches activos y obtener el ID del otro usuario
      const otherUserIds = matchesData
        .filter(match => match.active)
        .map(match => {
          // Determinar cuál es el otro usuario (no el actual)
          return match.userAId === currentUser.id ? match.userBId : match.userAId;
        });

      if (otherUserIds.length === 0) {
        return [];
      }

      // Obtener información de los usuarios
      const usersInfo = await Promise.all(
        otherUserIds.map(async userId => {
          try {
            const user = await UserService.getById(userId);
            return {
              id: user.id,
              name:
                user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario",
              avatar:
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.id)}&background=2563EB&color=fff&bold=true&size=128`,
              age: user.birthDate ? this.calculateAge(user.birthDate) : undefined,
            };
          } catch (error) {
            console.warn(`Error al obtener información del usuario ${userId}:`, error);
            return {
              id: userId,
              name: "Usuario",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}&background=2563EB&color=fff&bold=true&size=128`,
              age: undefined,
            };
          }
        }),
      );

      // Obtener IDs de usuarios que ya tienen conversación
      const conversations = await this.getConversations();
      const conversationUserIds = new Set(conversations.map(conv => conv.id));

      // Mapear a Match con información de conversación
      const matches: Match[] = usersInfo.map(userInfo => ({
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar,
        age: userInfo.age,
        hasConversation: conversationUserIds.has(userInfo.id),
      }));

      // Ordenar: primero los que NO tienen conversación (indicador amarillo), luego los que sí tienen
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
   * Nota: Solo el receptor puede marcar mensajes como entregados
   *
   * @param messageId - UUID del mensaje
   */
  async markAsDelivered(messageId: string): Promise<void> {
    if (MOCK_MODE) {
      // En modo mock, no hacer nada
      return;
    }
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
    if (MOCK_MODE) {
      // En modo mock, no hacer nada
      return;
    }
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
    if (MOCK_MODE) {
      // En modo mock, retornar 0
      return 0;
    }
    const response = await apiPost<{ message: string; count: number }>(
      `/messages/${userId}/mark-all-read`,
    );
    return response.count;
  }
}

export default new ChatService();
